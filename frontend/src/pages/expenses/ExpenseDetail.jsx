import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useExpenseRoutes } from "../../utils/routeHelpers";
import MapView from "../../components/ui/MapView";
import GoogleMapComponent from "../../components/ui/GoogleMapComponent";
import { getRouteSnapshot } from "../../api/expenseApi";
import { FiMap, FiMapPin, FiTrendingUp, FiArrowRight } from "react-icons/fi";

const ExpenseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const routes = useExpenseRoutes();

  const [expense, setExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      setLoading(true);
      try {
        // This would be an API call in a real app
        // Simulate API call with mock data
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Mock expense data
        const mockExpense = {
          id: parseInt(id),
          date: "2023-10-18",
          startLocation: "Munich",
          endLocation: "Frankfurt",
          startPlaceId: "ChIJ2V-Mo_l1nkcRfZixfUq4DAE", // Munich place ID
          endPlaceId: "ChIJxZZwR28JvUcRAMawKVBDIgQ", // Frankfurt place ID
          distance: 390,
          distanceInKm: 390,
          costPerKm: 0.7,
          totalCost: 273.0,
          status: "pending",
          notes: "Business trip to meet clients",
          createdAt: "2023-10-18T10:30:00Z",
          updatedAt: "2023-10-18T10:30:00Z",
          // Mock for origin location data
          origin: {
            placeId: "ChIJ2V-Mo_l1nkcRfZixfUq4DAE",
            description: "Munich, Germany",
            formattedAddress: "Munich, Germany",
            location: { lat: 48.1351, lng: 11.582 },
          },
          // Mock for destination location data
          destination: {
            placeId: "ChIJxZZwR28JvUcRAMawKVBDIgQ",
            description: "Frankfurt, Germany",
            formattedAddress: "Frankfurt, Germany",
            location: { lat: 50.1109, lng: 8.6821 },
          },
          // Mock waypoints (empty for this example)
          waypoints: [],
        };

        setExpense(mockExpense);

        // Try to fetch route snapshot data
        await fetchRouteData(mockExpense.id);
      } catch (err) {
        setError("Failed to fetch expense data");
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
  }, [id]);

  // Fetch route data for visualization
  const fetchRouteData = async (expenseId) => {
    try {
      // In a real app, this would call the API
      // const routeSnapshot = await getRouteSnapshot(expenseId);

      // For demo purposes, we'll create a mock route snapshot
      const mockRouteSnapshot = {
        origin: {
          placeId: "ChIJ2V-Mo_l1nkcRfZixfUq4DAE",
          description: "Munich, Germany",
          formattedAddress: "Munich, Germany",
          location: { lat: 48.1351, lng: 11.582 },
        },
        destination: {
          placeId: "ChIJxZZwR28JvUcRAMawKVBDIgQ",
          description: "Frankfurt, Germany",
          formattedAddress: "Frankfurt, Germany",
          location: { lat: 50.1109, lng: 8.6821 },
        },
        waypoints: [],
        distanceValue: 390,
        durationValue: 14400, // 4 hours in seconds
        durationText: "4 hours",
        route: {
          overview_polyline:
            "ylraHwtne@eChQ_K`fAsFrWgO|y@wIfl@cJbYiTpr@mNpl@}Qrs@{Qrr@kMbg@eRzz@cJj\\aHdXuO|o@}B|M{Cjo@oAfXwCnf@_Ddb@yC|PwG~WmPjj@yKbr@aK|g@gJf`@gIv_@oQnt@_`@~wAsOtl@sLdb@_Ifu@kHzc@oDvKaC`IyGj[sF~\\kGb_@oE`YyAfPaB`WcBtTiBjWu@bPeAbO_Cp\\kBvR{CdYqDra@oBbPeBhQaE~XiGdb@cGj`@oD|UcE`XmGx]eE~VyIhc@wJpg@gLbi@{Ltd@gF|TcHj]sDlPcKbg@yExUwKvh@gRfy@gGdXcJ~_@iXplAqJlc@gNnn@eLzl@qA`HbOnBfA|@t@hOrCbl@",
          bounds: {
            northeast: { lat: 50.1109, lng: 11.582 },
            southwest: { lat: 48.1351, lng: 8.6821 },
          },
        },
      };

      setRouteData(mockRouteSnapshot);
      setShowMap(true); // Automatically show map when data is available
    } catch (error) {
      // Error handled by error context
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this expense?")) {
      try {
        // This would be an API call in a real app
        // Deleting expense

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        navigate(routes.listUrl);
      } catch (err) {
        setError("Failed to delete expense");
      }
    }
  };

  const toggleMap = () => {
    setShowMap(!showMap);
  };

  // Format location data for the MapView component
  const formatMapLocation = (locationData) => {
    if (!locationData) return null;

    // If location data already has the correct format, return it
    if (
      locationData.location &&
      typeof locationData.location.lat === "number" &&
      typeof locationData.location.lng === "number"
    ) {
      return locationData;
    }

    // Return null if no valid location data is available
    return null;
  };

  // Prepare map data from expense and routeData
  const prepareMapData = () => {
    if (!expense)
      return {
        origin: null,
        destination: null,
        waypoints: [],
        routeData: null,
      };

    // Format origin location for MapView
    const origin = formatMapLocation(expense.origin) || {
      location: expense.origin?.location || null,
      placeId: expense.startPlaceId || expense.startingPointPlaceId,
      description: expense.startLocation || expense.startingPoint || "",
    };

    // Format destination location for MapView
    const destination = formatMapLocation(expense.destination) || {
      location: expense.destination?.location || null,
      placeId: expense.endPlaceId || expense.destinationPointPlaceId,
      description: expense.endLocation || expense.destinationPoint || "",
    };

    // Format waypoints for MapView
    const waypoints = (expense.waypoints || [])
      .map((wp) => formatMapLocation(wp))
      .filter((wp) => wp !== null && wp.location);

    // Format route data for MapView
    const mapRouteData = routeData?.route
      ? {
          polyline: routeData.route.overview_polyline,
          bounds: routeData.route.bounds,
        }
      : null;

    return { origin, destination, waypoints, routeData: mapRouteData };
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 flex justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FCA311]"></div>
          <p>Loading expense data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 border border-red-400 rounded bg-red-50 text-red-800">
          {error}
        </div>
      </div>
    );
  }

  if (!expense) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="p-4 border border-yellow-400 rounded bg-yellow-50 text-yellow-800">
          Expense not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#14213D]">Expense Details</h1>
        <div className="flex space-x-3">
          {expense.status === "pending" && (
            <Link
              to={routes.editPath(id)}
              className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-[#14213D] hover:bg-[#14213D]/90 transition-colors"
            >
              Edit
            </Link>
          )}
          <button
            onClick={handleDelete}
            className="px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Date
              </h3>
              <p className="text-sm text-gray-900">{expense.date}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Status
              </h3>
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                  expense.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : expense.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {expense.status.charAt(0).toUpperCase() +
                  expense.status.slice(1)}
              </span>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Start Location
              </h3>
              <p className="text-sm text-gray-900">{expense.startLocation}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                End Location
              </h3>
              <p className="text-sm text-gray-900">{expense.endLocation}</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Distance
              </h3>
              <p className="text-sm text-gray-900">{expense.distance} km</p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Cost per Kilometer
              </h3>
              <p className="text-sm text-gray-900">
                CHF {expense.costPerKm.toFixed(2)}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Total Cost
              </h3>
              <p className="text-sm font-semibold text-gray-900">
                CHF {expense.totalCost.toFixed(2)}
              </p>
            </div>

            <div>
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                Created
              </h3>
              <p className="text-sm text-gray-900">
                {new Date(expense.createdAt).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Route visualization section */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-[#14213D]">
                <span className="flex items-center gap-2">
                  <FiMap className="text-[#FCA311]" />
                  Route Information
                </span>
              </h3>
              <button
                onClick={toggleMap}
                className="text-sm text-[#14213D] hover:text-[#14213D]/70 flex items-center gap-1"
              >
                {showMap ? "Hide Map" : "Show Map"}
                <FiMap className="h-4 w-4" />
              </button>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-4 flex items-center gap-2 text-sm">
              <FiMapPin className="text-[#14213D]" />
              <span>{expense.startLocation}</span>
              <FiArrowRight className="text-gray-400" />
              {expense.waypoints && expense.waypoints.length > 0 && (
                <>
                  <span className="text-xs text-gray-500">
                    {expense.waypoints.length} waypoint(s)
                  </span>
                  <FiArrowRight className="text-gray-400" />
                </>
              )}
              <span>{expense.endLocation}</span>
              <FiTrendingUp className="text-[#FCA311] ml-auto" />
              <span className="font-medium">{expense.distance} km</span>
            </div>

            {showMap && (
              <div className="h-[400px] mb-6 border border-gray-200 rounded-lg overflow-hidden">
                {(() => {
                  const { origin, destination, waypoints } = prepareMapData();
                  return (
                    <GoogleMapComponent
                      origin={origin}
                      destination={destination}
                      waypoints={waypoints}
                      height="400px"
                    />
                  );
                })()}
              </div>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
              Notes
            </h3>
            <p className="text-sm text-gray-900 whitespace-pre-wrap">
              {(() => {
                if (!expense.notes) return "No notes provided.";
                
                // Check if notes is a JSON string with original/enhanced structure
                if (typeof expense.notes === 'string' && expense.notes.startsWith('{')) {
                  try {
                    const parsedNotes = JSON.parse(expense.notes);
                    // Return enhanced notes if available, otherwise original
                    return parsedNotes.enhanced || parsedNotes.original || expense.notes;
                  } catch (e) {
                    // If parsing fails, return the original string
                    return expense.notes;
                  }
                }
                
                // If it's already plain text, return as is
                return expense.notes;
              })()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between">
          <Link
            to="/expenses"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Expenses
          </Link>

          <button
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            onClick={() => window.print()}
          >
            Print / Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetail;
