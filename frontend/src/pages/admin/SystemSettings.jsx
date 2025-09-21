import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FiSettings,
  FiDollarSign,
  FiCheck,
  FiAlertCircle,
  FiCreditCard,
  FiHome,
  FiTruck,
  FiSave,
} from "react-icons/fi";
import Settings from "../settings/Settings";
import { useSettings } from "../../context/SettingsContext";
import {
  createSetting,
  updateSetting,
  getSettingByKey,
} from "../../api/settingsApi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const SystemSettings = () => {
  const { settings: appSettings, loading, refreshSettings } = useSettings();
  const [localSettings, setLocalSettings] = useState({
    costPerKilometer: 0.7,
    cateringAllowance: 30.0,
    accommodationAllowance: 150.0,
    otherAllowances: {
      tollFee: true,
      vignette: true,
    },
  });

  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [settingsIds, setSettingsIds] = useState({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingIds, setLoadingIds] = useState(false);

  // Update local settings when app settings are loaded
  useEffect(() => {
    if (appSettings) {
      setLocalSettings((prevSettings) => ({
        ...prevSettings,
        costPerKilometer:
          appSettings.costPerKilometer || prevSettings.costPerKilometer,
        cateringAllowance:
          appSettings.cateringAllowance || prevSettings.cateringAllowance,
        accommodationAllowance:
          appSettings.accommodationAllowance ||
          prevSettings.accommodationAllowance,
      }));

      // Only load setting IDs if they haven't been loaded yet
      if (Object.keys(settingsIds).length === 0 && !loadingIds) {
        loadSettingIds();
      }
    }
  }, [appSettings]);

  // Load setting IDs for updates
  const loadSettingIds = async () => {
    setLoadingIds(true);
    const ids = {};
    try {
      // Try to get the IDs of existing settings
      const keysToFetch = [
        "costPerKilometer",
        "cateringAllowance",
        "accommodationAllowance",
      ];
      const fetchPromises = keysToFetch.map(async (key) => {
        try {
          const response = await getSettingByKey(key);
          if (response && response.data && response.data._id) {
            ids[key] = response.data._id;
          }
        } catch (err) {
          // No existing setting found
          // This is fine, it just means the setting doesn't exist yet
        }
      });

      await Promise.all(fetchPromises);
      setSettingsIds(ids);
    } catch (error) {
      // Error handled by error context
    } finally {
      setLoadingIds(false);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 12,
      },
    },
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLocalSettings({
      ...localSettings,
      [name]: parseFloat(value),
    });
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setLocalSettings({
      ...localSettings,
      otherAllowances: {
        ...localSettings.otherAllowances,
        [name]: checked,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSavingSettings(true);

    try {
      // Save each setting to the API
      const settingsToUpdate = [
        {
          key: "costPerKilometer",
          value: localSettings.costPerKilometer,
          description:
            "Cost rate per kilometer in CHF for expense calculations",
        },
        {
          key: "cateringAllowance",
          value: localSettings.cateringAllowance,
          description: "Daily catering allowance in CHF",
        },
        {
          key: "accommodationAllowance",
          value: localSettings.accommodationAllowance,
          description: "Daily accommodation allowance in CHF",
        },
      ];

      // Process each setting - update if exists, create if doesn't
      for (const setting of settingsToUpdate) {
        const id = settingsIds[setting.key];

        if (id) {
          // Update existing setting
          await updateSetting(id, {
            value: setting.value,
            description: setting.description,
          });
        } else {
          // Create new setting
          const response = await createSetting(setting);
          if (response && response.data && response.data._id) {
            // Store the new ID for future updates
            setSettingsIds((prev) => ({
              ...prev,
              [setting.key]: response.data._id,
            }));
          }
        }
      }

      // Show success message
      setShowSaveSuccess(true);
      toast.success("Settings updated successfully!");
      setTimeout(() => {
        setShowSaveSuccess(false);
      }, 3000);

      // Refresh settings from the API
      setTimeout(() => {
        refreshSettings();
      }, 500);
    } catch (error) {
      // Error handled by error context
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setSavingSettings(false);
    }
  };

  // If loading settings and we don't have any local values, show a loader
  if (loading && Object.keys(localSettings).length <= 3) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="container mx-auto px-4 py-8 max-w-5xl"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <ToastContainer position="top-right" autoClose={3000} />
      <motion.div
        className="flex items-center mb-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <FiSettings className="text-[#f7b801] mr-3 text-2xl" />
        <h1 className="text-3xl font-bold text-[#3d348b]">System Settings</h1>
      </motion.div>

      <motion.p
        className="text-gray-600 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Configure global settings for the expense application
      </motion.p>

      <div className="grid grid-cols-1 gap-8">
        {/* API-Driven Settings Component */}
        <motion.div className="col-span-1" variants={itemVariants}>
          <Settings />
        </motion.div>

        {/* Legacy UI Settings (Optional - can be removed if using only API-driven settings) */}
        <motion.div className="col-span-1" variants={itemVariants}>
          {showSaveSuccess && (
            <motion.div
              className="mb-6 p-4 rounded-lg flex items-center"
              style={{ backgroundColor: "rgba(247, 184, 1, 0.1)" }}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FiCheck className="text-[#f7b801] mr-3 text-xl" />
              <span className="font-medium text-gray-800">
                Settings updated successfully!
              </span>
            </motion.div>
          )}

          <motion.div
            className="bg-white shadow-md rounded-xl p-6 border border-gray-100"
            variants={itemVariants}
          >
            <form onSubmit={handleSubmit}>
              <motion.div className="mb-8" variants={itemVariants}>
                <div className="flex items-center mb-4">
                  <FiDollarSign className="text-[#7678ed] mr-2 text-xl" />
                  <h2 className="text-xl font-semibold text-[#3d348b]">
                    Reimbursement Rates
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Cost per Kilometer (CHF)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">CHF</span>
                      </div>
                      <input
                        type="number"
                        name="costPerKilometer"
                        value={localSettings.costPerKilometer}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] py-2 transition-all"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Amount reimbursed per kilometer traveled.
                    </p>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Catering Allowance (CHF)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">CHF</span>
                      </div>
                      <input
                        type="number"
                        name="cateringAllowance"
                        value={localSettings.cateringAllowance}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] py-2 transition-all"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Daily allowance for meals when traveling.
                    </p>
                  </div>

                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Accommodation Allowance (CHF)
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">CHF</span>
                      </div>
                      <input
                        type="number"
                        name="accommodationAllowance"
                        value={localSettings.accommodationAllowance}
                        onChange={handleInputChange}
                        className="block w-full pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-[#7678ed] focus:border-[#7678ed] py-2 transition-all"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                    <p className="mt-2 text-sm text-gray-500">
                      Maximum allowance for overnight stays.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div className="mb-8" variants={itemVariants}>
                <div className="flex items-center mb-4">
                  <FiCreditCard className="text-[#f35b04] mr-2 text-xl" />
                  <h2 className="text-xl font-semibold text-[#3d348b]">
                    Other Reimbursable Expenses
                  </h2>
                </div>

                <div className="space-y-4 bg-gray-50 rounded-lg p-5">
                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="tollFee"
                        name="tollFee"
                        type="checkbox"
                        checked={localSettings.otherAllowances.tollFee}
                        onChange={handleCheckboxChange}
                        className="focus:ring-[#7678ed] h-5 w-5 text-[#7678ed] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="tollFee"
                        className="font-medium text-gray-700 flex items-center"
                      >
                        <FiTruck className="text-[#f7b801] mr-2" />
                        Road Tolls
                      </label>
                      <p className="text-gray-500 mt-1 ml-6">
                        Allow reimbursement for road tolls
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="vignette"
                        name="vignette"
                        type="checkbox"
                        checked={localSettings.otherAllowances.vignette}
                        onChange={handleCheckboxChange}
                        className="focus:ring-[#7678ed] h-5 w-5 text-[#7678ed] border-gray-300 rounded"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label
                        htmlFor="vignette"
                        className="font-medium text-gray-700 flex items-center"
                      >
                        <FiHome className="text-[#f35b04] mr-2" />
                        Vignette
                      </label>
                      <p className="text-gray-500 mt-1 ml-6">
                        Allow reimbursement for highway vignettes
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div className="flex justify-end" variants={itemVariants}>
                <button
                  type="submit"
                  disabled={savingSettings || loadingIds}
                  className="inline-flex justify-center items-center px-6 py-3 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-[#3d348b] hover:bg-[#291f6c] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#7678ed] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {savingSettings ? (
                    <>
                      <span className="inline-block w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <FiSave className="mr-2 -ml-1" />
                      Save Settings
                    </>
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SystemSettings;
