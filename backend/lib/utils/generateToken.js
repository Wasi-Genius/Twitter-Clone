import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: "15d",
    });

    res.cookie("jwt", token, {
        httpOnly: true, 
        maxAge: 15 * 24 * 60 * 60 * 1000,
        // MUST be "none" for cross-site cookies between separate Render services
        sameSite: "none", 
        // MUST be true if sameSite is "none"
        secure: true, 
    });
};