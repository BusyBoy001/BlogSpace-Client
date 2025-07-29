import React from "react";
import { Link } from "react-router-dom";

const BlogCard = ({ id, image, category, title, excerpt, date, readTime, compact }) => {
    if (compact) {
        return (
            <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow p-2 flex items-center gap-2">
                {image && (
                    <img
                        src={image}
                        alt={title}
                        className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                    />
                )}
                <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-xs text-lightsecondary dark:text-darksecondary mb-0.5 font-medium">{category}</span>
                    <h3 className="text-xs font-semibold mb-0.5 text-lighttext dark:text-darktext line-clamp-1">
                        <Link to={`/blog/${id}`} className="hover:text-lightaccent dark:hover:text-darkaccent transition-colors">
                            {title}
                        </Link>
                    </h3>
                    <p className="text-lightsecondary dark:text-darksecondary text-xs mb-0.5 line-clamp-1">{excerpt}</p>
                    <div className="text-xs text-lightsecondary dark:text-darksecondary">{date} • {readTime}</div>
                </div>
            </div>
        );
    }

    return (
        <Link to={`/blog/${id}`} className="group">
            <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 overflow-hidden h-full flex flex-col">
                {image && (
                    <div className="relative overflow-hidden">
                        <img
                            src={image}
                            alt={title}
                            className="w-full h-40 sm:h-48 object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                    </div>
                )}
                <div className="p-4 sm:p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="text-xs font-medium text-lightaccent dark:text-darkaccent bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                            {category}
                        </span>
                    </div>
                    <h3 className="text-base sm:text-lg font-semibold text-lighttext dark:text-darktext mb-2 sm:mb-3 line-clamp-2 group-hover:text-lightaccent dark:group-hover:text-darkaccent transition-colors flex-1">
                        {title}
                    </h3>
                    <p className="text-lightsecondary dark:text-darksecondary text-sm mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3 flex-1">
                        {excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs sm:text-sm text-lightsecondary dark:text-darksecondary mt-auto">
                        <span>{date}</span>
                        <span>{readTime}</span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default BlogCard; 