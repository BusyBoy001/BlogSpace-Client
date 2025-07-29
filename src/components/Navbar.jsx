import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { checkAuthStatus, getCurrentUser, logout } from "../utils/auth.js";
import { SearchContext } from "../SearchContext";
import { useTheme } from "../ThemeContext";

const Navbar = () => {
    // Removed setSearch as search box is now in BlogPage
    const { theme, toggleTheme } = useTheme();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        checkAuthAndSetUser();
    }, []);

    const checkAuthAndSetUser = async () => {
        try {
            const authStatus = await checkAuthStatus();
            setIsAuthenticated(authStatus);

            if (authStatus) {
                const user = await getCurrentUser();
                setCurrentUser(user);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            setIsAuthenticated(false);
            setCurrentUser(null);
            setIsMobileMenuOpen(false);
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <nav className="bg-white dark:bg-darkbg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-lightaccent dark:bg-darkaccent rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">B</span>
                        </div>
                        <span className="text-xl font-semibold text-lighttext dark:text-darktext">BlogSpace</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        {/* Links */}
                        <Link to="/" className="text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/blog" className="text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium transition-colors">
                            Blog
                        </Link>

                        {/* Search */}


                        {/* Theme Toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {theme === 'dark' ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                </svg>
                            )}
                        </button>

                        {/* Auth Buttons */}
                        {!isLoading && (
                            <div className="flex items-center space-x-4">
                                {!isAuthenticated ? (
                                    <>
                                        <Link to="/login" className="text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium transition-colors">
                                            Log in
                                        </Link>
                                        <Link to="/register" className="bg-lightaccent dark:bg-darkaccent text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">
                                            Sign up
                                        </Link>
                                    </>
                                ) : (
                                    <>
                                        {currentUser?.role === 'admin' && (
                                            <>
                                                <Link to="/admin" className="bg-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors">
                                                    Admin Panel
                                                </Link>
                                                <Link to="/create-post" className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                                                    Create Post
                                                </Link>
                                            </>
                                        )}

                                        <div className="relative group">
                                            <button className="flex items-center text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext transition-colors focus:outline-none">
                                                {currentUser?.profileImage ? (
                                                    <img
                                                        src={currentUser.profileImage}
                                                        alt="Profile"
                                                        className="w-8 h-8 rounded-full border border-gray-300 object-cover"
                                                        loading="lazy"
                                                    />
                                                ) : (
                                                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                                        <span className="text-white text-sm font-medium">
                                                            {currentUser?.username?.charAt(0)?.toUpperCase() || "U"}
                                                        </span>
                                                    </div>
                                                )}
                                                <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {/* Dropdown */}
                                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-darkbg rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                                                <div className="py-1">
                                                    <Link to="/profile" className="block px-4 py-2 text-sm text-lighttext dark:text-darktext hover:bg-gray-50 dark:hover:bg-gray-800">
                                                        Profile
                                                    </Link>
                                                    <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                                                        Sign out
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Mobile menu toggle */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
                        >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                {isMobileMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-darkbg border-t border-gray-200 dark:border-gray-700 px-4 pt-4 pb-6 space-y-4">
                    <Link to="/" className="block text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium">Home</Link>
                    <Link to="/blog" className="block text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium">Blog</Link>
                    {currentUser?.role === 'admin' && (
                        <Link to="/admin" className="block text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium">Admin Panel</Link>
                    )}

                    {/* Theme Toggle for Mobile */}
                    <button
                        onClick={toggleTheme}
                        className="flex items-center w-full text-left px-0 py-2 text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium transition-colors"
                        aria-label="Toggle theme"
                    >
                        <span className="mr-3">
                            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                        </span>
                        {theme === 'dark' ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                            </svg>
                        )}
                    </button>

                    {!isLoading && !isAuthenticated && (
                        <>
                            <Link to="/login" className="block text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext font-medium">Log in</Link>
                            <Link to="/register" className="block bg-lightaccent dark:bg-darkaccent text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors">Sign up</Link>
                        </>
                    )}
                    {!isLoading && isAuthenticated && (
                        <>
                            {currentUser?.role === 'admin' && (
                                <Link to="/create-post" className="block bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">Create Post</Link>
                            )}
                            <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">Sign out</button>
                        </>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;
