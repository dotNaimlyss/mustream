import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import SearchComponent from "../components/searchComponent";
import { handleSongClick } from "../lib/songClick";
import type { RootState } from "../redux/store";
import type { ITrack } from "../models/Track";
import { LoadingIndicator } from "../components/loadingIndicator";

const HomePage: React.FC = () => {
  const [recommendedSongs, setRecommendedSongs] = useState<ITrack[]>([]);
  const user = useSelector((state: RootState) => state.user.user);
  const [loading, setLoading] = useState<{
    hasError: Boolean;
    isLoading: Boolean;
    error: string;
  }>({
    hasError: false,
    isLoading: false,
    error: "",
  });

  useEffect(() => {
    const fetchRecommendedSongsForRegisteredUser = async () => {
      setLoading({
        hasError: false,
        isLoading: true,
        error: "",
      });
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No authentication token found in local storage");
        }

        const response = await fetch(`/api/user/getUserdata`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch recommendations");
        }

        const data = await response.json();
        setRecommendedSongs(data.recommended_songs || []);
        setLoading({ hasError: false, isLoading: false, error: "" });
      } catch (error) {
        console.error("Couldn't fetch recommendations for user:", error);
        setLoading({ hasError: true, isLoading: false, error: error.message });
      }
    };

    fetchRecommendedSongsForRegisteredUser();
  }, [user]); // Depend on user to refetch when user changes

  return (
    <div className="relative">
      <h1 className="text-2xl font-semibold text-primary mb-4 ">
        Song Tracks you may like!!
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading.isLoading ? (
          <LoadingIndicator />
        ) : loading.hasError ? (
          <div>{loading.error}</div>
        ) : (
          recommendedSongs.map((recommendation, index) => (
            <div
              key={index}
              className="p-4 rounded-lg shadow-md hover:bg-gray-50 transition cursor-pointer"
              onClick={() => handleSongClick(recommendation, user)}
            >
              <h4 className="text-primary">{recommendation.track_name}</h4>
              by{" "}
              <span className="text-gray-600">
                {recommendation.track_artist}
              </span>
            </div>
          ))
        )}
      </div>
      <SearchComponent />
      <div className="absolute top-0 right-1/4 x-2"></div>
    </div>
  );
};

export default HomePage;
