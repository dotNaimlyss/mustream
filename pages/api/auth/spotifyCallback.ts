import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { code, state } = req.query; // The code Spotify returns
  let returnUrl = "/dashboard";
  if (state) {
    const parsedState = JSON.parse(decodeURIComponent(state.toString()));
    returnUrl = parsedState.returnUrl || returnUrl;
  }
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID; 
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = `https://mustream.vercel.app/api/auth/spotifyCallback`;

  if (!code) {
    return res.status(400).send("Spotify code is required");
  }
  try {
    // Exchange the code for an access token connecting with the spotify api 

    const base64Credentials = Buffer.from(
      `${clientId}:${clientSecret}`
    ).toString("base64");
    const tokenResponse = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code: code.toString(),
          redirect_uri: redirectUri,
        }).toString(),
      }
    );
    console.log("here done spotify");
    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return res.status(400).json(tokenData);
    }

    const { access_token, expires_in, refresh_token } = tokenData; // Destructuring the token data object
    const clientRedirectUri = `${
      process.env.NEXT_PUBLIC_BASE_URL
    }/handleSpotifyToken?access_token=${encodeURIComponent(
      access_token
    )}&expires_in=${expires_in}&refresh_token=${encodeURIComponent(
      refresh_token
    )}`;

    return res.redirect(clientRedirectUri);
  } catch (error) {
    res.status(500).json({ error: "Something went wrong" });
  }
}
