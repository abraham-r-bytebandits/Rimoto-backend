import { Request, Response } from 'express';
import * as ridesService from '../services/rides.service';

// GET /api/v1/public/rides
export const getRides = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      skill_level,
      timeframe,
      search,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string | undefined>;

    const result = await ridesService.getPaginatedRides({
      skillLevel: skill_level,
      timeframe,
      search,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// GET /api/v1/public/rides/featured
export const getFeaturedRides = async (_req: Request, res: Response): Promise<void> => {
  try {
    const rides = await ridesService.getFeaturedRides();
    res.json({ data: rides });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/public/rides/:id/join
export const joinRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await ridesService.joinRide(id);

    if (!result) {
      res.status(404).json({ error: 'Ride not found' });
      return;
    }

    res.json({ whatsappGroupUrl: result.whatsappGroupUrl });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/public/rides  — anonymous submission (organizerId = dummy public user or provided)
export const submitRide = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      startLocation,
      endLocation,
      dateScheduled,
      timeStart,
      distanceKm,
      skillLevel,
      bikeRequirement,
      whatsappGroupUrl,
      organizerId,   // frontend sends authenticated user id, or falls back to a seeded public user
    } = req.body;

    if (!title || !startLocation || !endLocation || !dateScheduled || !timeStart || !skillLevel || !whatsappGroupUrl) {
      res.status(400).json({ error: 'Missing required fields: title, startLocation, endLocation, dateScheduled, timeStart, skillLevel, whatsappGroupUrl' });
      return;
    }

    // If no organizerId provided (anonymous public submission), use the first user in the DB
    let resolvedOrganizerId = organizerId;
    if (!resolvedOrganizerId) {
      const { PrismaClient } = await import('@prisma/client');
      const prisma = new PrismaClient();
      const firstUser = await prisma.user.findFirst({ orderBy: { joinedAt: 'asc' } });
      await prisma.$disconnect();
      if (!firstUser) {
        res.status(400).json({ error: 'No users found in the system to assign as organizer' });
        return;
      }
      resolvedOrganizerId = firstUser.id;
    }

    let imageUrls: string[] | null = null;
    if (req.files && Array.isArray(req.files)) {
      imageUrls = req.files.map((file: any) => `${req.protocol}://${req.get('host')}/uploads/rides/${file.filename}`);
    }

    const ride = await ridesService.createRide({
      title,
      startLocation,
      endLocation,
      dateScheduled,
      timeStart,
      distanceKm: parseFloat(distanceKm) || 0,
      skillLevel,
      bikeRequirement: bikeRequirement || 'All Bikes',
      whatsappGroupUrl,
      organizerId: resolvedOrganizerId,
      imageUrls,
    });

    res.status(201).json({ ok: true, id: ride.id });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

