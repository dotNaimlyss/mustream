import { useDispatch, useSelector } from "react-redux";
import {
  setLikeGenres,
  setLikeArtists,
  User,
  Song,
  setUser,
  setRecommendations,
} from "../redux/userSlice";
import { RootState } from "../redux/store";
import { useRouter } from "next/router";
import { MUSIC_GENRES, ARTISTS } from "../models/selection";
import React, { useState, useEffect } from "react";
import SearchComponent from "../components/searchComponent";
import { handleSongClick } from "../lib/songClick";

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [recommendedsongs, setRecommendedsongs] = useState<Song[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedArtists, setSelectedArtists] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<
    "genres" | "artists" | "recommendations"
  >("genres");

  const dispatch = useDispatch();
  const handleProceedToArtists = () => {
    setCurrentStep("artists");
  };

  useEffect(() => {
    if (selectedGenres.length >= 3) {
      dispatch(setLikeGenres(selectedGenres));
    }
  }, [selectedGenres, dispatch]);

  useEffect(() => {
    if (selectedArtists.length >= 3 ) {
      dispatch(setLikeArtists(selectedArtists));
    }
  }, [selectedArtists, dispatch]);

  useEffect(() => {
    if (user && user.recommendations && (user.recommendations?.length ?? 0) > 9 && user.password) {
      // If the user has recommendations, send to the homepage
      router.push("/HomePage");
    }else if (user?.recommendations && (user.recommendations.length ?? 0) >9){
      setCurrentStep("recommendations")
    }
  }, [user, router]);

  useEffect(() => {
    // Fetching data or updating state here
  }, [router.asPath]);


  const updateRegisteredUserData = async (user) => {
    console.log(`user`, user);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("No authentication token found in local storage");
        return;
      }

      const response = await fetch(`/api/user/updateUserData`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user }),
      });
      if (response.ok) {
        const updatedUser = await response.json();
        console.log(response)
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
      console.error("Couldn't update recommendations for user:", error);
    }
  };

  const handleProceed = async (): Promise<void> => {
    setLoading(true); // Start loading
    try {
      const UserToFetch: User = {
        username: user?.username,
        like_genres: selectedGenres,
        like_artists: selectedArtists,
      };

      const response = await fetch("https://47.129.43.142:443/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(UserToFetch),
        mode: 'no-cors'
      });

      if (response.ok) {
        const recommendations = await response.json();
        dispatch(setRecommendations(recommendations)); // Dispatch recommendations to Redux
        setRecommendedsongs(recommendations); // Update local state (if still needed)
        console.log(
          `this is user : ${user}, this is username : ${user?.username} and it's recommendations : ${user?.recommendations}`,
          recommendations
        );
        if (user && user._id) {
          const uuser: User = {
            username: user.username,
            like_genres: user.like_genres,
            like_artists: user.like_artists,
            recommendations: recommendations,
            searched_songs: user.searched_songs,
          };
          updateRegisteredUserData(uuser);
        } else {
          console.log("This is not a registered user");
          setCurrentStep("recommendations");
        }
      } else {
        console.error("Response not ok:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    setLoading(false); // Stop loading
  };

  const handleGenreSelect = (genre: string) => {
    setSelectedGenres((prevSelected) => {
      if (prevSelected.includes(genre)) {
        return prevSelected.filter((g) => g !== genre); // Deselect
      } else {
        return [...prevSelected, genre]; // Select
      }
    });
  };

  const handleArtistSelect = (artist: string) => {
    setSelectedArtists((prevSelected) => {
      if (prevSelected.includes(artist)) {
        return prevSelected.filter((g) => g !== artist); // Deselect
      } else {
        return [...prevSelected, artist]; // Select
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      {user && (
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-primary">
            Welcome {user.username}
          </h1>
          {currentStep === "genres" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Choose at least 3 Music Genres
              </h2>
              <div className="flex flex-wrap -mx-2">
                {MUSIC_GENRES.map((genre, index) => (
                  <div key={index} className="p-2 w-1/4">
                    <div
                      className={`p-4 rounded-lg text-center cursor-pointer transition-shadow shadow-md ${
                        selectedGenres.includes(genre)
                          ? "bg-primary text-white"
                          : "bg-white text-gray-700 hover:bg-gray-50"
                      }`}
                      onClick={() => handleGenreSelect(genre)}
                    >
                      {genre}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={`mt-6 px-6 py-2 rounded-lg ${
                  selectedGenres.length < 3
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-primary text-white hover:bg-primary focus:ring-4 focus:ring-primary focus:ring-opacity-50"
                } transition duration-150 ease-in-out transform hover:-translate-y-1 hover:scale-105`}
                disabled={selectedGenres.length < 3}
                onClick={handleProceedToArtists}
              >
                Continue
              </button>
            </div>
          )}
          {currentStep === "artists" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Choose your best favorite artists
              </h2>
              <div className="flex flex-wrap -mx-2">
                {ARTISTS.map((artist, index) => (
                  <div key={index} className="p-2 w-1/4">
                    <div
                      className={`p-4 rounded-lg text-center cursor-pointer ${
                        selectedArtists.includes(artist)
                          ? "bg-primary text-white"
                          : "bg-white hover:bg-gray-50"
                      } transition-shadow shadow-md`}
                      onClick={() => handleArtistSelect(artist)}
                    >
                      {artist}
                    </div>
                  </div>
                ))}
              </div>
              <button
                className={`mt-6 px-6 py-2 rounded-lg text-white ${
                  loading ? "bg-gray-400" : "bg-primary hover:bg-primary"
                } transition`}
                disabled={loading}
                onClick={handleProceed}
              >
                Continue
              </button>
            </div>
          )}
          {currentStep === "recommendations" && (
            <div>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Song Tracks You Might Want to Try
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {recommendedsongs.map((recommendation, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg shadow-md hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => handleSongClick(recommendation, user)}
                  >
                    <h4 className="text-primary">
                      {recommendation.track_name}
                    </h4>{" "}
                    by{" "}
                    <span className="text-gray-600">
                      {recommendation.track_artist}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <h1 className="text-2xl font-bold text-gray-700">
                  Search for a Songs
                </h1>
                <SearchComponent />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
