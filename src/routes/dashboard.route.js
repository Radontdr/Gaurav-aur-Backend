import { Router } from 'express';
import {
    getChannelStats, 
    getChannelVideos
} from "../controllers/dashboard.controller.js"
import { verifyjwt } from '../middlewares/auth.middleware.js';

const router=Router();
router.use(verifyjwt);

router.route("/channelstats/:channelId").get(getChannelStats);
router.route("/channelvideos/:channelId").get(getChannelVideos);
export default router