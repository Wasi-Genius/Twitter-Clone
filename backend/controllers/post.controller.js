import User from "../models/user.model.js";
import Post from "../models/post.model.js";
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
