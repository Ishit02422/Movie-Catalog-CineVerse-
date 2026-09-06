import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User, IUserDoc } from "../models/User.js";
import { ApiError } from "./errorHandler.js";

// Extend Express Request interface to include user
export interface AuthenticatedRequest extends Request {
  user?: IUserDoc;
}

export const protect = async (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      throw new ApiError("Not authorized to access this route. Please login.", 401);
    }

    const decoded: any = jwt.verify(
      token,
      process.env.JWT_SECRET || "cineverse_super_secret_jwt_key_2024_secure"
    );

    const user = await User.findById(decoded.id);

    if (!user) {
      throw new ApiError("No user found with this token identity.", 401);
    }

    req.user = user;
    next();
  } catch (error: any) {
    if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
      next(new ApiError("Invalid or expired session token. Please log in again.", 401));
    } else {
      next(error);
    }
  }
};

export const requireAdmin = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
): void => {
  if (!req.user || req.user.role !== "admin") {
    return next(
      new ApiError(
        "Access denied. Administrator privileges required for this action.",
        403
      )
    );
  }
  next();
};
