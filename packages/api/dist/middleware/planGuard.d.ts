import type { Request, Response, NextFunction } from 'express';
type PlanFeature = 'aiRecommendations' | 'aiDemandForecast' | 'aiSmartPricing' | 'inventory' | 'analytics' | 'whiteLabel';
export declare function requirePlanFeature(feature: PlanFeature): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function requireBranchLimit(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare function requireTableLimit(): (req: Request, res: Response, next: NextFunction) => Promise<void>;
export {};
//# sourceMappingURL=planGuard.d.ts.map