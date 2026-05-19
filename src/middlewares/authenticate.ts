import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma';

// Extend Express.User — required when @types/passport is installed.
// Passport types req.user as Express.User, so we must augment that interface
// (not Express.Request.user directly) for our fields to be visible on req.user.
declare global {
  namespace Express {
    interface User {
      id: string;
      role: string;
      email: string;
      firstName: string;
      lastName: string;
      avatarUrl: string | null;
    }
  }
}

interface JwtPayload {
  sub: string;
  role: string;
  iat?: number;
  exp?: number;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  // Accept both the user-app cookie and the admin-frontend alias cookie
  const token = (req.cookies?.access_token ?? req.cookies?.rimoto_token) as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'No token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    req.user = {
      id: user.id,
      role: user.role,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: user.avatarUrl ?? null,
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
