// components/SearchComponent.tsx
import React, { useState, useEffect } from "react";
import { ITrack } from "../models/Track";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setUser } from "../redux/userSlice";
import { LoadingIndicator } from "./loadingIndicator";
import { handleSongClick } from "../lib/songClick";
import { SearchIcon } from "@heroicons/react/solid";

const SearchComponent = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const [songs, setSongs] = useState<ITrack[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchSongs, setSearchSongs] = useState("");
  const router = useRouter();
  const dispatch = useDispatch();

  const fetchSearchResults = async (searchQuery) => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/search?query=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log(`This is search query: ${searchQuery}`);
      console.log(`This is data: ${JSON.stringify(data)}`);

      setSongs(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setSongs([]);
    } finally {
      setLoading(false);
    }
  };

  const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // Use the debounce function
  const debouncedFetchSearchResults = debounce(fetchSearchResults, 500);

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuery(value);
    if (value.length > 1) {
      debouncedFetchSearchResults(value);
    } else {
      setSongs([]);
    }
  };

  const handleSearchSongClick = async (song: ITrack): Promise<void> => {
    handleSongClick(song, user);
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
        body: JSON.stringify({ song }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        dispatch(setUser(updatedUser));
      } else {
        const error = await response.json();
        throw new Error(error.message);
      }
    } catch (error) {
      console.error("Couldn't update searched songs for user:", error);
    }
  };

  // Add this function as an onClick event to the list item that renders each song

  return (
    <div className="relative flex items-center w-1/4 mt-10">
  <input
    type="text"
    value={query}
    onChange={handleInputChange}
    className="border pl-10 pr-3 py-2 rounded-full w-full focus:outline-none focus:ring-2 focus:ring-primary"
    placeholder="Search for a song"
  />
  <div className="absolute left-3 inset-y-0 flex items-center pointer-events-none">
    <SearchIcon className="h-5 w-5 text-gray-500" />
  </div>
  {loading && <LoadingIndicator />}
  {songs.length > 0 && (
    <ul className="absolute w-full bg-white border border-gray-300 rounded-md mt-12 overflow-y-auto z-10 shadow-lg" style={{ maxHeight: '200px', top: '100%' }}>
      {songs.map((song, index) => (
        <li
          key={index}
          className="p-2 hover:bg-gray-100 cursor-pointer"
          onClick={() => handleSearchSongClick(song)}
        >
          {song.track_name} - {song.track_artist}
        </li>
      ))}
    </ul>
  )}
</div>

  );
};

export default SearchComponent;
