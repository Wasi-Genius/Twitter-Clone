import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

// Helper to send user data back to client (excluding sensitive fields)
const sendUserResponse = (user, res, status = 200) => {
	res.status(status).json({
		_id: user._id,
		fullName: user.fullName,
		username: user.username,
		email: user.email,
		followers: user.followers,
		following: user.following,
		profilePicture: user.profileImg,
		coverImg: user.coverImg,
	});
};

// Signup new user

export const signup = async (req, res) => {
	try {
		const { fullName, username, email, password } = req.body;

		// Simple email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(email)) {
			return res.status(400).json({ error: "Invalid email format" });
		}

		// Check if username or email already exists
		const [existingUser, existingEmail] = await Promise.all([
			User.findOne({ username }),
			User.findOne({ email }),
		]);

		if (existingUser) {
			return res.status(400).json({ error: "Username already exists" });
		}

		if (existingEmail) {
			return res.status(400).json({ error: "Email is already taken" });
		}

		if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

		if (!username) {
			return res.status(400).json({ error: "You must enter a username" });
		}

		if (!fullName) {
			return res.status(400).json({ error: "You must enter your full name" });
		}

		// Hash password with salt
		const hashedPassword = await bcrypt.hash(password, 10);

		// Create new user
		const newUser = new User({
			fullName,
			username,
			email,
			password: hashedPassword,
		});

		await newUser.save();
		generateTokenAndSetCookie(newUser._id, res);
		sendUserResponse(newUser, res, 201);
	} catch (error) {
		console.error("Error during signup:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Login existing user
export const login = async (req, res) => {
	try {
		const { username, password } = req.body;

		const user = await User.findOne({ username });

		// Check user and password validity
		const isPasswordValid = await bcrypt.compare(password, user?.password || "");
		if (!user || !isPasswordValid) {
			return res.status(400).json({ error: "Invalid username or password" });
		}

		generateTokenAndSetCookie(user._id, res);
		sendUserResponse(user, res);
	} catch (error) {
		console.error("Error during login:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

//Logout current user
export const logout = async (req, res) => {
	try {
		// Clear JWT cookie
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		console.error("Error during logout:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};

// Get current logged-in user's profile
export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.error("Error in getMe controller:", error);
		res.status(500).json({ error: "Internal server error" });
	}
};
