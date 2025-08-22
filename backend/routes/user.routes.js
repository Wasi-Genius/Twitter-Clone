import express from "express";
import { protectRoute } from '../middleware/protectRoute.js';
import { 
    followUnfollowUser, 
    getSuggestedUsers, 
    updateUserProfile, 
    getUserFollowers, 
    getUserFollowing, 
    getUserProfile} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/profile/:username", getUserProfile)
    
router.get("/suggested", protectRoute, getSuggestedUsers)

router.get("/followers/:id", protectRoute, getUserFollowers)

router.get("/following/:id", protectRoute, getUserFollowing)

router.post("/follow/:id", protectRoute, followUnfollowUser)

router.post("/update", protectRoute, updateUserProfile)

export default router; 