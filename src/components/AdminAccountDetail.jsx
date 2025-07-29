import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaEnvelope, FaUserShield, FaCalendarAlt, FaArrowLeft, FaBan, FaTrash } from "react-icons/fa";

export default function AdminAccountDetail() {
    const { id } = useParams();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const [actionLoading, setActionLoading] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError("");
        fetch(`/api/user/admin/account/${id}`, {
            credentials: "include",
        })
            .then((res) => res.json())
            .then((data) => {
                if (data.success) {
                    setUser(data.user);
                } else {
                    setError(data.message || "Failed to load user");
                }
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load user");
                setLoading(false);
            });
    }, [id]);

    // Block/Unblock handler
    const handleBlockToggle = async () => {
        setActionLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/user/admin/account/${id}/block`, {
                method: "PUT",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                setUser(data.user);
            } else {
                setError(data.message || "Failed to update user");
            }
        } catch {
            setError("Failed to update user");
        }
        setActionLoading(false);
    };

    // Delete handler
    const handleDelete = async () => {
        setActionLoading(true);
        setError("");
        try {
            const res = await fetch(`/api/user/admin/account/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json();
            if (data.success) {
                navigate("/admin/accounts");
            } else {
                setError(data.message || "Failed to delete user");
            }
        } catch {
            setError("Failed to delete user");
        }
        setActionLoading(false);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center py-10 px-2">
            <div className="w-full max-w-md bg-white dark:bg-darkbg rounded-2xl shadow-2xl p-8 flex flex-col items-center relative">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-4 text-gray-400 dark:text-gray-500 hover:text-lightaccent dark:hover:text-darkaccent text-lg"
                    title="Back"
                >
                    <FaArrowLeft />
                </button>
                {loading ? (
                    <div className="w-full flex flex-col items-center animate-pulse">
                        <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 mb-4" />
                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    </div>
                ) : error ? (
                    <div className="text-red-500 text-center py-8">{error}</div>
                ) : user ? (
                    <>
                        <img
                            src={
                                user.profileImage ||
                                `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}`
                            }
                            alt={user.username}
                            className="w-24 h-24 rounded-full object-cover border-4 border-indigo-400 shadow-lg mb-4"
                        />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1 flex items-center gap-2">
                            {user.username}
                            {user.blocked && (
                                <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200 text-xs flex items-center gap-1">
                                    <FaBan /> Blocked
                                </span>
                            )}
                        </h2>
                        <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize mb-4 ${user.role === "admin" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}>
                            {user.role}
                        </span>
                        <div className="w-full divide-y divide-indigo-100 dark:divide-gray-700 mb-6">
                            <div className="flex items-center gap-3 py-3">
                                <FaEnvelope className="text-indigo-500 text-lg" />
                                <span className="text-gray-700 dark:text-gray-200 text-base">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 py-3">
                                <FaUserShield className="text-indigo-500 text-lg" />
                                <span className="text-gray-700 dark:text-gray-200 text-base capitalize">{user.role}</span>
                            </div>
                            <div className="flex items-center gap-3 py-3">
                                <FaCalendarAlt className="text-indigo-500 text-lg" />
                                <span className="text-gray-700 dark:text-gray-200 text-base">
                                    Joined on {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full mt-2">
                            <button
                                onClick={handleBlockToggle}
                                disabled={actionLoading}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold transition-all duration-200 shadow-md ${user.blocked ? "bg-green-600 hover:bg-green-700 text-white" : "bg-red-600 hover:bg-red-700 text-white"}`}
                            >
                                <FaBan /> {user.blocked ? "Unblock" : "Block"}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(true)}
                                disabled={actionLoading}
                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold bg-gray-200 hover:bg-red-600 hover:text-white text-gray-700 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-red-700 dark:hover:text-white transition-all duration-200 shadow-md"
                            >
                                <FaTrash /> Delete
                            </button>
                        </div>
                        {/* Delete confirmation dialog */}
                        {deleteConfirm && (
                            <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 w-full max-w-xs flex flex-col items-center">
                                    <p className="text-lg font-semibold mb-4 text-center">Are you sure you want to delete this user?</p>
                                    <div className="flex gap-4 w-full">
                                        <button
                                            onClick={handleDelete}
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-2 rounded-md bg-red-600 text-white font-bold hover:bg-red-700 transition-all"
                                        >
                                            Yes, Delete
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(false)}
                                            disabled={actionLoading}
                                            className="flex-1 px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
} 