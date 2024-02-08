// pages/api/user/[userId]/updateSearchSongs.js
import dbConnect from '../../../lib/dbConnect';
import User from '../../../models/User';
import jwt from 'jsonwebtoken';

export default async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }

  await dbConnect();
  try {
    const { song } = req.body;

    // Verify the token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(403).json({ message: 'No token provided' });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if(!decodedToken._id){
        console.log("here")
        return res.status(403).json({message: "unauthorized"})
      }

    // Update the user document
    const updatedUser = await User.findByIdAndUpdate(
        decodedToken._id,
      { $push: { searched_songs: song } },
      { new: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Failed to update searched songs:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
