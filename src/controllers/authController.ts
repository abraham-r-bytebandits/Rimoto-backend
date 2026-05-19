import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import prisma from '../lib/prisma';
import { envConfig } from '../configs/env';

const JWT_SECRET = envConfig.JWT_SECRET;
const JWT_REFRESH_SECRET = envConfig.JWT_REFRESH_SECRET;
const JWT_EXPIRY_ACCESS = '15m'; // Short-lived access token
const JWT_EXPIRY_REFRESH = '7d';  // Long-lived refresh token

// ── Helper functions for Tokens ────────────────────────
function generateTokens(user: { id: string; role: string }) {
  const accessToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRY_ACCESS,
  });

  const refreshToken = jwt.sign({ sub: user.id, role: user.role }, JWT_REFRESH_SECRET, {
    expiresIn: JWT_EXPIRY_REFRESH,
  });

  return { accessToken, refreshToken };
}

function setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = envConfig.NODE_ENV === 'production';
  
  res.cookie('access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  // rimoto_token: alias used by the admin frontend (AuthContext.tsx)
  res.cookie('rimoto_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });

  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearTokenCookies(res: Response) {
  const isProd = envConfig.NODE_ENV === 'production';

  res.clearCookie('access_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });

  // Clear the admin frontend alias cookie
  res.clearCookie('rimoto_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
  
  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
}

// ── GET /me ─────────────────────────────────────────────
export const getMe = (req: Request, res: Response): void => {
  res.json(req.user);
};

// ── POST /admin/login ────────────────────────────────────
export const adminLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || user.role !== 'ADMIN' || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ ok: true, accessToken, refreshToken });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// ── POST /login ──────────────────────────────────────────
export const userLogin = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.passwordHash) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });
    setTokenCookies(res, accessToken, refreshToken);

    res.json({ ok: true, accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// ── POST /register ───────────────────────────────────────
export const userRegister = async (req: Request, res: Response): Promise<void> => {
  const { firstName, lastName, email, password } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
  };

  if (!firstName || !lastName || !email || !password) {
    res.status(400).json({ error: 'First name, last name, email, and password are required' });
    return;
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ error: 'Email already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        passwordHash,
      },
    });

    const { accessToken, refreshToken } = generateTokens({ id: user.id, role: user.role });
    setTokenCookies(res, accessToken, refreshToken);

    res.status(201).json({ ok: true, accessToken, refreshToken, user });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// ── POST /refresh ─────────────────────────────────────────
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refresh_token as string | undefined;

  if (!token) {
    res.status(401).json({ error: 'No refresh token provided' });
    return;
  }

  try {
    const payload = jwt.verify(token, JWT_REFRESH_SECRET) as { sub: string; role: string };
    
    // Verify user still exists
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens({ id: user.id, role: user.role });
    setTokenCookies(res, accessToken, newRefreshToken);

    res.json({ ok: true, accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    res.status(401).json({ error: 'Invalid or expired refresh token' });
  }
};

// ── POST /logout ─────────────────────────────────────────
export const logout = (_req: Request, res: Response): void => {
  clearTokenCookies(res);
  res.json({ ok: true });
};
