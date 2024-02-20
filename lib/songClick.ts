import { createHash } from "crypto";
import { Song, type User } from "../redux/userSlice";
import { ITrack } from "../models/Track";
import router from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { setUser } from "../redux/userSlice";

const createSessionId = (trackName: string, artistName: string): string => {
  const hash = createHash("sha256");
  hash.update(`${trackName}-${artistName}`);
  return hash.digest("hex");
};
const dispatch = useDispatch();
const updateRegisteredUserSearchData = async (user) => {
  console.log(`user`, user);
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No authentication token found in local storage");
      return;
    }

    const response = await fetch(`/api/user/updateSearchSongs`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ user }),
    });
    if (response.ok) {
      const updatedUser = await response.json();
      console.log(response);
      dispatch(setUser(updatedUser));
      console.log(`Updated User:`, updatedUser);
    } else if (response.status === 403) {
      console.error(
        "Access forbidden. You might not have the necessary permissions for this action."
      );
    } else {
      throw new Error("Failed to update recommendations");
    }
  } catch (error) {
    console.error("Couldn't update search songs for user:", error);
  }
};

export const handleSongClick = (song: Song | ITrack, user) => {
  const token = localStorage.getItem("token");
  if (user && user._id) {
    const uuser: User = {
      username: user.username,
      like_genres: user.like_genres,
      like_artists: user.like_artists,
      searched_songs: user.searched_songs,
    };
    updateRegisteredUserSearchData(uuser);
  }
  const sessionId = createSessionId(song.track_name, song.track_artist);
  const encodedTrackName = encodeURIComponent(song.track_name);
  const encodedArtistName = encodeURIComponent(song.track_artist);
  console.log("Clicked song:", song);
  router.push(`/session/${sessionId}/${encodedTrackName}/${encodedArtistName}`);
};
