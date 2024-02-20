import { createHash } from "crypto";
import { Song, type User } from "../redux/userSlice";
import { ITrack } from "../models/Track";
import router from "next/router";

const createSessionId = (trackName: string, artistName: string): string => {
    const hash = createHash("sha256");
    hash.update(`${trackName}-${artistName}`);
    return hash.digest("hex");
  };

  

export const handleSongClick = (song : Song | ITrack , user) => {
  const token = localStorage.getItem("token");
  // if(!user?._id || !token){
  //   return console.log("You have to registered to use this features.")
  // }
    const sessionId = createSessionId(
      song.track_name,
      song.track_artist
    );
    const encodedTrackName = encodeURIComponent(song.track_name);
    const encodedArtistName = encodeURIComponent(song.track_artist);
    console.log("Clicked song:", song);
    router.push(
      `/session/${sessionId}/${encodedTrackName}/${encodedArtistName}`
    );
  };