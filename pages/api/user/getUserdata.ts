import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  // Connect to the database
  await dbConnect();

  try {
    const authorizationHeader = req.headers.authorization;
    if (!authorizationHeader) {
      return res.status(401).json({ message: 'No authorization token provided' });
    }

    const token = authorizationHeader.split(' ')[1];
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken._id) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Retrieve the user and populate the recommended_songs from the "tracks" collection
    const user = await User.findById(decodedToken._id)
      .populate('searched_songs')
      .populate('recommended_songs');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Failed to retrieve recommendations:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
