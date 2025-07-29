import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BlogCard from "./BlogCard";
import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import ImageTool from '@editorjs/image';
import List from '@editorjs/list';
import { FaThumbsUp, FaThumbsDown } from 'react-icons/fa';
import CommentSection from "./CommentSection";
import { getCurrentUser } from "../utils/auth";

// Toast component for better alerts
function Toast({ message, type, onClose }) {
    if (!message) return null;
    return (
        <div className={`fixed bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 px-4 sm:px-6 py-3 sm:py-4 rounded-lg shadow-lg text-white text-sm sm:text-base font-medium transition-all duration-300 max-w-sm sm:max-w-md mx-4
            ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
            role="alert"
        >
            <div className="flex items-center gap-2 sm:gap-3">
                <span className="flex-1">{message}</span>
                <button onClick={onClose} className="ml-2 sm:ml-4 text-white/80 hover:text-white text-lg font-bold flex-shrink-0">&times;</button>
            </div>
        </div>
    );
}

export default function BlogReadPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [blog, setBlog] = useState(null);
    const [otherBlogs, setOtherBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const editorRef = useRef(null);
    const [likeCount, setLikeCount] = useState(0);
    const [dislikeCount, setDislikeCount] = useState(0);
    const [isAdmin, setIsAdmin] = useState(false);
    const [toast, setToast] = useState({ message: '', type: 'success' });
    const [editorLoaded, setEditorLoaded] = useState(false);

    // Suppress external script errors that are causing the ErrorBoundary to trigger
    useEffect(() => {
        const originalErrorHandler = window.onerror;
        const originalUnhandledRejectionHandler = window.onunhandledrejection;

        window.onerror = function (message, source, lineno, colno, error) {
            // Suppress errors from external scripts (interceptor.js, js.js, etc.)
            if (source && (source.includes('interceptor.js') || source.includes('js.js') || source.includes('content.js'))) {
                console.warn('🔇 Suppressed external script error:', message);
                return true; // Prevent error from bubbling up
            }

            // Log other errors normally
            console.error('🔍 BlogReadPage: Window error:', message, source, lineno, colno, error);

            // Call original handler if it exists
            if (originalErrorHandler) {
                return originalErrorHandler(message, source, lineno, colno, error);
            }
        };

        window.onunhandledrejection = function (event) {
            // Suppress unhandled rejections from external scripts
            if (event.reason && event.reason.toString().includes('widgetId')) {
                console.warn('🔇 Suppressed external script unhandled rejection:', event.reason);
                event.preventDefault();
                return;
            }

            // Log other rejections normally
            console.error('🔍 BlogReadPage: Unhandled rejection:', event.reason);

            // Call original handler if it exists
            if (originalUnhandledRejectionHandler) {
                originalUnhandledRejectionHandler(event);
            }
        };

        // Cleanup function
        return () => {
            window.onerror = originalErrorHandler;
            window.onunhandledrejection = originalUnhandledRejectionHandler;
        };
    }, []);

    useEffect(() => {
        console.log('🔍 BlogReadPage: Admin check effect running');
        getCurrentUser().then(user => {
            console.log('🔍 BlogReadPage: Current user:', user);
            setIsAdmin(user && user.role === "admin");
        }).catch(err => {
            console.error('🔍 BlogReadPage: Error getting current user:', err);
        });
    }, []);

    useEffect(() => {
        const fetchBlog = async () => {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/posts/${id}`);

                if (!res.ok) {
                    setError(`Failed to fetch blog: ${res.status} ${res.statusText}`);
                    return;
                }

                const data = await res.json();

                if (data.success && data.blog) {
                    setBlog(data.blog);
                } else {
                    setError("Blog not found");
                }
            } catch (fetchError) {
                console.error('🔍 BlogReadPage: Fetch error:', fetchError);
                setError("Failed to fetch blog");
            } finally {
                setLoading(false);
            }
        };
        fetchBlog();
    }, [id]);

    useEffect(() => {
        // Fetch other blogs for sidebar
        const fetchOtherBlogs = async () => {
            try {
                const res = await fetch("/api/posts");
                const data = await res.json();
                if (data.success && data.blogs) {
                    setOtherBlogs(data.blogs.filter(b => b._id !== id));
                }
            } catch (error) {
                console.error('🔍 BlogReadPage: Error fetching other blogs:', error);
            }
        };
        fetchOtherBlogs();
    }, [id]);

    useEffect(() => {
        console.log('🔍 BlogReadPage: EditorJS effect running, blog:', blog);

        // Clean up previous instance
        if (editorRef.current && typeof editorRef.current.destroy === 'function') {
            try {
                console.log('🔍 BlogReadPage: Destroying previous editor instance');
                editorRef.current.destroy();
            } catch (error) {
                console.error('🔍 BlogReadPage: Error destroying EditorJS:', error);
            }
            editorRef.current = null;
        }

        // Debug: Log the blog content structure
        if (blog) {
            console.log('🔍 BlogReadPage: Blog content structure:', blog.content);
            console.log('🔍 BlogReadPage: Blog content type:', typeof blog.content);
            console.log('🔍 BlogReadPage: Blog content blocks:', blog.content?.blocks);
        }

        // Render EditorJS content in read-only mode
        if (blog && blog.content) {
            console.log('🔍 BlogReadPage: Starting EditorJS initialization');
            // Reset editor loaded state
            setEditorLoaded(false);

            // Handle different content formats
            let contentData = blog.content;

            // If content is a string, try to parse it as JSON
            if (typeof blog.content === "string") {
                try {
                    console.log('🔍 BlogReadPage: Parsing content as JSON');
                    contentData = JSON.parse(blog.content);
                } catch (parseError) {
                    console.error('🔍 BlogReadPage: Failed to parse content as JSON:', parseError);
                    setError('Content format is invalid');
                    return;
                }
            }

            // Check if content has the expected structure
            if (!contentData || !contentData.blocks || !Array.isArray(contentData.blocks) || contentData.blocks.length === 0) {
                console.error('🔍 BlogReadPage: Content does not have expected structure:', contentData);
                setError('Content is not available in the expected format');
                return;
            }

            // Wrap EditorJS initialization in try-catch to prevent ErrorBoundary from catching
            const initEditor = async () => {
                try {
                    // Check if component is still mounted and blog hasn't changed
                    if (!blog || !blog.content) {
                        console.log('🔍 BlogReadPage: Blog changed during initialization, aborting');
                        return;
                    }

                    console.log('🔍 BlogReadPage: Creating new EditorJS instance');
                    editorRef.current = new EditorJS({
                        holder: 'editorjs-read',
                        data: contentData,
                        readOnly: true,
                        tools: {
                            header: {
                                class: Header,
                                config: {
                                    placeholder: 'Enter a header',
                                    levels: [1, 2, 3, 4, 5, 6],
                                    defaultLevel: 2
                                }
                            },
                            image: {
                                class: ImageTool,
                                config: {
                                    endpoints: {
                                        byFile: '/api/posts/upload-image',
                                        byUrl: '/api/posts/upload-image'
                                    }
                                }
                            },
                            list: {
                                class: List,
                                inlineToolbar: true,
                                config: {
                                    defaultStyle: 'unordered'
                                }
                            }
                        },
                        minHeight: 0,
                        placeholder: 'Start writing your blog...',
                        onReady: () => {
                            console.log('🔍 BlogReadPage: EditorJS is ready');
                            setEditorLoaded(true);
                            setError(''); // Clear any previous errors
                        },
                        onChange: () => {
                            // Read-only mode, no changes needed
                        }
                    });
                    console.log('🔍 BlogReadPage: EditorJS instance created successfully');
                } catch (error) {
                    console.error('🔍 BlogReadPage: Error initializing EditorJS:', error);
                    setError('Failed to load blog content properly');
                    setEditorLoaded(false);
                }
            };

            // Initialize editor
            initEditor();
        } else {
            console.log('🔍 BlogReadPage: No blog or content available for EditorJS');
        }
        return () => {
            if (editorRef.current && typeof editorRef.current.destroy === 'function') {
                try {
                    console.log('🔍 BlogReadPage: Cleaning up editor instance');
                    editorRef.current.destroy();
                } catch (error) {
                    console.error('🔍 BlogReadPage: Error destroying EditorJS:', error);
                }
                editorRef.current = null;
            }
        };
    }, [blog]);

    useEffect(() => {
        if (blog) {
            setLikeCount(blog.likes ? blog.likes.length : 0);
            setDislikeCount(blog.dislikes ? blog.dislikes.length : 0);
        }
    }, [blog]);

    const handleLike = async () => {
        try {
            const res = await fetch(`/api/posts/${id}/like`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                setLikeCount(data.likes);
                setDislikeCount(data.dislikes);
            } else {
                console.error('🔍 BlogReadPage: Like failed:', data.message);
                setToast({ message: data.message || "Failed to like post", type: "error" });
            }
        } catch (error) {
            console.error('🔍 BlogReadPage: Like error:', error);
            setToast({ message: "Network error. Please try again.", type: "error" });
        }
    };

    const handleDislike = async () => {
        try {
            const res = await fetch(`/api/posts/${id}/dislike`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await res.json();
            if (data.success) {
                setLikeCount(data.likes);
                setDislikeCount(data.dislikes);
            } else {
                console.error('🔍 BlogReadPage: Dislike failed:', data.message);
                setToast({ message: data.message || "Failed to dislike post", type: "error" });
            }
        } catch (error) {
            console.error('🔍 BlogReadPage: Dislike error:', error);
            setToast({ message: "Network error. Please try again.", type: "error" });
        }
    };



    // Fallback content renderer for when EditorJS fails
    const renderFallbackContent = (content) => {
        console.log('🔍 BlogReadPage: renderFallbackContent called with:', content);

        if (!content) {
            console.log('🔍 BlogReadPage: No content provided to fallback renderer');
            return null;
        }

        let contentData = content;
        if (typeof content === 'string') {
            try {
                console.log('🔍 BlogReadPage: Parsing string content as JSON');
                contentData = JSON.parse(content);
            } catch {
                console.log('🔍 BlogReadPage: Content is not JSON, treating as plain text');
                // If it's not JSON, treat it as plain text
                return <div className="whitespace-pre-wrap text-lighttext dark:text-darktext">{content}</div>;
            }
        }

        if (!contentData || !contentData.blocks || !Array.isArray(contentData.blocks)) {
            console.log('🔍 BlogReadPage: Content does not have expected blocks structure:', contentData);
            return <div className="text-lightsecondary dark:text-darksecondary italic">No content available</div>;
        }

        console.log('🔍 BlogReadPage: Rendering', contentData.blocks.length, 'blocks');

        return (
            <div className="space-y-4">
                {contentData.blocks.map((block, index) => {
                    try {
                        console.log('🔍 BlogReadPage: Rendering block', index, 'of type:', block.type);
                        switch (block.type) {
                            case 'paragraph':
                                return (
                                    <p key={index} className="text-lighttext dark:text-darktext leading-relaxed">
                                        {typeof block.data?.text === 'string' ? block.data.text : JSON.stringify(block.data?.text || '')}
                                    </p>
                                );
                            case 'header': {
                                const HeaderTag = `h${block.data?.level || 2}`;
                                return (
                                    <HeaderTag key={index} className="font-bold text-lighttext dark:text-darktext">
                                        {typeof block.data?.text === 'string' ? block.data.text : JSON.stringify(block.data?.text || '')}
                                    </HeaderTag>
                                );
                            }
                            case 'list': {
                                const ListTag = block.data?.style === 'ordered' ? 'ol' : 'ul';
                                return (
                                    <ListTag key={index} className="list-disc list-inside space-y-1">
                                        {block.data?.items?.map((item, itemIndex) => (
                                            <li key={itemIndex} className="text-lighttext dark:text-darktext">
                                                {typeof item === 'string' ? item : JSON.stringify(item)}
                                            </li>
                                        ))}
                                    </ListTag>
                                );
                            }
                            case 'image':
                                return (
                                    <div key={index} className="my-4">
                                        <img
                                            src={block.data?.file?.url || block.data?.url}
                                            alt={typeof block.data?.caption === 'string' ? block.data.caption : 'Blog image'}
                                            className="max-w-full h-auto rounded-lg"
                                            onError={(e) => {
                                                console.log('🔍 BlogReadPage: Image failed to load, hiding it');
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        {block.data?.caption && (
                                            <p className="text-sm text-lightsecondary dark:text-darksecondary mt-2 text-center">
                                                {typeof block.data.caption === 'string' ? block.data.caption : JSON.stringify(block.data.caption)}
                                            </p>
                                        )}
                                    </div>
                                );
                            default:
                                console.log('🔍 BlogReadPage: Unsupported block type:', block.type);
                                return (
                                    <div key={index} className="text-lightsecondary dark:text-darksecondary italic">
                                        Unsupported content type: {block.type}
                                    </div>
                                );
                        }
                    } catch (blockError) {
                        console.error('🔍 BlogReadPage: Error rendering block:', blockError, block);
                        return (
                            <div key={index} className="text-lightsecondary dark:text-darksecondary italic">
                                Error rendering content block
                            </div>
                        );
                    }
                })}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-lightaccent dark:border-darkaccent mx-auto mb-3 sm:mb-4"></div>
                    <p className="text-lightsecondary dark:text-darksecondary text-sm sm:text-lg">Loading blog...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                        <p className="text-sm sm:text-lg">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-lightaccent dark:bg-darkaccent text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!blog) return null;

    try {
        return (
            <>
                <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: toast.type })} />
                <div className="min-h-screen bg-lightbg dark:bg-darkbg py-4 sm:py-6 lg:py-8">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 sm:gap-8 lg:gap-12">
                            {/* Main Content */}
                            <main className="lg:col-span-7 order-2 lg:order-1">
                                <article className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                                    {blog.featuredImage && (
                                        <img
                                            src={blog.featuredImage}
                                            alt={blog.title}
                                            className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                    )}
                                    <div className="p-4 sm:p-6 lg:p-10">
                                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-lighttext dark:text-darktext mb-4 sm:mb-6 leading-tight">
                                            {blog.title}
                                        </h1>

                                        {/* Meta Information */}
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-6 sm:mb-8 pb-4 sm:pb-6 border-b border-gray-200 dark:border-gray-700">
                                            <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-lightaccent dark:text-darkaccent rounded-full text-sm font-medium">
                                                {blog.category}
                                            </span>
                                            <span className="text-lightsecondary dark:text-darksecondary text-xs sm:text-sm">
                                                {new Date(blog.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </span>
                                            {blog.author && blog.author.username && (
                                                <div className="flex items-center gap-2 text-lighttext dark:text-darktext font-medium">
                                                    {blog.author.profileImage && (
                                                        <img
                                                            src={blog.author.profileImage}
                                                            alt={blog.author.username}
                                                            className="w-6 h-6 rounded-full object-cover border border-gray-300 dark:border-gray-600"
                                                        />
                                                    )}
                                                    <span>{blog.author.username}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                            <button
                                                onClick={handleLike}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-green-100 text-green-700 rounded-lg font-medium hover:bg-green-200 transition-colors text-sm sm:text-base"
                                            >
                                                <FaThumbsUp className="text-sm" />
                                                <span>{likeCount}</span>
                                            </button>
                                            <button
                                                onClick={handleDislike}
                                                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-100 text-red-700 rounded-lg font-medium hover:bg-red-200 transition-colors text-sm sm:text-base"
                                            >
                                                <FaThumbsDown className="text-sm" />
                                                <span>{dislikeCount}</span>
                                            </button>

                                        </div>

                                        {/* Blog Content */}
                                        <div className="prose prose-sm sm:prose-base lg:prose-lg text-lighttext dark:text-darktext max-w-none leading-relaxed dark:prose-invert">
                                            {(() => {
                                                try {
                                                    return (
                                                        <>
                                                            <div id="editorjs-read" />

                                                            {/* Show fallback content if EditorJS failed to load or there are content issues */}
                                                            {(!editorLoaded && blog.content) && (
                                                                <div className="mt-4">
                                                                    {renderFallbackContent(blog.content)}
                                                                </div>
                                                            )}

                                                            {error && (
                                                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                                                                    <p className="text-red-700 dark:text-red-300 font-medium">Content Error</p>
                                                                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{error}</p>
                                                                    {/* Show fallback content when EditorJS fails */}
                                                                    <div className="mt-4 pt-4 border-t border-red-200 dark:border-red-800">
                                                                        <p className="text-red-600 dark:text-red-400 text-sm font-medium mb-2">Fallback Content:</p>
                                                                        {renderFallbackContent(blog.content)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                            {blog.content && !error && !editorLoaded && (!blog.content.blocks || blog.content.blocks.length === 0) && (
                                                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mt-4">
                                                                    <p className="text-yellow-700 dark:text-yellow-300 font-medium">Content Notice</p>
                                                                    <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
                                                                        Content is not available in the expected format. This might be due to a content format issue.
                                                                    </p>
                                                                    {/* Show fallback content */}
                                                                    <div className="mt-4 pt-4 border-t border-yellow-200 dark:border-yellow-800">
                                                                        <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium mb-2">Fallback Content:</p>
                                                                        {renderFallbackContent(blog.content)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </>
                                                    );
                                                } catch (renderError) {
                                                    console.error('🔍 BlogReadPage: Error rendering blog content:', renderError);
                                                    return (
                                                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                                                            <p className="text-red-700 dark:text-red-300 font-medium">Content Rendering Error</p>
                                                            <p className="text-red-600 dark:text-red-400 text-sm mt-1">
                                                                There was an error rendering the blog content. Please try refreshing the page.
                                                            </p>
                                                            <pre className="text-xs mt-2 text-red-600 dark:text-red-400">{renderError.message}</pre>
                                                        </div>
                                                    );
                                                }
                                            })()}
                                        </div>
                                    </div>
                                </article>

                                {/* Comments Section */}
                                <div className="mt-6 sm:mt-8">
                                    <CommentSection blogId={blog._id} />
                                </div>
                            </main>

                            {/* Sidebar */}
                            <aside className="lg:col-span-3 order-1 lg:order-2">
                                <div className="lg:sticky lg:top-24">
                                    <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 sm:p-4">
                                        <h2 className="text-base font-bold text-lighttext dark:text-darktext mb-3">Other Blogs</h2>
                                        <div className="space-y-2">
                                            {otherBlogs.slice(0, 2).map(b => (
                                                <BlogCard
                                                    key={b._id}
                                                    id={b._id}
                                                    image={b.featuredImage}
                                                    category={b.category}
                                                    title={b.title}
                                                    excerpt={b.content?.blocks?.find(block => block.type === "paragraph")?.data?.text?.slice(0, 50) || ""}
                                                    date={new Date(b.createdAt).toLocaleDateString()}
                                                    readTime={(() => {
                                                        if (!b.content?.blocks) return "1 min";
                                                        const words = b.content.blocks.map(block => block.data?.text || "").join(" ").split(/\s+/).length;
                                                        const mins = Math.max(1, Math.round(words / 200));
                                                        return `${mins} min`;
                                                    })()}
                                                    compact
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </div>
            </>
        );
    } catch (error) {
        console.error('🔍 BlogReadPage: Component error:', error);
        return (
            <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
                        <p className="text-sm sm:text-lg font-bold">Component Error</p>
                        <p className="text-sm">{error.message}</p>
                        <pre className="text-xs mt-2 overflow-auto max-h-32">{error.stack}</pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-lightaccent dark:bg-darkaccent text-white px-4 py-2 rounded hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-sm sm:text-base"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }
} 