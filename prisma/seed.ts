import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash }, // allows password rotation via re-seed
    create: {
      email: adminEmail,
      firstName: 'Rimoto',
      lastName: 'Admin',
      role: 'ADMIN',
      passwordHash,
    },
  });

  console.log(`✅ Admin seeded: ${admin.email}`);

  // ─── DUMMY DATA FOR TESTING ───────────────────────────────

  // 1. Create a dummy user
  const dummyUser = await prisma.user.upsert({
    where: { email: 'dummy.rider@example.com' },
    update: {},
    create: {
      email: 'dummy.rider@example.com',
      firstName: 'Dummy',
      lastName: 'Rider',
      role: 'USER',
      clubAffiliation: 'Weekend Warriors',
    },
  });
  console.log(`✅ Dummy User seeded: ${dummyUser.email}`);

  // 2. Create a dummy ride
  const dummyRide = await prisma.ride.create({
    data: {
      title: 'Sunday Morning Cruise to the Hills',
      startLocation: 'Downtown Square',
      endLocation: 'Hilltop Cafe',
      dateScheduled: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      timeStart: '06:30 AM',
      distanceKm: 45.5,
      skillLevel: 'BEGINNER',
      bikeRequirement: 'Any Bike',
      whatsappGroupUrl: 'https://chat.whatsapp.com/dummy',
      imageUrls: [
        'https://placehold.co/600x400/png?text=Ride+Image+1',
        'https://placehold.co/600x400/png?text=Ride+Image+2'
      ],
      status: 'APPROVED',
      organizerId: dummyUser.id,
    },
  });
  console.log(`✅ Dummy Ride seeded: ${dummyRide.title}`);

  // 3. Create a dummy story
  const dummyStory = await prisma.story.create({
    data: {
      title: 'My First Long Ride Experience',
      destinationTag: 'Hills',
      flairType: 'SOLO_STORY',
      contentBody: 'It was a beautiful sunny day when I started my journey...',
      mediaUrls: [],
      mediaMeta: { photos: 2, videos: 0 },
      images: ['https://placehold.co/600x400/png', 'https://placehold.co/600x400/png'],
      ratingScore: 4.8,
      voteCount: 10,
      status: 'APPROVED',
      authorId: dummyUser.id,
    },
  });
  console.log(`✅ Dummy Story seeded: ${dummyStory.title}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
