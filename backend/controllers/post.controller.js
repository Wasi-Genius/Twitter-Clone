import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { v2 as cloudinary } from "cloudinary";

export const createPost = async (req, res) => {
    try {
        const {text} = req.body; 
        let {img} = req.body; 
        const userId = req.user._id.toString();

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({message: "User not found"})
        }

        if (!text && !img) {
            return res.status(400).json({message: "Text or image is required"});
        }

        if(img){
            const uploadedResponse = await cloudinary.uploader.upload(img)
            img = uploadedResponse.secure_url; 
        }

        const newPost = new Post ({
            user: userId,
            text,
            img,
        });

        await newPost.save();

        res.status(201).json({
            message: "Post created successfully",
            post: newPost
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error!",
            error: error.message
        });
    }
};

export const deletePost = async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }

        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({message: "You are not authorized to delete this post"});
        }

        if (post.img) {
            const imageId = post.img.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(imageId);
        }

        await Post.findByIdAndDelete(req.params.id);
        res.status(200).json({message: "Post deleted successfully"});

    } catch (error) {
        res.status(500).json({
            message: "Internal server error!",
            error: error.message
        });
    }
};

export const commentOnPost = async (req, res) => {

    try {
        const {text} = req.body; 
        const postId = req.params.id; 
        const userId = req.user._id; 

        if(!text){
            return res.status(400).json({message: "Comment text is required"});
        }

        const post = await Post.findById(postId)

        if(!post){
            return res.status(404).json({message: "Post not found"});
        }

        const comment = {
            text,
            user: userId
        };

        post.comments.push(comment); 

        await post.save();

        res.status(201).json({
            message: "Comment added successfully",
            comment
        });

    } catch (error) {
        res.status(500).json({
            message: "Internal server error!",
            error: error.message
        });
    }
}

export const likeUnlikePost = async (req, res) => {
    try {
        
        const postId = req.params.id; 
        const userId = req.user._id; 

        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({message: "Post not found"});
        }

        if (post.likes.includes(userId)) {
            //Unlike the post
            await Post.updateOne({_id:postId}, {$pull: {likes: userId}});
            res.status(200).json({
                message: "Post unliked successfully",
            });

        } else {
            post.likes.push(userId);
            await post.save();

            const notification = new Notification({
                from: userId, 
                to: post.user,
                type: "like"
            })

            await notification.save();

            res.status(200).json({
                message: "Post liked successfully",
                likes: post.likes
            });
        }

        await post.save();

        res.status(200).json({
            message: "Post liked/unliked successfully",
            likes: post.likes
        });


    } catch (error) {

        return res.status(500).json({
            message: "Internal server error!",
            error: error.message
        });
        
    }
}