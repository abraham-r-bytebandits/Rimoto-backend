import { Request, Response } from 'express';
import prisma from '@/lib/prisma';

// GET /api/v1/public/popular-routes
export const getPopularRoutes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const routes = await prisma.popularRoute.findMany({
      orderBy: { orderNo: 'asc' },
    });
    res.json({ data: routes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/admin/popular-routes
export const createPopularRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { orderNo, title, place, iframeUrl } = req.body;
    const newRoute = await prisma.popularRoute.create({
      data: {
        orderNo: Number(orderNo),
        title,
        place,
        iframeUrl,
      },
    });
    res.status(201).json(newRoute);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// DELETE /api/v1/admin/popular-routes/:id
export const deletePopularRoute = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.popularRoute.delete({ where: { id } });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};
