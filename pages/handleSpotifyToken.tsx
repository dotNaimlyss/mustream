import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import React from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

const HandleSpotifyToken = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const user = useSelector((state: RootState) => state.user.user);

  useEffect(() => {
    const { access_token, expires_in, refresh_token } = router.query;
    console.log(user)
    const redirectUserBasedOnRecommendations = () => {
      // Assuming user?.recommendations is an array
      if (user && (user.recommendations?.length ?? 0) > 9) {
        router.push("/HomePage").catch((err) => {
          console.error("Failed to redirect to HomePage:", err);
          setError("Failed to redirect to the homepage.");
        });
      } else {
        router.push("/HomePage").catch((err) => {
          console.error("Failed to redirect to dashboard:", err);
          setError("Failed to redirect to the dashboard.");
        });
      }
    };

    if (access_token && expires_in && refresh_token) {
      try {
        const expiryTime = new Date().getTime() + Number(expires_in) * 1000;
        localStorage.setItem("spotifyAccessToken", access_token as string);
        localStorage.setItem("spotifyTokenExpiryTime", expiryTime.toString());
        localStorage.setItem("spotifyRefreshToken", refresh_token as string);

        // Check and redirect based on recommendations
        redirectUserBasedOnRecommendations();
      } catch (error) {
        console.error("Error setting tokens in localStorage:", error);
        setError("An error occurred while processing your request.");
      }
    } else {
      setError("Missing necessary authorization information.");
    }
  }, [router, user?.recommendations]); // Depend on user.recommendations to re-evaluate when it changes

  return (
    <div>
      {error ? (
        <div>
          <p>{error}</p>
          <button onClick={() => router.push("/login")}>Try Again</button>
        </div>
      ) : (
        <p>Redirecting you to the homepage...</p>
      )}
    </div>
  );
};

export default HandleSpotifyToken;
