// ═══════════════════════════════════════════
// DineSmart OS — Global Error Handler
// ═══════════════════════════════════════════

import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  try {
    logger.error('Error:', {
      message: err.message,
      stack: err.stack,
      path: req.path,
      method: req.method,
      userId: req.user?.userId,
      restaurantId: req.user?.restaurantId,
    });
  } catch (logError) {
    console.error('Logger failed:', logError);
    console.error('Original Error:', err);
  }

  // Ensure we haven't already sent headers
  if (res.headersSent) {
    return _next(err);
  }

  // Zod validation errors
  if (err instanceof ZodError) {
    return void res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // Prisma unique constraint violation
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') || 'field';
      return void res.status(409).json({
        success: false,
        error: `A record with this ${target} already exists`,
      });
    }
    if (err.code === 'P2025') {
      return void res.status(404).json({
        success: false,
        error: 'Record not found',
      });
    }
  }

  // App errors
  if (err instanceof AppError) {
    return void res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return void res.status(401).json({
      success: false,
      error: 'Invalid or expired token',
    });
  }

  // Default 500 error
  const statusCode = (err as any).status || (err as any).statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: env.NODE_ENV === 'production'
      ? 'An unexpected error occurred'
      : err.message || 'Internal Server Error',
  });
}
