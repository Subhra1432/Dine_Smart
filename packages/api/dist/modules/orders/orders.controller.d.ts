import type { Request, Response } from 'express';
export declare function createOrder(req: Request, res: Response): Promise<void>;
export declare function getOrderBySession(req: Request, res: Response): Promise<void>;
export declare function initiatePayment(req: Request, res: Response): Promise<void>;
export declare function paymentWebhook(req: Request, res: Response): Promise<void>;
export declare function createReview(req: Request, res: Response): Promise<void>;
export declare function requestPayment(req: Request, res: Response): Promise<void>;
//# sourceMappingURL=orders.controller.d.ts.map