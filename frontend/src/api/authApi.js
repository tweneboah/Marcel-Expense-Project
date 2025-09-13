import API from "./apiConfig";

// Register user
export const register = async (userData) => {
  const response = await API.post("/auth/register", userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await API.post("/auth/login", credentials);

  // Store token and user data in localStorage
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

// Logout user
export const logout = async () => {
  const response = await API.get("/auth/logout");

  // Remove token and user data from localStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  return response.data;
};

// Get current user
export const getCurrentUser = async () => {
  const response = await API.get("/auth/me");
  return response.data;
};

// Forgot Password - Request password reset
export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgotpassword", { email });
  return response.data;
};

// Reset Password - Reset using token from email
export const resetPassword = async (resetToken, password) => {
  const response = await API.put(`/auth/resetpassword/${resetToken}`, {
    password,
  });
  return response.data;
};

// Update Password - For logged-in users
export const updatePassword = async (passwordData) => {
  const response = await API.put("/auth/updatepassword", passwordData);

  // Update token if a new one is returned
  if (response.data.token) {
    localStorage.setItem("token", response.data.token);
    localStorage.setItem("user", JSON.stringify(response.data.user));
  }

  return response.data;
};

// Update Profile - Update user profile information
export const updateProfile = async (profileData) => {
  const response = await API.put("/auth/updateprofile", profileData);

  // Update user in localStorage if successful
  if (response.data.success) {
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...currentUser, ...response.data.data };
    localStorage.setItem("user", JSON.stringify(updatedUser));
  }

  return response.data;
};
