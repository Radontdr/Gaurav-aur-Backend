import { Router } from 'express';
import {
    getVideoComments, 
    addComment, 
    updateComment,
    deleteComment
} from "../controllers/comment.controller.js"
import {verifyjwt} from "../middlewares/auth.middleware.js"
const router=Router();
router.use(verifyjwt)

router.route("/").get(getVideoComments);
router.route("/:videoId").patch(addComment)
router.route("/c/:commentId").delete(deleteComment)
router.route("/c/:commentId").patch(updateComment)
export default router