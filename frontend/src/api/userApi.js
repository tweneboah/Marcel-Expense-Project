import API from "./apiConfig";

/**
 * Get all users (admin only)
 * @returns {Promise} - Response with users data
 */
export const getAllUsers = async () => {
  const response = await API.get("/users");
  return response.data;
};

/**
 * Get a single user by ID (admin only)
 * @param {string} userId - The ID of the user to fetch
 * @returns {Promise} - Response with user data
 */
export const getUserById = async (userId) => {
  const response = await API.get(`/users/${userId}`);
  return response.data;
};

/**
 * Create a new user (admin only)
 * @param {Object} userData - User data containing name, email, password, and role
 * @returns {Promise} - Response with created user data
 */
export const createUser = async (userData) => {
  const response = await API.post("/users", userData);
  return response.data;
};

/**
 * Update user information (admin only)
 * @param {string} userId - The ID of the user to update
 * @param {Object} userData - User data to update (name, email, role)
 * @returns {Promise} - Response with updated user data
 */
export const updateUser = async (userId, userData) => {
  const response = await API.put(`/users/${userId}`, userData);
  return response.data;
};

/**
 * Delete a user (admin only)
 * @param {string} userId - The ID of the user to delete
 * @returns {Promise} - Response with deletion status
 */
export const deleteUser = async (userId) => {
  const response = await API.delete(`/users/${userId}`);
  return response.data;
};
