import {Router} from "express"
import {getallVidoes,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    getVideoDuration
} from "../controllers/video.controller.js"
import { verifyjwt } from "../middlewares/auth.middleware.js"
import {upload} from "../middlewares/multer.middleware.js"
import { cloudinaryfileupload } from "../utils/cloudinary.js"
const router=Router();
router.use(verifyjwt)

router.route("/").get(getallVidoes);
router.route("/publishAVideo").post(upload.fields([
    {
        name:"video",
        maxCount:1
    },
    {
        name:"thumbnail",
        maxCount:1
    }
]),publishAVideo)
router.route("/:videoId").get(getVideoById)
router.route("/delete/:videoId").delete(deleteVideo)
router.route("/update/:videoId").patch(upload.single("thumbnail"),updateVideo)
router.route("/toggle/publish/:videoId").patch(togglePublishStatus)
export default router