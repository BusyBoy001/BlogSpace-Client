import React, { useState, useEffect } from "react";
import { getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaNewspaper, FaUserCog, FaSignOutAlt, FaChartBar, FaComments } from "react-icons/fa";
import AdminUsers from "./AdminUsers";
import AdminPosts from "./AdminPosts";
import AdminAccount from "./AdminAccount";
import AdminStats from "./AdminStats";
import AdminComments from "./AdminComments";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState("stats");
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser().then(u => {
            console.log("Current user:", u);
            setUser(u);
            if (!u || u.role !== "admin") {
                console.log("User not admin, redirecting");
                navigate("/", { replace: true });
            } else {
                console.log("User is admin, setting loading to false");
                setLoading(false);
            }
        }).catch(error => {
            console.error("Error getting current user:", error);
            navigate("/", { replace: true });
        });
    }, [navigate]);

    const tabs = [
        { id: "stats", label: "Dashboard", icon: FaChartBar },
        { id: "users", label: "Users", icon: FaUsers },
        { id: "posts", label: "Posts", icon: FaNewspaper },
        { id: "comments", label: "Comments", icon: FaComments },
        { id: "account", label: "My Account", icon: FaUserCog },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-lightbg dark:bg-darkbg flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lightaccent dark:border-darkaccent"></div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case "stats":
                return <AdminStats setActiveTab={setActiveTab} />;
            case "users":
                return <AdminUsers />;
            case "posts":
                return <AdminPosts />;
            case "comments":
                return <AdminComments />;
            case "account":
                return <AdminAccount />;
            default:
                return <AdminStats setActiveTab={setActiveTab} />;
        }
    };

    return (
        <div className="min-h-screen bg-lightbg dark:bg-darkbg">
            {/* Header */}
            <div className="bg-white dark:bg-darkbg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-lighttext dark:text-darktext">
                                Admin Panel
                            </h1>
                            <span className="text-sm text-lightsecondary dark:text-darksecondary">
                                Welcome, {user?.username}
                            </span>
                        </div>
                        <button
                            onClick={() => navigate("/")}
                            className="flex items-center space-x-2 text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext transition-colors"
                        >
                            <FaSignOutAlt />
                            <span>Exit Admin</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="bg-white dark:bg-darkbg border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex space-x-8 overflow-x-auto">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                        ? "border-lightaccent dark:border-darkaccent text-lightaccent dark:text-darkaccent"
                                        : "border-transparent text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext"
                                        }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {renderTabContent()}
            </div>
        </div>
    );
} 