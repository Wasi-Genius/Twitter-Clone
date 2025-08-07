import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized access. Token missing.",
      });
    }

    // Verifies token and decodes it (throws if invalid)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user without password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        error: "Unauthorized access. User not found.",
      });
    }

    // Attach user to request object
    req.user = user;
    next();

  } catch (error) {
    console.error("protectRoute error:", error.message);
    return res.status(500).json({
      error: "Internal server error.",
    });
  }
};
