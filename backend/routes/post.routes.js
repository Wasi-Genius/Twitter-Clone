import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";
import { createPost, deletePost, 
    commentOnPost, likeUnlikePost, 
    getAllPosts, getLikedPosts,
    getFollowingPosts, getUserPosts} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likedPosts/:id", protectRoute, getLikedPosts);
router.get("/userPosts/:username", protectRoute, getUserPosts);
router.post("/create", protectRoute, createPost);
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/:id", protectRoute, deletePost);

export default router;