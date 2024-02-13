import React, { useState, useEffect } from "react";
import PlayArrowRoundedIcon from "@mui/icons-material/PlayArrowRounded";
import PauseOutlinedIcon from "@mui/icons-material/PauseOutlined";

const PlayerControls = ({
  isPlaying,
  onPlayPause,
  position,
  duration,
  onSeek,
  onVolumeChange,
  trackname,
  artistname,
}) => {
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [volume, setVolume] = useState(100); // Assuming volume is between 0 and 100

  useEffect(() => {
    setProgressPercentage((position / duration) * 100);
  }, [position, duration]);

  const handleVolumeChange = (event) => {
    if (!event.target) {
      console.error("Event target is not defined.");
      return;
    }

    const newVolume = event.target.value;
    setVolume(newVolume); // Updates the volume state

    // Check if onVolumeChange is a function
    if (typeof onVolumeChange === "function") {
      onVolumeChange(newVolume / 100); // Calls the parent component's volume change handler
    } else {
      console.error("onVolumeChange is not a function.");
    }
  };

  const handleSeekChange = (event) => {
    setProgressPercentage(event.target.value);
  };

  const handleSeekCommit = (event) => {
    const newTime = (event.target.value / 100) * duration;
    onSeek(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <div className="mt-5 relative bg-primary text-white p-4 rounded-lg shadow-lg max-w-lg mx-auto">
      <h1 className="text-xl font-bold text-center mb-2">{trackname}</h1>
      <span className="text-m text-center">by {artistname}</span>

      {/* Progress Bar and Time */}
      <div className="flex items-center mb-4">
        <span className="text-xs w-12">{formatTime(position / 1000)}</span>
        <input
          type="range"
          className="flex-1 mx-2 bg-pink-100 rounded-full h-1.5 appearance-none cursor-pointer accent-pink-400"
          min="0"
          max="100"
          value={progressPercentage}
          onChange={handleSeekChange}
          onMouseUp={handleSeekCommit}
        />
        <span className="text-xs w-12">{formatTime(duration / 1000)}</span>
      </div>

      {/* Player Controls */}
      <div className="flex items-center justify-center space-x-4">
        <button
          onClick={onPlayPause}
          className=" hover:bg-primary text-white w-12 h-12 rounded-full flex items-center justify-center focus:outline-none"
        >
          {isPlaying ? (
            <PauseOutlinedIcon /> // Unicode play symbol
          ) : (
            <PlayArrowRoundedIcon /> // Unicode pause symbol
          )}
        </button>

        {/* Volume Control */}
        <div className="flex items-center">
          <span className="text-xs mr-2">🔊</span>
          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={handleVolumeChange}
            className="bg-pink-100 accent-pink-300"
          />
        </div>
      </div>
    </div>
  );
};

export default PlayerControls;
