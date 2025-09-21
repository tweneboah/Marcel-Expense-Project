import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExpenseById, deleteExpense } from "../../api/expenseApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { formatDistance } from "../../utils/googleMaps";
import { useExpenseRoutes } from "../../utils/routeHelpers";
import { useAuth } from "../../context/AuthContext";
import { formatDirectionInstruction } from "../../utils/htmlSanitizer";
import { motion } from "framer-motion";
import GoogleMapComponent from "../../components/ui/GoogleMapComponent";
import {
  FiMapPin,
  FiCalendar,
  FiTrendingUp,
  FiTrash2,
  FiEdit,
  FiArrowLeft,
  FiFileText,
  FiClock,
  FiNavigation,
  FiMap,
  FiEye,
  FiEyeOff,
  FiDollarSign,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiSettings,
  FiCornerUpRight,
  FiCornerDownRight,
} from "react-icons/fi";
import {
  FaCar,
  FaRoute,
  FaClipboardCheck,
  FaMoneyBillWave,
  FaLocationArrow,
} from "react-icons/fa";

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
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
      stiffness: 100,
    },
  },
};

const ExpenseDetails = () => {
  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showRouteDetails, setShowRouteDetails] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const routes = useExpenseRoutes();
  const { user } = useAuth();

  // Fetch expense details on component mount
  useEffect(() => {
    const fetchExpenseDetails = async () => {
      // Skip fetching if we're on the create page
      if (id === "new" || id === "create") {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getExpenseById(id);
        // Extract data from the response
        const expenseData = response.data || response;
        setExpense(expenseData);
      } catch (err) {
        // Error handled by error context
        setError("Failed to load expense details. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchExpenseDetails();
  }, [id]);

  // Format date to display in a user-friendly format
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format date and time for audit information
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  // Format currency value
  const formatCurrency = (value) => {
    if (value === undefined || value === null) return "0.00 CHF";
    return `${Number(value).toFixed(2)} CHF`;
  };

  // Handle expense deletion
  const handleDelete = async () => {
    // Only admins can delete expenses
    if (user?.role !== "admin") {
      return;
    }

    try {
      await deleteExpense(id);
      navigate(routes.listUrl);
    } catch (err) {
      // Error handled by error context
      setDeleteError("Failed to delete expense. Please try again.");
      setShowDeleteConfirm(false);
    }
  };

  const handleBack = () => {
    navigate(routes.listUrl);
  };

  // Cancel deletion
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  // Toggle map visibility
  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Check if expense has waypoints
  const hasWaypoints = () => {
    return (
      expense?.waypoints &&
      Array.isArray(expense.waypoints) &&
      expense.waypoints.length > 0
    );
  };

  // Format waypoint address
  const formatWaypointAddress = (waypoint) => {
    if (!waypoint) return "Unknown location";
    return waypoint.description || waypoint.formattedAddress || "Waypoint";
  };

  // Prepare map data from expense
  const prepareMapData = () => {
    if (!expense) return null;

    return {
      origin: {
        location: expense.routeSnapshot?.origin?.location || null,
        placeId: expense.startingPointPlaceId || "",
        description: expense.startingPoint || "",
      },
      destination: {
        location: expense.routeSnapshot?.destination?.location || null,
        placeId: expense.destinationPointPlaceId || "",
        description: expense.destinationPoint || "",
      },
      waypoints: (expense.waypoints || []).map((waypoint) => ({
        location: waypoint.location || null,
        placeId: waypoint.placeId || "",
        description: formatWaypointAddress(waypoint),
        stopover: true,
      })),
    };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="flex flex-col items-center justify-center h-64"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="w-16 h-16 border-t-4 border-b-4 border-[#7678ed] rounded-full animate-spin mb-4"></div>
          <p className="text-[#3d348b] font-medium">Loading expense data...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert variant="error" title="Error!">
            {error}
          </Alert>
        </motion.div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Alert variant="warning" title="No Expense Found">
            The requested expense could not be found.
          </Alert>
        </motion.div>
      </div>
    );
  }

  // Map backend fields to frontend names
  const startLocation = expense.startingPoint || expense.startLocation;
  const endLocation = expense.destinationPoint || expense.endLocation;
  const distance = expense.distance || expense.distanceInKm;
  const costPerKm = expense.costPerKm;
  const totalCost = expense.totalCost;
  const journeyDate = expense.journeyDate || expense.expenseDate;
  const categoryName = expense.category?.name || "";
  const status = expense.status || "pending";
  const notes = expense.notes || "";
  const duration = expense.duration || "";

  // Get status color based on expense status
  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
    }
  };

  // Get status icon based on expense status
  const getStatusIcon = (status) => {
    switch (status) {
      case "approved":
        return <FiCheckCircle className="mr-1" />;
      case "rejected":
        return <FiXCircle className="mr-1" />;
      default:
        return <FiAlertCircle className="mr-1" />;
    }
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header Section */}
      <motion.div
        className="mb-6 bg-gradient-to-r from-[#3d348b] to-[#7678ed] rounded-xl shadow-lg overflow-hidden"
        variants={itemVariants}
      >
        <div className="p-6 text-white">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <h1 className="text-2xl font-bold mb-2 flex items-center">
                <FaCar className="mr-2" /> Expense Details
              </h1>
              <div className="flex items-center mb-4">
                <FiCalendar className="mr-2" />
                <span className="font-medium">{formatDate(journeyDate)}</span>
                {categoryName && (
                  <span className="ml-2 px-3 py-1 bg-[#f7b801] text-[#3d348b] rounded-full text-xs font-bold">
                    {categoryName}
                  </span>
                )}
                <span
                  className={`ml-2 px-3 py-1 flex items-center rounded-full text-xs font-bold ${
                    status === "approved"
                      ? "bg-green-500 text-white"
                      : status === "rejected"
                      ? "bg-red-500 text-white"
                      : "bg-yellow-400 text-[#3d348b]"
                  }`}
                >
                  {getStatusIcon(status)}
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </span>
              </div>
            </div>

            <div className="flex space-x-2 mt-4 md:mt-0">
              <Button
                variant="secondary"
                onClick={handleBack}
                icon={<FiArrowLeft />}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              >
                Back
              </Button>
              <Button
                variant="secondary"
                icon={<FiEdit />}
                onClick={() => navigate(routes.editPath(expense._id))}
                className="bg-[#f7b801] hover:bg-[#f7b801]/90 text-[#3d348b] border-none"
              >
                Edit
              </Button>
              {user?.role === "admin" && (
                <Button
                  variant="danger"
                  icon={<FiTrash2 />}
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-[#f35b04] hover:bg-[#f35b04]/90 text-white border-none"
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Journey Route Card */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card className="border-l-4 border-[#7678ed]">
          <h2 className="text-xl font-bold mb-6 text-[#3d348b] border-b pb-3 flex items-center">
            <FaRoute className="mr-3 text-[#7678ed]" /> Journey Route
          </h2>

          <div className="flex flex-col mb-6">
            <div className="relative pl-8">
              <div className="absolute left-0 top-0 h-full w-0.5 bg-[#7678ed]"></div>
              <div className="absolute left-[-5px] top-0 h-4 w-4 rounded-full bg-[#3d348b] border-2 border-white"></div>
              <div className="mb-4">
                <p className="font-bold text-[#3d348b]">Starting Point</p>
                <p className="text-gray-700">{startLocation}</p>
              </div>
            </div>

            {hasWaypoints() && (
              <div className="relative pl-8 my-2">
                <div className="absolute left-0 top-0 h-full w-0.5 bg-[#7678ed]"></div>
                <div className="absolute left-[-5px] top-0 h-4 w-4 rounded-full bg-[#f7b801] border-2 border-white"></div>
                <div>
                  <p className="font-bold text-[#f7b801]">Via</p>
                  <ul className="list-none space-y-2">
                    {expense.waypoints.map((waypoint, index) => (
                      <li key={index} className="flex items-center">
                        <FiCornerDownRight className="mr-2 text-[#f7b801]" />
                        <span>{formatWaypointAddress(waypoint)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="relative pl-8">
              {hasWaypoints() && (
                <div className="absolute left-0 top-0 h-1/2 w-0.5 bg-[#7678ed]"></div>
              )}
              <div className="absolute left-[-5px] top-0 h-4 w-4 rounded-full bg-[#f35b04] border-2 border-white"></div>
              <div>
                <p className="font-bold text-[#f35b04]">Destination</p>
                <p className="text-gray-700">{endLocation}</p>
              </div>
            </div>
          </div>

          {/* Route Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#7678ed]/10 mr-3">
                <FiMapPin className="text-[#7678ed] text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Distance</p>
                <p className="font-bold text-[#3d348b]">
                  {formatDistance(distance)}
                </p>
              </div>
            </div>

            {expense?.routeSnapshot?.durationText && (
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-[#f7b801]/10 mr-3">
                  <FiClock className="text-[#f7b801] text-xl" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Estimated Duration</p>
                  <p className="font-bold text-[#3d348b]">
                    {expense.routeSnapshot.durationText}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#f35b04]/10 mr-3">
                <FaLocationArrow className="text-[#f35b04] text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Stops</p>
                <p className="font-bold text-[#3d348b]">
                  {hasWaypoints()
                    ? `${expense.waypoints.length} waypoint${
                        expense.waypoints.length > 1 ? "s" : ""
                      }`
                    : "Direct route"}
                </p>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Cost Details Card */}
      <motion.div variants={itemVariants} className="mb-6">
        <Card className="border-l-4 border-[#f7b801]">
          <h2 className="text-xl font-bold mb-6 text-[#3d348b] border-b pb-3 flex items-center">
            <FaMoneyBillWave className="mr-3 text-[#f7b801]" /> Cost Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#3d348b]/10 mr-3">
                <FiSettings className="text-[#3d348b] text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Cost per Kilometer</p>
                <p className="font-bold text-[#3d348b]">
                  {formatCurrency(costPerKm)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="p-3 rounded-full bg-[#7678ed]/10 mr-3">
                <FiTrendingUp className="text-[#7678ed] text-xl" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Distance</p>
                <p className="font-bold text-[#3d348b]">
                  {formatDistance(distance)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gradient-to-r from-[#f7b801] to-[#f35b04] rounded-lg text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/70">Total Cost</p>
                  <p className="font-bold text-2xl">
                    {formatCurrency(totalCost)}
                  </p>
                </div>
                <FiDollarSign className="text-3xl opacity-70" />
              </div>
            </div>
          </div>

          {notes && (
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-medium flex items-center text-[#3d348b] mb-2">
                <FiFileText className="mr-2" /> Notes
              </h3>
              <p className="text-gray-700">
                {(() => {
                  if (!notes) return "No notes provided.";

                  // Check if notes is a JSON string with original/enhanced structure
                  if (typeof notes === "string" && notes.startsWith("{")) {
                    try {
                      const parsedNotes = JSON.parse(notes);
                      // Return enhanced notes if available, otherwise original
                      return (
                        parsedNotes.enhanced || parsedNotes.original || notes
                      );
                    } catch (e) {
                      // If parsing fails, return the original string
                      return notes;
                    }
                  }

                  // If it's already plain text, return as is
                  return notes;
                })()}
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Map Toggle and Display */}
      {expense.routeSnapshot?.origin?.location && (
        <motion.div variants={itemVariants} className="mb-6">
          <Button
            onClick={toggleMap}
            icon={showMap ? <FiEyeOff /> : <FiEye />}
            className={`w-full ${
              showMap
                ? "bg-[#3d348b] hover:bg-[#3d348b]/90"
                : "bg-[#7678ed] hover:bg-[#7678ed]/90"
            } text-white`}
          >
            {showMap ? "Hide Route Map" : "Show Route Map"}
          </Button>

          {showMap && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                transition: {
                  height: { duration: 0.3 },
                  opacity: { delay: 0.1, duration: 0.3 },
                },
              }}
              className="mt-4"
            >
              <div
                className="border border-gray-200 rounded-lg overflow-hidden shadow-lg"
                style={{ height: "500px" }}
              >
                <GoogleMapComponent
                  origin={{
                    location: expense.routeSnapshot.origin.location,
                    placeId: expense.startingPointPlaceId,
                    description: startLocation,
                  }}
                  destination={{
                    location: expense.routeSnapshot.destination.location,
                    placeId: expense.destinationPointPlaceId,
                    description: endLocation,
                  }}
                  waypoints={(expense.waypoints || []).map((waypoint) => ({
                    location: waypoint.location,
                    placeId: waypoint.placeId,
                    description: formatWaypointAddress(waypoint),
                    stopover: true,
                  }))}
                  height="500px"
                />
              </div>
            </motion.div>
          )}

          {/* Route details toggle - only visible when map is displayed */}
          {showMap &&
            expense.routeSnapshot?.route?.legs &&
            expense.routeSnapshot.route.legs.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-4"
              >
                <Button
                  onClick={() => setShowRouteDetails(!showRouteDetails)}
                  icon={showRouteDetails ? <FiEyeOff /> : <FiEye />}
                  className={`w-full ${
                    showRouteDetails
                      ? "bg-[#f35b04] hover:bg-[#f35b04]/90"
                      : "bg-[#f7b801] hover:bg-[#f7b801]/90"
                  } text-white`}
                >
                  {showRouteDetails
                    ? "Hide Route Details"
                    : "Show Route Details"}
                </Button>
              </motion.div>
            )}

          {/* Route details content */}
          {showMap &&
            showRouteDetails &&
            expense.routeSnapshot?.route?.legs &&
            expense.routeSnapshot.route.legs.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{
                  opacity: 1,
                  height: "auto",
                  transition: {
                    height: { duration: 0.3 },
                    opacity: { delay: 0.1, duration: 0.3 },
                  },
                }}
                className="mt-4"
              >
                <Card className="border-l-4 border-[#f35b04]">
                  <h2 className="text-xl font-bold mb-6 text-[#3d348b] border-b pb-3 flex items-center">
                    <FiNavigation className="mr-3 text-[#f35b04]" /> Route
                    Instructions
                  </h2>

                  {/* Trip legs */}
                  <div className="space-y-6">
                    {expense.routeSnapshot.route.legs.map((leg, legIndex) => (
                      <div key={`leg-${legIndex}`} className="mb-6">
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 mb-4">
                          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                            <div className="flex items-center mb-2 md:mb-0">
                              <div className="p-2 rounded-full bg-[#7678ed]/10 mr-3">
                                <FiMapPin className="text-[#7678ed] text-lg" />
                              </div>
                              <div className="font-medium truncate">
                                {leg.start_address}
                              </div>
                            </div>
                            <div className="hidden md:block text-[#3d348b]">
                              →
                            </div>
                            <div className="flex items-center">
                              <div className="p-2 rounded-full bg-[#f35b04]/10 mr-3">
                                <FiMapPin className="text-[#f35b04] text-lg" />
                              </div>
                              <div className="font-medium truncate">
                                {leg.end_address}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className="px-3 py-1 bg-[#7678ed]/10 text-[#7678ed] rounded-full text-xs font-medium flex items-center">
                              <FiTrendingUp className="mr-1" />{" "}
                              {leg.distance?.text || formatDistance(distance)}
                            </span>
                            <span className="px-3 py-1 bg-[#f7b801]/10 text-[#f7b801] rounded-full text-xs font-medium flex items-center">
                              <FiClock className="mr-1" />{" "}
                              {leg.duration?.text || ""}
                            </span>
                            {leg.steps && leg.steps[0]?.travel_mode && (
                              <span className="px-3 py-1 bg-[#3d348b]/10 text-[#3d348b] rounded-full text-xs font-medium flex items-center">
                                <FaCar className="mr-1" />{" "}
                                {leg.steps[0].travel_mode}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Steps for this leg */}
                        <div className="pl-4 border-l-2 border-[#7678ed]/30">
                          <h3 className="font-medium text-[#3d348b] mb-4">
                            Step-by-Step Instructions
                          </h3>
                          <div className="space-y-4">
                            {leg.steps.map((step, stepIndex) => (
                              <motion.div
                                key={`step-${legIndex}-${stepIndex}`}
                                whileHover={{ x: 4 }}
                                className="p-3 hover:bg-gray-50 rounded-md transition-colors"
                              >
                                <div className="flex">
                                  <div className="flex-shrink-0 mr-3">
                                    <div className="bg-[#f7b801] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium">
                                      {stepIndex + 1}
                                    </div>
                                  </div>
                                  <div className="flex-grow">
                                    <div className="font-medium text-gray-700 mb-1">
                                      {formatDirectionInstruction(step.html_instructions)}
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {step.distance && (
                                        <span className="px-2 py-0.5 bg-[#7678ed]/10 text-[#7678ed] rounded-full text-xs">
                                          {step.distance.text}
                                        </span>
                                      )}
                                      {step.duration && (
                                        <span className="px-2 py-0.5 bg-[#f7b801]/10 text-[#f7b801] rounded-full text-xs">
                                          {step.duration.text}
                                        </span>
                                      )}
                                      {step.maneuver && (
                                        <span className="px-2 py-0.5 bg-[#f35b04]/10 text-[#f35b04] rounded-full text-xs">
                                          {step.maneuver.replace(/-/g, " ")}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </motion.div>
            )}
        </motion.div>
      )}

      {/* Audit Information */}
      <motion.div variants={itemVariants}>
        <Card className="border-t-4 border-[#3d348b]">
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <p className="text-xs text-gray-500 flex items-center">
                <FaClipboardCheck className="mr-1 text-[#3d348b]" /> Created on
              </p>
              <p className="font-medium">{formatDateTime(expense.createdAt)}</p>
            </div>
            {expense.updatedAt && expense.updatedAt !== expense.createdAt && (
              <div className="mt-3 md:mt-0">
                <p className="text-xs text-gray-500 flex items-center">
                  <FiEdit className="mr-1 text-[#7678ed]" /> Last updated
                </p>
                <p className="font-medium">
                  {formatDateTime(expense.updatedAt)}
                </p>
              </div>
            )}
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-xl font-bold text-[#3d348b] mb-4">
              Confirm Deletion
            </h3>
            <p className="mb-6">
              Are you sure you want to delete this expense? This action cannot
              be undone.
            </p>

            {deleteError && (
              <div className="mb-4 p-2 border border-red-300 bg-red-50 text-red-800 rounded">
                {deleteError}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={cancelDelete}>
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                className="bg-[#f35b04] hover:bg-[#f35b04]/90 text-white"
              >
                Delete Expense
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ExpenseDetails;
