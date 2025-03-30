import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthUser {
    id: string; 
    name: string; 
    email: string; 
}

declare module "express" {
    interface Request {
        user?: AuthUser
    }
}