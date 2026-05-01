// ═══════════════════════════════════════════
// DineSmart OS — Restaurant Module (Service)
// ═══════════════════════════════════════════

import { prisma } from '../../config/database.js';
import { AppError } from '../../middleware/errorHandler.js';
import QRCode from 'qrcode';
import { env } from '../../config/env.js';
import type { Request } from 'express';

export async function getProfile(restaurantId: string) {
  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      _count: { select: { branches: true, tables: true, menuItems: true, orders: true } },
    },
  });
  if (!restaurant) throw new AppError(404, 'Restaurant not found');
  return restaurant;
}

export async function updateProfile(restaurantId: string, data: { name?: string; logoUrl?: string; bannerText?: string; bannerImageUrl?: string }) {
  return prisma.restaurant.update({ where: { id: restaurantId }, data });
}

// ── Branches ─────────────────────────────

export async function getBranches(restaurantId: string) {
  return prisma.branch.findMany({
    where: { restaurantId },
    include: { _count: { select: { tables: true, orders: true } } },
    orderBy: { name: 'asc' },
  });
}

export async function createBranch(restaurantId: string, data: {
  name: string; address: string; phone: string; timezone?: string;
}) {
  return prisma.branch.create({
    data: { ...data, restaurantId, timezone: data.timezone || 'Asia/Kolkata' },
  });
}

export async function updateBranch(restaurantId: string, branchId: string, data: Record<string, unknown>) {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, restaurantId } });
  if (!branch) throw new AppError(404, 'Branch not found');
  return prisma.branch.update({ where: { id: branchId }, data });
}

export async function deleteBranch(restaurantId: string, branchId: string) {
  const branch = await prisma.branch.findFirst({ where: { id: branchId, restaurantId } });
  if (!branch) throw new AppError(404, 'Branch not found');
  return prisma.branch.delete({ where: { id: branchId } });
}

// ── Tables ───────────────────────────────

export async function getTables(restaurantId: string, branchId?: string) {
  const where: Record<string, unknown> = { restaurantId };
  if (branchId) where['branchId'] = branchId;
  return prisma.table.findMany({
    where,
    include: {
      branch: { select: { name: true } },
      orders: {
        where: { status: { notIn: ['COMPLETED', 'CANCELLED'] } },
        select: { id: true, status: true, total: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
    orderBy: [{ branchId: 'asc' }, { number: 'asc' }],
  });
}

export async function createTable(restaurantId: string, data: {
  branchId: string; number: number; capacity: number;
}) {
  const branch = await prisma.branch.findFirst({
    where: { id: data.branchId, restaurantId },
  });
  if (!branch) throw new AppError(404, 'Branch not found');

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });

  const table = await prisma.table.create({
    data: { ...data, restaurantId },
  });

  // Generate QR code
  const qrUrl = `${env.QR_BASE_URL}/menu?restaurant=${restaurant?.slug}&table=${table.id}`;
  const qrDataUrl = await QRCode.toDataURL(qrUrl, { width: 400, margin: 2 });

  const updated = await prisma.table.update({
    where: { id: table.id },
    data: { qrCodeUrl: qrDataUrl },
  });

  return updated;
}

export async function updateTable(restaurantId: string, tableId: string, data: Record<string, unknown>) {
  const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
  if (!table) throw new AppError(404, 'Table not found');
  return prisma.table.update({ where: { id: tableId }, data });
}

export async function deleteTable(restaurantId: string, tableId: string) {
  const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
  if (!table) throw new AppError(404, 'Table not found');
  return prisma.table.delete({ where: { id: tableId } });
}

export async function getTableQR(restaurantId: string, tableId: string, req?: Request) {
  const table = await prisma.table.findFirst({ where: { id: tableId, restaurantId } });
  if (!table) throw new AppError(404, 'Table not found');

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    select: { slug: true },
  });

  // Derive the customer app base URL dynamically from the request host.
  // This makes QR codes work on phones on the same WiFi — they get the real LAN IP.
  let baseUrl = env.QR_BASE_URL;
  if (req) {
    // X-Forwarded-Host contains the real host when behind Vite dev proxy
    const forwardedHost = req.headers['x-forwarded-host'] as string | undefined;
    const host = forwardedHost || req.headers['host'] || '';
    // Strip port from host to get just the IP/hostname
    const hostname = host.split(':')[0];
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      // Use the detected LAN IP with the customer app port (5173)
      baseUrl = `http://${hostname}:5173`;
    }
  }

  const qrUrl = `${baseUrl}/menu?restaurant=${restaurant?.slug}&table=${table.number}`;
  return QRCode.toBuffer(qrUrl, { width: 400, margin: 2, type: 'png' });
}

// ── Users ────────────────────────────────

export async function getUsers(restaurantId: string) {
  return prisma.user.findMany({
    where: { restaurantId },
    select: {
      id: true, email: true, role: true, branchId: true, isActive: true, createdAt: true, name: true,
      branch: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function createUser(restaurantId: string, data: {
  email: string; password: string; role: string; branchId?: string; name?: string;
}) {
  const bcrypt = await import('bcryptjs');
  const passwordHash = await bcrypt.default.hash(data.password, 12);
  return prisma.user.create({
    data: {
      restaurantId,
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role as 'OWNER' | 'MANAGER' | 'CASHIER' | 'KITCHEN_STAFF',
      branchId: data.branchId,
    },
    select: { id: true, email: true, role: true, branchId: true, isActive: true, name: true },
  });
}

export async function updateUser(restaurantId: string, userId: string, data: Record<string, unknown>) {
  const user = await prisma.user.findFirst({ where: { id: userId, restaurantId } });
  if (!user) throw new AppError(404, 'User not found');
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, role: true, branchId: true, isActive: true, name: true },
  });
}

export async function deleteUser(restaurantId: string, userId: string) {
  const user = await prisma.user.findFirst({ where: { id: userId, restaurantId } });
  if (!user) throw new AppError(404, 'User not found');
  return prisma.user.delete({ where: { id: userId } });
}
