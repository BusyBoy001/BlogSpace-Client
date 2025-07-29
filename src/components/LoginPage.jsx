import React, { useState } from "react";
import { login } from "../utils/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setMessageType("");
    try {
      await login(email, password);
      setMessageType("success");
      setMessage("Login successful! Redirecting...");
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error) {
      setMessageType("error");
      setMessage(error.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-darkbg px-4">
      <div className="bg-white dark:bg-darkbg rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <h1 className="text-3xl font-bold text-center pt-5 mb-6 text-lighttext dark:text-darktext">Login</h1>
        {message && (
          <div
            className={`mx-8 mb-4 p-3 rounded-lg text-sm ${messageType === "success"
              ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600"
              : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-600"
              }`}
          >
            {message}
          </div>
        )}
        <form className="px-8 pb-8 pt-2" onSubmit={handleSubmit}>
          <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Email</label>
          <input
            type="email"
            className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Password</label>
          <input
            type="password"
            className="w-full px-4 py-2 mb-6 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            className="w-full bg-lightaccent dark:bg-darkaccent text-white py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow"
            type="submit"
            disabled={!email || !password || isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
} 