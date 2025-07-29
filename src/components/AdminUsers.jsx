import React, { useState, useEffect } from "react";
import { FaSearch, FaEdit, FaTrash, FaBan, FaUserShield, FaUser, FaEye } from "react-icons/fa";
import { getCurrentUser, isMainAdmin } from "../utils/auth";

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [modalType, setModalType] = useState(""); // "edit", "delete", "block"
    const [actionLoading, setActionLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        fetchUsers();
        // Get current user to check admin level
        getCurrentUser().then(user => {
            setCurrentUser(user);
        });
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/user/all-accounts", { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                setUsers(data.users);
            }
        } catch (error) {
            console.error("Failed to fetch users:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
    );

    // Count admins
    const adminCount = users.filter(user => user.role === "admin").length;

    const handleAction = async (action, userId) => {
        setActionLoading(true);
        setErrorMessage("");
        setSuccessMessage(""); // Clear previous success messages
        try {
            let url = `/api/user/admin/account/${userId}`;
            let method = "PUT";
            let body = {};

            switch (action) {
                case "block":
                    url += "/block";
                    break;
                case "role":
                    // Find the user to determine current role
                    const user = users.find(u => u._id === userId);
                    if (!user) {
                        setErrorMessage("User not found");
                        return;
                    }
                    body = { role: user.role === "admin" ? "user" : "admin" };
                    break;
                case "delete":
                    method = "DELETE";
                    break;
                default:
                    return;
            }

            const res = await fetch(url, {
                method,
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined
            });

            const data = await res.json();
            if (data.success) {
                await fetchUsers(); // Refresh the list
                setShowModal(false);
                setSelectedUser(null);
                setSuccessMessage(data.message || "Action successful");
            } else {
                setErrorMessage(data.message || "Action failed");
            }
        } catch (error) {
            setErrorMessage("Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    const openModal = (type, user) => {
        setModalType(type);
        setSelectedUser(user);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-lighttext dark:text-darktext mb-2">
                    User Management
                </h2>
                <p className="text-lightsecondary dark:text-darksecondary">
                    Manage all user accounts, roles, and permissions.
                </p>
                <div className="mt-2 flex items-center gap-4">
                    <span className="text-sm text-lightsecondary dark:text-darksecondary">
                        Total Users: {users.length}
                    </span>
                    <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">
                        Admins: {adminCount}/3
                    </span>
                </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Error!</strong>
                    <span className="block sm:inline"> {errorMessage}</span>
                </div>
            )}

            {/* Success Message */}
            {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                </div>
            )}

            {/* Junior Admin Notice */}
            {currentUser && !isMainAdmin(currentUser) && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Junior Admin Notice:</strong>
                    <span className="block sm:inline"> You can block/unblock users, but only the main admin can edit roles, promote/demote users, or delete accounts.</span>
                </div>
            )}

            {/* Search */}
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                    <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                    />
                </div>
                <span className="text-sm text-lightsecondary dark:text-darksecondary">
                    {filteredUsers.length} users found
                </span>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-darkbg rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Role
                                    {adminCount >= 3 && (
                                        <span className="ml-2 text-xs text-red-500">(Limit Reached)</span>
                                    )}
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Joined
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredUsers.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-10 w-10">
                                                {user.profileImage ? (
                                                    <img
                                                        className="h-10 w-10 rounded-full object-cover"
                                                        src={user.profileImage}
                                                        alt={user.username}
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                                                        <span className="text-white font-medium">
                                                            {user.username.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-lighttext dark:text-darktext">
                                                    {user.username}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-lightsecondary dark:text-darksecondary">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.role === "admin"
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300"
                                            : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                                            }`}>
                                            {user.role === "admin" ? <FaUserShield className="w-3 h-3 mr-1" /> : <FaUser className="w-3 h-3 mr-1" />}
                                            {user.role}
                                        </span>
                                        {user.role === "admin" && (
                                            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                                                Admin #{users.filter(u => u.role === "admin").indexOf(user) + 1}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${user.blocked
                                            ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                            : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                            }`}>
                                            {user.blocked ? "Blocked" : "Active"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-lightsecondary dark:text-darksecondary">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-2">
                                            {isMainAdmin(currentUser) && (
                                                <>
                                                    <button
                                                        onClick={() => openModal("edit", user)}
                                                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit User (Main Admin Only)"
                                                    >
                                                        <FaEdit className="w-4 h-4" />
                                                    </button>
                                                    {user.role === "user" && adminCount < 3 && (
                                                        <button
                                                            onClick={() => handleAction("role", user._id)}
                                                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                                            title="Promote to Admin (Main Admin Only)"
                                                        >
                                                            <FaUserShield className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                    {user.role === "admin" && (
                                                        <button
                                                            onClick={() => handleAction("role", user._id)}
                                                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                                            title="Demote to User (Main Admin Only)"
                                                        >
                                                            <FaUser className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                onClick={() => openModal("block", user)}
                                                className={`${user.blocked
                                                    ? "text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                                    : "text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300"
                                                    }`}
                                                title={user.blocked ? "Unblock User" : "Block User"}
                                            >
                                                <FaBan className="w-4 h-4" />
                                            </button>
                                            {isMainAdmin(currentUser) && (
                                                <button
                                                    onClick={() => openModal("delete", user)}
                                                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                                    title="Delete User (Main Admin Only)"
                                                >
                                                    <FaTrash className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-darkbg rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-semibold text-lighttext dark:text-darktext mb-4">
                            {modalType === "edit" && "Edit User"}
                            {modalType === "block" && (selectedUser.blocked ? "Unblock User" : "Block User")}
                            {modalType === "delete" && "Delete User"}
                        </h3>

                        <div className="mb-4">
                            <p className="text-lightsecondary dark:text-darksecondary">
                                {modalType === "edit" && `Edit user: ${selectedUser.username}`}
                                {modalType === "block" && `Are you sure you want to ${selectedUser.blocked ? "unblock" : "block"} ${selectedUser.username}?`}
                                {modalType === "delete" && `Are you sure you want to delete ${selectedUser.username}? This action cannot be undone.`}
                            </p>
                        </div>

                        {modalType === "edit" && (
                            <div className="space-y-4 mb-4">
                                <div>
                                    <label className="block text-sm font-medium text-lighttext dark:text-darktext mb-2">
                                        Role
                                    </label>
                                    <select
                                        value={selectedUser.role}
                                        onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-darkbg text-lighttext dark:text-darktext focus:outline-none focus:ring-2 focus:ring-lightaccent dark:focus:ring-darkaccent"
                                    >
                                        <option value="user">User</option>
                                        <option value="admin" disabled={adminCount >= 3 && selectedUser.role !== "admin"}>
                                            Admin {adminCount >= 3 && selectedUser.role !== "admin" ? "(Limit Reached)" : ""}
                                        </option>
                                    </select>
                                    {adminCount >= 3 && selectedUser.role !== "admin" && (
                                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                                            Maximum of 3 admins allowed. Current: {adminCount}/3
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {errorMessage && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline"> {errorMessage}</span>
                            </div>
                        )}

                        {successMessage && (
                            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
                                <strong className="font-bold">Success!</strong>
                                <span className="block sm:inline"> {successMessage}</span>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-sm font-medium text-lightsecondary dark:text-darksecondary hover:text-lighttext dark:hover:text-darktext transition-colors"
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(modalType, selectedUser._id)}
                                disabled={actionLoading}
                                className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors ${modalType === "delete"
                                    ? "bg-red-600 hover:bg-red-700 disabled:bg-red-400"
                                    : modalType === "block"
                                        ? "bg-yellow-600 hover:bg-yellow-700 disabled:bg-yellow-400"
                                        : "bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400"
                                    }`}
                            >
                                {actionLoading ? "Processing..." :
                                    modalType === "edit" ? "Save Changes" :
                                        modalType === "block" ? (selectedUser.blocked ? "Unblock" : "Block") :
                                            "Delete"
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 