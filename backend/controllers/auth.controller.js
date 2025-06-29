import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {

    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: "Invalid email format",
      });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        error: "Username already exists",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        error: "Email is already taken.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters long.",
      });
    }
    // hash password
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profilePicture: newUser.profileImg,
        coverImg: newUser.coverImg,
      });
    } 
    
    else {
      res.status(400).json({
        error: "User not created",
      });
    }
  } 
  
  catch (error) {
    console.error("Error during signup:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const login = async (req, res) => {
  try{
    const {username, password} = req.body;
    const user = await User.findOne({username});
    const isPasswordValid = await bcrypt.compare(password, user?.password || "")

    if(!user || isPasswordCorrect){
      return res.status(400).json({
        error: "Invalid username or password"
      });
    }

    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profilePicture: user.profileImg,
      coverImg: user.coverImg,
    });

  }

  catch (error) {
    console.error("Error login controller:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const logout = async (req, res) => {
  res.json({
    data: "You hit the logout endpoint",
  });
};
