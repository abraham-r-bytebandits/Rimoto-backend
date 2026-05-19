import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

// Register env validation first — exits if invalid
import { envConfig } from '@/configs/env';


// Route handlers
import authRoutes from '@/routes/authRoute';
import publicRoutes from '@/routes/public.routes';
import adminRoutes from '@/routes/admin.routes';

// Middleware
import { authenticate } from '@/middlewares/authenticate';
import { requireAdmin } from '@/middlewares/requireAdmin';
import { notFound } from '@/middlewares/notFound';
import { errorHandler } from '@/middlewares/errorHandler';

const app: Express = express();

// ─── Core middleware ───────────────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // disable CSP for API-only server
    crossOriginResourcePolicy: { policy: "cross-origin" }, // allow cross-origin images explicitly
    crossOriginOpenerPolicy: { policy: "unsafe-none" }, // just in case
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: envConfig.FRONTEND_URL,
    credentials: true, // required for cross-origin httpOnly cookies
  })
);

app.use(express.json({ limit: '2mb' }));
app.use(cookieParser());

import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use(
  morgan('combined', {
    skip: (_req, res) => res.statusCode < 400 && process.env.NODE_ENV === 'production',
  })
);

// ─── Health check ──────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Rimoto API is running 🚀' });
});

app.get('/api/v1/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Healthy 🏥',
    uptime: process.uptime(),
    env: process.env.NODE_ENV,
  });
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/public', publicRoutes);
app.use('/api/v1/admin', authenticate, requireAdmin, adminRoutes);

// ─── Error handling ───────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start ────────────────────────────────────────────────
const PORT = envConfig.PORT;
app.listen(PORT, () => {
  console.log(`\n🚀 Rimoto API running on http://localhost:${PORT}`);
  console.log(`   Environment: ${envConfig.NODE_ENV}`);
  console.log(`   Frontend:    ${envConfig.FRONTEND_URL}\n`);
});

export default app;
