import dbConnect from "../../../lib/dbConnect";
import User from "../../../models/User";
import jwt from "jsonwebtoken";

export default async function handler(req, res) {
  // Ensure that the request dealing with a PUT request
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
    // Checking the authorization header is available
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

    const { user } = req.body; // Destructure the user object from req.body
    console.log(`this is req body:`, user); // for debugging purpose

    // Update the user's recommendations in the database
    const updatedUser = await User.findByIdAndUpdate(
      decodedToken._id,
      {
        $set: {
          username: decodedToken.username,
          like_genres: decodedToken.like_genres,
          like_artists: decodedToken.like_artists,
          recommended_songs: decodedToken.recommendations,
          searched_songs: decodedToken.searched_songs,
        },
      },
      { new: true }
    );
    console.log(`backend user:`, updatedUser);
    // If the updating process fail, return a 404 error
    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude the password when returning the updated user
    const { password, ...userWithoutPassword } = updatedUser.toObject();

    // Return the updated user data without the password
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    console.error("Failed to update recommendations:", error);
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
}
