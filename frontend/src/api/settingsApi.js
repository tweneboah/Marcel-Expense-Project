import API from "./apiConfig";

/**
 * Fetch all settings
 * @returns {Promise} Promise object that resolves to the settings data
 */
export const getAllSettings = async () => {
  const response = await API.get("/settings");
  return response.data;
};

/**
 * Fetch a setting by ID
 * @param {string} id - The setting ID
 * @returns {Promise} Promise object that resolves to the setting data
 */
export const getSettingById = async (id) => {
  const response = await API.get(`/settings/${id}`);
  return response.data;
};

/**
 * Fetch a setting by key
 * @param {string} key - The setting key
 * @returns {Promise} Promise object that resolves to the setting data
 */
export const getSettingByKey = async (key) => {
  const response = await API.get(`/settings/key/${key}`);
  return response.data;
};

/**
 * Create a new setting (Admin only)
 * @param {Object} settingData - The setting data with key, value, description and optional isDefault
 * @returns {Promise} Promise object that resolves to the created setting
 */
export const createSetting = async (settingData) => {
  const response = await API.post("/settings", settingData);
  return response.data;
};

/**
 * Update a setting (Admin only)
 * @param {string} id - The setting ID
 * @param {Object} settingData - The updated setting data which may include value, description, and isDefault
 * @returns {Promise} Promise object that resolves to the updated setting
 */
export const updateSetting = async (id, settingData) => {
  const response = await API.put(`/settings/${id}`, settingData);
  return response.data;
};

/**
 * Delete a setting (Admin only)
 * @param {string} id - The setting ID
 * @returns {Promise} Promise object that resolves to an empty object
 */
export const deleteSetting = async (id) => {
  const response = await API.delete(`/settings/${id}`);
  return response.data;
};
