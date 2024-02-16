// pages/api/signup.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // if (req.method !== 'POST') {
  //   return res.status(405).end(); // Method Not Allowed
  // }

  const { username, password } = req.body;
  await dbConnect();

  try {
    // Create and save the new user
    const newUser = await User.create({
      username,
      password,
      like_artists : [],
      like_genres : [],
      searched_songs: [],
      recommended_songs: [],
    });

    // Respond with the created user (excluding the password)
    const { password: _, ...userWithoutPassword } = newUser.toObject();
    
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
