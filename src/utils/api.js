// API utility for centralized API calls

const API_BASE = "/api";

/**
 * Make an API request with consistent error handling
 * @param {string} endpoint - API endpoint (without /api prefix)
 * @param {Object} options - Fetch options
 * @returns {Promise<Object>} - Response data
 */
export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;

  const defaultOptions = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === "TypeError" && error.message.includes("fetch")) {
      throw new Error("Network error. Please check your connection.");
    }
    throw error;
  }
};

/**
 * GET request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - Response data
 */
export const apiGet = (endpoint) => apiRequest(endpoint, { method: "GET" });

/**
 * POST request
 * @param {string} endpoint - API endpoint
 * @param {Object|FormData} body - Request body
 * @returns {Promise<Object>} - Response data
 */
export const apiPost = (endpoint, body) => {
  const options = {
    method: "POST",
  };

  if (body instanceof FormData) {
    options.body = body;
    delete options.headers; // Let browser set Content-Type for FormData
  } else {
    options.body = JSON.stringify(body);
  }

  return apiRequest(endpoint, options);
};

/**
 * PUT request
 * @param {string} endpoint - API endpoint
 * @param {Object|FormData} body - Request body
 * @returns {Promise<Object>} - Response data
 */
export const apiPut = (endpoint, body) => {
  const options = {
    method: "PUT",
  };

  if (body instanceof FormData) {
    options.body = body;
    delete options.headers;
  } else {
    options.body = JSON.stringify(body);
  }

  return apiRequest(endpoint, options);
};

/**
 * DELETE request
 * @param {string} endpoint - API endpoint
 * @returns {Promise<Object>} - Response data
 */
export const apiDelete = (endpoint) =>
  apiRequest(endpoint, { method: "DELETE" });
