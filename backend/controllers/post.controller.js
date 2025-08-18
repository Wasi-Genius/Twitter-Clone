import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

// Create a new post
export const createPost = async (req, res) => {
  try {
    const { text, img: rawImg } = req.body;
    const userId = req.user._id.toString();

    if (!text && !rawImg) {
      return res.status(400).json({ message: "Text or image is required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    let img = null;
    if (rawImg) {
      const uploadRes = await cloudinary.uploader.upload(rawImg);
      img = uploadRes.secure_url;
    }

    const newPost = new Post({ user: userId, text, img });
    await newPost.save();

    return res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Delete a post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this post" });
    }

    if (post.img) {
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await post.deleteOne();
    return res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Comment on a post
export const commentOnPost = async (req, res) => {
  try {
    const { text } = req.body;
    const postId = req.params.id;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Text is required for comment" });
    }

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = { text, user: userId };
    post.comments.push(comment.trim());
    await post.save();

    return res.status(201).json({
      comment,
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Like or Unlike a post
export const likeUnlikePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    let updatedLikes;
    if (post.likes.includes(userId)) {
      // Unlike
      await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: postId } });

      updatedLikes = post.likes.filter(id => id.toString() !== userId.toString());
    } else {
      // Like
      post.likes.push(userId);
      await post.save();
      await User.updateOne({ _id: userId }, { $push: { likedPosts: postId } });

      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
      });
      await notification.save();

      updatedLikes = post.likes;
    }

    return res.status(200).json({ updatedLikes });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Get all posts
export const getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Get liked posts by user
export const getLikedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(likedPosts);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Get posts from followed users
export const getFollowingPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const feedPosts = await Post.find({ user: { $in: user.following } })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(feedPosts);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};

// Get posts by username
export const getUserPosts = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate("user", "-password")
      .populate("comments.user", "-password");

    return res.status(200).json(posts);
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error!",
      error: error.message,
    });
  }
};
