import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCamera, FaSave, FaEye, FaEyeSlash } from "react-icons/fa";
import { getCurrentUser } from "../utils/auth";

export default function AdminAccount() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    // Form states
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPasswords, setShowPasswords] = useState(false);

    // Profile image
    const [profileImage, setProfileImage] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const userData = await getCurrentUser();
            if (userData) {
                setUser(userData);
                setUsername(userData.username || "");
                setEmail(userData.email || "");
                setProfilePreview(userData.profileImage || null);
            }
        } catch (error) {
            console.error("Failed to fetch user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        // Check if any changes were made
        const hasChanges = username !== user?.username || profileImage !== null;
        if (!hasChanges) {
            setMessage({ text: "No changes to save", type: "info" });
            setSaving(false);
            return;
        }

        try {
            const formData = new FormData();
            formData.append("username", username);
            if (profileImage) {
                formData.append("profileImage", profileImage);
            }

            const res = await fetch("/api/user/update/me", {
                method: "PUT",
                credentials: "include",
                body: formData
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ text: "Profile updated successfully!", type: "success" });
                setProfileImage(null);
                // Update local user data
                setUser(data.user);
                setProfilePreview(data.user.profileImage);
            } else {
                setMessage({ text: data.message || "Failed to update profile", type: "error" });
            }
        } catch (error) {
            console.error("Profile update error:", error);
            setMessage({ text: "Failed to update profile", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setSaving(true);
        setMessage({ text: "", type: "" });

        if (newPassword !== confirmPassword) {
            setMessage({ text: "New passwords do not match", type: "error" });
            setSaving(false);
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ text: "Password must be at least 6 characters long", type: "error" });
            setSaving(false);
            return;
        }

        if (!currentPassword) {
            setMessage({ text: "Current password is required", type: "error" });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/user/change-password", {
                method: "PUT",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await res.json();
            if (data.success) {
                setMessage({ text: "Password changed successfully!", type: "success" });
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                setMessage({ text: data.message || "Failed to change password", type: "error" });
            }
        } catch (error) {
            console.error("Password change error:", error);
            setMessage({ text: "Failed to change password", type: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightaccent dark:border-darkaccent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-lighttext dark:text-darktext mb-2">
                    My Account
                </h2>
                <p className="text-lightsecondary dark:text-darksecondary">
                    Manage your profile information and account settings.
                </p>
            </div>

            {/* Message */}
            {message.text && (
                <div className={`p-4 rounded-lg ${message.type === "success"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300"
                        : message.type === "error"
                        ? "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"
                        : "bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300"
                    }`}>
                    {message.text}
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Profile Information */}
                <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-6 flex items-center">
                        <FaUser className="w-5 h-5 mr-2" />
                        Profile Information
                    </h3>

                    <form onSubmit={handleProfileUpdate} className="space-y-6">
                        {/* Profile Image */}
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <img
                                    src={profilePreview || "/default-avatar.png"}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-600"
                                />
                                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer hover:bg-blue-600 transition-colors">
                                    <FaCamera className="w-3 h-3" />
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleProfileImageChange}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <div>
                                <p className="text-sm text-lightsecondary dark:text-darksecondary">
                                    Click the camera icon to change your profile picture
                                </p>
                            </div>
                        </div>

                        {/* Username */}
                        <div>
                            <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type="email"
                                    value={email}
                                    readOnly
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-xs text-lightsecondary dark:text-darksecondary mt-1">
                                Email cannot be changed for security reasons
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors"
                        >
                            <FaSave className="w-4 h-4" />
                            <span>{saving ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </form>
                </div>

                {/* Change Password */}
                <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-6 flex items-center">
                        <FaLock className="w-5 h-5 mr-2" />
                        Change Password
                    </h3>

                    <form onSubmit={handlePasswordChange} className="space-y-6">
                        {/* Current Password */}
                        <div>
                            <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                Current Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="pl-10 pr-10 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPasswords(!showPasswords)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPasswords ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                New Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                Confirm New Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                <input
                                    type={showPasswords ? "text" : "password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full flex items-center justify-center space-x-2 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:bg-green-400 transition-colors"
                        >
                            <FaLock className="w-4 h-4" />
                            <span>{saving ? "Changing..." : "Change Password"}</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Account Info */}
            <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-4">
                    Account Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-lightsecondary dark:text-darksecondary">Role</p>
                        <p className="text-lighttext dark:text-darktext font-medium">{user?.role}</p>
                    </div>
                    <div>
                        <p className="text-sm text-lightsecondary dark:text-darksecondary">Member Since</p>
                        <p className="text-lighttext dark:text-darktext font-medium">
                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
} 