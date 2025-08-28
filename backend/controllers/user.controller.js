import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";

import bcrypt from "bcryptjs";
import { v2 as cloudinary } from "cloudinary";

// Get user profile
export const getUserProfile = async (req, res) => {
	const { username } = req.params;

	try {
		const user = await User.findOne({ username })
			.select("-password")
			.populate([
				{ path: "followers", select: "username fullName profileImg" },
				{ path: "following", select: "username fullName profileImg" },
			]);

		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		return res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Follow or unfollow a user
export const followUnfollowUser = async (req, res) => {
	try {
		const { id } = req.params;
		const userToModify = await User.findById(id);
		const currentUser = await User.findById(req.user._id);

		if (id === req.user._id.toString()) {
			return res.status(400).json({ error: "You cannot follow or unfollow yourself." });
		}

		if (!userToModify || !currentUser) {
			return res.status(404).json({ error: "User not found!" });
		}

		const isFollowing = currentUser.following.includes(id);

		if (isFollowing) {
			// Unfollow
			await User.findByIdAndUpdate(id, { $pull: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $pull: { following: id } });

			res.status(200).json({ message: "Unfollowed successfully!" });
		} else {
			// Follow
			await User.findByIdAndUpdate(id, { $push: { followers: req.user._id } });
			await User.findByIdAndUpdate(req.user._id, { $push: { following: id } });

			const newNotification = new Notification({
				from: req.user._id,
				to: userToModify._id,
				type: "follow",
			});

			await newNotification.save();

			res.status(200).json({ message: "Followed successfully!" });
		}
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Get the suggested users
export const getSuggestedUsers = async (req, res) => {
	try {
		const userId = req.user._id;

		const usersFollowedByMe = await User.findById(userId).select("following");

		const users = await User.aggregate([
			{
				$match: {
					_id: { $ne: userId },
				},
			},
			{ $sample: { size: 10 } },
			{
				$project: {
					password: 0, // exclude password
				},
			},
		]);

		const filteredUsers = users.filter((user) => !usersFollowedByMe.following.includes(user._id));
		const suggestedUsers = filteredUsers.slice(0, 4);

		suggestedUsers.forEach((user) => (user.password = null));

		res.status(200).json(suggestedUsers);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// Update user profile info, including password and images
export const updateUserProfile = async (req, res) => {
	const { fullName, email, username, currentPassword, newPassword, bio, link } = req.body;
	let { profileImg, coverImg } = req.body;

	const userId = req.user._id;

	try {
		let user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Handle password update
		if ((!newPassword && currentPassword) || (!currentPassword && newPassword)) {
			return res.status(400).json({
				error: "Both current and new passwords are required to update password",
			});
		}

		if (currentPassword && newPassword) {
			const isMatch = await bcrypt.compare(currentPassword, user.password);
			if (!isMatch) {
				return res.status(400).json({ error: "Current password is incorrect!" });
			}

			if (newPassword.length < 6) {
				return res.status(400).json({
					error: "New password must be at least 6 characters long",
				});
			}

			const salt = await bcrypt.genSalt(10);
			user.password = await bcrypt.hash(newPassword, salt);
		}

		// Upload profile image
		if (profileImg) {
			if (user.profileImg) {
				await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]);
			}
			const uploaded = await cloudinary.uploader.upload(profileImg);
			profileImg = uploaded.secure_url;
		}

		// Upload cover image
		if (coverImg) {
			if (user.coverImg) {
				await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]);
			}
			const uploaded = await cloudinary.uploader.upload(coverImg);
			coverImg = uploaded.secure_url;
		}

		// Update other fields
		user.fullName = fullName || user.fullName;
		user.email = email || user.email;
		user.username = username || user.username;
		user.bio = bio || user.bio;
		user.link = link || user.link;
		user.profileImg = profileImg || user.profileImg;
		user.coverImg = coverImg || user.coverImg;

		user = await user.save();
		user.password = null;

		return res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
