import React, { useState, useEffect } from "react";
import { FaUsers, FaNewspaper, FaComments, FaEye, FaUserCog } from "react-icons/fa";

export default function AdminStats({ setActiveTab }) {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalComments: 0,
        totalViews: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            console.log("Fetching stats...");
            const [usersRes, postsRes, commentsRes] = await Promise.all([
                fetch("/api/user/all-accounts", { credentials: "include" }),
                fetch("/api/posts", { credentials: "include" }),
                fetch("/api/user/comments", { credentials: "include" })
            ]);

            console.log("API responses:", { usersRes, postsRes, commentsRes });

            const [usersData, postsData, commentsData] = await Promise.all([
                usersRes.json(),
                postsRes.json(),
                commentsRes.json()
            ]);

            console.log("API data:", { usersData, postsData, commentsData });

            setStats({
                totalUsers: usersData.success ? usersData.users.length : 0,
                totalPosts: postsData.success ? postsData.blogs.length : 0,
                totalComments: commentsData.success ? commentsData.comments.length : 0,
                totalViews: postsData.success ? postsData.blogs.reduce((sum, post) => sum + (post.views || 0), 0) : 0
            });
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        {
            title: "Total Users",
            value: stats.totalUsers,
            icon: FaUsers,
            color: "bg-blue-500",
            textColor: "text-blue-500"
        },
        {
            title: "Total Posts",
            value: stats.totalPosts,
            icon: FaNewspaper,
            color: "bg-green-500",
            textColor: "text-green-500"
        },
        {
            title: "Total Comments",
            value: stats.totalComments,
            icon: FaComments,
            color: "bg-purple-500",
            textColor: "text-purple-500"
        },
        {
            title: "Total Views",
            value: stats.totalViews,
            icon: FaEye,
            color: "bg-orange-500",
            textColor: "text-orange-500"
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
                        <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                        <div className="h-12 w-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-lighttext dark:text-darktext mb-2">
                    Dashboard Overview
                </h2>
                <p className="text-lightsecondary dark:text-darksecondary">
                    Welcome to your admin dashboard. Here's an overview of your platform statistics.
                </p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <div key={index} className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-lightsecondary dark:text-darksecondary">
                                        {stat.title}
                                    </p>
                                    <p className="text-3xl font-bold text-lighttext dark:text-darktext">
                                        {stat.value.toLocaleString()}
                                    </p>
                                </div>
                                <div className={`p-3 rounded-full ${stat.color} bg-opacity-10`}>
                                    <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-4">
                    Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <button
                        onClick={() => setActiveTab("users")}
                        className="flex items-center justify-center space-x-2 p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                    >
                        <FaUsers className="w-5 h-5" />
                        <span>Manage Users</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("posts")}
                        className="flex items-center justify-center space-x-2 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                    >
                        <FaNewspaper className="w-5 h-5" />
                        <span>Manage Posts</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("comments")}
                        className="flex items-center justify-center space-x-2 p-4 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors"
                    >
                        <FaComments className="w-5 h-5" />
                        <span>View Comments</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("account")}
                        className="flex items-center justify-center space-x-2 p-4 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                    >
                        <FaUserCog className="w-5 h-5" />
                        <span>My Account</span>
                    </button>
                </div>
            </div>
        </div>
    );
} 