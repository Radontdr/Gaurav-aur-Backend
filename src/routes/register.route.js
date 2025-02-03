import { Router } from "express";
import {userregister,userlogin,userLogout} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {verifyjwt} from "../middlewares/auth.middleware.js"
import refreshaccesstoken from "../controllers/user.controller.js"
const router=Router();

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverimage",
            maxCount:1
        }
    ]),
    userregister)
router.route("/login").post(userlogin)
router.route("/logout").post(verifyjwt,userLogout)
router.route("/refresh-token").post(refreshaccesstoken)
export default router