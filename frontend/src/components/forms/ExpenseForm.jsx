import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getPlaceDetails,
  calculateDistance,
  calculateRouteWithWaypoints,
  formatDistance,
  calculateTotalCost,
} from "../../utils/googleMaps";
import {
  createExpense,
  getExpenseCategories,
  previewEnhancedNotes,
  updateExpense,
} from "../../api/expenseApi";
import { useExpenseRoutes } from "../../utils/routeHelpers";
import { useAuth } from "../../context/AuthContext";
import useSettingsValue from "../../hooks/useSettingsValue";
import { useApiCall, useFormSubmit } from "../../hooks/useApiCall";
import { useError } from "../../context/ErrorContext";
import PlaceAutocomplete from "./PlaceAutocomplete";
import Button from "../ui/Button";
import Stepper from "../ui/Stepper";
import MapView from "../ui/MapView";
import GoogleMapComponent from "../ui/GoogleMapComponent";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiMapPin,
  FiArrowRight,
  FiArrowLeft,
  FiCalendar,
  FiTag,
  FiTrendingUp,
  FiDollarSign,
  FiFileText,
  FiAlertTriangle,
  FiCheckCircle,
  FiRefreshCw,
  FiMap,
} from "react-icons/fi";
import { FaRoute, FaMapMarkedAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import { formatCurrency } from "../../utils/formatters";

import "react-datepicker/dist/react-datepicker.css";

const ExpenseForm = ({ initialData = {}, isEdit = false }) => {
  const navigate = useNavigate();
  const routes = useExpenseRoutes();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [enhancedNotes, setEnhancedNotes] = useState("");
  const [notesPreviewLoading, setNotesPreviewLoading] = useState(false);
  const [useEnhancedNotes, setUseEnhancedNotes] = useState(true);
  const [showEnhancedNotes, setShowEnhancedNotes] = useState(false);
  const [waypoints, setWaypoints] = useState(initialData.waypoints || []);
  const [optimizeRoute, setOptimizeRoute] = useState(false);

  // Get cost per km from settings API with fallback to default
  const [costPerKm, costPerKmLoading] = useSettingsValue(
    "costPerKilometer",
    0.7
  );

  const [formData, setFormData] = useState({
    startLocation: initialData.startLocation || "",
    endLocation: initialData.endLocation || "",
    startPlaceId: initialData.startPlaceId || "",
    endPlaceId: initialData.endPlaceId || "",
    waypoints: initialData.waypoints || [],
    distanceInKm: initialData.distanceInKm || 0,
    costPerKm: initialData.costPerKm || 0.7, // Will be updated from settings
    totalCost: initialData.totalCost || 0,
    expenseDate:
      initialData.expenseDate || new Date().toISOString().split("T")[0],
    categoryId: initialData.categoryId || "",
    notes: initialData.notes || "",
    status: initialData.status || "pending",
  });

  // Update costPerKm in formData when it's loaded from settings
  useEffect(() => {
    if (!costPerKmLoading && costPerKm !== null) {
      setFormData((prev) => ({
        ...prev,
        costPerKm,
        // Recalculate total cost if distance is already set
        totalCost: prev.distanceInKm
          ? prev.distanceInKm * costPerKm
          : prev.totalCost,
      }));
    }
  }, [costPerKm, costPerKmLoading]);

  // Track origin and destination for map view
  const [originPlace, setOriginPlace] = useState(null);
  const [destinationPlace, setDestinationPlace] = useState(null);
  const [waypointPlaces, setWaypointPlaces] = useState([]);
  const [routeSnapshot, setRouteSnapshot] = useState(null);
  const [showMap, setShowMap] = useState(false);

  // Animation variants
  const pageVariants = {
    hidden: {
      opacity: 0,
      x: 20,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      x: -20,
      transition: { duration: 0.2 },
    },
  };

  // When initialData changes and we're in edit mode, update the form
  useEffect(() => {
    if (isEdit && initialData && Object.keys(initialData).length > 0) {

      // Handle notes that might be stored as JSON string
      let notesValue = initialData.notes || "";
      let enhancedValue = "";

      if (typeof notesValue === "string" && notesValue.startsWith("{")) {
        try {
          const parsedNotes = JSON.parse(notesValue);
          if (parsedNotes.original) {
            notesValue = parsedNotes.original;
            enhancedValue = parsedNotes.enhanced || "";
            setShowEnhancedNotes(!!enhancedValue);
            setEnhancedNotes(enhancedValue);
          }
        } catch (err) {
          // Failed to parse notes JSON - continue with original value
        }
      }

      // Handle waypoints
      if (initialData.waypoints && Array.isArray(initialData.waypoints)) {
        setWaypoints(initialData.waypoints);
      }

      // Set form data with the existing expense values
      setFormData({
        startLocation:
          initialData.startLocation || initialData.startingPoint || "",
        endLocation:
          initialData.endLocation || initialData.destinationPoint || "",
        startPlaceId:
          initialData.startPlaceId || initialData.startingPointPlaceId || "",
        endPlaceId:
          initialData.endPlaceId || initialData.destinationPointPlaceId || "",
        waypoints: initialData.waypoints || [],
        distanceInKm: initialData.distanceInKm || initialData.distance || 0,
        costPerKm: initialData.costPerKm || 0.7,
        totalCost: initialData.totalCost || 0,
        expenseDate:
          initialData.expenseDate ||
          initialData.journeyDate ||
          new Date().toISOString().split("T")[0],
        categoryId:
          initialData.categoryId ||
          initialData.category?._id ||
          initialData.category,
        notes: notesValue,
        status: initialData.status || "pending",
      });

      // If we have route data in the initialData, set it for the map
      if (initialData.routeSnapshot) {
        setRouteSnapshot(initialData.routeSnapshot);
        setShowMap(true);
      }

      // Move to the final step when editing
      setCurrentStep(6);
    }
  }, [isEdit, initialData]);

  // Use unified error handling for fetching categories
  const { execute: fetchCategories, loading: fetchCategoriesLoading, error: fetchCategoriesError } = useApiCall({
    onSuccess: (result) => {
      // Extract categories array from result
      const categoriesData = result.categories || [];

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);

        // Set default category if available and not already set
        if (categoriesData.length > 0 && !formData.categoryId) {
          const defaultCategory =
            categoriesData.find(
              (cat) => cat.name.toLowerCase() === "travel"
            ) || categoriesData[0];
          setFormData((prev) => ({
            ...prev,
            categoryId: defaultCategory._id,
          }));
        }
      } else {
        setCategories([]);
      }
    }
  });

  // Fetch expense categories on mount
  useEffect(() => {
    fetchCategories(() => getExpenseCategories({ isActive: true }), {
      context: { component: 'ExpenseForm', action: 'fetchCategories' }
    });
  }, [fetchCategories]);

  // Development helper function to reload categories
  const reloadCategories = async () => {
    try {
      setCategoriesLoading(true);
      setCategoriesError(null);

      const result = await getExpenseCategories({ isActive: true });

      // Extract categories array from result
      const categoriesData = result.categories || [];

      if (Array.isArray(categoriesData)) {
        setCategories(categoriesData);
      } else {
        setCategoriesError("Invalid categories data structure");
        setCategories([]);
      }
    } catch (err) {
      setCategoriesError(`Failed to load: ${err.message}`);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear errors for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }

    // Recalculate total cost when costPerKm changes
    if (name === "costPerKm" && formData.distanceInKm > 0) {
      const newTotalCost = calculateTotalCost(
        formData.distanceInKm,
        parseFloat(value)
      );
      setFormData((prev) => ({
        ...prev,
        totalCost: newTotalCost,
      }));
    }

    // If notes field changed and we have enough context, trigger enhancement after user stops typing
    if (
      name === "notes" &&
      value.trim().length > 5 &&
      formData.startLocation &&
      formData.endLocation &&
      formData.distanceInKm
    ) {
      // Clear any existing timeout to debounce API calls
      if (window.enhanceNotesTimeout) {
        clearTimeout(window.enhanceNotesTimeout);
      }

      // Set a new timeout to enhance notes after 1 second of no typing
      window.enhanceNotesTimeout = setTimeout(() => {
        handleEnhanceNotes();
      }, 1000);
    }
  };

  // Update formatPlaceForMap to ensure correct structure for MapView
  const formatPlaceForMap = (place) => {
    if (!place) return null;

    // Ensure we have a location object with lat/lng
    if (
      place.location &&
      typeof place.location.lat === "number" &&
      typeof place.location.lng === "number"
    ) {
      return {
        placeId: place.placeId,
        description:
          place.description || place.name || place.formattedAddress || "",
        formattedAddress: place.formattedAddress || "",
        location: place.location,
      };
    }
    return null;
  };

  // Update function to handle origin place selection
  const handleOriginSelected = async (place) => {
    setFormData({
      ...formData,
      startLocation: place.description || place.formattedAddress,
      startPlaceId: place.placeId,
    });

    try {
      const placeDetails = await getPlaceDetails(place.placeId);
      setOriginPlace(formatPlaceForMap(placeDetails));
    } catch (err) {
      setFormErrors({
        ...formErrors,
        startLocation: "Failed to get place details",
      });
    }
  };

  // Update function to handle destination place selection
  const handleDestinationSelected = async (place) => {
    setFormData({
      ...formData,
      endLocation: place.description || place.formattedAddress,
      endPlaceId: place.placeId,
    });

    try {
      const placeDetails = await getPlaceDetails(place.placeId);
      setDestinationPlace(formatPlaceForMap(placeDetails));
    } catch (err) {
      setFormErrors({
        ...formErrors,
        endLocation: "Failed to get place details",
      });
    }
  };

  // Update function to handle waypoint place selection
  const handleWaypointSelected = async (place, index) => {
    const updatedWaypoints = [...waypoints];
    updatedWaypoints[index] = {
      ...updatedWaypoints[index],
      description: place.description || place.formattedAddress,
      placeId: place.placeId,
    };
    setWaypoints(updatedWaypoints);

    try {
      const placeDetails = await getPlaceDetails(place.placeId);
      const formattedPlace = formatPlaceForMap(placeDetails);

      const updatedWaypointPlaces = [...waypointPlaces];
      updatedWaypointPlaces[index] = formattedPlace;
      setWaypointPlaces(updatedWaypointPlaces);
    } catch (err) {
      // Error handling without console logging
    }
  };

  // Handle waypoint management
  const addWaypoint = () => {
    // Create an empty waypoint entry
    const newWaypoint = { placeId: "", description: "" };
    setWaypoints([...waypoints, newWaypoint]);
  };

  const removeWaypoint = (index) => {
    const newWaypoints = [...waypoints];
    newWaypoints.splice(index, 1);
    setWaypoints(newWaypoints);

    // Also update formData.waypoints to keep them in sync
    setFormData((prev) => ({
      ...prev,
      waypoints: newWaypoints,
    }));
  };

  // Calculate route distance
  const calculateRouteDistance = async () => {
    try {
      if (!formData.startPlaceId || !formData.endPlaceId) {
        setFormErrors((prev) => ({
          ...prev,
          startLocation: "Please select both start and end locations",
        }));
        return;
      }

      setCalculating(true);
      setFormErrors((prev) => ({ ...prev, startLocation: null }));

      let result;

      // Filter out any waypoints without placeId
      const validWaypoints = waypoints.filter((wp) => wp && wp.placeId);

      // If we have waypoints, use the route with waypoints calculation
      if (validWaypoints.length > 0) {
        result = await calculateRouteWithWaypoints(
          { placeId: formData.startPlaceId },
          { placeId: formData.endPlaceId },
          validWaypoints,
          { optimize: optimizeRoute }
        );
      } else {
        // Otherwise use the simple distance calculation
        result = await calculateDistance(
          { placeId: formData.startPlaceId },
          { placeId: formData.endPlaceId }
        );
      }

      if (!result || typeof result.distanceValue !== "number") {
        throw new Error("Invalid distance calculation result");
      }

      // Convert distance from meters to kilometers (if needed)
      // The API might return distance in meters, we need kilometers
      let distanceInKm;
      if (result.distanceValue > 1000) {
        // If the value is large, it's probably in meters
        distanceInKm = result.distanceValue / 1000;
      } else {
        // Otherwise assume it's already in kilometers
        distanceInKm = result.distanceValue;
      }

      // Ensure distance is positive
      if (distanceInKm <= 0) {
        throw new Error("Invalid distance: must be positive");
      }

      // Use the costPerKm from state when calculating
      const calculatedTotalCost = calculateTotalCost(
        distanceInKm,
        formData.costPerKm
      );

      // If we have optimized waypoints, update the waypoints order
      if (
        result.optimizedWaypointOrder &&
        result.optimizedWaypointOrder.length > 0
      ) {
        const optimizedWaypoints = [];
        result.optimizedWaypointOrder.forEach((orderInfo) => {
          optimizedWaypoints.push(validWaypoints[orderInfo.originalIndex]);
        });
        setWaypoints(optimizedWaypoints);
      }

      setFormData((prev) => ({
        ...prev,
        waypoints: validWaypoints,
        distanceInKm: distanceInKm,
        totalCost: calculatedTotalCost,
        distanceText: result.distanceText || `${distanceInKm.toFixed(2)} km`,
        durationText: result.durationText || "Unknown duration",
        routeSnapshot: result, // Store full route data for later use
      }));

      // If we have a route result with polyline and bounds, save it for the map
      if (result && result.route) {
        setRouteSnapshot({
          origin: originPlace,
          destination: destinationPlace,
          waypoints: waypointPlaces,
          distanceValue: result.distanceValue,
          durationValue: result.durationValue,
          durationText: result.durationText,
          route: {
            overview_polyline: result.route.overview_polyline,
            bounds: result.route.bounds,
          },
        });
      }

      setCurrentStep(6); // Move to expense details step
    } catch (err) {
      setFormErrors((prev) => ({
        ...prev,
        startLocation: "Failed to calculate distance. Please try again.",
      }));
    } finally {
      setCalculating(false);
    }
  };

  // Request AI-enhanced notes preview
  const handleEnhanceNotes = async () => {
    try {
      if (!formData.notes?.trim()) {
        return; // Don't request if notes are empty
      }

      setNotesPreviewLoading(true);
      setShowEnhancedNotes(true);

      const previewData = {
        notes: formData.notes,
        startingPoint: formData.startLocation,
        destinationPoint: formData.endLocation,
        distance: formData.distanceInKm,
        totalCost: formData.totalCost,
        journeyDate: formData.expenseDate,
        categoryId: formData.categoryId,
      };

      const result = await previewEnhancedNotes(previewData);

      if (result && result.enhanced) {
        setEnhancedNotes(result.enhanced);
      } else {
        setEnhancedNotes(formData.notes);
      }
    } catch (err) {
      setError("Failed to enhance notes. Using original text.");
      setEnhancedNotes(formData.notes);
    } finally {
      setNotesPreviewLoading(false);
    }
  };

  // Validate form data
  const validateForm = () => {
    const errors = {};

    // Check for required fields
    if (!formData.categoryId) {
      errors.categoryId = "Category is required";
    }

    if (!formData.expenseDate) {
      errors.expenseDate = "Journey date is required";
    } else {
      const journeyDate = new Date(formData.expenseDate);
      const today = new Date();

      // Clear time portion for comparison
      today.setHours(0, 0, 0, 0);

      if (journeyDate > today) {
        errors.expenseDate = "Journey date cannot be in the future";
      }
    }

    if (!formData.startLocation) {
      errors.startLocation = "Starting point is required";
    } else if (
      formData.startLocation.length < 2 ||
      formData.startLocation.length > 100
    ) {
      errors.startLocation =
        "Starting point must be between 2 and 100 characters";
    }

    if (!formData.endLocation) {
      errors.endLocation = "Destination point is required";
    } else if (
      formData.endLocation.length < 2 ||
      formData.endLocation.length > 100
    ) {
      errors.endLocation =
        "Destination point must be between 2 and 100 characters";
    }

    if (formData.distanceInKm <= 0) {
      errors.distanceInKm = "Valid distance calculation is required";
    }

    if (formData.costPerKm <= 0) {
      errors.costPerKm = "Cost per kilometer must be greater than zero";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      // Make sure distance is a positive number
      if (!formData.distanceInKm || formData.distanceInKm <= 0) {
        setFormErrors((prev) => ({
          ...prev,
          distanceInKm: "Distance must be a positive number",
        }));
        setLoading(false);
        return;
      }

      // Map frontend field names to backend expected names
      const expenseData = {
        // Category ID - backend expects "category"
        category: formData.categoryId,

        // Journey date - backend expects "journeyDate"
        journeyDate: formData.expenseDate,

        // Locations - backend expects "startingPoint" and "destinationPoint"
        startingPoint: formData.startLocation,
        destinationPoint: formData.endLocation,

        // Place IDs - backend expects "startingPointPlaceId" and "destinationPointPlaceId"
        startingPointPlaceId: formData.startPlaceId,
        destinationPointPlaceId: formData.endPlaceId,

        // Waypoints - pass through the waypoints array
        waypoints: waypoints,

        // Route optimization
        optimizeWaypoints: optimizeRoute,

        // Distance - backend expects "distance" in a positive number
        distance: parseFloat(formData.distanceInKm),

        // Cost per km - backend expects "costPerKm"
        costPerKm: parseFloat(formData.costPerKm),

        // Total cost - calculated by backend if not provided
        totalCost: parseFloat(formData.totalCost),

        // Notes - prepare for AI-enhanced or regular notes
        notes:
          useEnhancedNotes && enhancedNotes
            ? JSON.stringify({
                original: formData.notes,
                enhanced: enhancedNotes,
              })
            : formData.notes,

        // If we have a route snapshot, include it
        routeSnapshot: formData.routeSnapshot,
      };

      // Include status field if admin user and in edit mode
      if (user?.role === "admin" && isEdit) {
        expenseData.status = formData.status;
      }

      let result;
      if (isEdit && initialData._id) {
        // Update existing expense
        result = await updateExpense(initialData._id, expenseData);
      } else {
        // Create new expense
        result = await createExpense(expenseData);
      }

      // Redirect to expense details page after successful operation
      navigate(routes.detail(result.data._id));
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          `Failed to ${isEdit ? "update" : "create"} expense. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Add a toggle map function
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Render waypoints selection UI
  const renderWaypointsStep = () => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-[#FCA311]/10 p-2 rounded-full">
            <FiMapPin className="h-5 w-5 text-[#FCA311]" />
          </div>
          <h3 className="text-xl font-medium text-[#14213D]">
            Add Waypoints (Optional)
          </h3>
        </div>

        <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-600">
            <FiMapPin className="text-[#14213D]" />
            <span>Starting Point:</span>
            <span className="font-medium text-gray-900">
              {formData.startLocation}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <FiMapPin className="text-[#FCA311]" />
            <span>Destination:</span>
            <span className="font-medium text-gray-900">
              {formData.endLocation}
            </span>
          </div>
        </div>

        {waypoints.map((waypoint, index) => (
          <div
            key={`waypoint-${index}`}
            className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-sm font-medium flex items-center gap-1">
                <span className="bg-[#FCA311] text-white rounded-full w-5 h-5 inline-flex items-center justify-center text-xs">
                  {index + 1}
                </span>
                <span>Waypoint {index + 1}</span>
              </h4>
              <button
                type="button"
                onClick={() => removeWaypoint(index)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                Remove
              </button>
            </div>
            <div className="mb-2">
              <PlaceAutocomplete
                label={"Location"}
                placeholder="Enter a waypoint location"
                onPlaceSelect={(place) => handleWaypointSelected(place, index)}
                initialValue={waypoint.description || ""}
              />
            </div>
          </div>
        ))}

        <div className="flex items-center justify-between mt-4">
          <button
            type="button"
            onClick={addWaypoint}
            className="flex items-center space-x-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
          >
            <span>Add Waypoint</span>
            <FiMapPin className="h-4 w-4" />
          </button>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="optimizeRoute"
              checked={optimizeRoute}
              onChange={() => setOptimizeRoute(!optimizeRoute)}
              className="h-4 w-4 text-blue-600 rounded"
            />
            <label htmlFor="optimizeRoute" className="text-sm text-gray-700">
              Optimize route order
            </label>
          </div>
        </div>

        {formData.startPlaceId && formData.endPlaceId && (
          <div className="mt-6">
            <button
              type="button"
              onClick={toggleMap}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#14213D]/10 hover:bg-[#14213D]/20 text-[#14213D] rounded-md transition-colors"
            >
              <FiMap className="h-4 w-4" />
              <span>{showMap ? "Hide Route Map" : "Show Route Map"}</span>
            </button>
          </div>
        )}

        {showMap && (
          <div className="mt-4 h-[300px] border border-gray-200 rounded-lg overflow-hidden">
            <GoogleMapComponent
              origin={originPlace}
              destination={destinationPlace}
              waypoints={waypointPlaces.filter((wp) => wp !== null)}
              height="300px"
            />
          </div>
        )}

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500 mb-4">
            {waypoints.length === 0
              ? "No waypoints added. The direct route will be calculated."
              : `${waypoints.length} waypoint(s) will be included in the route calculation.`}
          </p>
        </div>

        {/* Add navigation buttons */}
        <div className="flex justify-between pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handlePrevious}
            className="border-[#14213D]/20 text-[#14213D] gap-2"
          >
            <FiArrowLeft className="h-4 w-4" /> Back
          </Button>
          <Button
            type="button"
            onClick={handleNext}
            className="bg-[#14213D] hover:bg-[#14213D]/90 focus:ring-[#14213D]/50 gap-2"
          >
            Next <FiArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  // Render step content
  const renderStepContent = () => {
    return (
      <AnimatePresence mode="wait">
        {currentStep === 1 && (
          <motion.div
            key="step1"
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#7678ed]/10 p-2 rounded-full">
                <FiMapPin className="h-5 w-5 text-[#7678ed]" />
              </div>
              <h3 className="text-xl font-medium text-[#3d348b]">
                Starting Location
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Enter the starting point of your journey. You can type an address,
              location name, or use the autosuggest feature.
            </p>

            <div className="relative">
              <label className="block text-sm font-medium text-[#3d348b] mb-2">
                Starting Point <span className="text-[#f35b04]">*</span>
              </label>
              <PlaceAutocomplete
                onPlaceSelect={handleOriginSelected}
                initialValue={formData.startLocation}
                placeholder="Enter starting location"
                required
                className={`block w-full px-4 py-3 border-2 ${
                  formErrors.startLocation
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#7678ed]"
                } rounded-lg shadow-sm focus:outline-none focus:ring-[#7678ed]/20 focus:ring-2 transition-all duration-200`}
              />
              {formErrors.startLocation && (
                <motion.p
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiAlertTriangle className="h-4 w-4" />
                  {formErrors.startLocation}
                </motion.p>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button
                type="button"
                onClick={handleNext}
                disabled={!formData.startLocation}
                className="bg-[#3d348b] hover:bg-[#3d348b]/90 focus:ring-[#3d348b]/50 gap-2"
              >
                Next <FiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && (
          <motion.div
            key="step2"
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#f7b801]/10 p-2 rounded-full">
                <FiCheckCircle className="h-5 w-5 text-[#f7b801]" />
              </div>
              <h3 className="text-xl font-medium text-[#3d348b]">
                Confirm Starting Location
              </h3>
            </div>

            <div className="bg-[#7678ed]/5 p-5 rounded-lg border border-[#7678ed]/20">
              <p className="text-sm text-gray-600 mb-2">
                Selected Starting Point:
              </p>
              <div className="flex items-center gap-2 mb-4">
                <FiMapPin className="h-5 w-5 text-[#f35b04]" />
                <span className="font-medium text-[#3d348b]">
                  {formData.startLocation}
                </span>
              </div>

              <p className="text-sm text-gray-500">
                Please confirm this is the correct starting location for your
                journey.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className="border-[#3d348b]/20 text-[#3d348b] gap-2"
              >
                <FiArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#3d348b] hover:bg-[#3d348b]/90 focus:ring-[#3d348b]/50 gap-2"
              >
                Confirm <FiCheckCircle className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 3 && (
          <motion.div
            key="step3"
            className="space-y-6"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#7678ed]/10 p-2 rounded-full">
                <FiMapPin className="h-5 w-5 text-[#7678ed]" />
              </div>
              <h3 className="text-xl font-medium text-[#3d348b]">
                Destination Location
              </h3>
            </div>

            <p className="text-gray-600 mb-6">
              Enter the destination point of your journey. You can type an
              address, location name, or use the autosuggest feature.
            </p>

            <div className="relative">
              <label className="block text-sm font-medium text-[#3d348b] mb-2">
                Destination Point <span className="text-[#f35b04]">*</span>
              </label>
              <PlaceAutocomplete
                onPlaceSelect={handleDestinationSelected}
                initialValue={formData.endLocation}
                placeholder="Enter destination location"
                required
                className={`block w-full px-4 py-3 border-2 ${
                  formErrors.endLocation
                    ? "border-red-500"
                    : "border-gray-300 focus:border-[#7678ed]"
                } rounded-lg shadow-sm focus:outline-none focus:ring-[#7678ed]/20 focus:ring-2 transition-all duration-200`}
              />
              {formErrors.endLocation && (
                <motion.p
                  className="mt-2 text-sm text-red-500 flex items-center gap-1"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <FiAlertTriangle className="h-4 w-4" />
                  {formErrors.endLocation}
                </motion.p>
              )}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className="border-[#3d348b]/20 text-[#3d348b] gap-2"
              >
                <FiArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                disabled={!formData.endLocation}
                className="bg-[#3d348b] hover:bg-[#3d348b]/90 focus:ring-[#3d348b]/50 gap-2"
              >
                Next <FiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 4 && renderWaypointsStep()}

        {currentStep === 5 && (
          <motion.div
            key="step5"
            className="space-y-4"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FCA311]/10 p-2 rounded-full">
                <FiTrendingUp className="h-5 w-5 text-[#FCA311]" />
              </div>
              <h3 className="text-xl font-medium text-[#14213D]">
                Calculate Route Distance
              </h3>
            </div>

            <div className="bg-[#FCA311]/5 p-5 rounded-lg border border-[#FCA311]/20">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Journey Route:</p>
                <div className="flex items-center gap-2 font-medium text-[#14213D]">
                  <FiMapPin className="h-4 w-4 text-[#FCA311]" />
                  <span>{formData.startLocation}</span>
                  <FiArrowRight className="h-4 w-4 text-gray-400" />
                  {waypoints.length > 0 && (
                    <>
                      <span className="text-sm text-gray-500">
                        {waypoints.length} waypoint
                        {waypoints.length > 1 ? "s" : ""}
                      </span>
                      <FiArrowRight className="h-4 w-4 text-gray-400" />
                    </>
                  )}
                  <span>{formData.endLocation}</span>
                </div>
              </div>

              {showMap && (
                <div className="mb-4 h-[250px] border border-gray-200 rounded-lg overflow-hidden">
                  <GoogleMapComponent
                    origin={originPlace}
                    destination={destinationPlace}
                    waypoints={waypointPlaces.filter((wp) => wp !== null)}
                    height="250px"
                  />
                </div>
              )}

              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <button
                  type="button"
                  onClick={calculateRouteDistance}
                  disabled={calculating}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#14213D] text-white rounded-md hover:bg-[#14213D]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {calculating ? (
                    <>
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                      <span>Calculating...</span>
                    </>
                  ) : (
                    <>
                      <FiTrendingUp className="h-4 w-4" />
                      <span>Calculate Distance</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={toggleMap}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#14213D]/10 hover:bg-[#14213D]/20 text-[#14213D] rounded-md transition-colors"
                >
                  <FiMap className="h-4 w-4" />
                  <span>{showMap ? "Hide Route Map" : "Show Route Map"}</span>
                </button>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Distance:</span>
                  <span className="font-medium">
                    {formatDistance(formData.distanceInKm)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Cost Per Kilometer:</span>
                  <span className="font-medium">{formData.costPerKm} CHF</span>
                </div>
                <div className="flex justify-between font-medium text-[#14213D]">
                  <span>Total Cost:</span>
                  <span>{parseFloat(formData.totalCost).toFixed(2)} CHF</span>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className="border-[#14213D]/20 text-[#14213D] gap-2"
              >
                <FiArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="button"
                onClick={handleNext}
                className="bg-[#14213D] hover:bg-[#14213D]/90 focus:ring-[#14213D]/50 gap-2"
              >
                Next <FiArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {currentStep === 6 && (
          <motion.div
            key="step6"
            className="space-y-4"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-[#FCA311]/10 p-2 rounded-full">
                <FiDollarSign className="h-5 w-5 text-[#FCA311]" />
              </div>
              <h3 className="text-xl font-medium text-[#14213D]">
                Complete Expense Details
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <FiCalendar className="h-4 w-4 text-[#FCA311]" />
                  Date <span className="text-[#FCA311]">*</span>
                </label>
                <input
                  type="date"
                  name="expenseDate"
                  value={formData.expenseDate}
                  onChange={handleChange}
                  required
                  className={`block w-full px-4 py-3 border-2 ${
                    formErrors.expenseDate
                      ? "border-red-500"
                      : "border-gray-300 focus:border-[#FCA311]"
                  } rounded-lg shadow-sm focus:outline-none focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200`}
                />
                {formErrors.expenseDate && (
                  <motion.p
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiAlertTriangle className="h-4 w-4" />
                    {formErrors.expenseDate}
                  </motion.p>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <FiTag className="h-4 w-4 text-[#FCA311]" />
                  Category <span className="text-[#FCA311]">*</span>
                </label>
                {categoriesLoading ? (
                  <div className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm bg-gray-50 flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-[#FCA311] border-t-transparent rounded-full"></div>
                    <span>Loading categories...</span>
                  </div>
                ) : categoriesError ? (
                  <div className="flex flex-col gap-2">
                    <div className="block w-full px-4 py-3 border-2 border-red-300 rounded-lg shadow-sm bg-red-50 text-red-800 flex items-center gap-2">
                      <FiAlertTriangle className="h-4 w-4" />
                      {categoriesError}
                    </div>
                    <button
                      type="button"
                      onClick={reloadCategories}
                      className="self-end text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <FiRefreshCw className="h-3 w-3" /> Reload Categories
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="categoryId"
                      value={formData.categoryId}
                      onChange={handleChange}
                      required
                      className={`block w-full px-4 py-3 border-2 ${
                        formErrors.categoryId
                          ? "border-red-500"
                          : "border-gray-300 focus:border-[#FCA311]"
                      } rounded-lg shadow-sm focus:outline-none focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200`}
                    >
                      <option value="">Select a category</option>
                      {Array.isArray(categories) && categories.length > 0 ? (
                        categories.map((category) => (
                          <option key={category._id} value={category._id}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>
                          No categories available
                        </option>
                      )}
                    </select>
                    {process.env.NODE_ENV !== "production" && (
                      <button
                        type="button"
                        onClick={reloadCategories}
                        className="absolute right-0 top-0 h-full px-3 text-blue-600 hover:text-blue-800"
                        title="Reload categories (debug)"
                      >
                        <FiRefreshCw className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}
                {formErrors.categoryId && (
                  <motion.p
                    className="mt-2 text-sm text-red-500 flex items-center gap-1"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <FiAlertTriangle className="h-4 w-4" />
                    {formErrors.categoryId}
                  </motion.p>
                )}
              </div>
            </div>

            {/* Cost Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <FiTrendingUp className="h-4 w-4 text-[#FCA311]" />
                  Distance
                </label>
                <input
                  type="text"
                  value={formatDistance(formData.distanceInKm)}
                  readOnly
                  className="block w-full px-4 py-3 bg-[#14213D]/5 border-2 border-[#14213D]/10 rounded-lg shadow-sm font-medium text-[#14213D]"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <FiDollarSign className="h-4 w-4 text-[#FCA311]" />
                  Cost per Kilometer (CHF)
                </label>
                <input
                  type="number"
                  name="costPerKm"
                  value={formData.costPerKm}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <FiDollarSign className="h-4 w-4 text-[#FCA311]" />
                  Total Cost (CHF)
                </label>
                <input
                  type="text"
                  value={formData.totalCost.toFixed(2)}
                  readOnly
                  className="block w-full px-4 py-3 bg-[#FCA311]/10 border-2 border-[#FCA311]/20 rounded-lg shadow-sm font-medium text-[#14213D]"
                />
              </div>
            </div>

            {/* Notes */}
            <div className="pt-2">
              <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                <FiFileText className="h-4 w-4 text-[#FCA311]" />
                Notes
              </label>
              <div className="space-y-3">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
                  placeholder="Enter any additional information about this expense"
                />

                {notesPreviewLoading && (
                  <div className="flex items-center justify-center py-3">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-[#FCA311] mr-2"></div>
                    <span className="text-sm text-gray-600">
                      Enhancing your notes with AI...
                    </span>
                  </div>
                )}

                {showEnhancedNotes && enhancedNotes && !notesPreviewLoading && (
                  <div className="bg-[#FCA311]/5 p-4 border border-[#FCA311]/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-[#14213D]">
                        AI Enhanced Notes
                      </span>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-2">
                          Use enhanced version
                        </span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={useEnhancedNotes}
                            onChange={() =>
                              setUseEnhancedNotes(!useEnhancedNotes)
                            }
                            className="sr-only peer"
                          />
                          <div className="w-9 h-5 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-[#FCA311]/50 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FCA311]"></div>
                        </label>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700">{enhancedNotes}</div>
                  </div>
                )}

                {formData.notes &&
                  !showEnhancedNotes &&
                  !notesPreviewLoading && (
                    <button
                      type="button"
                      onClick={handleEnhanceNotes}
                      className="text-sm text-[#FCA311] hover:text-[#FCA311]/80 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 12l-4 4-4-4M12 8v8" />
                      </svg>
                      Enhance with AI
                    </button>
                  )}
              </div>
            </div>

            {/* Status (Admin Only) */}
            {isAdmin && isEdit && (
              <div className="pt-4 border-t border-gray-200 mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-[#14213D] mb-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 text-[#FCA311]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  Expense Status
                </label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="block w-full px-4 py-3 border-2 border-gray-300 rounded-lg shadow-sm focus:outline-none focus:border-[#FCA311] focus:ring-[#FCA311]/20 focus:ring-2 transition-all duration-200"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {formData.status === "pending"
                    ? "This expense is waiting for review."
                    : formData.status === "approved"
                    ? "This expense has been approved."
                    : "This expense has been rejected."}
                </p>
              </div>
            )}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={handlePrevious}
                className="border-[#14213D]/20 text-[#14213D] gap-2"
              >
                <FiArrowLeft className="h-4 w-4" /> Back
              </Button>
              <Button
                type="submit"
                disabled={loading}
                isLoading={loading}
                className="bg-[#FCA311] hover:bg-[#FCA311]/90 focus:ring-[#FCA311]/50 gap-2"
              >
                <FiDollarSign className="h-4 w-4" />{" "}
                {isEdit ? "Update" : "Create"} Expense
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Update steps for stepper based on our current flow
  const steps = [
    { name: "Start", icon: <FiMapPin />, color: "#7678ed" },
    { name: "Confirm", icon: <FiCheckCircle />, color: "#f7b801" },
    { name: "Destination", icon: <FiMapPin />, color: "#7678ed" },
    { name: "Waypoints", icon: <FiArrowRight />, color: "#f7b801" },
    { name: "Calculate", icon: <FiTrendingUp />, color: "#3d348b" },
    { name: "Details", icon: <FiDollarSign />, color: "#f35b04" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <motion.div
          className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiAlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      <Stepper currentStep={currentStep} />
      {renderStepContent()}
    </form>
  );
};

export default ExpenseForm;
