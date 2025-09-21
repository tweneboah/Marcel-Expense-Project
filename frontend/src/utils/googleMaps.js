import apiConfig from "../api/apiConfig";

/**
 * Get place suggestions based on user input using Google Places Autocomplete API
 * @param {string} query - The user input to search for places
 * @returns {Promise<Array>} - Array of place suggestions
 */
export const getPlaceSuggestions = async (query) => {
  try {
    const response = await apiConfig.get("/maps/places/autocomplete", {
      params: { input: query },
    });
    return response.data.data.map((prediction) => ({
      placeId: prediction.placeId,
      description: prediction.description,
      mainText: prediction.description.split(",")[0],
      secondaryText: prediction.description
        .split(",")
        .slice(1)
        .join(",")
        .trim(),
    }));
  } catch (error) {
    throw error;
  }
};

/**
 * Get details for a place using its place ID
 * @param {string} placeId - The Google Place ID
 * @returns {Promise<Object>} - Place details
 */
export const getPlaceDetails = async (placeId) => {
  try {
    const response = await apiConfig.get(`/maps/places/details/${placeId}`);

    const placeData = response.data.data;
    return {
      placeId: placeData.placeId,
      name: placeData.name,
      formattedAddress: placeData.formattedAddress,
      location: placeData.location,
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate distance between two places
 * @param {Object} origin - Origin place with placeId
 * @param {Object} destination - Destination place with placeId
 * @returns {Promise<Object>} - Distance and duration information
 */
export const calculateDistance = async (origin, destination) => {
  try {
    const response = await apiConfig.post("/maps/distance", {
      originPlaceId: origin.placeId,
      destinationPlaceId: destination.placeId,
    });

    // Handle different response structures
    const result = response.data.data || response.data;

    // Ensure we have distance value
    if (!result || typeof result.distanceValue !== "number") {
      throw new Error("Failed to calculate distance");
    }

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate route with multiple waypoints
 * @param {Object} origin - Origin place with placeId
 * @param {Object} destination - Destination place with placeId
 * @param {Array<Object>} waypoints - Array of waypoints with placeId
 * @param {Object} options - Additional route options
 * @returns {Promise<Object>} - Route information with distance and duration
 */
export const calculateRouteWithWaypoints = async (
  origin,
  destination,
  waypoints = [],
  options = {}
) => {
  try {
    // Ensure we have valid waypoints array
    if (!waypoints || !Array.isArray(waypoints) || waypoints.length === 0) {
      throw new Error("Please provide at least one waypoint");
    }

    // Format waypoints for the API - ensure we pass the full waypoint objects
    const formattedWaypoints = waypoints
      .map((wp) => {
        // If waypoint is a string (just a placeId)
        if (typeof wp === "string") {
          return { placeId: wp };
        }
        // If waypoint is an object with placeId
        else if (wp && typeof wp === "object" && wp.placeId) {
          return {
            placeId: wp.placeId,
            stopover: wp.stopover !== false, // default to true if not specified
            description: wp.description || "",
          };
        }
        // Skip invalid waypoints
        return null;
      })
      .filter(Boolean); // Remove any null entries

    // Ensure we have at least one valid waypoint after filtering
    if (formattedWaypoints.length === 0) {
      throw new Error("No valid waypoints provided after formatting");
    }

    try {
      // Try with backend API first
      const response = await apiConfig.post("/maps/route/optimize", {
        originPlaceId: origin.placeId,
        destinationPlaceId: destination.placeId,
        waypoints: formattedWaypoints,
        optimizeWaypoints: options.optimize === true,
        includeAlternatives: options.includeAlternatives === true,
      });

      // Handle different response structures
      const result = response.data.data || response.data;

      // Ensure we have distance value
      if (!result || typeof result.distanceValue !== "number") {
        throw new Error("Failed to calculate route");
      }

      return result;
    } catch (backendError) {
      // If the backend API fails, try with a direct distance calculation
      // Fallback: Calculate distance between origin and destination directly
      const distanceResult = await calculateDistance(origin, destination);

      // Create a simplified result object
      return {
        distanceValue: distanceResult.distanceValue,
        distanceText: distanceResult.distanceText,
        durationValue: distanceResult.durationValue,
        durationText: distanceResult.durationText,
        route: {
          overview_polyline: null, // We don't have polyline in the fallback
          bounds: null, // We don't have bounds in the fallback
        },
        waypoints: formattedWaypoints,
        waypointsOptimized: false,
      };
    }
  } catch (error) {
    throw error;
  }
};

/**
 * Format distance in kilometers with 2 decimal places
 * @param {number} distanceInKm - Distance in kilometers
 * @returns {string} - Formatted distance string
 */
export const formatDistance = (distanceInKm) => {
  // Handle undefined, null, or invalid distance values
  if (
    distanceInKm === undefined ||
    distanceInKm === null ||
    isNaN(distanceInKm)
  ) {
    return "0.00 km";
  }
  return `${Number(distanceInKm).toFixed(2)} km`;
};

/**
 * Format a duration value in seconds
 * @param {number} durationInSeconds - Duration in seconds
 * @returns {string} - Formatted duration string
 */
export const formatDuration = (durationInSeconds) => {
  if (!durationInSeconds) return "0 min";

  const hours = Math.floor(durationInSeconds / 3600);
  const minutes = Math.floor((durationInSeconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${minutes} min`;
  }

  return `${minutes} min`;
};

/**
 * Calculate total cost based on distance and cost per km
 * @param {number} distanceInKm - Distance in kilometers
 * @param {number} costPerKm - Cost per kilometer in CHF
 * @returns {number} - Total cost in CHF
 */
export const calculateTotalCost = (distanceInKm, costPerKm) => {
  return parseFloat(distanceInKm) * parseFloat(costPerKm);
};

/**
 * Get route data from a stored snapshot
 * @param {Object} routeSnapshot - The stored route snapshot
 * @returns {Object} - Formatted route information
 */
export const getRouteFromSnapshot = (routeSnapshot) => {
  if (!routeSnapshot) {
    return null;
  }

  try {
    // Extract key information from the snapshot
    const {
      distanceValue,
      durationValue,
      durationText,
      origin,
      destination,
      waypoints,
      route,
    } = routeSnapshot;

    return {
      distanceValue,
      durationValue,
      durationText: durationText || formatDuration(durationValue),
      route: {
        origin,
        destination,
        waypoints: waypoints || [],
        polyline: route?.overview_polyline,
        bounds: route?.bounds,
      },
    };
  } catch (error) {
    return null;
  }
};

/**
 * Format route data for display or storage
 * @param {Object} routeData - Raw route data from API
 * @returns {Object} - Formatted route data
 */
export const formatRouteData = (routeData) => {
  if (!routeData) {
    return null;
  }

  return {
    distance: {
      text: routeData.distanceText || formatDistance(routeData.distanceValue),
      value: routeData.distanceValue, // kilometers
    },
    duration: {
      text: routeData.durationText || formatDuration(routeData.durationValue),
      value: routeData.durationValue, // seconds
    },
    origin: routeData.origin,
    destination: routeData.destination,
    waypoints: routeData.waypoints || [],
    legs: routeData.legs || [],
    polyline: routeData.route?.overview_polyline,
    bounds: routeData.route?.bounds,
  };
};
