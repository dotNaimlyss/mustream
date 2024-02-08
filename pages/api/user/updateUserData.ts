// pages/api/user/[userId]/updateRecommendations.js
import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // Ensure that we're dealing with a PUT request
  if (req.method !== "PUT") {
    return res
      .status(405)
      .json({ message: `Method ${req.method} Not Allowed` });
  }

  // Connect to the database
  await dbConnect();

  try {
    // Retrieve the user ID from the URL parameter and the Authorization header
    const authorizationHeader = req.headers.authorization;
    // Check for the presence of the authorization header
    if (!authorizationHeader) {
      return res
        .status(401)
        .json({ message: "No authorization token provided" });
    }

    // Extract the token from the Authorization header
    const token = authorizationHeader.split(" ")[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
    if (!decodedToken._id) {
      console.log("here");
      return res.status(403).json({ message: "unauthorized" });
    }
    // Check if the user ID from the token matches the user ID in the URL parameter

    // Extract recommendations from the request body
    const { user } = req.body; // Destructure the user object from req.body
    console.log(`this is req body:`, user); // Log the user object to verify its structure

    // Update the user's recommendations in the database
    const updatedUser = await User.findByIdAndUpdate(
      decodedToken._id,
      {
        $set: {
          username: user.username,
          like_genres: user.like_genres,
          like_artists: user.like_artists,
          recommended_songs: user.recommendations,
          searched_songs: user.searched_songs,
        },
      },
      { new: true }
    );
    console.log(`backend user:`, updatedUser);
    // If the user wasn't found, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude the password when returning the updated user
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    // Return the updated user data minus the password
    console.log("user search list updated");
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update recommendations:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
