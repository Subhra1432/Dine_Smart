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

export async function sendOtp(phone: string, slug?: string) {
  // Check if restaurant has OTP bypass enabled
  let otpBypass = true; // default to bypass
  if (slug) {
    const restaurant = await prisma.restaurant.findUnique({ where: { slug }, select: { otpBypass: true } });
    if (restaurant) otpBypass = restaurant.otpBypass;
  }

  if (otpBypass) {
    logger.info(`[OTP BYPASS] Sending OTP to ${phone} (use 123456)`);
    return { message: 'OTP sent successfully (Bypass active: use 123456)', bypass: true };
  }

  // Real Twilio Verify
  const { env } = await import('../../config/env.js');
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
    logger.warn('[OTP] Twilio not configured, falling back to bypass');
    return { message: 'OTP sent successfully (use 123456)', bypass: true };
  }

  try {
    const twilio = (await import('twilio')).default;
    const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
    
    // Ensure phone has country code
    const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`;
    
    await client.verify.v2
      .services(env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({ to: formattedPhone, channel: 'sms' });
    
    logger.info(`[OTP] Twilio OTP sent to ${formattedPhone}`);
    return { message: 'OTP sent successfully', bypass: false };
  } catch (error: any) {
    logger.error('[OTP] Twilio send failed', { error: error.message });
    throw new AppError(500, 'Failed to send OTP. Please try again.');
  }
}

export async function verifyOtp(slug: string, phone: string, code: string, name?: string) {
  const restaurant = await prisma.restaurant.findUnique({ where: { slug } });
  if (!restaurant) throw new AppError(404, 'Restaurant not found');

  const otpBypass = restaurant.otpBypass;

  if (otpBypass) {
    logger.info(`[OTP BYPASS] Verifying OTP for ${phone} with code ${code}`);
    if (code !== '123456') {
      throw new AppError(400, 'Invalid verification code');
    }
  } else {
    // Real Twilio Verify check
    const { env } = await import('../../config/env.js');
    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SERVICE_SID) {
      // Fallback if Twilio not configured
      if (code !== '123456') throw new AppError(400, 'Invalid verification code');
    } else {
      try {
        const twilio = (await import('twilio')).default;
        const client = twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
        const formattedPhone = phone.startsWith('+') ? phone : `+91${phone.replace(/^0+/, '')}`;
        
        const verification = await client.verify.v2
          .services(env.TWILIO_VERIFY_SERVICE_SID)
          .verificationChecks.create({ to: formattedPhone, code });
        
        if (verification.status !== 'approved') {
          throw new AppError(400, 'Invalid or expired OTP');
        }
        logger.info(`[OTP] Twilio verified for ${formattedPhone}`);
      } catch (error: any) {
        if (error instanceof AppError) throw error;
        logger.error('[OTP] Twilio verify failed', { error: error.message });
        throw new AppError(400, 'Invalid or expired OTP');
      }
    }
  }

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { restaurantId_phone: { restaurantId: restaurant.id, phone } }
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        phone,
        name: name || 'Guest',
        restaurantId: restaurant.id
      }
    });
  } else if (name && !customer.name) {
    customer = await prisma.customer.update({
      where: { id: customer.id },
      data: { name }
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
