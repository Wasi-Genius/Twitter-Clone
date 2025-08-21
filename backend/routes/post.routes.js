import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";
import { 
  createPost, 
  deletePost, 
  commentOnPost, 
  deleteComment,
  likeUnlikePost,
  bookmarkPost, 
  getAllPosts, 
  getLikedPosts,
  getBookmarkedPosts,
  getFollowingPosts, 
  getUserPosts, 
  rePost 
} from "../controllers/post.controller.js";

const router = express.Router();

// Get posts
router.get("/all", protectRoute, getAllPosts);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/bookmarks/:id", protectRoute, getBookmarkedPosts);
router.get("/user/:username", protectRoute, getUserPosts);

// Create / Delete posts
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);

// Post actions
router.post("/like/:id", protectRoute, likeUnlikePost);
router.post("/bookmark/:id", protectRoute, bookmarkPost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.delete("/comment/:id/:commentId", protectRoute, deleteComment);
router.post("/:id/repost", protectRoute, rePost);

export default router;
