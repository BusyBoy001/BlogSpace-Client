import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { FaThumbsUp, FaThumbsDown, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost, apiDelete } from "../utils/api";

export default function CommentSection({ blogId }) {
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [posting, setPosting] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchComments();
        getCurrentUser().then(setUser);
        // eslint-disable-next-line
    }, [blogId]);

    const fetchComments = async () => {
        setLoading(true);
        setError("");
        try {
            const data = await apiGet(`/comments/${blogId}`);
            if (data.success) {
                setComments(data.comments);
            } else {
                setError("Failed to load comments");
            }
        } catch {
            setError("Failed to load comments");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        setPosting(true);
        try {
            const data = await apiPost(`/comments/${blogId}`, { text: commentText });
            if (data.success) {
                setCommentText("");
                fetchComments();
            } else {
                setError(data.message || "Failed to post comment");
            }
        } catch {
            setError("Failed to post comment");
        } finally {
            setPosting(false);
        }
    };

    const handleLike = async (commentId) => {
        if (!user) return;
        await apiPost(`/comments/${commentId}/like`);
        fetchComments();
    };
    const handleDislike = async (commentId) => {
        if (!user) return;
        await apiPost(`/comments/${commentId}/dislike`);
        fetchComments();
    };
    const handleDelete = async (commentId) => {
        if (!user) return;
        if (!window.confirm("Delete this comment?")) return;
        await apiDelete(`/comments/${commentId}`);
        fetchComments();
    };

    const maxLength = 100;

    return (
        <div className="mt-8 max-w-xl">
            <h2 className="text-lg font-bold mb-3 text-lighttext dark:text-darktext">Comments</h2>
            {user ? (
                <form onSubmit={handleSubmit} className="mb-4 flex flex-col gap-2">
                    <textarea
                        className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-darkbg text-lighttext dark:text-darktext text-sm resize-none"
                        rows={2}
                        placeholder="Write a comment (max 100 characters)..."
                        value={commentText}
                        onChange={e => {
                            if (e.target.value.length <= maxLength) setCommentText(e.target.value);
                        }}
                        maxLength={maxLength}
                        disabled={posting}
                    />
                    <div className="flex justify-between items-center">
                        <span className="text-xs text-lightsecondary dark:text-darksecondary">{commentText.length}/{maxLength}</span>
                        <button
                            type="submit"
                            className="px-4 py-1 bg-lightaccent dark:bg-darkaccent text-white rounded font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                            disabled={posting || !commentText.trim()}
                        >
                            {posting ? "Posting..." : "Post Comment"}
                        </button>
                    </div>
                </form>
            ) : (
                <div className="mb-4 text-lightsecondary dark:text-darksecondary text-sm">Log in to post a comment.</div>
            )}
            {loading ? (
                <div className="text-lightsecondary dark:text-darksecondary text-sm">Loading comments...</div>
            ) : error ? (
                <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>
            ) : comments.length === 0 ? (
                <div className="text-lightsecondary dark:text-darksecondary text-sm">No comments yet. Be the first to comment!</div>
            ) : (
                <ul className="space-y-4">
                    {comments.map(comment => (
                        <li key={comment._id} className="flex gap-2 items-start text-sm">
                            <div className="relative w-8 h-8">
                                <img
                                    src={comment.profileImage || "https://ui-avatars.com/api/?name=" + encodeURIComponent(comment.username)}
                                    alt={comment.username}
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200 dark:border-gray-600 cursor-pointer hover:ring-2 hover:ring-lightaccent dark:hover:ring-darkaccent"
                                    onClick={() => navigate(`/profile/${comment.userId._id || comment.userId.toString()}`)}
                                    title={`View ${comment.username}'s profile`}
                                />
                                {comment.blocked && (
                                    <span className="absolute bottom-0 right-0 w-2 h-2 bg-red-600 rounded-full border-2 border-white dark:border-darkbg" title="Blocked user"></span>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <button
                                        className="font-semibold text-lighttext dark:text-darktext text-sm hover:underline focus:outline-none"
                                        style={{ background: 'none', border: 'none', padding: 0, margin: 0, cursor: 'pointer' }}
                                        onClick={() => navigate(`/profile/${comment.userId._id || comment.userId.toString()}`)}
                                        title={`View ${comment.username}'s profile`}
                                    >
                                        {comment.username}
                                    </button>
                                    <div className="text-lightsecondary dark:text-darksecondary mb-1 text-xs">{new Date(comment.createdAt).toLocaleString()}</div>
                                    {(user && (user.role === "admin" || user._id === (comment.userId._id || comment.userId))) && (
                                        <button
                                            className="ml-2 text-red-500 hover:text-red-700"
                                            title="Delete comment"
                                            onClick={() => handleDelete(comment._id)}
                                        >
                                            <FaTrash size={12} />
                                        </button>
                                    )}
                                </div>
                                <div className="text-lighttext dark:text-darktext mb-1 break-words">{comment.text}</div>
                                <div className="flex items-center gap-2 text-xs">
                                    <button
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${user && comment.likes && comment.likes.includes(user._id) ? 'bg-green-200 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-800 text-lighttext dark:text-darktext'}`}
                                        onClick={() => handleLike(comment._id)}
                                        disabled={!user}
                                    >
                                        <FaThumbsUp size={12} /> {comment.likes ? comment.likes.length : 0}
                                    </button>
                                    <button
                                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${user && comment.dislikes && comment.dislikes.includes(user._id) ? 'bg-red-200 dark:bg-red-900 text-red-700 dark:text-red-300' : 'bg-gray-100 dark:bg-gray-800 text-lighttext dark:text-darktext'}`}
                                        onClick={() => handleDislike(comment._id)}
                                        disabled={!user}
                                    >
                                        <FaThumbsDown size={12} /> {comment.dislikes ? comment.dislikes.length : 0}
                                    </button>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
} 