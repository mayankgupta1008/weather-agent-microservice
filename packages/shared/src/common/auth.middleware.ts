import { type NextFunction, type Request, type Response } from "express";
import { auth } from "./auth.config.js";
import { fromNodeHeaders } from "better-auth/node";

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Attach user and session to the request object (or res.locals)
    res.locals.user = session.user;
    res.locals.session = session.session;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
