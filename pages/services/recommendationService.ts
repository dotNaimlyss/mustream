import { User } from "../../redux/userSlice";

export const fetchGuestRecommendations = async ({user, selectedGenres, selectedArtists}) => {
    try {
        // Update user state with selected genres and artists
        const updatedUser: User = {
          username: user?.username,
          like_genres: selectedGenres,
          like_artists: selectedArtists,
          _id: undefined
        };
  
        // Fetch the recommendations from the backend
        const response = await fetch("http://localhost:4000/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedUser),
        });
        if (response.ok) {
          const data = await response.json();
          return (data);
        } else {
          console.error("Response not ok:", response.statusText);
          // Handle the error state here if necessary
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        // Handle the error state here if necessary
      }
  };