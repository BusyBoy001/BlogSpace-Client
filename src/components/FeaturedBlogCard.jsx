import React from "react";
import { Link } from "react-router-dom";

const FeaturedBlogCard = ({ blog, getExcerpt, formatDate, getReadTime }) => {
    return (
        <div className="hidden md:block mb-16">
            <div className="bg-white dark:bg-darkbg rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col lg:flex-row">
                    {/* Image Section */}
                    {blog.featuredImage && (
                        <div className="lg:w-1/2 relative overflow-hidden">
                            <img
                                src={blog.featuredImage}
                                alt={blog.title}
                                className="w-full h-64 lg:h-full object-cover"
                            />
                            <div className="absolute top-4 left-4">
                                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold tracking-wide uppercase">
                                    Featured
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Content Section */}
                    <div className="lg:w-1/2 p-6 lg:p-8 flex flex-col justify-center">
                        <div className="mb-4">
                            <span className="text-sm font-medium text-lightaccent dark:text-darkaccent bg-blue-50 dark:bg-blue-900/20 px-3 py-1 rounded-full">
                                {blog.category}
                            </span>
                        </div>

                        <h2 className="text-2xl lg:text-3xl font-bold text-lighttext dark:text-darktext mb-4 leading-tight">
                            {blog.title}
                        </h2>

                        <p className="text-lightsecondary dark:text-darksecondary text-base mb-6 leading-relaxed">
                            {getExcerpt(blog.content)}
                        </p>

                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4 text-sm text-lightsecondary dark:text-darksecondary">
                                <span>{formatDate(blog.createdAt)}</span>
                                <span>•</span>
                                <span>{getReadTime(blog.content)}</span>
                            </div>
                        </div>

                        <Link
                            to={`/blog/${blog._id}`}
                            className="inline-flex items-center justify-center bg-lightaccent dark:bg-darkaccent text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors duration-200 w-fit"
                        >
                            Read Article
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FeaturedBlogCard; 