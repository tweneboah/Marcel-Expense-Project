import React, { useState, useEffect, useCallback } from "react";
import {
  getAllSettings,
  createSetting,
  updateSetting,
  deleteSetting,
} from "../../api/settingsApi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Settings = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: "",
    value: "",
    description: "",
    isDefault: false,
  });
  const [isAdmin, setIsAdmin] = useState(false);

  // Memoize fetchSettings to avoid infinite loops in the refresh interval
  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllSettings();
      setSettings(response.data);
      setLoading(false);
    } catch (error) {
      // Error handled by error context
      toast.error("Failed to load settings");
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    setIsAdmin(user.role === "admin");
    fetchSettings();
    // Set up refresh interval to detect changes from other components
    const refreshInterval = setInterval(() => {
      fetchSettings();
    }, 10000); // Refresh every 10 seconds

    // Clean up interval on unmount
    return () => clearInterval(refreshInterval);
  }, [fetchSettings]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : name === "value" && !isNaN(value)
          ? parseFloat(value)
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      toast.error("Only administrators can modify settings");
      return;
    }

    try {
      if (editMode) {
        await updateSetting(currentSetting._id, {
          value: formData.value,
          description: formData.description,
          isDefault: formData.isDefault,
        });
        toast.success("Setting updated successfully");
      } else {
        await createSetting(formData);
        toast.success("Setting created successfully");
      }

      // Reset form and fetch updated settings
      resetForm();
      fetchSettings();
    } catch (error) {
      // Error handled by error context
      toast.error(error.message || "Failed to save setting");
    }
  };

  const handleEdit = (setting) => {
    setCurrentSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description,
      isDefault: setting.isDefault || false,
    });
    setEditMode(true);
  };

  const handleDelete = async (id) => {
    if (!isAdmin) {
      toast.error("Only administrators can delete settings");
      return;
    }

    if (window.confirm("Are you sure you want to delete this setting?")) {
      try {
        await deleteSetting(id);
        toast.success("Setting deleted successfully");
        fetchSettings();
      } catch (error) {
        // Error handled by error context
        toast.error("Failed to delete setting");
      }
    }
  };

  const resetForm = () => {
    setFormData({ key: "", value: "", description: "", isDefault: false });
    setCurrentSetting(null);
    setEditMode(false);
  };

  // Format value for display
  const formatValue = (value) => {
    if (typeof value === "number") {
      // Format number with 2 decimal places for currency values
      return value.toFixed(2);
    }
    return value;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        Loading settings...
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      <h1 className="text-2xl font-bold mb-6">Application Settings</h1>

      {!isAdmin && (
        <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-6">
          <p>
            You are viewing settings in read-only mode. Only administrators can
            modify settings.
          </p>
        </div>
      )}

      {isAdmin && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">
            {editMode ? "Edit Setting" : "Add New Setting"}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="key"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Setting Key
                </label>
                <input
                  type="text"
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleInputChange}
                  disabled={editMode}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="value"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Value
                </label>
                <input
                  type="text"
                  id="value"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>

            <div className="mb-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isDefault"
                  name="isDefault"
                  checked={formData.isDefault}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="isDefault"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Set as Default Setting
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Default settings are applied as the baseline configuration for
                all users.
              </p>
            </div>

            <div className="flex justify-end space-x-2">
              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                {editMode ? "Update Setting" : "Save Setting"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b">
          <h2 className="text-xl font-semibold">Current Settings</h2>
          <button
            onClick={fetchSettings}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Refresh
          </button>
        </div>

        {settings.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No settings found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Setting Key
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Value
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Description
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Default
                  </th>
                  {isAdmin && (
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {settings.map((setting) => (
                  <tr key={setting._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {setting.key}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatValue(setting.value)}{" "}
                      {setting.key.toLowerCase().includes("cost") && "CHF"}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {setting.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {setting.isDefault ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Default
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          Custom
                        </span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEdit(setting)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(setting._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
