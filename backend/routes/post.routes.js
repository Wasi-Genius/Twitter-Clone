import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";

const router = express.Router();

router.post("/create", protectRoute, createPost);
//router.post("/like/:id", protectRoute, likeUnlikePost);
//router.post("/comment/:id", protectRoute, commentOnPost);
//router.delete("/", protectRoute, deletePost);

export default router;