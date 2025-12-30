import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { JWT_PASS } from "./config.js";


interface AuthPayload extends JwtPayload {
    id: string;
}
export const useMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const header = req.headers["authorization"];
    if(!header){
        return res.status(401).json({message: "Missing token"})
    }
    try {
        const decoded = jwt.verify(header as string, JWT_PASS) as AuthPayload;
        req.userId = decoded.id;
        next();

    } catch (err){
        return res.status(403).json({message:"Invalid or expired token!"})
    }
   
    

}