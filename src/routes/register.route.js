import { Router } from "express";
import {userRegister,userlogin,userLogout,refreshaccesstoken,updatepassword,
    updateUserCoverimage,updateUserDetails,updateUseravatar,
    deleteprevavtar,getCurrentUser,getUserChannelProfile,getwatchhistory} from "../controllers/user.controller.js"
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
    userRegister)
router.route("/login").post(userlogin)
router.route("/logout").post(verifyjwt,userLogout)
router.route("/refresh-token").post(refreshaccesstoken)
router.route("/change-password").patch(verifyjwt,updatepassword)
router.route("/change-cover-image").patch(verifyjwt,upload.single("coverimage"),updateUserCoverimage)
router.route("/change-avatar-image").patch(verifyjwt,deleteprevavtar,upload.single("avatar"),updateUseravatar)
router.route("/updateuserdetails").post(verifyjwt,updateUserDetails)
router.route("/currentuser").get(verifyjwt,getCurrentUser)
router.route("/c/:username").get(verifyjwt,getUserChannelProfile)
router.route("/history").get(verifyjwt,getwatchhistory)
export default router