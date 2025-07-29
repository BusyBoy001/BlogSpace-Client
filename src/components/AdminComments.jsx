import React, { useState, useEffect } from "react";
import { FaSearch, FaTrash, FaUser, FaCalendar, FaComments } from "react-icons/fa";
import { getCurrentUser, isMainAdmin } from "../utils/auth";

export default function AdminComments() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchComments();
        // Get current user to check admin level
        getCurrentUser().then(user => {
            setCurrentUser(user);
        });
    }, []);

    const fetchComments = async () => {
        try {
            const res = await fetch("/api/user/comments", { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error("Failed to fetch comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredComments = comments.filter(comment =>
        comment.text.toLowerCase().includes(search.toLowerCase()) ||
        (comment.username && comment.username.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async (commentId) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;

        try {
            const res = await fetch(`/api/comments/${commentId}`, {
                method: "DELETE",
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                await fetchComments(); // Refresh the list
            } else {
                alert(data.message || "Failed to delete comment");
            }
        } catch (error) {
            alert("Failed to delete comment");
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-lighttext dark:text-darktext mb-2">
                    Comment Management
                </h2>
                <p className="text-lightsecondary dark:text-darksecondary">
                    Manage and moderate user comments across all blog posts.
                </p>
            </div>

            {/* Junior Admin Notice */}
            {currentUser && !isMainAdmin(currentUser) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Junior Admin Notice:</strong>
                    <span className="block sm:inline"> You can view all comments, but only the main admin can delete comments.</span>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search comments..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                    />
                </div>
                <span className="text-sm text-lightsecondary dark:text-darksecondary">
                    {filteredComments.length} comments found
                </span>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                {filteredComments.map((comment) => (
                    <div key={comment._id} className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                    <FaUser className="w-4 h-4 text-gray-400" />
                                    <span className="font-medium text-lighttext dark:text-darktext">
                                        {comment.username || "Unknown User"}
                                    </span>
                                    <FaCalendar className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-lightsecondary dark:text-darksecondary">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-lighttext dark:text-darktext mb-2">
                                    {comment.text}
                                </p>
                                <div className="flex items-center space-x-4 text-sm text-lightsecondary dark:text-darksecondary">
                                    <span>Post: {comment.postTitle || "Unknown Post"}</span>
                                    <span>{comment.likes?.length || 0} likes</span>
                                    <span>{comment.dislikes?.length || 0} dislikes</span>
                                </div>
                            </div>
                            {isMainAdmin(currentUser) && (
                                <button
                                    onClick={() => handleDelete(comment._id)}
                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 ml-4"
                                    title="Delete Comment (Main Admin Only)"
                                >
                                    <FaTrash className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredComments.length === 0 && !loading && (
                <div className="text-center py-12">
                    <FaComments className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-2">
                        No comments found
                    </h3>
                    <p className="text-lightsecondary dark:text-darksecondary">
                        {search ? "Try adjusting your search terms." : "No comments have been posted yet."}
                    </p>
                </div>
            )}
        </div>
    );
} 