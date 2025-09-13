import React from "react";
import useSettingsValue from "../../hooks/useSettingsValue";

/**
 * Component to display the current cost per kilometer rate
 * Can be used in expense forms and calculations
 * @param {Object} props - Component props
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.useDefault - Whether to use default setting (if true) or user setting
 */
const ExpenseRateDisplay = ({ className, useDefault = false }) => {
  const [costPerKilometer, loading, refreshRate] = useSettingsValue(
    "costPerKilometer",
    0.7,
    useDefault
  );

  if (loading) {
    return (
      <div className={`text-sm font-medium text-gray-500 ${className}`}>
        Loading rate...
      </div>
    );
  }

  return (
    <div
      className={`text-sm font-medium flex justify-between items-center ${className}`}
    >
      <div>
        {useDefault ? "Default rate: " : "Current rate: "}
        <span className="text-blue-600 font-semibold">
          {costPerKilometer.toFixed(2)} CHF
        </span>{" "}
        per kilometer
      </div>
      <button
        onClick={refreshRate}
        className="text-xs text-blue-600 hover:text-blue-800 ml-2 p-1"
        title="Refresh rate"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-3 w-3"
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
      </button>
    </div>
  );
};

export default ExpenseRateDisplay;
