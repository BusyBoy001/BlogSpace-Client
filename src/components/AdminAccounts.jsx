import React, { useEffect, useState } from "react";
import { getCurrentUser } from "../utils/auth";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaUserShield, FaCalendarAlt, FaSearch } from "react-icons/fa";

export default function AdminAccounts() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [user, setUser] = useState(null);
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        getCurrentUser().then(u => {
            setUser(u);
            if (!u || u.role !== "admin") {
                navigate("/", { replace: true });
            } else {
                fetchAccounts();
            }
        });
        // eslint-disable-next-line
    }, []);

    const fetchAccounts = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/user/all-accounts", {
                credentials: "include"
            });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            } else {
                setError("Failed to load accounts");
            }
        } catch {
            setError("Failed to load accounts");
        } finally {
            setLoading(false);
        }
    };

    // Filter users by search
    const filteredUsers = users.filter(u =>
        u.username.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    // Skeleton loader rows
    const skeletonRows = Array.from({ length: 6 });

    const handleRowClick = (id) => {
        navigate(`/admin/accounts/${id}`);
    };

    return (
        <div className="max-w-5xl mx-auto mt-10 p-4 bg-white dark:bg-darkbg rounded-2xl shadow-lg">
            <h1 className="text-2xl font-bold mb-6 text-lighttext dark:text-darktext">All User Accounts</h1>
            <div className="mb-4 flex items-center gap-2">
                <div className="relative w-full max-w-xs">
                    <span className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500"><FaSearch /></span>
                    <input
                        type="text"
                        placeholder="Search by username or email..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 pr-3 py-2 w-full rounded-md border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                    />
                </div>
            </div>
            {loading ? (
                <div className="animate-pulse">
                    <table className="w-full text-left">
                        <thead>
                            <tr>
                                <th className="py-2 px-3">User</th>
                                <th className="py-2 px-3">Email</th>
                                <th className="py-2 px-3">Role</th>
                                <th className="py-2 px-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {skeletonRows.map((_, i) => (
                                <tr key={i}>
                                    <td className="py-3 px-3">
                                        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </td>
                                    <td className="py-3 px-3">
                                        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : error ? (
                <div className="text-red-500">{error}</div>
            ) : (
                <div className="overflow-x-auto rounded-lg">
                    <table className="w-full text-left border-separate border-spacing-y-2">
                        <thead>
                            <tr className="bg-indigo-50 dark:bg-gray-900">
                                <th className="py-2 px-3 rounded-l-lg font-semibold text-gray-700 dark:text-gray-200"><FaUser className="inline mr-1" />User</th>
                                <th className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-200"><FaEnvelope className="inline mr-1" />Email</th>
                                <th className="py-2 px-3 font-semibold text-gray-700 dark:text-gray-200"><FaUserShield className="inline mr-1" />Role</th>
                                <th className="py-2 px-3 rounded-r-lg font-semibold text-gray-700 dark:text-gray-200"><FaCalendarAlt className="inline mr-1" />Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-6 text-gray-400 dark:text-darkmuted">No users found.</td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr
                                        key={u._id}
                                        className="bg-gray-50 dark:bg-darkbg hover:bg-indigo-100 dark:hover:bg-gray-800 transition-all shadow-sm rounded-lg group cursor-pointer"
                                        onClick={() => handleRowClick(u._id)}
                                        tabIndex={0}
                                        style={{ outline: 'none' }}
                                    >
                                        <td className="py-3 px-3 flex items-center gap-3 min-w-[180px]">
                                            <img
                                                src={u.profileImage || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.username)}`}
                                                alt={u.username}
                                                className="w-9 h-9 rounded-full object-cover border border-gray-200 dark:border-darkborder shadow-sm"
                                            />
                                            <span className="font-semibold text-gray-900 dark:text-darktext truncate" title={u.username}>{u.username}</span>
                                        </td>
                                        <td className="py-3 px-3 min-w-[200px]">
                                            <span className="text-gray-600 dark:text-darkmuted truncate" title={u.email}>{u.email}</span>
                                        </td>
                                        <td className="py-3 px-3">
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-bold capitalize ${u.role === "admin" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200" : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200"}`}
                                                title={u.role === "admin" ? "Administrator" : "User"}
                                            >
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="py-3 px-3 min-w-[120px]">
                                            <span className="text-gray-400 dark:text-darkmuted text-xs" title={new Date(u.createdAt).toLocaleString()}>
                                                {new Date(u.createdAt).toLocaleDateString()}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
} 