import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaEye, FaUser, FaCalendar, FaNewspaper } from "react-icons/fa";
import { Link } from "react-router-dom";
import { getCurrentUser, isMainAdmin } from "../utils/auth";

export default function AdminPosts() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedPost, setSelectedPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "delete"
    const [actionLoading, setActionLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchPosts();
        // Get current user to check admin level
        getCurrentUser().then(user => {
            setCurrentUser(user);
        });
    }, []);

    const fetchPosts = async () => {
        try {
            const res = await fetch("/api/posts", { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setPosts(data.blogs);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(search.toLowerCase()) ||
        post.category.toLowerCase().includes(search.toLowerCase()) ||
        (post.author && post.author.username && post.author.username.toLowerCase().includes(search.toLowerCase()))
    );

    const handleDelete = async (postId) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/posts/${postId}`, {
                method: "DELETE",
                credentials: "include"
            });

            const data = await res.json();
            if (data.success) {
                await fetchPosts(); // Refresh the list
                setShowModal(false);
                setSelectedPost(null);
            } else {
                alert(data.message || "Failed to delete post");
            }
        } catch (error) {
            alert("Failed to delete post");
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (type, post) => {
        setModalType(type);
        setSelectedPost(post);
        setShowModal(true);
    };

    const getExcerpt = (content) => {
        if (!content?.blocks) return "";
        const para = content.blocks.find(block => block.type === "paragraph");
        return para ? para.data.text.slice(0, 100) + "..." : "";
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
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
                    Post Management
                </h2>
                <p className="text-lightsecondary dark:text-darksecondary">
                    Manage all blog posts, edit content, and moderate submissions.
                </p>
            </div>

            {/* Junior Admin Notice */}
            {currentUser && !isMainAdmin(currentUser) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Junior Admin Notice:</strong>
                    <span className="block sm:inline"> You can view and edit posts, but only the main admin can delete posts.</span>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search posts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                    />
                </div>
                <span className="text-sm text-lightsecondary dark:text-darksecondary">
                    {filteredPosts.length} posts found
                </span>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPosts.map((post) => (
                    <div key={post._id} className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow">
                        {/* Post Image */}
                        {post.featuredImage && (
                            <div className="relative h-48 overflow-hidden">
                                <img
                                    src={post.featuredImage}
                                    alt={post.title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2">
                                    <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Post Content */}
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-2 line-clamp-2">
                                {post.title}
                            </h3>

                            <p className="text-sm text-lightsecondary dark:text-darksecondary mb-4 line-clamp-3">
                                {getExcerpt(post.content)}
                            </p>

                            {/* Post Meta */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center text-xs text-lightsecondary dark:text-darksecondary">
                                    <FaUser className="w-3 h-3 mr-1" />
                                    <span>{post.author?.username || "Unknown"}</span>
                                </div>
                                <div className="flex items-center text-xs text-lightsecondary dark:text-darksecondary">
                                    <FaCalendar className="w-3 h-3 mr-1" />
                                    <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center text-xs text-lightsecondary dark:text-darksecondary">
                                    <FaNewspaper className="w-3 h-3 mr-1" />
                                    <span>{post.likes?.length || 0} likes</span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex items-center space-x-2">
                                    <Link
                                        to={`/blog/${post._id}`}
                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                        title="View Post"
                                    >
                                        <FaEye className="w-4 h-4" />
                                    </Link>
                                    <Link
                                        to={`/create-post?edit=${post._id}`}
                                        className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                        title="Edit Post"
                                    >
                                        <FaEdit className="w-4 h-4" />
                                    </Link>
                                    {isMainAdmin(currentUser) && (
                                        <button
                                            onClick={() => openModal("delete", post)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                            title="Delete Post (Main Admin Only)"
                                        >
                                            <FaTrash className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredPosts.length === 0 && !loading && (
                <div className="text-center py-12">
                    <FaNewspaper className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-2">
                        No posts found
                    </h3>
                    <p className="text-lightsecondary dark:text-darksecondary">
                        {search ? "Try adjusting your search terms." : "No posts have been created yet."}
                    </p>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showModal && selectedPost && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-darkbg rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-4">
                            Delete Post
                        </h3>

                        <div className="mb-4">
                            <p className="text-lightsecondary dark:text-darksecondary">
                                Are you sure you want to delete "{selectedPost.title}"? This action cannot be undone.
                            </p>
                        </div>

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(selectedPost._id)}
                                disabled={actionLoading}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-400 rounded-lg transition-colors"
                            >
                                {actionLoading ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 