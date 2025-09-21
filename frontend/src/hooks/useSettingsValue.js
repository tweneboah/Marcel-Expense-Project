import { useState, useEffect, useRef } from "react";
import { useSettings } from "../context/SettingsContext";
import { getSettingByKey } from "../api/settingsApi";

/**
 * A hook to get a specific setting value with an optional default value
 * @param {string} key - The setting key to retrieve
 * @param {any} defaultValue - Default value to use if setting doesn't exist
 * @param {boolean} preferDefault - Whether to prefer default setting over custom setting
 * @returns {[any, boolean, Function]} - The setting value, loading state, and refresh function
 */
const useSettingsValue = (key, defaultValue = null, preferDefault = false) => {
  const [value, setValue] = useState(defaultValue);
  const [isLoading, setIsLoading] = useState(false);
  const mountedRef = useRef(false);
  const hasFetchedRef = useRef(false);
  const timeoutRef = useRef(null);

  // Function to fetch the setting with built-in circuit breaker
  const fetchSettingValue = async () => {
    // Don't fetch if we've already tried or component unmounted
    if (hasFetchedRef.current || !mountedRef.current) return;

    try {
      setIsLoading(true);
      hasFetchedRef.current = true;

      const response = await getSettingByKey(key);

      if (mountedRef.current && response?.data?.value !== undefined) {
        setValue(response.data.value);
      }
    } catch (error) {
      // Error handled by error context
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  // Only fetch once on component mount
  useEffect(() => {
    mountedRef.current = true;

    if (!hasFetchedRef.current) {
      fetchSettingValue();
    }

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [key]);

  // Create a refresh function that refreshes this specific setting
  const refreshValue = () => {
    // Prevent concurrent refreshes
    if (isLoading || !mountedRef.current) return Promise.resolve();

    // Reset fetched status to allow a new fetch
    hasFetchedRef.current = false;

    // Add a small delay to prevent rapid consecutive calls
    return new Promise((resolve) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        fetchSettingValue().finally(resolve);
      }, 300);
    });
  };

  return [value, isLoading, refreshValue];
};

export default useSettingsValue;
