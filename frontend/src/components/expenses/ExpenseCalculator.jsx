import React, { useState, useEffect } from "react";
import useSettingsValue from "../../hooks/useSettingsValue";
import ExpenseRateDisplay from "./ExpenseRateDisplay";

/**
 * Component to calculate expense costs based on distance and settings rates
 * @param {Object} props - Component props
 * @param {number} props.distance - The distance in kilometers
 * @param {Function} props.onCalculated - Callback when calculation is complete
 * @param {boolean} props.useDefaultRates - Whether to use default rates instead of custom rates
 */
const ExpenseCalculator = ({
  distance,
  onCalculated,
  useDefaultRates = false,
}) => {
  const [costPerKilometer, loading, refreshCostRate] = useSettingsValue(
    "costPerKilometer",
    0.7,
    useDefaultRates
  );

  const [cateringAllowance, cateringLoading, refreshCateringRate] =
    useSettingsValue("cateringAllowance", 30, useDefaultRates);

  const [
    accommodationAllowance,
    accommodationLoading,
    refreshAccommodationRate,
  ] = useSettingsValue("accommodationAllowance", 150, useDefaultRates);

  const [includesCatering, setIncludesCatering] = useState(false);
  const [includesAccommodation, setIncludesAccommodation] = useState(false);
  const [totalCost, setTotalCost] = useState(0);

  // Function to refresh all rates
  const refreshAllRates = () => {
    refreshCostRate();
    refreshCateringRate();
    refreshAccommodationRate();
  };

  // Calculate total cost when inputs change
  useEffect(() => {
    // Wait for settings to load
    if (loading || cateringLoading || accommodationLoading) return;

    let cost = 0;

    // Calculate distance cost
    if (distance && costPerKilometer) {
      cost += distance * costPerKilometer;
    }

    // Add allowances if selected
    if (includesCatering) {
      cost += cateringAllowance;
    }

    if (includesAccommodation) {
      cost += accommodationAllowance;
    }

    setTotalCost(cost);

    // Pass the calculated cost to parent component
    if (onCalculated) {
      onCalculated(cost);
    }
  }, [
    distance,
    costPerKilometer,
    cateringAllowance,
    accommodationAllowance,
    includesCatering,
    includesAccommodation,
    loading,
    cateringLoading,
    accommodationLoading,
    onCalculated,
  ]);

  if (loading || cateringLoading || accommodationLoading) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        Loading expense calculator...
      </div>
    );
  }

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">
          Expense Calculator {useDefaultRates && "(Using Default Rates)"}
        </h3>
        <button
          onClick={refreshAllRates}
          className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
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
          Refresh Rates
        </button>
      </div>

      <div className="mb-4">
        <ExpenseRateDisplay className="mb-2" useDefault={useDefaultRates} />

        <div className="flex items-center mb-2">
          <span className="w-32 text-sm text-gray-600">Distance:</span>
          <span className="font-medium">
            {distance ? `${distance.toFixed(2)} km` : "0.00 km"}
          </span>
        </div>

        <div className="flex items-center mb-2">
          <span className="w-32 text-sm text-gray-600">Distance Cost:</span>
          <span className="font-medium">
            {(distance * costPerKilometer).toFixed(2)} CHF
          </span>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="includesCatering"
            checked={includesCatering}
            onChange={(e) => setIncludesCatering(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="includesCatering" className="text-sm text-gray-700">
            Include Catering Allowance ({cateringAllowance.toFixed(2)} CHF)
          </label>
        </div>

        <div className="flex items-center mb-2">
          <input
            type="checkbox"
            id="includesAccommodation"
            checked={includesAccommodation}
            onChange={(e) => setIncludesAccommodation(e.target.checked)}
            className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="includesAccommodation"
            className="text-sm text-gray-700"
          >
            Include Accommodation Allowance ({accommodationAllowance.toFixed(2)}{" "}
            CHF)
          </label>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-700">
            Total Cost:
          </span>
          <span className="text-xl font-bold text-blue-700">
            {totalCost.toFixed(2)} CHF
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseCalculator;
