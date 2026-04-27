// ═══════════════════════════════════════════
// DineSmart — Customer Menu Page
// ═══════════════════════════════════════════

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Search, ShoppingCart, Leaf, Flame, Star, Minus, Plus, X, ChevronRight, Tag, User, Clock, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPublicMenu, placeOrder, validateCoupon, getRecommendations, getCustomerHistory, getAvailableCoupons } from '../lib/api';
import { useCartStore } from '../store/cart';
import { CustomerAuthModal } from '../components/CustomerAuthModal';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string | null;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTimeMinutes: number;
  tags: string[];
  orderCount: number;
  isPopular?: boolean;
  variants: Array<{ id: string; name: string; additionalPrice: number }>;
  addons: Array<{ id: string; name: string; price: number }>;
}

interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

interface MenuData {
  restaurant: { id: string; name: string; logoUrl: string | null };
  table: { id: string; number: number };
  categories: Category[];
}

export default function MenuPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const slug = searchParams.get('restaurant') || '';
  const tableId = searchParams.get('table') || '';

  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [vegOnly, setVegOnly] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const [couponInput, setCouponInput] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [nonVegOnly, setNonVegOnly] = useState(false);
  const [sortOrder, setSortOrder] = useState<'NONE' | 'PRICE_ASC' | 'PRICE_DESC'>('NONE');

  const cart = useCartStore();

  // Set restaurant info in store
  useEffect(() => {
    if (slug && tableId) {
      cart.setRestaurantInfo(slug, tableId);
    }
  }, [slug, tableId]);

  // Auth check moved to checkout action

  // Fetch menu
  const { data: menuData, isLoading, error } = useQuery<MenuData>({
    queryKey: ['menu', slug, tableId],
    queryFn: () => getPublicMenu(slug, tableId) as Promise<MenuData>,
    enabled: !!slug && !!tableId,
  });

  // Fetch recommendations
  const cartItemIds = cart.items.map((i) => i.menuItemId);
  const { data: recommendations } = useQuery({
    queryKey: ['recommendations', slug, cartItemIds],
    queryFn: () => getRecommendations(slug, cartItemIds) as Promise<Array<{
      id: string; name: string; price: number; imageUrl: string | null; confidence: number;
    }>>,
    enabled: cartItemIds.length > 0 && !!slug,
  });

  // Fetch Order History
  const { data: history } = useQuery({
    queryFn: () => getCustomerHistory(slug, cart.customerPhone!) as Promise<Array<any>>,
    enabled: !!slug && !!cart.customerPhone && showHistory,
  });
  
  // Fetch Available Coupons
  const { data: availableCoupons } = useQuery({
    queryKey: ['availableCoupons', slug],
    queryFn: () => getAvailableCoupons(slug) as Promise<any[]>,
    enabled: !!slug,
  });

  // Filter items
  const filteredCategories = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories
      .map((cat) => {
        let items = cat.items.filter((item) => {
          if (vegOnly && !item.isVeg) return false;
          if (nonVegOnly && item.isVeg) return false;
          if (search) {
            const q = search.toLowerCase();
            return item.name.toLowerCase().includes(q) ||
              item.description.toLowerCase().includes(q) ||
              (item.tags || []).some((t) => t.toLowerCase().includes(q));
          }
          return true;
        });

        if (sortOrder === 'PRICE_ASC') items = items.sort((a, b) => a.price - b.price);
        if (sortOrder === 'PRICE_DESC') items = items.sort((a, b) => b.price - a.price);

        return { ...cat, items };
      })
      .filter((cat) => activeCategory === 'all' || cat.id === activeCategory)
      .filter((cat) => cat.items.length > 0);
  }, [menuData, search, vegOnly, nonVegOnly, activeCategory, sortOrder]);

  const addToCart = useCallback((item: MenuItem, variantId?: string, selectedAddons?: string[]) => {
    const variant = variantId ? item.variants.find((v) => v.id === variantId) : undefined;
    const addons = selectedAddons
      ? item.addons.filter((a) => selectedAddons.includes(a.id))
      : [];

    cart.addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price + (variant?.additionalPrice || 0),
      quantity: 1,
      variantId: variant?.id,
      variantName: variant?.name,
      addonIds: addons.map((a) => a.id),
      addonNames: addons.map((a) => a.name),
      addonPrices: addons.map((a) => a.price),
      specialInstructions: '',
      imageUrl: item.imageUrl || undefined,
      isVeg: item.isVeg,
    });

    toast.success(`${item.name} added to cart`, { duration: 1500 });
  }, [cart]);

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    try {
      const result = await validateCoupon(slug, couponInput, cart.getSubtotal()) as {
        valid: boolean; reason?: string; discount?: number; discountType?: string; discountValue?: number;
      };
      if (result.valid && result.discount !== undefined) {
        cart.setCoupon(couponInput.toUpperCase(), result.discount);
        toast.success(`Coupon applied! You save ₹${result.discount.toFixed(0)}`);
      } else {
        toast.error(result.reason || 'Invalid coupon');
      }
    } catch {
      toast.error('Failed to validate coupon');
    } finally {
      setCouponLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (cart.items.length === 0) return;
    
    // Check if customer is identified
    if (!cart.customerPhone) {
      setIsAuthModalOpen(true);
      return;
    }

    setPlacing(true);
    try {
      const result = await placeOrder({
        tableId,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          variantId: item.variantId,
          quantity: item.quantity,
          addonIds: item.addonIds,
          specialInstructions: item.specialInstructions,
        })),
        couponCode: cart.couponCode || undefined,
        customerPhone: cart.customerPhone || undefined,
        customerName: cart.customerName || undefined,
      }) as { sessionId: string };

      cart.setSessionId(result.sessionId);
      cart.clearCart();
      setShowCheckout(false);
      setShowCart(false);
      toast.success('Order placed successfully!');
      navigate(`/track/${result.sessionId}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (!slug || !tableId) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-center bg-surface">
        <div className="max-w-xs">
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20">
            <span className="text-4xl">📱</span>
          </div>
          <h1 className="text-3xl font-black text-on-surface mb-3 tracking-tight font-serif">DineSmart</h1>
          <p className="text-on-surface-variant text-sm leading-relaxed">
            Please scan the QR code located at your table to view the menu and place your order.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-surface">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-surface-container-highest rounded-full" />
          <div className="absolute inset-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-on-surface-variant font-medium animate-pulse">Preparing your menu...</p>
      </div>
    );
  }

  if (error || !menuData) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 text-center bg-surface">
        <div className="max-w-xs">
          <div className="w-20 h-20 bg-error-container/50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-error-container">
            <span className="text-4xl">⚠️</span>
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2 font-serif">Menu Unavailable</h1>
          <p className="text-on-surface-variant text-sm mb-8">
            We couldn't load the menu for this table. This might be due to a technical glitch or the restaurant being closed.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-primary text-on-primary font-bold rounded-2xl hover:bg-primary-container hover:text-on-primary-container transition-all active:scale-95 shadow-lg shadow-primary-container/20"
          >
            Try Refreshing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-24 font-sans text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-surface-bright/90 backdrop-blur-2xl border-b border-outline-variant py-3 px-4 transition-all">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {menuData.restaurant.logoUrl ? (
              <img src={menuData.restaurant.logoUrl} alt={menuData.restaurant.name} className="w-10 h-10 rounded-xl object-cover border border-outline-variant" />
            ) : (
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 text-primary font-black text-xl">
                {menuData.restaurant.name.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-black text-on-surface tracking-tight leading-none mb-1 font-serif">{menuData.restaurant.name}</h1>
              <div className="flex items-center gap-1.5">
                <span className="flex h-1.5 w-1.5 rounded-full bg-secondary animate-pulse" />
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">Table {menuData.table.number}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {cart.customerPhone && (
              <>
                <button
                  onClick={() => setShowHistory(true)}
                  className="relative w-12 h-12 bg-surface-container border border-outline-variant rounded-2xl flex items-center justify-center hover:bg-surface-container-high transition-all active:scale-90"
                >
                  <User size={20} className="text-on-surface" />
                </button>
                <button
                  onClick={() => {
                    cart.clearCustomerInfo();
                    toast.success('Signed out successfully');
                  }}
                  className="relative w-12 h-12 bg-error-container border border-error-container rounded-2xl flex items-center justify-center hover:opacity-80 transition-all active:scale-90"
                >
                  <LogOut size={20} className="text-on-error-container" />
                </button>
              </>
            )}
            <button
              onClick={() => setShowCart(true)}
              className="relative w-12 h-12 bg-primary rounded-2xl flex items-center justify-center hover:bg-primary-container transition-all active:scale-90 shadow-lg shadow-primary-container/20"
              id="cart-button"
            >
              <ShoppingCart size={20} className="text-on-primary" />
              {cart.getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-on-primary text-primary text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg">
                  {cart.getItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="pt-6 px-4 pb-2 bg-surface-container-lowest">
        <h2 className="text-2xl font-black text-on-surface mb-1 font-serif">Hungry?</h2>
        <p className="text-sm text-on-surface-variant mb-5">Order now and skip the wait!</p>

        {/* Search */}
        <div className="relative group shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search our delicious menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-surface-container rounded-[1.5rem] text-sm text-on-surface placeholder:text-on-surface-variant/70 border border-outline-variant focus:border-primary/50 focus:bg-surface-container-high focus:outline-none transition-all"
            id="search-input"
          />
        </div>
      </div>

      {/* Available Coupons Slider */}
      {availableCoupons && availableCoupons.length > 0 && (
        <div className="px-4 py-4 overflow-x-auto flex gap-4 scrollbar-hide mask-fade-right bg-surface-container-lowest">
          {availableCoupons.map((coupon: any) => (
            <div 
              key={coupon.id}
              onClick={() => {
                setCouponInput(coupon.code);
                toast.success(`Coupon ${coupon.code} copied! Apply it in your cart.`);
              }}
              className="flex-shrink-0 w-64 p-4 bg-surface-container-low border border-outline-variant border-dashed rounded-[1.5rem] flex items-center justify-between group hover:bg-surface-container hover:border-primary/30 transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                   <Tag size={18} />
                </div>
                <div>
                  <p className="text-xs font-black text-on-surface group-hover:text-primary transition-colors">{coupon.code}</p>
                  <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest">
                    {coupon.discountType === 'PERCENT' ? `${coupon.discountValue}% OFF` : `₹${coupon.discountValue} OFF`}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-secondary tracking-tighter">Min. ₹{coupon.minOrderValue}</p>
                <div className="px-2 py-0.5 bg-primary text-on-primary text-[8px] font-black rounded-full mt-1 uppercase">TAP TO SELECT</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pt-4 pb-4 scrollbar-hide px-4 mask-fade-right sticky top-[72px] z-30 bg-surface-bright/90 backdrop-blur-md border-b border-outline-variant">
        <button
          onClick={() => {
            setVegOnly(!vegOnly);
            if (!vegOnly) setNonVegOnly(false);
          }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
            vegOnly ? 'bg-secondary-container text-on-secondary-container border-secondary/30' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${vegOnly ? 'bg-secondary shadow-[0_0_8px_#d9e3ca]' : 'bg-outline'}`} />
          VEG
        </button>
        <button
          onClick={() => {
            setNonVegOnly(!nonVegOnly);
            if (!nonVegOnly) setVegOnly(false);
          }}
          className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-xl text-[11px] font-bold transition-all border ${
            nonVegOnly ? 'bg-tertiary-container text-on-tertiary-container border-tertiary/30' : 'bg-surface-container text-on-surface-variant border-transparent hover:bg-surface-container-high'
          }`}
        >
          <div className={`w-2 h-2 rounded-full ${nonVegOnly ? 'bg-tertiary shadow-[0_0_8px_#c8503e]' : 'bg-outline'}`} />
          NON-VEG
        </button>

        <div className="ml-auto flex border-l border-outline-variant pl-2">
          <select 
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="flex-shrink-0 bg-surface-container text-on-surface-variant px-3 py-2 rounded-xl text-[11px] font-bold border border-transparent focus:border-primary/30 outline-none hover:bg-surface-container-high transition-colors"
          >
            <option value="NONE">Sort: Recommended</option>
            <option value="PRICE_ASC">Price: Low to High</option>
            <option value="PRICE_DESC">Price: High to Low</option>
          </select>
        </div>

        <div className="w-px h-4 bg-outline-variant mx-1 flex-shrink-0" />
        <button
          onClick={() => setActiveCategory('all')}
          className={`flex-shrink-0 px-5 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all ${
            activeCategory === 'all' ? 'bg-primary text-on-primary shadow-lg shadow-primary-container/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          ALL DISHES
        </button>
        {menuData.categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-5 py-2 rounded-xl text-[11px] font-black tracking-widest uppercase transition-all whitespace-nowrap ${
              activeCategory === cat.id ? 'bg-primary text-on-primary shadow-lg shadow-primary-container/20' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Menu Items */}
      <main className="px-4 py-8 space-y-12">
        {filteredCategories.map((cat) => (
          (activeCategory === 'all' || activeCategory === cat.id) && cat.items.length > 0 && (
            <section key={cat.id} id={`cat-${cat.id}`} className="animate-fade-in-up">
              <div className="flex items-baseline gap-3 mb-6">
                <h2 className="text-xl font-black text-on-surface tracking-tight">{cat.name}</h2>
                <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{cat.items.length} items</span>
              </div>
              
              <div className="grid grid-cols-1 gap-5">
                {cat.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} onAdd={addToCart} cart={cart} />
                ))}
              </div>
            </section>
          )
        ))}

        {filteredCategories.length === 0 && (
          <div className="text-center py-20 bg-surface-container/50 rounded-[3rem] border border-dashed border-outline-variant/50">
            <Search size={40} className="text-on-surface-variant mx-auto mb-4" />
            <p className="text-on-surface-variant font-medium">No masterpieces match your search</p>
          </div>
        )}
      </main>

      {/* Modern Floating Cart Summary */}
      {cart.getItemCount() > 0 && !showCart && (
        <div className="fixed bottom-8 left-4 right-4 z-[45] animate-slide-up">
          <button
            onClick={() => setShowCart(true)}
            className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-black py-4 rounded-[2rem] flex items-center justify-between px-8 shadow-[0_20px_50px_rgba(166,59,0,0.3)] transition-all active:scale-[0.98] border-b-4 border-surface-tint group/cart"
            id="view-cart-button"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-on-primary/20 rounded-2xl flex items-center justify-center group-hover/cart:scale-110 transition-transform">
                <ShoppingCart size={18} strokeWidth={2.5} />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black text-primary-fixed uppercase tracking-widest leading-none mb-1">In Your Bag</p>
                <p className="text-sm leading-none font-black">{cart.getItemCount()} {cart.getItemCount() > 1 ? 'Selections' : 'Selection'}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-black text-primary-fixed uppercase tracking-widest leading-none mb-1 text-right">Total Bill</p>
                <p className="text-xl leading-none font-black">₹{cart.getTotal().toFixed(0)}</p>
              </div>
              <ChevronRight size={24} strokeWidth={3} className="text-primary-fixed-dim" />
            </div>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {showCart && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up border-t border-outline-variant text-on-surface">
            <div className="flex items-center justify-between p-4 border-b border-outline-variant">
              <h2 className="text-lg font-bold">Your Order</h2>
              <button onClick={() => setShowCart(false)} className="p-1 rounded-full hover:bg-surface-container">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.items.map((item) => (
                <div key={`${item.menuItemId}-${item.variantId}`} className="bg-surface-container rounded-xl p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-sm border-2 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                          <span className={`block w-1.5 h-1.5 rounded-full m-[1px] ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                        </span>
                        <span className="font-medium text-sm text-on-surface">{item.name}</span>
                      </div>
                      {item.variantName && (
                        <span className="text-xs text-on-surface-variant ml-5">{item.variantName}</span>
                      )}
                      {item.addonNames.length > 0 && (
                        <p className="text-xs text-on-surface-variant ml-5">+ {item.addonNames.join(', ')}</p>
                      )}
                    </div>
                    <span className="text-sm font-semibold text-on-surface">
                      ₹{((item.price + item.addonPrices.reduce((a, b) => a + b, 0)) * item.quantity).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <input
                      type="text"
                      placeholder="Special instructions..."
                      value={item.specialInstructions}
                      onChange={(e) => cart.updateSpecialInstructions(item.menuItemId, e.target.value, item.variantId)}
                      className="text-xs bg-surface-container-high rounded-lg px-2 py-1.5 flex-1 mr-3 text-on-surface placeholder:text-on-surface-variant/70 border-none focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => cart.updateQuantity(item.menuItemId, item.quantity - 1, item.variantId)}
                        className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest transition-colors text-on-surface"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-sm font-semibold w-6 text-center text-on-surface">{item.quantity}</span>
                      <button
                        onClick={() => cart.updateQuantity(item.menuItemId, item.quantity + 1, item.variantId)}
                        className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center hover:bg-primary-container transition-colors text-on-primary hover:text-on-primary-container"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Recommendations */}
              {recommendations && (recommendations as Array<{id: string; name: string; price: number; confidence: number}>).length > 0 && (
                <div className="mt-4 p-3 bg-primary/10 rounded-xl border border-primary/20">
                  <p className="text-xs text-primary font-semibold mb-2">🤖 Often ordered together</p>
                  {(recommendations as Array<{id: string; name: string; price: number; confidence: number}>).map((rec) => (
                    <div key={rec.id} className="flex items-center justify-between py-1">
                      <span className="text-sm text-on-surface">{rec.name}</span>
                      <span className="text-xs text-primary">₹{rec.price}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Coupon */}
              <div className="mt-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 bg-surface-container rounded-xl text-sm border border-outline-variant focus:border-primary focus:outline-none text-on-surface"
                    />
                  </div>
                  <button
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                    className="px-4 py-2.5 bg-surface-container-high text-primary text-sm font-medium rounded-xl hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    {couponLoading ? '...' : 'Apply'}
                  </button>
                </div>
                {cart.couponCode && (
                  <div className="flex items-center justify-between mt-2 px-2">
                    <span className="text-xs text-secondary">✓ {cart.couponCode} applied — ₹{cart.discount.toFixed(0)} off</span>
                    <button onClick={() => cart.clearCoupon()} className="text-xs text-error">Remove</button>
                  </div>
                )}
              </div>
            </div>

            {/* Order Summary */}
            <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
              <div className="space-y-1 mb-3">
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Subtotal</span>
                  <span>₹{cart.getSubtotal().toFixed(0)}</span>
                </div>
                {cart.discount > 0 && (
                  <div className="flex justify-between text-sm text-secondary">
                    <span>Discount</span>
                    <span>-₹{cart.discount.toFixed(0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-on-surface-variant">
                  <span>Tax (5%)</span>
                  <span>₹{cart.getTax().toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-base font-bold text-on-surface pt-1 border-t border-outline-variant">
                  <span>Total</span>
                  <span>₹{cart.getTotal().toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing || cart.items.length === 0}
                className="w-full bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-semibold py-3.5 rounded-xl transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                id="place-order-button"
              >
                {placing ? 'Placing Order...' : `Place Order — ₹${cart.getTotal().toFixed(0)}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex flex-col">
          <div className="absolute inset-0 bg-inverse-surface/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <div className="relative mt-auto bg-surface-container-lowest rounded-t-[2rem] max-h-[85vh] h-[80vh] flex flex-col animate-slide-up border-t border-outline-variant shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
            <div className="flex items-center justify-between p-6 border-b border-outline-variant">
              <div>
                <h2 className="text-xl font-bold text-on-surface mb-1">Your Profile</h2>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-md">{cart.customerName}</span>
                  <span className="text-xs text-on-surface-variant">{cart.customerPhone}</span>
                </div>
              </div>
              <button onClick={() => setShowHistory(false)} className="p-2 rounded-full hover:bg-surface-container transition-colors">
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <h3 className="text-sm font-semibold text-on-surface-variant mb-4 flex items-center gap-2">
                <Clock size={16} /> Order History
              </h3>
              
              {!history ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-4">
                    <Clock size={24} className="text-on-surface-variant/70" />
                  </div>
                  <p className="text-on-surface-variant font-medium">No past orders found.</p>
                  <p className="text-xs text-on-surface-variant/70 mt-1">Your delicious history will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {history.map((order: any) => (
                    <div key={order.id} className="bg-surface-container-high/50 rounded-2xl p-4 border border-outline-variant/50 hover:bg-surface-container-highest transition-colors">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="text-xs font-bold text-on-surface-variant mb-0.5">{order.branch.name}</p>
                          <p className="text-[10px] text-on-surface-variant/70">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${
                          order.status === 'COMPLETED' ? 'bg-secondary-container text-secondary' :
                          order.status === 'CANCELLED' ? 'bg-error-container text-error' :
                          'bg-primary-container text-primary'
                        }`}>{order.status}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {order.items.map((item: any, i: number) => (
                          <span key={i} className="text-xs text-on-surface bg-surface-container-highest/50 px-2 py-1 rounded-md">
                            {item.quantity}x {item.menuItem.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-outline-variant/50">
                        <span className="text-[10px] text-on-surface-variant/70 font-medium uppercase">Total Paid</span>
                        <span className="text-sm font-black text-primary">₹{order.total}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <CustomerAuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => {
          // If we had items and tried to checkout, proceed
          if (showCheckout) handlePlaceOrder();
        }}
        isForced={!cart.customerPhone}
        slug={slug!}
      />
    </div>
  );
}

// ── Menu Item Card Component ──────────────

function MenuItemCard({ item, onAdd, cart }: {
  item: MenuItem;
  onAdd: (item: MenuItem, variantId?: string, addonIds?: string[]) => void;
  cart: any;
}) {
  const [showCustomize, setShowCustomize] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    item.variants.length > 0 ? item.variants[0]?.id : undefined
  );
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  const cartItem = cart.items.find((i: any) => i.menuItemId === item.id);
  const hasVariants = item.variants.length > 0;

  const handleAdd = () => {
    if (hasVariants || item.addons.length > 0) {
      setShowCustomize(true);
    } else {
      onAdd(item);
    }
  };

  const confirmAdd = () => {
    onAdd(item, selectedVariant, selectedAddons);
    setShowCustomize(false);
    setSelectedAddons([]);
  };

  return (
    <>
      <div className="group relative bg-surface-container-lowest border border-outline-variant rounded-[2rem] p-4 flex gap-5 hover:bg-surface-container-low hover:border-outline transition-all active:scale-[0.98] duration-500 shadow-2xl shadow-black/5">
        {/* Image Section */}
        <button 
          onClick={() => setShowDetails(true)} 
          className="relative w-32 h-32 sm:w-36 sm:h-36 flex-shrink-0 overflow-hidden rounded-3xl bg-surface-container border border-outline-variant shadow-inner block text-left"
        >
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl opacity-30 group-hover:opacity-50 transition-opacity">
              {item.isVeg ? '🥗' : '🍗'}
            </div>
          )}
          {item.isPopular && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 bg-tertiary text-[9px] font-black text-on-tertiary rounded-full flex items-center gap-1.5 shadow-lg shadow-tertiary/30 backdrop-blur-sm">
              <Flame size={10} fill="currentColor" /> POPULAR
            </div>
          )}
        </button>

        {/* Content Section */}
        <div className="flex-1 flex flex-col justify-between py-1 min-w-0">
          <div>
            <button onClick={() => setShowDetails(true)} className="flex items-center gap-2.5 mb-2 hover:opacity-80 transition-opacity text-left w-full">
              <div className={`w-3.5 h-3.5 rounded-sm border-[1.5px] flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${item.isVeg ? 'bg-green-600 shadow-[0_0_8px_rgba(22,163,74,0.4)]' : 'bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]'}`} />
              </div>
              <h3 className="text-base font-black text-on-surface tracking-tight truncate group-hover:text-primary transition-colors pointer-events-none">{item.name}</h3>
            </button>
            <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-4 group-hover:text-on-surface-variant/90 transition-colors">
              {item.description || "A masterfully crafted selection featuring premium local ingredients and traditional culinary techniques."}
            </p>
          </div>

          <div className="flex items-center justify-between mt-auto">
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-[10px] font-black text-outline uppercase">₹</span>
                <span className="text-xl font-black text-on-surface tracking-tighter">{item.price}</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[9px] font-black text-outline uppercase tracking-[0.15em]">Classic Selection</p>
                {item.tags.includes('spicy') && <div className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />}
              </div>
            </div>
            
            {cartItem ? (
              <div className="flex items-center bg-surface-container rounded-2xl p-1.5 border border-outline-variant shadow-lg">
                <button
                  onClick={() => cart.updateQuantity(item.id, cartItem.quantity - 1, cartItem.variantId)}
                  className="w-8 h-8 rounded-xl bg-surface-container-high flex items-center justify-center hover:bg-surface-container-highest text-on-surface transition-all active:scale-90"
                >
                  <Minus size={14} strokeWidth={3} />
                </button>
                <span className="text-sm font-black text-on-surface w-8 text-center">{cartItem.quantity}</span>
                <button
                  onClick={() => cart.updateQuantity(item.id, cartItem.quantity + 1, cartItem.variantId)}
                  className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center hover:bg-primary-container text-on-primary hover:text-on-primary-container transition-all active:scale-90 shadow-lg shadow-primary/20"
                >
                  <Plus size={14} strokeWidth={3} />
                </button>
              </div>
            ) : (
              <button
                onClick={handleAdd}
                className="group/btn relative px-7 py-3 bg-primary text-on-primary font-black text-[10px] tracking-widest uppercase rounded-2xl border-b-4 border-surface-tint hover:bg-primary-container hover:text-on-primary-container active:translate-y-0.5 active:border-b-0 transition-all shadow-xl shadow-primary/20 overflow-hidden"
              >
                <span className="relative z-10">Add to Bag</span>
                <div className="absolute inset-0 bg-on-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Item Details Info Drawer */}
      {showDetails && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-inverse-surface/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowDetails(false)} />
          <div className="relative w-full max-w-sm bg-surface-container-lowest rounded-[2rem] overflow-hidden animate-slide-up shadow-2xl border border-outline-variant">
            {item.imageUrl ? (
               <img src={item.imageUrl} alt={item.name} className="w-full h-64 object-cover" />
            ) : (
               <div className="w-full h-64 bg-surface-container flex items-center justify-center text-6xl shadow-inner">
                  {item.isVeg ? '🥗' : '🍗'}
               </div>
            )}
            
            <button onClick={() => setShowDetails(false)} className="absolute top-4 right-4 w-10 h-10 bg-inverse-surface/50 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-inverse-surface/80 transition-colors">
              <X size={20} className="text-inverse-on-surface" />
            </button>

            <div className="p-6">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                     <div className={`w-4 h-4 rounded-sm border-[2px] flex items-center justify-center flex-shrink-0 ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                     </div>
                     <h3 className="text-xl font-black text-on-surface tracking-tight">{item.name}</h3>
                  </div>
                  <span className="text-2xl font-black text-primary">₹{item.price}</span>
               </div>
               
               <p className="text-sm text-on-surface-variant leading-relaxed mb-6">
                  {item.description || "A masterfully crafted selection featuring premium local ingredients and traditional culinary techniques."}
               </p>

               <div className="flex flex-wrap gap-2 mb-6">
                  {(item.tags || []).map(t => (
                     <span key={t} className="px-2 py-1 bg-surface-container-high border border-outline-variant text-on-surface-variant rounded text-xs font-bold uppercase tracking-widest">{t}</span>
                  ))}
                  {item.preparationTimeMinutes > 0 && (
                     <span className="px-2 py-1 bg-primary/10 border border-primary/20 text-primary rounded text-xs font-bold tracking-widest">{item.preparationTimeMinutes} Min</span>
                  )}
               </div>

               <button
                  onClick={() => {
                     setShowDetails(false);
                     handleAdd();
                  }}
                  className="w-full py-4 bg-primary hover:bg-primary-container text-on-primary hover:text-on-primary-container font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
               >
                  Add to Bag
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modern Customize Sheet (Mobile Optimized) */}
      {showCustomize && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-inverse-surface/80 backdrop-blur-sm animate-fade-in" onClick={() => setShowCustomize(false)} />
          <div className="relative w-full max-w-lg bg-surface-container-lowest rounded-t-[3rem] p-8 animate-slide-up border-t border-outline-variant shadow-2xl">
            <div className="w-12 h-1.5 bg-surface-container-high rounded-full mx-auto mb-8" />
            
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-on-surface tracking-tight mb-2">{item.name}</h3>
                <p className="text-sm text-on-surface-variant">Tailor your selection to perfection</p>
              </div>
              <button onClick={() => setShowCustomize(false)} className="w-10 h-10 bg-surface-container rounded-full flex items-center justify-center hover:bg-surface-container-high transition-colors">
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="space-y-8 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide mb-8">
              {item.variants.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Select Variant</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {item.variants.map((v) => (
                      <label
                        key={v.id}
                        className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${
                          selectedVariant === v.id ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="radio"
                            name="variant"
                            checked={selectedVariant === v.id}
                            onChange={() => setSelectedVariant(v.id)}
                            className="w-5 h-5 accent-primary bg-transparent border-outline"
                          />
                          <span className={`text-sm font-bold ${selectedVariant === v.id ? 'text-on-surface' : 'text-on-surface-variant'}`}>{v.name}</span>
                        </div>
                        <span className={`text-xs font-black ${selectedVariant === v.id ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {v.additionalPrice > 0 ? `+₹${v.additionalPrice}` : v.additionalPrice < 0 ? `-₹${Math.abs(v.additionalPrice)}` : 'Included'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {item.addons.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Enhancements</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {item.addons.map((a) => (
                      <label
                        key={a.id}
                        className={`flex items-center justify-between p-5 rounded-3xl cursor-pointer transition-all border-2 ${
                          selectedAddons.includes(a.id) ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' : 'bg-surface-container border-transparent hover:bg-surface-container-high'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedAddons.includes(a.id)}
                            onChange={(e) => {
                              if (e.target.checked) setSelectedAddons([...selectedAddons, a.id]);
                              else setSelectedAddons(selectedAddons.filter((id) => id !== a.id));
                            }}
                            className="w-5 h-5 rounded-lg accent-primary bg-transparent border-outline"
                          />
                          <span className={`text-sm font-bold ${selectedAddons.includes(a.id) ? 'text-on-surface' : 'text-on-surface-variant'}`}>{a.name}</span>
                        </div>
                        <span className={`text-xs font-black ${selectedAddons.includes(a.id) ? 'text-primary' : 'text-on-surface-variant'}`}>
                          {a.price > 0 ? `+₹${a.price}` : 'Free'}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={confirmAdd}
              className="w-full bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-black py-5 rounded-[2rem] border-b-4 border-surface-tint active:translate-y-1 active:border-b-0 transition-all shadow-2xl shadow-primary/30 text-xs tracking-widest uppercase mb-4"
            >
              Update Bag — Total ₹{(item.price + (item.variants.find(v => v.id === selectedVariant)?.additionalPrice || 0) + item.addons.filter(a => selectedAddons.includes(a.id)).reduce((sum, a) => sum + a.price, 0))}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
