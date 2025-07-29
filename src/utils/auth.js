// Authentication utility functions

/**
 * Check if user is logged in by verifying the token cookie
 * @returns {Promise<boolean>} - True if user is logged in
 */
export const checkAuthStatus = async () => {
  try {
    const response = await fetch("/api/user/me", {
      method: "GET",
      credentials: "include", // Include cookies
      headers: {
        "Content-Type": "application/json",
      },
    });

    return response.ok;
  } catch (error) {
    console.error("Auth check failed:", error);
    return false;
  }
};

/**
 * Update current user data
 * @param {FormData|Object} updatedData - FormData for file uploads or Object for JSON data
 * @returns {Promise<Object|null>} - Updated user data or null if failed
 */
export const updateUser = async (updatedData) => {
  try {
    const isFormData = updatedData instanceof FormData;

    const response = await fetch("/api/user/update/me", {
      method: "PUT",
      credentials: "include",
      headers: isFormData
        ? {}
        : {
            "Content-Type": "application/json",
          },
      body: isFormData ? updatedData : JSON.stringify(updatedData),
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    } else {
      const errorData = await response.json();
      console.error("Update user failed:", errorData.message);
      throw new Error(errorData.message || "Update failed");
    }
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};

/**
 * Get current user data
 * @returns {Promise<Object|null>} - User data or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const response = await fetch("/api/user/me", {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch (error) {
    console.error("Get user failed:", error);
    return null;
  }
};

/**
 * Logout user by clearing the token cookie
 * @returns {Promise<boolean>} - True if logout successful
 */
export const logout = async () => {
  try {
    const response = await fetch("/api/user/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (response.ok) {
      // Redirect to home page after logout
      window.location.href = "/";
      return true;
    }
    return false;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};

/**
 * Check if token exists in cookies (client-side check)
 * @returns {boolean} - True if token cookie exists
 */
export const hasToken = () => {
  return document.cookie.includes("token=");
};

/**
 * Login user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object|null>} - User data or null if failed
 */
export const login = async (email, password) => {
  try {
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    const response = await fetch("/api/user/login", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.user;
    } else {
      throw new Error(data.message || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @param {string} userData.email - User's email
 * @param {string} userData.username - User's username
 * @param {string} userData.password - User's password
 * @param {File} userData.profileImage - Profile image file (optional)
 * @returns {Promise<Object|null>} - User data or null if failed
 */
export const register = async (userData) => {
  try {
    const formData = new FormData();
    formData.append("email", userData.email);
    formData.append("username", userData.username);
    formData.append("password", userData.password);

    if (userData.profileImage) {
      formData.append("profileImage", userData.profileImage);
    }

    const response = await fetch("/api/user/register", {
      method: "POST",
      credentials: "include",
      body: formData,
    });

    const data = await response.json();
    if (response.ok) {
      return data.user;
    } else {
      throw new Error(data.message || "Registration failed");
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Check if current user is the main admin
export const isMainAdmin = (user) => {
  // Note: This should be handled server-side for security
  // This is just for UI purposes
  const mainAdminId = import.meta.env.VITE_MAIN_ADMIN_ID;

  // Debug logging
  console.log("🔍 isMainAdmin check:", {
    user: user ? { id: user._id, role: user.role } : null,
    mainAdminId: mainAdminId,
    isMatch: user && user.role === "admin" && user._id === mainAdminId,
  });

  return user && user.role === "admin" && user._id === mainAdminId;
};
