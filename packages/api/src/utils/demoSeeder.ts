import { prisma } from '../config/database.js';
import { logger } from '../config/logger.js';

export async function seedDemoMenu(restaurantId: string) {
  logger.info('🌱 Seeding demo menu items...', { restaurantId });

  // 1. Create Categories
  const categoriesData = [
    { name: 'Chef\'s Special', sortOrder: 0 },
    { name: 'Premium Starters', sortOrder: 1 },
    { name: 'Signature Main Course', sortOrder: 2 },
    { name: 'Artisanal Breads', sortOrder: 3 },
    { name: 'Sides & Salads', sortOrder: 4 },
    { name: 'Craft Beverages', sortOrder: 5 },
    { name: 'Decadent Desserts', sortOrder: 6 },
  ];

  const categories = await Promise.all(
    categoriesData.map(c => 
      prisma.category.upsert({
        where: { restaurantId_name: { restaurantId, name: c.name } },
        update: { sortOrder: c.sortOrder },
        create: { restaurantId, ...c }
      })
    )
  );

  // 2. Create Addons
  const addonsData = [
    { name: 'Extra Truffle Oil', price: 150 },
    { name: 'Aged Parmesan', price: 80 },
    { name: 'Himalayan Chili Dip', price: 40 },
    { name: 'Roasted Garlic Mayo', price: 30 },
  ];

  const addons = await Promise.all(
    addonsData.map(a => 
      prisma.addon.upsert({
        where: { restaurantId_name: { restaurantId, name: a.name } },
        update: { price: a.price },
        create: { restaurantId, ...a }
      })
    )
  );

  // 3. Create Menu Items
  const menuItems = [
    // Chef's Special
    { 
      categoryId: categories[0]!.id, 
      name: 'Truffle Mushroom Risotto', 
      price: 549, 
      isVeg: true, 
      prepTime: 25, 
      tags: ['premium', 'signature'], 
      desc: 'Arborio rice slow-cooked with wild mushrooms and finished with Italian truffle oil.' 
    },
    { 
      categoryId: categories[0]!.id, 
      name: 'Flame-Grilled Atlantic Salmon', 
      price: 899, 
      isVeg: false, 
      prepTime: 20, 
      tags: ['healthy', 'omega-3'], 
      desc: 'Fresh salmon fillet glazed with honey-lemon and served over roasted asparagus.' 
    },
    
    // Premium Starters
    { 
      categoryId: categories[1]!.id, 
      name: 'Crispy Avocado Tempura', 
      price: 349, 
      isVeg: true, 
      prepTime: 12, 
      tags: ['new', 'vegan'], 
      desc: 'Lightly battered avocado wedges served with spicy sriracha aioli.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Spiced Lamb Sliders', 
      price: 499, 
      isVeg: false, 
      prepTime: 15, 
      tags: ['bestseller'], 
      desc: 'Three mini lamb burgers with feta cheese and pickled cucumbers.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Mediterranean Mezze Platter', 
      price: 429, 
      isVeg: true, 
      prepTime: 10, 
      tags: ['sharing', 'healthy'], 
      desc: 'Hummus, babaganoush, and tzatziki served with warm pita bread.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Spicy Tuna Tartare', 
      price: 595, 
      isVeg: false, 
      prepTime: 12, 
      tags: ['seafood', 'premium'], 
      desc: 'Fresh Ahi tuna with avocado, ginger-soy glaze and crispy wonton chips.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Wagyu Beef Sliders', 
      price: 649, 
      isVeg: false, 
      prepTime: 15, 
      tags: ['signature', 'beef'], 
      desc: 'Three mini Wagyu beef burgers with caramelized onions and truffle aioli.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Burrata with Heirloom Tomatoes', 
      price: 525, 
      isVeg: true, 
      prepTime: 10, 
      tags: ['fresh', 'italian'], 
      desc: 'Creamy burrata cheese with organic heirloom tomatoes, basil pesto and aged balsamic.' 
    },
    { 
      categoryId: categories[1]!.id, 
      name: 'Black Truffle Arancini', 
      price: 450, 
      isVeg: true, 
      prepTime: 15, 
      tags: ['starter', 'truffle'], 
      desc: 'Crispy risotto balls stuffed with mozzarella and black truffle, served with garlic aioli.' 
    },

    // Main Course
    { 
      categoryId: categories[2]!.id, 
      name: 'Slow-Cooked Rogan Josh', 
      price: 599, 
      isVeg: false, 
      prepTime: 30, 
      tags: ['spicy', 'traditional'], 
      desc: 'Kashmiri style tender lamb cooked in a rich onion and tomato gravy.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Spinach & Ricotta Ravioli', 
      price: 449, 
      isVeg: true, 
      prepTime: 18, 
      tags: ['classic'], 
      desc: 'Handmade pasta filled with creamy ricotta and spinach in a brown butter sage sauce.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Butter Chicken Deluxe', 
      price: 549, 
      isVeg: false, 
      prepTime: 25, 
      tags: ['popular', 'creamy'], 
      desc: 'Tandoori grilled chicken in a velvety tomato and butter gravy.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Wild Mushroom Fettuccine', 
      price: 479, 
      isVeg: true, 
      prepTime: 20, 
      tags: ['vegetarian', 'italian'], 
      desc: 'Fresh fettuccine tossed with a medley of wild mushrooms and parmesan cream.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Lobster Thermidor', 
      price: 2450, 
      isVeg: false, 
      prepTime: 35, 
      tags: ['luxury', 'seafood'], 
      desc: 'Tender lobster meat in a creamy brandy sauce, topped with Gruyère cheese.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Pan-Seared Scallops', 
      price: 895, 
      isVeg: false, 
      prepTime: 18, 
      tags: ['seafood', 'signature'], 
      desc: 'Jumbo scallops with cauliflower silk, crispy pancetta and herb oil.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Sous-vide Duck Breast', 
      price: 1250, 
      isVeg: false, 
      prepTime: 30, 
      tags: ['gourmet', 'meat'], 
      desc: 'Tender duck breast with cherry reduction, parsnip puree and roasted baby carrots.' 
    },
    { 
      categoryId: categories[2]!.id, 
      name: 'Wild Caught Sea Bass', 
      price: 1450, 
      isVeg: false, 
      prepTime: 25, 
      tags: ['healthy', 'ocean-fresh'], 
      desc: 'Pan-seared sea bass with saffron beurre blanc and sautéed baby spinach.' 
    },

    // Beverages
    { 
      categoryId: categories[5]!.id, 
      name: 'Blueberry Mint Mojito', 
      price: 199, 
      isVeg: true, 
      prepTime: 5, 
      tags: ['refreshing'], 
      desc: 'Fresh blueberries, mint leaves, and lime muddled with sparkling soda.' 
    },
    { 
      categoryId: categories[5]!.id, 
      name: 'Caramel Macchiato', 
      price: 249, 
      isVeg: true, 
      prepTime: 8, 
      tags: ['hot'], 
      desc: 'Double shot espresso with steamed milk and vanilla syrup, drizzled with caramel.' 
    },
    { 
      categoryId: categories[5]!.id, 
      name: 'Passion Fruit Iced Tea', 
      price: 159, 
      isVeg: true, 
      prepTime: 3, 
      tags: ['cold'], 
      desc: 'House-brewed black tea infused with tropical passion fruit nectar.' 
    },
    { categoryId: categories[5]!.id, name: 'Lavender Lemonade', desc: 'Refreshing house-made lemonade', price: 195, isVeg: true, prepTime: 5, tags: ['drink'] },
    { categoryId: categories[5]!.id, name: 'Classic Negroni', desc: 'Gin, Campari, Sweet Vermouth', price: 550, isVeg: true, prepTime: 5, tags: ['drink'] },
    { categoryId: categories[5]!.id, name: 'Passion Fruit Mojito', desc: 'Fresh mint, lime, and passion fruit', price: 285, isVeg: true, prepTime: 5, tags: ['drink'] },
    { categoryId: categories[5]!.id, name: 'Himalayan Pink Salt Lassi', desc: 'Creamy yogurt with pink salt', price: 145, isVeg: true, prepTime: 5, tags: ['drink'] },
    { 
      categoryId: categories[5]!.id, 
      name: 'Hibiscus Infused Gin (Mocktail)', 
      price: 325, 
      isVeg: true, 
      prepTime: 7, 
      tags: ['exclusive', 'floral'], 
      desc: 'Non-alcoholic botanical spirit infused with hibiscus, lime and soda.' 
    },
    { 
      categoryId: categories[5]!.id, 
      name: 'Cold Brew Nitro Coffee', 
      price: 275, 
      isVeg: true, 
      prepTime: 3, 
      tags: ['caffeine', 'smooth'], 
      desc: '24-hour slow steeped cold brew infused with nitrogen for a creamy finish.' 
    },

    // Desserts
    { 
      categoryId: categories[6]!.id, 
      name: 'Molten Lava Cake', 
      price: 299, 
      isVeg: true, 
      prepTime: 15, 
      tags: ['indulgent'], 
      desc: 'Warm chocolate cake with a gooey center, served with vanilla bean ice cream.' 
    },
    { 
      categoryId: categories[6]!.id, 
      name: 'Classic Tiramisu', 
      price: 349, 
      isVeg: true, 
      prepTime: 10, 
      tags: ['italian', 'coffee'], 
      desc: 'Espresso-soaked ladyfingers layered with mascarpone cream and cocoa dust.' 
    },
    { 
      categoryId: categories[6]!.id, 
      name: 'Deconstructed Lemon Tart', 
      price: 425, 
      isVeg: true, 
      prepTime: 12, 
      tags: ['citrus', 'artistic'], 
      desc: 'Lemon curd, shortbread soil, meringue kisses, and candied lemon peel.' 
    },
    { 
      categoryId: categories[0]!.id, 
      name: 'Miso Glazed Baby Eggplant', 
      price: 495, 
      isVeg: true, 
      prepTime: 15, 
      tags: ['vegan', 'umami'], 
      desc: 'Roasted baby eggplant with sweet miso glaze, toasted sesame, and scallions.' 
    },
    { categoryId: categories[6]!.id, name: 'Warm Apple Galette', desc: 'With vanilla bean ice cream', price: 375, isVeg: true, prepTime: 15, tags: ['dessert'] },
    { categoryId: categories[6]!.id, name: 'Espresso Martini Tiramisu', desc: 'Classic Italian with a twist', price: 425, isVeg: true, prepTime: 12, tags: ['dessert'] },
    { categoryId: categories[6]!.id, name: 'Belgian Chocolate Fondant', desc: 'Oozing warm chocolate center', price: 495, isVeg: true, prepTime: 15, tags: ['dessert'] },
    { categoryId: categories[6]!.id, name: 'Mango Sticky Rice', desc: 'Sweet coconut rice with fresh Alphonso', price: 325, isVeg: true, prepTime: 10, tags: ['dessert'] },
    { 
      categoryId: categories[6]!.id, 
      name: 'Deconstructed Lemon Tart', 
      price: 450, 
      isVeg: true, 
      prepTime: 15, 
      tags: ['artisan', 'dessert'], 
      desc: 'Lemon curd, shortbread soil, toasted meringue and basil crystals.' 
    },
  ];

  for (const data of menuItems) {
    const item = await prisma.menuItem.upsert({
      where: { restaurantId_name: { restaurantId, name: data.name } },
      update: {
        price: data.price,
        description: data.desc,
        isVeg: data.isVeg,
        preparationTimeMinutes: data.prepTime,
        tags: data.tags,
      },
      create: {
        restaurantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.desc,
        price: data.price,
        isVeg: data.isVeg,
        preparationTimeMinutes: data.prepTime,
        tags: data.tags,
      }
    });

    // Add some variants for Risotto
    if (data.name === 'Truffle Mushroom Risotto') {
      await prisma.menuItemVariant.upsert({
        where: { menuItemId_name: { menuItemId: item.id, name: 'Small' } },
        update: { additionalPrice: -150 },
        create: { menuItemId: item.id, name: 'Small', additionalPrice: -150 }
      });
      await prisma.menuItemVariant.upsert({
        where: { menuItemId_name: { menuItemId: item.id, name: 'Large' } },
        update: { additionalPrice: 0 },
        create: { menuItemId: item.id, name: 'Large', additionalPrice: 0 }
      });
    }

    // Link addons to starters
    if (data.categoryId === categories[1]!.id) {
      await prisma.menuItemAddon.upsert({
        where: { menuItemId_addonId: { menuItemId: item.id, addonId: addons[2]!.id } }, // Himalayan Chili
        update: {},
        create: { menuItemId: item.id, addonId: addons[2]!.id }
      });
    }
  }

  logger.info('✅ Demo menu seeded successfully');
}
