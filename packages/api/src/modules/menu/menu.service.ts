import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import { logger } from '../../config/logger.js';

export async function getPublicMenu(slug: string, tableId: string) {
  logger.info(`Fetching public menu for restaurant: ${slug}, table: ${tableId}`);
  
  const restaurant = await prisma.restaurant.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          menuItems: {
            where: { isAvailable: true },
            include: {
              menuItemAddons: true
            }
          }
        }
      },
      branches: {
        take: 1
      }
    }
  });

  if (!restaurant) {
    throw new AppError(404, 'Restaurant not found');
  }

  // Find table if not takeaway
  let table = { id: 'takeaway', number: 0 };
  if (tableId !== 'takeaway' && tableId !== '0') {
    try {
      const tableData = await prisma.table.findUnique({
        where: { id: tableId }
      });
      if (tableData) {
        table = { id: tableData.id, number: tableData.number };
      }
    } catch (error) {
      logger.warn(`Failed to fetch table ${tableId}, defaulting to takeaway`);
    }
  }

  const branch = restaurant.branches[0] || {
    allowOrderModification: true,
    requireOrderVerification: false
  };

  return {
    restaurant: {
      id: restaurant.id,
      name: restaurant.name,
      logoUrl: restaurant.logoUrl,
      bannerText: restaurant.bannerText,
      bannerImageUrl: restaurant.bannerImageUrl
    },
    table,
    categories: restaurant.categories.map((cat: any) => ({
      id: cat.id,
      name: cat.name,
      items: (cat.menuItems || []).map((item: any) => ({
        ...item,
        addons: item.menuItemAddons || [],
        variants: []
      }))
    })),
    branch: {
      allowOrderModification: branch.allowOrderModification,
      requireOrderVerification: branch.requireOrderVerification
    }
  };
}

export async function sendOtp(phone: string) {
  logger.info(`[DEV BYPASS] Sending OTP to ${phone}`);
  // Development bypass: Always return success
  return { message: 'OTP sent successfully (Bypass active: use 123456)' };
}

export async function verifyOtp(slug: string, phone: string, code: string, name?: string) {
  logger.info(`[DEV BYPASS] Verifying OTP for ${phone} with code ${code}`);
  
  if (code !== '123456') {
    throw new AppError(400, 'Invalid verification code');
  }

  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) throw new AppError(404, 'Restaurant not found');

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { phone }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phone,
        name: name || 'Guest',
        isVerified: true
      }
    });
  } else if (name && !customer.name) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name, isVerified: true }
    });
  }

  return {
    customer: {
      id: customer.id,
      name: customer.name,
      phone: customer.phone
    },
    token: 'dev-token-' + customer.id
  };
}

// Minimal placeholders for other methods to prevent crashes in controller
export async function getCategories(restaurantId: string) { return []; }
export async function createCategory(restaurantId: string, data: any) { return {}; }
export async function updateCategory(restaurantId: string, id: string, data: any) { return {}; }
export async function deleteCategory(restaurantId: string, id: string) { return {}; }
export async function getMenuItems(restaurantId: string, categoryId?: string) { return []; }
export async function createMenuItem(restaurantId: string, data: any) { return {}; }
export async function updateMenuItem(restaurantId: string, id: string, data: any) { return {}; }
export async function deleteMenuItem(restaurantId: string, id: string) { return {}; }
export async function toggleAvailability(restaurantId: string, id: string) { return {}; }
export async function getAddons(restaurantId: string) { return []; }
export async function createAddon(restaurantId: string, data: any) { return {}; }
export async function updateAddon(restaurantId: string, id: string, data: any) { return {}; }
export async function deleteAddon(restaurantId: string, id: string) { return {}; }
export async function getPublicHistory(slug: string, phone: string) { return []; }
