import React from "react";
import { Link } from "react-router-dom";

const FeaturedCard = ({ id, image, category, title, excerpt, date, readTime }) => {
    return (
        <Link to={`/blog/${id}`} className="bg-white dark:bg-darkcard rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-10 cursor-pointer border border-transparent dark:border-darkborder">
            <img src={image} alt={title} className="w-full md:w-2/5 h-64 md:h-auto object-cover" />
            <div className="p-8 flex flex-col justify-center flex-1">
                <span className="text-sm text-blue-600 dark:text-darkaccent font-semibold mb-2">{category}</span>
                <h2 className="text-3xl font-bold mb-4 text-gray-900 dark:text-darktext">{title}</h2>
                <p className="text-gray-700 dark:text-darktext2 text-lg mb-6">{excerpt}</p>
                <div className="text-sm text-gray-400 dark:text-darkmuted">
                    {date} • {readTime} read
                </div>
            </div>
        </Link>
    );
};

export default FeaturedCard; 