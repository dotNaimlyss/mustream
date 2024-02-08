import ChatComponent from "../../../../components/chatComponent";
import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { RootState } from "../../../../redux/store";
import React, { useEffect, useState } from "react";
import NextMusicSession from "../../../../components/nextMusicSession";
import PlayerControls from "../../../../components/playerControls";
import type { SpotifyPlayerInstance } from "../../../../global";

const SessionPage: React.FC = () => {
  const router = useRouter();
  const user = useSelector((state: RootState) => state.user.user);
  const [deviceID, setDeviceID] = useState(null);
  const { sessionId, artistName, trackName } = router.query;
  const decodedTrackName = decodeURIComponent((trackName as string) || "");
  const decodedArtistName = decodeURIComponent((artistName as string) || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [player, setPlayer] = useState<SpotifyPlayerInstance | null>(null);
  const [position, setPosition] = useState(0); // Current playback position in milliseconds
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<number | null>(null);

  useEffect(() => {
    const loadSpotifySdk = () => {
      if (!window.Spotify) {
        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
        document.body.appendChild(script);
      }
    };

    window.onSpotifyWebPlaybackSDKReady = () => {
      const token = localStorage.getItem("spotifyAccessToken");
      if (token && window.Spotify && window.Spotify.Player) {
        const newPlayer = new window.Spotify.Player({
          name: "Your Player Name",
          getOAuthToken: (cb: (token: any) => void) => cb(token), // Adjust token type accordingly
        });

        // Set up player event listeners
        newPlayer.addListener("ready", ({ device_id }) => {
          console.log("Ready with Device ID", device_id);
          setDeviceID(device_id);
        });
        newPlayer.addListener("not_ready", ({ device_id }) => {
          console.log("Device ID has gone offline", device_id);
          setDeviceID(device_id);
        });
        newPlayer.addListener("player_state_changed", (state) => {
          if (state) {
            setPosition(state.position);
            setDuration(state.track_window.current_track.duration_ms);
          }
        });

        newPlayer.connect().then((success) => {
          if (success) {
            console.log(
              "The Web Playback SDK successfully connected to Spotify!"
            );
          }
        });

        setPlayer(newPlayer);
        return () => newPlayer.removeListener("player_state_changed");
      }
    };

    loadSpotifySdk();

    // Cleanup
    return () => {
      player?.disconnect();
      stopProgressUpdate();
    };
  }, []);

  const refreshSpotifyAccessToken = async () => {
    try {
      const response = await fetch("/api/refresh-spotify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        // Ensure you're securely sending the refresh token or any required data
      });
      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem("spotifyAccessToken", data.accessToken);
        // Update expiration time as well, assuming `data.expiresIn` is the duration in seconds
        const expiryTime = new Date().getTime() + data.expiresIn * 1000;
        localStorage.setItem("spotifyTokenExpiryTime", expiryTime.toString());
        return data.accessToken;
      }
    } catch (error) {
      console.error("Error refreshing Spotify access token:", error);
      return null;
    }
  };

  const playTrack = async (
    device_id: string,
    trackName: string,
    artistName: string
  ) => {
    // Spotify Search API to find the track
    let token = localStorage.getItem("spotifyAccessToken");
    const expiryTime = localStorage.getItem("spotifyTokenExpiryTime");
    const query = encodeURIComponent(`track:${trackName} artist:${artistName}`);
    const searchUrl = `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`;

    if (!token || !expiryTime || new Date().getTime() > Number(expiryTime)) {
      token = await refreshSpotifyAccessToken(); // Refresh the token
      if (!token) {
        console.error("Failed to refresh token");
        return; // Exit if unable to refresh the token
      }
    }
    try {
      const searchResponse = await fetch(searchUrl, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const searchData = await searchResponse.json();
      const trackUri = searchData.tracks.items[0]?.uri;

      if (trackUri) {
        const playUrl = `https://api.spotify.com/v1/me/player/play?device_id=${device_id}`;
        await fetch(playUrl, {
          method: "PUT",
          body: JSON.stringify({ uris: [trackUri] }),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Error playing track:", error);
    }
  };

  const togglePlay = async () => {
    if (player) {
      const isTokenExpired =
        new Date().getTime() >
        Number(localStorage.getItem("spotifyTokenExpiryTime"));
      let token = localStorage.getItem("spotifyAccessToken");

      if (isTokenExpired || !token) {
        token = await refreshSpotifyAccessToken(); // Refresh the token
        if (!token) {
          console.error("Failed to refresh token");
          return; // Exit if unable to refresh the token
        }
      }

      if (isPlaying) {
        await player.pause(); // Pause the music if it is currently playing
        setIsPlaying(false);
        stopProgressUpdate();
        console.log("paused"); // Stop updating progress when music is paused
      } else {
        // Check if there's a need to start a new track or resume current playback
        if (!position || position === 0) {
          // Assuming 'position' is the current playback position; if it's 0, likely no track has been started
          const device_id = deviceID; // Ensure deviceID is correctly obtained from your setup
          if (device_id && decodedTrackName && decodedArtistName) {
            // Start a new track only if necessary
            await playTrack(device_id, decodedTrackName, decodedArtistName);
            console.log("playing");
            startProgressUpdate();
          }
        } else {
          // Resume playback from the current position
          if (player.resume) {
            await player.resume();
            console.log("resumed");
          } else {
            await player.togglePlay();
          }
        }
        setIsPlaying(true);
        startProgressUpdate(); // Resume updating progress when music plays
      }
    }
  };

  const onVolumeChange = (event) => {
    if (event) {
      if (player && event !== undefined) {
        player.setVolume(event);
        console.log(event);
      }
    }
  };

  const handleSeek = async (newPositionMs) => {
    if (player) {
      player
        .seek(newPositionMs)
        .then(() => {
          console.log(`Seeked to ${newPositionMs} ms`);
        })
        .catch((err) => {
          console.error("Error during seek:", err);
        });
    }
  };

  const startProgressUpdate = () => {
    const id = setInterval(async () => {
      if (player) {
        const state = await player.getCurrentState();
        if (state) {
          setPosition(state.position);
          setDuration(state.duration);
        }
      }
    }, 1000) as unknown as number; // Update every second

    setIntervalId(id); // Store interval ID for later cleanup
    if (intervalId !== null) {
      clearInterval(intervalId as unknown as NodeJS.Timeout); // Cast back if necessary
      setIntervalId(null);
    }
  };

  const stopProgressUpdate = () => {
    if (intervalId !== null) {
      clearInterval(intervalId as any); // Use 'as any' to bypass the type mismatch issue
    }
    setIntervalId(null);
  };

  return (
    <div className="relative w-full bg-white text-gray-800">
      <PlayerControls
        isPlaying={isPlaying}
        onPlayPause={togglePlay}
        position={position}
        duration={duration}
        onSeek={handleSeek}
        onVolumeChange={onVolumeChange}
        trackname={decodedTrackName}
        artistname={decodedArtistName}
      />
      <div className="pt-4 px-4">
        <div className="text-sm bg-secondary p-2 rounded text-white">
          {user?.username} at Session: {sessionId}
        </div>
        <ChatComponent
          sessionId={sessionId as string}
          selectedTrack={decodedTrackName}
          selectedArtist={decodedArtistName}
          currentUser={user?.username as string}
        />
        <NextMusicSession />
      </div>
    </div>
  );
};

export default SessionPage;
