import { Request, Response } from 'express';
import prisma from '@/lib/prisma';
import * as adminLogService from '@/services/adminLog.service';

// GET /api/v1/admin/dashboard/metrics
export const getDashboardMetrics = async (_req: Request, res: Response): Promise<void> => {
  try {
    const [pendingRides, publishedRides, totalRiders, pendingStories, recentActivity] =
      await Promise.all([
        prisma.ride.count({ where: { status: 'PENDING' } }),
        prisma.ride.count({ where: { status: 'APPROVED' } }),
        prisma.user.count({ where: { role: 'USER' } }),
        prisma.story.count({ where: { status: 'PENDING' } }),
        prisma.adminLog.findMany({
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: {
            actor: {
              select: { firstName: true, lastName: true, avatarUrl: true },
            },
          },
        }),
      ]);

    res.json({
      pendingRides,
      publishedRides,
      totalRiders,
      pendingStories,
      recentActivity: recentActivity.map((log) => ({
        id: log.id,
        actionType: log.actionType,
        actionSeverity: log.actionSeverity,
        message: log.message,
        createdAt: log.createdAt.toISOString(),
        actor: {
          firstName: log.actor.firstName,
          lastName: log.actor.lastName,
          avatarUrl: log.actor.avatarUrl ?? null,
        },
      })),
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// GET /api/v1/admin/submissions/rides?status=PENDING|APPROVED|REJECTED
export const getSubmissionRides = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'PENDING' } = req.query as { status?: string };
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'ARCHIVED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const rides = await prisma.ride.findMany({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' | 'ARCHIVED' },
      include: {
        organizer: { select: { firstName: true, lastName: true, email: true, avatarUrl: true, contactNumber: true, clubAffiliation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: rides });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/admin/submissions/rides/:id/review
export const reviewRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action, featuredSlot } = req.body as {
      action?: 'APPROVE' | 'REJECT';
      featuredSlot?: string;
    };

    if (action !== 'APPROVE' && action !== 'REJECT') {
      res.status(400).json({ error: 'action must be "APPROVE" or "REJECT"' });
      return;
    }

    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.ride.update({
      where: { id },
      data: {
        status: newStatus,
        ...(action === 'APPROVE' && featuredSlot ? { featuredSlot: featuredSlot as any } : {}),
      },
    });

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: action === 'APPROVE' ? 'Approved' : 'Rejected',
      actionSeverity: action === 'APPROVE' ? 'SUCCESS' : 'WARNING',
      message: `Ride "${ride.title}" was ${action === 'APPROVE' ? 'approved' : 'rejected'}`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// PATCH /api/v1/admin/submissions/rides/:id/images — APPEND new uploaded images
export const patchRideImages = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No images provided' });
      return;
    }

    const newUrls = req.files.map(
      (file: any) => `${req.protocol}://${req.get('host')}/uploads/rides/${file.filename}`
    );

    // Append to existing imageUrls (keep up to 10)
    const existing: string[] = Array.isArray(ride.imageUrls) ? (ride.imageUrls as string[]) : [];
    const merged = [...existing, ...newUrls].slice(0, 10);

    const updated = await prisma.ride.update({
      where: { id },
      data: { imageUrls: merged },
    });

    res.json({ ok: true, imageUrls: updated.imageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// PUT /api/v1/admin/submissions/rides/:id/images — REPLACE imageUrls with a JSON array (for deletions)
export const putRideImageUrls = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { imageUrls } = req.body as { imageUrls?: string[] };

    if (!Array.isArray(imageUrls)) {
      res.status(400).json({ error: 'imageUrls must be an array' });
      return;
    }

    const ride = await prisma.ride.findUnique({ where: { id } });
    if (!ride) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    const updated = await prisma.ride.update({
      where: { id },
      data: { imageUrls },
    });

    res.json({ ok: true, imageUrls: updated.imageUrls });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// GET /api/v1/admin/submissions/stories?status=PENDING|APPROVED|REJECTED
export const getSubmissionStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const { status = 'PENDING' } = req.query as { status?: string };
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ error: `status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const stories = await prisma.story.findMany({
      where: { status: status as 'PENDING' | 'APPROVED' | 'REJECTED' },
      include: {
        author: { select: { firstName: true, lastName: true, email: true, avatarUrl: true } },
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
    });

    res.json({ data: stories });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/admin/submissions/stories/:id/review
export const reviewStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { action } = req.body as { action?: 'APPROVE' | 'REJECT' };

    if (action !== 'APPROVE' && action !== 'REJECT') {
      res.status(400).json({ error: 'action must be "APPROVE" or "REJECT"' });
      return;
    }

    const story = await prisma.story.findUnique({ where: { id } });
    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    const newStatus = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    const updated = await prisma.story.update({
      where: { id },
      data: { status: newStatus },
    });

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: action === 'APPROVE' ? 'Approved' : 'Rejected',
      actionSeverity: action === 'APPROVE' ? 'SUCCESS' : 'WARNING',
      message: `Story "${story.title}" was ${action === 'APPROVE' ? 'approved' : 'rejected'}`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// PUT /api/v1/admin/content/featured
export const updateFeaturedSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slots } = req.body as {
      slots?: Array<{ rideId: string; slot: string }>;
    };

    if (!slots || !Array.isArray(slots) || slots.length > 3) {
      res.status(400).json({ error: 'A maximum of 3 featured slots can be assigned' });
      return;
    }

    const validSlots = ['HERO_BANNER', 'WEEKEND_PICK', 'EDITORS_CHOICE'];
    for (const s of slots) {
      if (!validSlots.includes(s.slot)) {
        res.status(400).json({ error: `Invalid slot: ${s.slot}. Must be one of: ${validSlots.join(', ')}` });
        return;
      }
    }

    // Atomic transaction: clear all featured slots, then assign new ones
    await prisma.$transaction([
      prisma.ride.updateMany({
        where: { featuredSlot: { not: null } },
        data: { featuredSlot: null },
      }),
      ...slots.map(({ rideId, slot }) =>
        prisma.ride.update({
          where: { id: rideId },
          data: { featuredSlot: slot as any },
        })
      ),
    ]);

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: 'Featured Updated',
      actionSeverity: 'SUCCESS',
      message: 'Featured ride slots were updated',
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// GET /api/v1/admin/routes
export const getAdminRoutes = async (_req: Request, res: Response): Promise<void> => {
  try {
    const routes = await prisma.ride.findMany({
      where: { status: 'APPROVED' },
      include: {
        organizer: { select: { firstName: true, lastName: true, clubAffiliation: true } },
      },
      orderBy: { dateScheduled: 'asc' },
    });
    res.json({ data: routes });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// GET /api/v1/admin/users
export const getAdminUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = '1', limit = '20' } = req.query as { page?: string; limit?: string };
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [total, users] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        skip,
        take: limitNum,
        orderBy: { joinedAt: 'desc' },
      }),
    ]);

    res.json({
      data: users.map((u) => ({
        ...u,
        // isBanned and strikeCount are now real DB columns — included via spread
      })),
      meta: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/admin/users/:id/role
export const updateAdminUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role } = req.body as { role?: 'USER' | 'ADMIN' };

    if (!role || (role !== 'USER' && role !== 'ADMIN')) {
      res.status(400).json({ error: 'role must be USER or ADMIN' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (id === req.user!.id && role === 'USER') {
      res.status(400).json({ error: 'Cannot demote yourself' });
      return;
    }

    const updated = await prisma.user.update({ where: { id }, data: { role } });

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: 'User Updated',
      actionSeverity: 'SUCCESS',
      message: `User "${target.firstName} ${target.lastName}" role changed to ${role}`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/admin/users/:id/ban
export const updateAdminUserBan = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { isBanned } = req.body as { isBanned?: boolean };

    if (isBanned === undefined) {
      res.status(400).json({ error: 'isBanned field is required' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (id === req.user!.id && isBanned === true) {
      res.status(400).json({ error: 'Cannot ban yourself' });
      return;
    }

    const updated = await prisma.user.update({ where: { id }, data: { isBanned } });

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: isBanned ? 'User Banned' : 'User Unbanned',
      actionSeverity: isBanned ? 'WARNING' : 'SUCCESS',
      message: `User "${target.firstName} ${target.lastName}" was ${isBanned ? 'banned' : 'unbanned'}`,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// DELETE /api/v1/admin/users/:id
export const deleteAdminUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Cannot delete yourself
    if (id === req.user!.id) {
      res.status(400).json({ error: 'Cannot delete your own account' });
      return;
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Cannot delete another ADMIN — demote first
    if (target.role === 'ADMIN') {
      res.status(400).json({ error: 'Cannot delete an admin account. Demote to USER first.' });
      return;
    }

    // Delete in correct FK order inside a transaction to avoid constraint errors:
    //   admin_logs → stories → rides → user
    await prisma.$transaction([
      prisma.adminLog.deleteMany({ where: { actorId: id } }),
      prisma.story.deleteMany({ where: { authorId: id } }),
      prisma.ride.deleteMany({ where: { organizerId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    await adminLogService.log({
      actorId: req.user!.id,
      actionType: 'User Deleted',
      actionSeverity: 'DANGER',
      message: `User "${target.firstName} ${target.lastName}" (${target.email}) was permanently deleted`,
    });

    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

