import React, { useState } from "react";
import { register } from "../utils/auth";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [profilePreview, setProfilePreview] = useState(null);
    const [profileFile, setProfileFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState(""); // "success" or "error"
    const fileInputRef = React.useRef();

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
                setProfileFile(file);
            };
            reader.readAsDataURL(file);
        } else {
            setProfilePreview(null);
            setProfileFile(null);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            const userData = {
                email,
                username,
                password,
                profileImage: profileFile
            };

            await register(userData);
            
            // Registration successful
            setMessageType("success");
            setMessage("Registration successful! Redirecting to home page...");

            // Clear form
            setEmail("");
            setUsername("");
            setPassword("");
            setProfilePreview(null);
            setProfileFile(null);

            // Redirect to home page after a short delay
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } catch (error) {
            setMessageType("error");
            setMessage(error.message || 'Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-lightbg dark:bg-darkbg px-4">
            <div className="bg-white dark:bg-darkbg rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-gray-200 dark:border-gray-700">
                {/* Form */}
                <h1 className="text-3xl font-bold text-center pt-5 mb-6 text-lighttext dark:text-darktext">Register</h1>
                {/* Message Display */}
                {message && (
                    <div className={`mx-8 mb-4 p-3 rounded-lg text-sm ${messageType === "success"
                        ? "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-600"
                        : "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-600"
                        }`}>
                        {message}
                    </div>
                )}
                <form className="px-8 pb-8 pt-8" onSubmit={handleSubmit}>
                    <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Profile Image</label>
                    <div className="flex justify-center mb-4">
                        <div
                            className="w-24 h-24 rounded-full bg-gray-100 dark:bg-darkbg border-2 border-lightaccent dark:border-darkaccent flex items-center justify-center overflow-hidden cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                            title="Click to upload image"
                        >
                            {profilePreview ? (
                                <img src={profilePreview} alt="Profile Preview" className="w-full h-full object-cover" />
                            ) : (
                                <svg className="w-10 h-10 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12A4 4 0 118 12a4 4 0 018 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14v4m-2 2h4" />
                                </svg>
                            )}
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleImageChange}
                            />
                        </div>
                    </div>
                    <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Email</label>
                    <input
                        type="email"
                        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Enter your email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                    />
                    <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Username</label>
                    <input
                        type="text"
                        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Choose a username"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                    />
                    <label className="block mb-2 font-medium text-lighttext dark:text-darktext">Password</label>
                    <input
                        type="password"
                        className="w-full px-4 py-2 mb-4 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent bg-white dark:bg-darkbg text-lighttext dark:text-darktext placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Create a password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-lightaccent dark:bg-darkaccent text-white py-2 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition shadow mt-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!email || !username || !password || isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
            </div>
        </div>
    );
} 