import React, { useState } from "react";
import { useRouter } from "next/router";
import { LoadingIndicator } from "../components/loadingIndicator";

const SignUpForm = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<{
    isLoading: boolean;
    error: string;
  }>({
    isLoading: false,
    error: "",
  });
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading({ isLoading: true, error: "" });

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        // Handle successful sign up (e.g., redirect to sign-in page)
        alert("User successfully created!");
        router.push("/");
      } else {
        // Handle errors (e.g., username already exists)
        const error = await response.text();
        setLoading({ isLoading: false, error });
      }
    } catch (error) {
      console.error("Failed to sign up:", error);
      setLoading({ isLoading: false, error: "Failed to sign up." });
    }
  };

  return (
    <div className="max-w-lg mx-auto my-10 p-8 bg-white rounded-lg shadow-md">
      <h1 className="block text-xl font-medium text-gray-700">Register your account</h1>
      {loading.isLoading && <LoadingIndicator />}
      <form onSubmit={handleSubmit} className="">
        <div className="mb-6">
          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
            Username:
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder-gray-400"
          />
        </div>
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mt-1 p-2 w-full border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary placeholder-gray-400"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
        >
          Sign Up
        </button>
        {loading.error && <p className="text-red-500 mt-2">{loading.error}</p>}
      </form>
    </div>
  );
};

export default SignUpForm;
