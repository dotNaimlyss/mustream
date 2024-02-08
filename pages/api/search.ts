import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "../../lib/dbConnect";
import Track from "../../models/Track";
import mongoose from "mongoose";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Connect to the database
    await dbConnect();

    // Extract the query parameter
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ message: "Query parameter is required" });
    }

    // Log the formatted query
    const regexQuery = new RegExp(query as string, "i");
    console.log(`Formatted query: ${regexQuery}`);

    // Perform the search operation using the Track model
    const tracks = await Track.find({
      track_name: regexQuery,
    });

    // Log the found tracks
    console.log(`Found tracks: ${tracks.length}`);
    console.log(`Using database: ${mongoose.connection.db.databaseName}`);
    console.log(`Using collection: ${Track.collection.collectionName}`);

    // Send the search results back to the client
    res.status(200).json(tracks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}
