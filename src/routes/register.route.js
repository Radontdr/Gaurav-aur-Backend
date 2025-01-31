import { Router } from "express";
import asynchandler from "../utils/asynchandlers.js";
const router=Router();

router.route("/register").post(asynchandler)
export default router