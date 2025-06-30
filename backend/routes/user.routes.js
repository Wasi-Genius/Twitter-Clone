import express from "express";
import { protectRoute } from '../middleware/protectRoute.js';
import { getUserProfile } from "../controllers/user.controller.js";
import { followUnfollowUser } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile)
    
router.get("/suggested", protectRoute, getUserProfile)

router.post("/follow/:id", protectRoute, followUnfollowUser)

//router.post("/update", protectRoute, updateUserProfile)

export default router; 