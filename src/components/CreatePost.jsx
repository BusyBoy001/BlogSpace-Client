import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Image from '@editorjs/image';
import { getCurrentUser } from "../utils/auth";

export default function CreatePost() {
    const [title, setTitle] = useState("");
    const [editorData, setEditorData] = useState(null);
    const [category, setCategory] = useState("all");
    const [featuredImage, setFeaturedImage] = useState(null);
    const [featuredImagePreview, setFeaturedImagePreview] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const fileInputRef = useRef();
    const editorRef = useRef();
    const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
    const [isAdminUser, setIsAdminUser] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editPostId, setEditPostId] = useState(null);
    const [isLoadingPost, setIsLoadingPost] = useState(false);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Check admin status on mount
    useEffect(() => {
        const checkAdmin = async () => {
            const user = await getCurrentUser();
            if (user && user.role === "admin") {
                setIsAdminUser(true);
            }
            setIsCheckingAdmin(false);
        };
        checkAdmin();
    }, [navigate]);

    // Check if we're editing a post and load post data
    useEffect(() => {
        const editId = searchParams.get('edit');
        if (editId && !isCheckingAdmin && isAdminUser) {
            setIsEditing(true);
            setEditPostId(editId);
            loadPostForEditing(editId);
        }
    }, [searchParams, isCheckingAdmin, isAdminUser]);

    const loadPostForEditing = async (postId) => {
        setIsLoadingPost(true);
        try {
            const response = await fetch(`/api/posts/${postId}`, {
                credentials: 'include'
            });
            const data = await response.json();

            if (data.success && data.blog) {
                const post = data.blog;


                setTitle(post.title);
                setCategory(post.category);


                setEditorData(post.content);

                if (post.featuredImage) {
                    setFeaturedImagePreview(post.featuredImage);
                }
            } else {
                setMessageType("error");
                setMessage("Failed to load post for editing");
            }
        } catch (error) {
            console.error("Error loading post for editing:", error);
            setMessageType("error");
            setMessage("Failed to load post for editing");
        } finally {
            setIsLoadingPost(false);
        }
    };

    // Initialize Editor.js only if admin check is done and user is admin
    useLayoutEffect(() => {
        if (!isCheckingAdmin && isAdminUser && !editorRef.current) {

            const initEditor = async () => {
                try {
                    const editorConfig = {
                        holder: 'editorjs',
                        tools: {
                            header: {
                                class: Header,
                                config: {
                                    placeholder: 'Enter a header',
                                    levels: [1, 2, 3],
                                    defaultLevel: 2
                                }
                            },
                            list: {
                                class: List,
                                inlineToolbar: true
                            },
                            image: {
                                class: Image,
                                config: {
                                    uploader: {
                                        uploadByFile: imageUploadHandler
                                    }
                                }
                            }
                        },
                        placeholder: 'Start writing your post...',
                        onChange: async () => {
                            try {
                                if (editorRef.current) {
                                    const data = await editorRef.current.save();
                                    setEditorData(data);
                                }
                            } catch (err) {
                                console.error('Error saving editor data:', err);
                            }
                        }
                    };

                    // Don't set data during initialization - we'll load it separately



                    editorRef.current = new EditorJS(editorConfig);
                } catch (err) {
                    console.error('Error initializing editor:', err);
                }
            };
            initEditor();
        }
        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    editorRef.current.destroy();
                } catch (err) {
                    console.error('Error destroying editor:', err);
                }
                editorRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isCheckingAdmin, isAdminUser]); // Only reinitialize when admin status changes

        // Handle loading editor data when editing (separate from initialization)
    useEffect(() => {
        if (isEditing && editorData && editorRef.current) {
            // Load the data into the existing editor instance
            editorRef.current.render(editorData).catch(err => {
                console.error('Error rendering editor data:', err);
            });
        }
    }, [isEditing, editorData]);

    





    // Redirect non-admins after admin check
    useEffect(() => {
        if (!isCheckingAdmin && !isAdminUser) {
            navigate("/", { replace: true });
        }
    }, [isCheckingAdmin, isAdminUser, navigate]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFeaturedImagePreview(reader.result);
                setFeaturedImage(file);
            };
            reader.readAsDataURL(file);
        } else {
            setFeaturedImagePreview(null);
            setFeaturedImage(null);
        }
    };

    // Custom image upload handler for Editor.js
    const imageUploadHandler = async (file) => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch('/api/posts/upload-image', {
                method: 'POST',
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            if (data.success && data.file?.url) {
                return {
                    success: 1,
                    file: {
                        url: data.file.url
                    }
                };
            } else {
                throw new Error('Image upload failed');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            return {
                success: 0,
                message: 'Image upload failed'
            };
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage("");

        try {
            // Get the editor data
            const editorData = await editorRef.current.save();

            // Debug: Log the editor data structure
            console.log('🔍 CreatePost: Editor data structure:', {
                hasData: !!editorData,
                hasBlocks: !!editorData?.blocks,
                blocksLength: editorData?.blocks?.length,
                dataType: typeof editorData,
                contentPreview: editorData ? JSON.stringify(editorData).substring(0, 200) + '...' : 'no data'
            });

            const formData = new FormData();
            formData.append('title', title);
            formData.append('content', JSON.stringify(editorData)); // Send as JSON string
            formData.append('category', category);

            if (featuredImage) {
                formData.append('featuredImage', featuredImage);
            }

            // Debug: Log what we're sending
            console.log('🔍 CreatePost: Sending data:', {
                title,
                category,
                contentLength: JSON.stringify(editorData).length,
                hasFeaturedImage: !!featuredImage
            });

            const url = isEditing
                ? `/api/posts/${editPostId}`
                : '/api/posts/create';

            const method = isEditing ? 'PUT' : 'POST';

            console.log('🔍 CreatePost: Making request to:', url, 'with method:', method);

            const response = await fetch(url, {
                method: method,
                credentials: 'include',
                body: formData
            });

            const data = await response.json();

            console.log('🔍 CreatePost: Response status:', response.status);
            console.log('🔍 CreatePost: Response data:', data);

            if (response.ok) {
                setMessageType("success");
                setMessage(isEditing ? "Post updated successfully! Redirecting..." : "Post created successfully! Redirecting...");
                setTimeout(() => {
                    navigate(`/blog/${data.post._id}`);
                }, 2000);
            } else {
                setMessageType("error");
                setMessage(data.message || (isEditing ? 'Failed to update post' : 'Failed to create post'));
            }
        } catch (error) {
            console.error('🔍 CreatePost: Submit error:', error);
            setMessageType("error");
            setMessage('Network error. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    if (isCheckingAdmin || isLoadingPost) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">
                        {isLoadingPost ? "Loading post for editing..." : "Loading..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lightbg dark:bg-darkbg">
            {/* Header */}
            <div className="bg-white dark:bg-darkbg border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => navigate('/')}
                                className="flex items-center space-x-2 text-lightsecondary dark:text-darksecondary hover:text-lightaccent dark:hover:text-darkaccent transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                <span className="font-medium">Back to Home</span>
                            </button>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                type="button"
                                onClick={() => navigate('/')}
                                className="px-4 py-2 text-lightsecondary dark:text-darksecondary font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={!title || !editorData || isLoading}
                                className="px-6 py-2 bg-lightaccent dark:bg-darkaccent text-white font-medium rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Publishing...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                        </svg>
                                        <span>{isEditing ? "Update Post" : "Publish Post"}</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Display */}
            {message && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
                    <div className={`p-4 rounded-lg border ${messageType === "success"
                        ? "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-600"
                        : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-600"
                        }`}>
                        {message}
                    </div>
                </div>
            )}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Sidebar - Left Side */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                            <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-6">Post Settings</h3>

                            {/* Category Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                    Category
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent focus:border-lightaccent dark:focus:border-darkaccent text-lighttext dark:text-darktext bg-white dark:bg-darkbg"
                                >
                                    <option value="all">All</option>
                                    <option value="entertainment">Entertainment</option>
                                    <option value="other">Others</option>
                                    <option value="plan">Plan</option>
                                </select>
                            </div>

                            {/* Featured Image */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                    Featured Image
                                </label>
                                <div
                                    className="w-full h-48 bg-gray-50 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-lightaccent dark:hover:border-darkaccent transition-colors"
                                    onClick={() => fileInputRef.current.click()}
                                >
                                    {featuredImagePreview ? (
                                        <img
                                            src={featuredImagePreview}
                                            alt="Preview"
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="text-center">
                                            <svg className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                            </svg>
                                            <p className="text-sm text-lightsecondary dark:text-darksecondary font-medium">Click to upload featured image</p>
                                            <p className="text-xs text-lightsecondary dark:text-darksecondary mt-1">Recommended: 1200x630px</p>
                                        </div>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleImageChange}
                                />
                            </div>

                            {/* Status */}
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                                <h4 className="text-sm font-medium text-lighttext dark:text-darktext mb-3">Post Status</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lightsecondary dark:text-darksecondary">Title</span>
                                        <span className={title ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                                            {title ? "✓ Complete" : "✗ Required"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lightsecondary dark:text-darksecondary">Content</span>
                                        <span className={editorData ? "text-green-600 dark:text-green-400" : "text-red-500 dark:text-red-400"}>
                                            {editorData ? "✓ Complete" : "✗ Required"}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-lightsecondary dark:text-darksecondary">Category</span>
                                        <span className="text-green-600 dark:text-green-400">✓ Complete</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Content Area - Right Side */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            {/* Title Input */}
                            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                                <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                    Post Title
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent focus:border-lightaccent dark:focus:border-darkaccent text-2xl font-bold text-lighttext dark:text-darktext placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-darkbg"
                                    placeholder="Enter your post title..."
                                    required
                                />
                            </div>

                            {/* Editor Container */}
                            <div className="p-6">
                                <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                    Post Content
                                </label>
                                <div className="border border-gray-300 dark:border-gray-600 rounded-lg">
                                    <div
                                        id="editorjs"
                                        className="p-6 min-h-[500px] text-lighttext dark:text-darktext bg-white dark:bg-darkbg"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
} 