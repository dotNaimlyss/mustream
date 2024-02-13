// pages/api/auth/login.js
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  const { method } = req;
  await dbConnect();

  if (method === "POST") {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username });
      if (user && (await bcrypt.compare(password, user.password))) {
        // Create token
        const token = jwt.sign(
          {
            _id: user._id,
            username: user.username,
            password: user.password,
            like_genres: user.like_genres,
            like_artists: user.like_artists,
            recommended_songs: user.recommended_songs,
            searched_songs: user.searched_songs,
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "1h", // token will expire in 1 hour
          }
        );

        // Return user and token
        res.status(200).json({ token });
      } else {
        res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
}
