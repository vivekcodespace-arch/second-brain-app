import { Request } from "express";

declare global {
    namespace Express {
        interface Request {
            userId?: string | mongoose.Types.ObjectId,
        }
    }
}

export{};