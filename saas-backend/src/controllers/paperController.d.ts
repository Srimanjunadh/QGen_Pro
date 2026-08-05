import { Request, Response } from "express";
export declare const generatePaper: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPapers: (req: Request, res: Response) => Promise<void>;
export declare const getPaperById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=paperController.d.ts.map