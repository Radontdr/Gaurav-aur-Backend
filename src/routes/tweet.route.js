import { Router } from 'express';
import {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
} from "../controllers/tweet.controller.js"
import { verifyjwt } from '../middlewares/auth.middleware.js';
const router=Router();
router.use(verifyjwt)

router.route("/:userId").post(createTweet)
router.route("/").get(getUserTweets)
router.route("/update/:tweetId").patch(updateTweet)
router.route("/delete/:tweetId").delete(deleteTweet)
export default router