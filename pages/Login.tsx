// components/LoginForm.js
import { jwtDecode } from "jwt-decode";
import React, { useState } from "react";

import { useDispatch } from "react-redux";
import { Song, setUser } from "../redux/userSlice";

interface CustomJwtPayload {
  like_artists: string[];
  like_genres: string[];
  password: string | undefined;
  _id?: string;
  username?: string;
  recommended_songs?: Song[];
  searched_songs?: string[];
  // Include other custom claims you expect as well
}

const LoginForm = () => {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  // Spotify Authorization Redirect
  const redirectToSpotifyAuthorization = () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = `https://mustream.vercel.app/api/auth/spotifyCallback`;
    const scope =
      "streaming user-read-email user-read-private ";
    const spotifyAuthUrl = `https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=${encodeURIComponent(
      scope
    )}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    window.location.href = spotifyAuthUrl;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials({
      ...credentials,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    redirectToSpotifyAuthorization();
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });
    console.log(response)
    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem("token", token);
      console.log(`this is token: ${token}`);
      const decodedToken = jwtDecode<CustomJwtPayload>(token);
      console.log(`User ID: ${decodedToken._id}`);
      console.log(`Username: ${decodedToken.username}`);
      console.log(`password :${decodedToken.password}` )
      console.log(`Recommended Songs: ${decodedToken.recommended_songs}`);
      console.log(`Searched Songs: ${decodedToken.searched_songs}`);
      dispatch(
        setUser({
          _id: decodedToken._id,
          username: decodedToken.username,
          password: decodedToken.password,
          like_genres: decodedToken.like_genres, 
          like_artists: decodedToken.like_artists, 
          recommendations: decodedToken.recommended_songs,
          searched_songs: decodedToken.searched_songs,
        })
      );

    } else {
      const error = await response.json();
      console.error(`Login error: ${error.message}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto my-10 p-8 bg-white rounded-lg shadow-md"
    >
      <div className="mb-6">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-700"
        >
          Username
        </label>
        <input
          type="text"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          placeholder="Username"
          required
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <div className="mb-6">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <input
          type="password"
          name="password"
          value={credentials.password}
          onChange={handleChange}
          placeholder="Password"
          required
          className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
        />
      </div>
      <button
        type="submit"
        className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      >
        Login
      </button>
    </form>
  );
};

export default LoginForm;
