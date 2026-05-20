import { Router } from 'express';
import { getRides, getFeaturedRides, joinRide, submitRide } from '../controllers/rides.controller';
import { getStories, voteStory, createStory } from '../controllers/stories.controller';
import { getPopularRoutes } from '../controllers/popularRoutes.controller';
import { uploadRideImage, uploadPostImage, uploadClaimMedia } from '../middlewares/upload';
import { authenticate } from '../middlewares/authenticate';
import { submitClaim } from '../controllers/claims.controller';

const router = Router();

// ── Rides ────────────────────────────────────────────────
router.get('/rides', getRides);
router.get('/rides/featured', getFeaturedRides);
router.post('/rides', uploadRideImage.array('images', 5), submitRide);          // public ride submission → status PENDING
router.post('/rides/:id/join', joinRide);

// ── Stories ──────────────────────────────────────────────
router.get('/stories', getStories);
router.post('/stories', authenticate, uploadPostImage.array('images', 5), createStory);
router.post('/stories/:id/vote', voteStory);

// ── Popular Routes ───────────────────────────────────────
router.get('/popular-routes', getPopularRoutes);

// ── Claims ───────────────────────────────────────────────
router.post('/claims', uploadClaimMedia.fields([
  { name: 'invoice', maxCount: 1 },
  { name: 'productMedia', maxCount: 10 }
]), submitClaim);

export default router;
