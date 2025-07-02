import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import {v2 as cloudinary} from "cloudinary";

export const getUserProfile = async (req, res) => {
    const {username} = req.params; 

    try {
        const user = await User.findOne
        ({username}).select("-password");

        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }
        res.status
    } catch (error) {

        console.log("Error in getUserProfile:", error);

        res.status(500).json({
            error: error.message
        });
    }
}

export const followUnfollowUser = async (req, res) => {

    try {
       
        const { id } = req.params;
        const userToModify = await User.findById(id);
        const currentUser = await User.findById(req.user._id);

        if (id === req.user._id.toString()) {
            return res.status(400).json({
                error: "You cannot follow or unfollow yourself."
            })
        }

        if(!userToModify || !currentUser) {
            return res.status(404).json({
                error: "User not found!"
            });
        }

        const isFollowing = currentUser.following.includes(id);

        if(isFollowing){
            await User.findByIdAndUpdate (id, {$pull : {followers: req.user._id}})
            await User.findByIdAndUpdate(req.user._id, {$pull: {following: id}});
            
            // const newNotification = new Notification({
            //     from: req.user._id,
            //     to: userToModify._id,
            //     type: "unfollow"
            // });

            // await newNotification.save();
            
            res.status(200).json({
                message: "Unfollowed successfully!"
            });
        }
        else{
            await User.findByIdAndUpdate(id, {$push: {followers: req.user._id}});
            await User.findByIdAndUpdate(req.user._id, {$push: {following: id}});
            
            const newNotification = new Notification({
                from: req.user._id,
                to: userToModify._id,
                type: "follow"
            });

            await newNotification.save();
            
            res.status(200).json({
                message: "Followed successfully!"
            });
        }



    } catch (error) {

        console.log("Error in getUserProfile:", error);

        res.status(500).json({
            error: error.message
        });
    }
}

export const getSuggestedUsers = async (req, res) => {
    
    try {
        const userId = req.user._id;

        const usersIFollow = await User.findById(userId).select("following");

        const users = await User.aggregate([
            {
                $match: {
                    _id: { $ne: userId }
                }
            }, 
            
            {
                $sample: { size: 10 } // Get 10 random users
            }
    
        ])

        const filteredUsers = users.filter(user => !usersIFollow.following.includes(user._id.toString()));
        const suggestedUsers = filteredUsers.slice(0, 5);

        suggestedUsers.forEach(user =>user.password = null); 

        res.status(200).json({
            users: suggestedUsers
        });

    } catch (error) {
        console.log("Error in getSuggestedUsers:", error);
        res.status(500).json({
            error: error.message
        });
    }
}

export const updateUserProfile = async (req, res) => {
    const {fullName, email, username, currentPassword, newPassword, bio, link} = req.body; 
    
    let {profileImg, coverImg} = req.body; 

    const userId = req.user._id; 

    try {
        const user = await User.findById(userId); 
        if (!user) {
            return res.status(404).json({
                error: "User not found"
            });
        }

        if((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
            return res.status(400).json({
                error: "Both current and new passwords are required to update password"
            });
        }

        if(currentPassword && newPassword) {
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            
            if (!isMatch) {
                return res.status(400).json({
                    error: "Current password is incorrect!"
                });
            }

            if( newPassword.length < 6) {
                return res.status(400).json({
                    error: "New password must be at least 6 characters long"
                });
            }

            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword, salt);
        }

        if(profileImg) {
            const uploadedReponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedReponse.secure_url;
        }

        if(coverImg) {
            const uploadedReponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedReponse.secure_url;
        }

        user.fullName = fullName || user.fullName;
        user.email = email || user.email;
        user.username = username || user.username;
        user.bio = bio || user.bio;
        user.link = link || user.link;
        user.profileImg = profileImg || user.profileImg;
        user.coverImg = coverImg || user.coverImg;

        user = await user.save();

        // Makes the password null before sending the response 
        user.password = null; 

        return res.status(200).json(user);

    } catch (error) {
        
    }
}
    