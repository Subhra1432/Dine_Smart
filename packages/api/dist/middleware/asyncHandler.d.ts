import type { Request, Response, NextFunction, RequestHandler } from 'express';
type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<unknown>;
export declare function asyncHandler(fn: AsyncRequestHandler): RequestHandler;
export {};
//# sourceMappingURL=asyncHandler.d.ts.map