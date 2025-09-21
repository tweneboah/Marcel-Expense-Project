import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { getAllSettings } from "../api/settingsApi";

// Create the context
const SettingsContext = createContext();

// Custom hook to use the settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};

// Provider component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({});
  const [defaultSettings, setDefaultSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Function to fetch all settings
  const fetchSettings = async (force = false) => {
    // Skip if already fetched unless forced
    if (fetchAttemptedRef.current && !force) {
      return;
    }

    // Mark that we've attempted a fetch
    fetchAttemptedRef.current = true;

    try {
      setLoading(true);
      setError(null);

      const response = await getAllSettings();

      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      // Process settings data if valid
      if (response?.data && Array.isArray(response.data)) {
        // Regular settings
        const settingsObj = {};
        // Default settings
        const defaultObj = {};

        // Process each setting
        response.data.forEach((setting) => {
          if (setting && setting.key) {
            // Store all settings in the settings object
            settingsObj[setting.key] = setting.value;

            // If it's a default setting, also store in defaultSettings
            if (setting.isDefault === true) {
              defaultObj[setting.key] = setting.value;
            }
          }
        });

        setSettings(settingsObj);
        setDefaultSettings(defaultObj);
      }

      setLoading(false);
    } catch (err) {
      if (isMountedRef.current) {
        // Error handled by error context
        setError("Failed to load application settings");
        setLoading(false);
      }
    }
  };

  // Initialize settings on component mount
  useEffect(() => {
    isMountedRef.current = true;
    fetchSettings(true);

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Value object to be provided by the context
  const value = {
    settings,
    defaultSettings,
    loading,
    error,
    refreshSettings: () => fetchSettings(true),
    // Include a legacy handler for backward compatibility
    getDefaultSettings: () => {
      // getDefaultSettings is deprecated
      return Promise.resolve({
        success: true,
        data: Object.keys(defaultSettings).map((key) => ({
          key,
          value: defaultSettings[key],
          isDefault: true,
        })),
      });
    },
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
