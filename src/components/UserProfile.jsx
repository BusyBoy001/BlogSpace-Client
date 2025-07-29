import React, { useEffect, useState } from "react";
import { getCurrentUser, logout } from "../utils/auth";
import { useNavigate, useParams } from "react-router-dom";
import { FaEnvelope, FaUserShield, FaCalendarAlt, FaSignOutAlt, FaTrash } from "react-icons/fa";

export default function UserProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const { userId } = useParams();

    useEffect(() => {
        setUser(null);
        setLoading(true);
        setError("");
        if (userId) {
            // Viewing another user's public profile
            fetch(`/api/user/profile/${userId}`, {
                credentials: "include",
            })
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setUser(data.user);
                    } else {
                        setError(data.message || "Failed to load user info");
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError("Failed to load user info");
                    setLoading(false);
                });
        } else {
            // Viewing own profile
            getCurrentUser()
                .then((u) => {
                    if (!u) {
                        navigate("/login", { replace: true });
                    } else {
                        setUser(u);
                    }
                    setLoading(false);
                })
                .catch(() => {
                    setError("Failed to load user info");
                    setLoading(false);
                });
        }
    }, [navigate, userId]);

    const handleLogout = async () => {
        await logout();
        navigate("/login", { replace: true });
    };

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading profile...</p>
                </div>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        <p className="text-lg">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );

    if (!user) return null;

    return (
        <div className="min-h-screen bg-lightbg dark:bg-darkbg py-8">
            <div className="max-w-2xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Profile Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8 text-white">
                        <div className="flex items-center space-x-6">
                            <div className="flex-shrink-0">
                                <img
                                    src={
                                        user.profileImage ||
                                        `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=2563eb&color=fff&size=120`
                                    }
                                    alt={user.username}
                                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
                                <div className="flex items-center space-x-4">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white bg-opacity-20 text-white">
                                        {user.role}
                                    </span>
                                    <span className="text-blue-100 text-sm">
                                        Member since {new Date(user.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details */}
                    <div className="px-6 py-6">
                        <div className="space-y-4">
                            {!userId && user.email && (
                                <div className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                    <div className="flex-shrink-0 w-8">
                                        <FaEnvelope className="text-gray-400 dark:text-gray-500 text-lg" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm font-medium text-lightsecondary dark:text-darksecondary">Email Address</p>
                                        <p className="text-lighttext dark:text-darktext">{user.email}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex-shrink-0 w-8">
                                    <FaUserShield className="text-gray-400 dark:text-gray-500 text-lg" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-lightsecondary dark:text-darksecondary">Account Type</p>
                                    <p className="text-lighttext dark:text-darktext capitalize">{user.role}</p>
                                </div>
                            </div>

                            <div className="flex items-center py-3 border-b border-gray-100 dark:border-gray-700">
                                <div className="flex-shrink-0 w-8">
                                    <FaCalendarAlt className="text-gray-400 dark:text-gray-500 text-lg" />
                                </div>
                                <div className="ml-4 flex-1">
                                    <p className="text-sm font-medium text-lightsecondary dark:text-darksecondary">Joined</p>
                                    <p className="text-lighttext dark:text-darktext">
                                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        {!userId && (
                            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex flex-col space-y-3">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-600 text-white rounded-md font-medium hover:bg-gray-700 transition-colors duration-200"
                                    >
                                        <FaSignOutAlt className="text-sm" />
                                        <span>Sign Out</span>
                                    </button>

                                    <div className="w-full px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-600 rounded-md">
                                        <div className="flex items-center justify-center space-x-2 text-yellow-800 dark:text-yellow-200">
                                                <FaUserShield className="text-sm" />
                                            <span className="text-sm font-medium">Account deletion is temporarily disabled</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Info */}
                <div className="mt-6 text-center">
                    <p className="text-lightsecondary dark:text-darksecondary text-sm">
                        {userId ? `Viewing ${user.username}'s public profile` : 'Your account information'}
                    </p>
                </div>
            </div>
        </div>
    );
}
