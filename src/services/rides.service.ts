import { Prisma, SkillLevel } from '@prisma/client';
import prisma from '@/lib/prisma';

interface GetPaginatedRidesOptions {
  skillLevel?: string;
  timeframe?: string;
  search?: string;
  page: number;
  limit: number;
}

export async function getPaginatedRides({
  skillLevel,
  timeframe,
  search,
  page,
  limit,
}: GetPaginatedRidesOptions) {
  const skip = (page - 1) * limit;

  // Build date filter based on timeframe
  let dateFilter: Prisma.RideWhereInput = {};
  if (timeframe === 'this_week') {
    const now = new Date();
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    dateFilter = { dateScheduled: { gte: now, lte: weekEnd } };
  } else if (timeframe === 'this_month') {
    const now = new Date();
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    dateFilter = { dateScheduled: { gte: now, lte: monthEnd } };
  } else if (timeframe === 'upcoming') {
    dateFilter = { dateScheduled: { gte: new Date() } };
  }

  const where: Prisma.RideWhereInput = {
    status: 'APPROVED',
    ...(skillLevel && { skillLevel: skillLevel as SkillLevel }),
    ...dateFilter,
    ...(search && {
      OR: [
        { title: { contains: search } },
        { startLocation: { contains: search } },
        { endLocation: { contains: search } },
        { organizer: { firstName: { contains: search } } },
        { organizer: { lastName: { contains: search } } },
      ],
    }),
  };

  const [total, rides] = await Promise.all([
    prisma.ride.count({ where }),
    prisma.ride.findMany({
      where,
      skip,
      take: limit,
      orderBy: { dateScheduled: 'asc' },
      include: {
        organizer: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
  ]);

  return {
    data: rides,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getFeaturedRides() {
  return prisma.ride.findMany({
    where: { featuredSlot: { not: null }, status: 'APPROVED' },
    include: {
      organizer: { select: { firstName: true, lastName: true, avatarUrl: true, contactNumber: true, clubAffiliation: true } },
    },
  });
}

export async function joinRide(rideId: string) {
  const ride = await prisma.ride.findUnique({
    where: { id: rideId, status: 'APPROVED' },
  });

  if (!ride) return null;

  return prisma.ride.update({
    where: { id: rideId },
    data: { whatsappJoinsCount: { increment: 1 } },
    select: { whatsappGroupUrl: true },
  });
}

export async function createRide(data: {
  title: string;
  startLocation: string;
  endLocation: string;
  dateScheduled: string;
  timeStart: string;
  distanceKm: number;
  skillLevel: string;
  bikeRequirement: string;
  whatsappGroupUrl: string;
  organizerId: string;
  imageUrls?: string[] | null;
}) {
  return prisma.ride.create({
    data: {
      title: data.title,
      startLocation: data.startLocation,
      endLocation: data.endLocation,
      dateScheduled: new Date(data.dateScheduled),
      timeStart: data.timeStart,
      distanceKm: data.distanceKm,
      skillLevel: data.skillLevel as any,
      bikeRequirement: data.bikeRequirement || 'All Bikes',
      whatsappGroupUrl: data.whatsappGroupUrl,
      organizerId: data.organizerId,
      imageUrls: data.imageUrls || [],
      status: 'PENDING',
    },
  });
}
