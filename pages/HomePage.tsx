import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchComponent from "../components/searchComponent";
import { handleSongClick } from "../lib/songClick";
import type { RootState } from "../redux/store";
import type { ITrack } from "../models/Track";

const HomePage: React.FC = () => {
  const [recommendedSongs, setRecommendedSongs] = useState<ITrack[]>([]);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const fetchRecommendedSongsForRegisteredUser = async () => {
      // if (!user?.username || !user._id) {
      //   console.error("This user is not registered or user ID is missing");
      //   return;
      // }

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("No authentication token found in local storage");
          return;
        }

        const response = await fetch(`/api/user/getUserdata`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setRecommendedSongs(data.recommended_songs || []);
        } else {
          console.error("Failed to fetch recommendations:", response.statusText);
        }
      } catch (error) {
        console.error("Couldn't fetch recommendations for user:", error);
      }
    };

    fetchRecommendedSongsForRegisteredUser();
  }, [user]); // Depend on user to refetch when user changes

  return (
    <div className="relative">
      <h1 className="text-2xl font-semibold text-gray-700 mb-4">
        Song Tracks you may like!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendedSongs.map((recommendation, index) => (
          <div
            key={index}
            className="p-4 rounded-lg shadow-md hover:bg-gray-50 transition cursor-pointer"
            onClick={() => handleSongClick(recommendation, user)}
          >
            <h4 className="text-primary">{recommendation.track_name}</h4>
            by <span className="text-gray-600">{recommendation.track_artist}</span>
          </div>
        ))}
      </div>
      <SearchComponent />
      <div className="absolute top-0 right-1/4 x-2">
      
      </div>
    </div>
  );
};

export default HomePage;
