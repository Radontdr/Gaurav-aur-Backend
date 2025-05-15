import { Router } from 'express';
import {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
} from "../controllers/like.controller.js"
import { verifyjwt } from '../middlewares/auth.middleware.js';
const router=Router();
router.use(verifyjwt)
router.route("/toggle/video/:videoId").patch(toggleVideoLike)
router.route("/toggle/comment/:commentId").patch(toggleCommentLike)
router.route("/toggle/comment/:tweetId").patch(toggleTweetLike)
router.route("/likedVideo").get(getLikedVideos)
export default router