import API from "./apiConfig";

/**
 * Fetch all settings
 * @returns {Promise} Promise object that resolves to the settings data
 */
export const getAllSettings = async () => {
  try {
    const response = await API.get("/settings");
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a setting by ID
 * @param {string} id - The setting ID
 * @returns {Promise} Promise object that resolves to the setting data
 */
export const getSettingById = async (id) => {
  try {
    const response = await API.get(`/settings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Fetch a setting by key
 * @param {string} key - The setting key
 * @returns {Promise} Promise object that resolves to the setting data
 */
export const getSettingByKey = async (key) => {
  try {
    const response = await API.get(`/settings/key/${key}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Create a new setting (Admin only)
 * @param {Object} settingData - The setting data with key, value, description and optional isDefault
 * @returns {Promise} Promise object that resolves to the created setting
 */
export const createSetting = async (settingData) => {
  try {
    const response = await API.post("/settings", settingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Update a setting (Admin only)
 * @param {string} id - The setting ID
 * @param {Object} settingData - The updated setting data which may include value, description, and isDefault
 * @returns {Promise} Promise object that resolves to the updated setting
 */
export const updateSetting = async (id, settingData) => {
  try {
    const response = await API.put(`/settings/${id}`, settingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a setting (Admin only)
 * @param {string} id - The setting ID
 * @returns {Promise} Promise object that resolves to an empty object
 */
export const deleteSetting = async (id) => {
  try {
    const response = await API.delete(`/settings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Legacy function to get default settings - doesn't call the API endpoint
 * @deprecated Use getAllSettings and filter isDefault settings instead
 * @returns {Promise} Promise that resolves to filtered default settings
 */
export const getDefaultSettings = async () => {
  try {
    console.warn(
      "getDefaultSettings is deprecated - using filtered settings instead"
    );
    // Get all settings and filter for default ones
    const allSettings = await getAllSettings();

    if (allSettings && allSettings.data && Array.isArray(allSettings.data)) {
      const defaultSettings = allSettings.data.filter(
        (setting) => setting.isDefault === true
      );
      return {
        success: true,
        data: defaultSettings,
      };
    }

    return { success: true, data: [] };
  } catch (error) {
    console.error("Error in legacy getDefaultSettings:", error);
    return { success: false, data: [], error: error.message };
  }
};
