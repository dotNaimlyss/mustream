// /pages/api/auth/spotifyRefreshToken.ts

import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { refresh_token } = req.body;
  console.log(req.body); // Log the incoming request body

  // Make sure the refresh token is provided
  if (!refresh_token) {
    return res.status(400).json({ error: "Refresh token is required" });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID; // Changed to SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  // Check for the presence of clientId and clientSecret
  if (!clientId || !clientSecret) {
    console.error("Spotify client ID or secret is not set in the environment variables.");
    return res.status(500).json({ error: "Server configuration error" });
  }

  const base64Credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64Credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token,
      }).toString(),
    });

    const data = await tokenResponse.json();

    if (data.error) {
      console.error("Failed to refresh token with Spotify:", data);
      return res.status(400).json({ error: "Failed to refresh access token" });
    }

    res.json({ access_token: data.access_token, expires_in: data.expires_in });
  } catch (error) {
    console.error("Error while contacting Spotify:", error);
    res.status(500).json({ error: "Something went wrong on the server." });
  }
}
