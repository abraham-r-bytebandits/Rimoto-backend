import { Router } from 'express';
import {
  getDashboardMetrics,
  getSubmissionRides,
  reviewRide,
  patchRideImages,
  putRideImageUrls,
  getSubmissionStories,
  reviewStory,
  updateFeaturedSlots,
  getAdminRoutes,
  getAdminUsers,
  updateAdminUserRole,
  updateAdminUserBan,
  deleteAdminUser,
} from '@/controllers/admin.controller';
import { createPopularRoute, deletePopularRoute } from '@/controllers/popularRoutes.controller';
import { uploadRideImage } from '@/middlewares/upload';

const router = Router();

// ── Dashboard ────────────────────────────────────────────
router.get('/dashboard/metrics', getDashboardMetrics);

// ── Ride Submissions ─────────────────────────────────────
router.get('/submissions/rides', getSubmissionRides);
router.post('/submissions/rides/:id/review', reviewRide);
router.patch('/submissions/rides/:id/images', uploadRideImage.array('images', 10), patchRideImages); // append new files
router.put('/submissions/rides/:id/images', putRideImageUrls); // replace URL list (for deletions)

// ── Story Submissions ────────────────────────────────────
router.get('/submissions/stories', getSubmissionStories);
router.post('/submissions/stories/:id/review', reviewStory);

// ── Featured Content ─────────────────────────────────────
router.put('/content/featured', updateFeaturedSlots);

// ── Future Tabs ──────────────────────────────────────────
router.get('/routes', getAdminRoutes);
router.get('/users', getAdminUsers);
router.post('/users/:id/role', updateAdminUserRole);
router.post('/users/:id/ban', updateAdminUserBan);
router.delete('/users/:id', deleteAdminUser);
// ── Popular Routes ───────────────────────────────────────
router.post('/popular-routes', createPopularRoute);
router.delete('/popular-routes/:id', deletePopularRoute);

export default router;
