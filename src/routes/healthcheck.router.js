import {Router} from "express"
import  {healthcheck} from "../controllers/health.controller.js"

const router=Router();
router.route("/healthcheck").get(healthcheck)
export default router