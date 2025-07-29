import BlogCard from "./BlogCard";
import FeaturedBlogCard from "./FeaturedBlogCard";
import LoadingSpinner from "./LoadingSpinner";
import { useState, useEffect } from "react";

export default function HomePage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            try {
                const res = await fetch("/api/posts");
                const data = await res.json();
                if (data.success) {
                    setBlogs(data.blogs);
                } else {
                    setBlogs([]);
                }
            } catch {
                setBlogs([]);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, []);

    // Helper to get excerpt from content
    const getExcerpt = (content) => {
        if (!content?.blocks) return "";
        const para = content.blocks.find(block => block.type === "paragraph");
        return para ? para.data.text.slice(0, 120) : "";
    };
    // Helper to format date
    const formatDate = (dateStr) => {
        const d = new Date(dateStr);
        return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    };
    // Helper to estimate read time
    const getReadTime = (content) => {
        if (!content?.blocks) return "1 min";
        const words = content.blocks.map(block => block.data?.text || "").join(" ").split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 200));
        return `${mins} min`;
    };

    // Show the most recent 9 blogs for the grid
    const recentBlogs = blogs.slice(0, 9);

    if (loading) {
        return (
            <div className="min-h-screen bg-lightbg dark:bg-darkbg">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <LoadingSpinner size="lg" text="Loading blogs..." />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-lightbg dark:bg-darkbg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                {/* Featured Blog Section - Desktop Only */}
                {blogs.length > 0 && (
                    <FeaturedBlogCard
                        blog={recentBlogs[0]}
                        getExcerpt={getExcerpt}
                        formatDate={formatDate}
                        getReadTime={getReadTime}
                    />
                )}

                {/* Recent Blog Posts Section */}
                <section>
                    <div className="mb-8 sm:mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold text-lighttext dark:text-darktext mb-3 sm:mb-4">
                            Recent blog posts
                        </h2>
                        <p className="text-base sm:text-lg text-lightsecondary dark:text-darksecondary max-w-2xl">
                            Discover the latest insights, stories, and perspectives from our community of writers and thought leaders.
                        </p>
                    </div>

                    {blogs.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                            {recentBlogs.map((blog, idx) => (
                                idx === 0 ? null : (
                                    <BlogCard
                                        key={blog._id}
                                        id={blog._id}
                                        image={blog.featuredImage}
                                        category={blog.category}
                                        title={blog.title}
                                        excerpt={getExcerpt(blog.content)}
                                        date={formatDate(blog.createdAt)}
                                        readTime={getReadTime(blog.content)}
                                    />
                                )
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8 sm:py-16">
                            <div className="bg-white dark:bg-darkbg rounded-2xl p-6 sm:p-12 border border-gray-200 dark:border-gray-700 shadow-sm">
                                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4 sm:mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <h3 className="text-lg sm:text-xl font-semibold text-lighttext dark:text-darktext mb-2">No blogs found</h3>
                                <p className="text-sm sm:text-base text-lightsecondary dark:text-darksecondary">Check back soon for new content!</p>
                            </div>
                        </div>
                    )}

                    {/* Load More Button */}
                    {blogs.length > 9 && (
                        <div className="text-center mt-8 sm:mt-16">
                            <button className="bg-white border-2 border-gray-300 text-gray-700 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm text-sm sm:text-base">
                                Loading more...
                            </button>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
} 