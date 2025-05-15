import { Router } from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
} from "../controllers/subscription.controller.js"
import { verifyjwt } from '../middlewares/auth.middleware.js';
const router=Router();
router.use(verifyjwt);

router.route("/toggle/:channelId").patch(toggleSubscription)
router.route("/userchannel/").get(getUserChannelSubscribers)
router.route("/:subscriberId").get(getSubscribedChannels)
export default router