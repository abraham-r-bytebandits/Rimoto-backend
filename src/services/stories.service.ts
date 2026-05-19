import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

interface GetPaginatedStoriesOptions {
  sort: 'top' | 'recent';
  flair?: string;
  search?: string;
  postType?: 'STORY' | 'REVIEW';
  page: number;
  limit: number;
}

export async function getPaginatedStories({
  sort,
  flair,
  search,
  postType,
  page,
  limit,
}: GetPaginatedStoriesOptions) {
  const skip = (page - 1) * limit;

  const where: Prisma.StoryWhereInput = {
    status: 'APPROVED',
    ...(postType && { postType }),
    ...(flair && { flairType: flair }),
    ...(search && {
      OR: [
        { title: { contains: search } },
        { destinationTag: { contains: search } },
        { author: { firstName: { contains: search } } },
        { author: { lastName: { contains: search } } },
      ],
    }),
  };

  // Pinned stories always first, then sort by votes or date
  const orderBy: Prisma.StoryOrderByWithRelationInput[] = [
    { isPinned: 'desc' },
    sort === 'top' ? { voteCount: 'desc' } : { createdAt: 'desc' },
  ];

  const [total, stories] = await Promise.all([
    prisma.story.count({ where }),
    prisma.story.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        author: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
  ]);

  return {
    data: stories,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function voteStory(storyId: string, direction: 'up' | 'down') {
  const story = await prisma.story.findUnique({
    where: { id: storyId, status: 'APPROVED' },
  });

  if (!story) return null;

  return prisma.story.update({
    where: { id: storyId },
    data: {
      voteCount: direction === 'up' ? { increment: 1 } : { decrement: 1 },
    },
    select: { voteCount: true },
  });
}

export interface CreateStoryData {
  title: string;
  destinationTag: string;
  flairType: string;
  contentBody: string;
  mediaUrls: any;
  mediaMeta: any;
  images?: any;
  ratingScore: number;
  authorId: string;
  postType: 'STORY' | 'REVIEW';
}

export async function createStory(data: CreateStoryData) {
  return prisma.story.create({
    data: {
      ...data,
      status: 'PENDING',
    },
  });
}
