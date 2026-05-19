import { Request, Response } from 'express';
import * as storiesService from '@/services/stories.service';

// GET /api/v1/public/stories
export const getStories = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      sort = 'recent',
      flair,
      search,
      postType,
      page = '1',
      limit = '20',
    } = req.query as Record<string, string | undefined>;

    const result = await storiesService.getPaginatedStories({
      sort: sort as 'top' | 'recent',
      flair,
      search,
      postType: postType as 'STORY' | 'REVIEW' | undefined,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/public/stories/:id/vote
export const voteStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { direction } = req.body as { direction?: 'up' | 'down' };

    if (direction !== 'up' && direction !== 'down') {
      res.status(400).json({ error: 'direction must be "up" or "down"' });
      return;
    }

    const story = await storiesService.voteStory(id, direction);

    if (!story) {
      res.status(404).json({ error: 'Story not found' });
      return;
    }

    res.json({ voteCount: story.voteCount });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};

// POST /api/v1/public/stories
export const createStory = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      title,
      destinationTag,
      flairType,
      contentBody,
      mediaUrls,
      mediaMeta,
      ratingScore,
      postType,
    } = req.body;

    const authorId = req.user?.id;
    const authorRole = req.user?.role;
    if (!authorId) {
      res.status(401).json({ error: 'Unauthorized: You must be logged in to create a post.' });
      return;
    }

    const type = postType === 'STORY' ? 'STORY' : 'REVIEW';

    // "stories needed to added by the admin but the review can add by the users with multiple imgs"
    if (type === 'STORY' && authorRole !== 'ADMIN') {
      res.status(403).json({ error: 'Forbidden: Only admins can create stories.' });
      return;
    }

    if (!title || !destinationTag || !flairType || !contentBody) {
      res.status(400).json({ error: 'Missing required fields.' });
      return;
    }

    // Process uploaded images
    const imageFiles = req.files as Express.Multer.File[];
    let images: string[] = [];

    if (imageFiles && imageFiles.length > 0) {
      images = imageFiles.map((file) => `${req.protocol}://${req.get('host')}/uploads/posts/${file.filename}`);
    }

    // fallback to provided images array if needed (e.g. from frontend state)
    if (req.body.images) {
      const parsedImages = typeof req.body.images === 'string' ? JSON.parse(req.body.images) : req.body.images;
      images = [...images, ...parsedImages];
    }

    const newStory = await storiesService.createStory({
      title,
      destinationTag,
      flairType,
      contentBody,
      mediaUrls: mediaUrls ? (typeof mediaUrls === 'string' ? JSON.parse(mediaUrls) : mediaUrls) : [],
      mediaMeta: mediaMeta ? (typeof mediaMeta === 'string' ? JSON.parse(mediaMeta) : mediaMeta) : {},
      images,
      postType: type,
      ratingScore: Number(ratingScore) || 0,
      authorId,
    });

    res.status(201).json(newStory);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error', detail: (err as Error).message });
  }
};
