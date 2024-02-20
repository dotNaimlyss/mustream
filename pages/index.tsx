import React, { useState } from "react";
import { useRouter } from "next/router";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/userSlice";
import { User } from "../redux/userSlice";
type FormState = "login" | "signup" | null;

export default function Home() {
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();
  const router = useRouter();
  const handleSubmit = () => {
    const userData: User = {
      username : username + "- Guest",
      like_artists: [],
      like_genres: [],
      _id: undefined,
    };
    dispatch(setUser(userData));
    router.push("/dashboard");
  };
  const handleLoginClick = () => {
    router.push("/Login");
  };

  const handleSignUpClick = () => {
    router.push("/Signup");
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-xl font-bold mb-4">Welcome to Mustream.</h1>

        <p className="mb-2">Enter your username to start using the demo</p>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter username"
          className="px-4 py-2 border border-gray-300 rounded-lg mb-2 focus:outline-none focus:ring-2 focus: ring-forth"
        />
        <button
          className="px-6 py-2 m-5 fill-none border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-third transition-colors duration-150"
          onClick={handleSubmit}
        >
          Enter as a Guest
        </button>
        <br />
        <div>
          <button
            className="px-6 py-2 m-5 fill-none border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-third transition-colors duration-150"
            onClick={handleLoginClick}
          >
            LogIn
          </button>
          <button
            className="px-6 py-2 m-5 fill-none border-2 border-primary text-primary rounded-lg hover:bg-primary hover:text-third transition-colors duration-150"
            onClick={handleSignUpClick}
          >
            SignUp
          </button>
        </div>
      </div>
    </div>
  );
}
