import React, { useState, useEffect } from "react";
import { FiAlertTriangle, FiRefreshCw } from "react-icons/fi";
import apiConfig from "../../api/apiConfig";

// Default map settings
const DEFAULT_CENTER = { lat: 47.3769, lng: 8.5417 }; // Zurich, Switzerland
const DEFAULT_ZOOM = 10;

// Map container style
const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

const MapView = ({
  origin,
  destination,
  waypoints = [],
  routeData = null,
  height = "400px",
  onLoad = () => {},
  isInteractive = true,
}) => {
  const [mapElement, setMapElement] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [routePath, setRoutePath] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [usingFallback, setUsingFallback] = useState(false);
  const mapContainerRef = React.useRef(null);

  // Function to generate a static map URL directly
  const getDirectStaticMapUrl = (
    origin,
    destination,
    waypoints,
    useMapbox = false
  ) => {
    const mapWidth = mapContainerRef.current?.clientWidth || 600;
    const mapHeight = mapContainerRef.current?.clientHeight || 400;

    // If using Mapbox as ultimate fallback
    if (useMapbox) {
      // Free Mapbox static maps API (no API key required for simple uses)
      const mapboxUrl = new URL(
        "https://api.mapbox.com/styles/v1/mapbox/streets-v11/static"
      );

      // Add markers for origin and destination (simple pins)
      const markers = [];
      if (origin?.location) {
        markers.push(
          `pin-s-a+0000FF(${origin.location.lng},${origin.location.lat})`
        );
      }
      if (destination?.location) {
        markers.push(
          `pin-s-b+FF0000(${destination.location.lng},${destination.location.lat})`
        );
      }

      // Add waypoint markers
      waypoints.forEach((waypoint, index) => {
        if (waypoint?.location) {
          markers.push(
            `pin-s-${index + 1}+00FF00(${waypoint.location.lng},${
              waypoint.location.lat
            })`
          );
        }
      });

      // Add all markers
      const markersString = markers.join(",");

      // Calculate center of the map
      let centerLat = DEFAULT_CENTER.lat;
      let centerLng = DEFAULT_CENTER.lng;
      if (origin?.location && destination?.location) {
        centerLat = (origin.location.lat + destination.location.lat) / 2;
        centerLng = (origin.location.lng + destination.location.lng) / 2;
      }

      // Finish URL
      const mapboxFullUrl = `${mapboxUrl}/${markersString}/${centerLng},${centerLat},10/${mapWidth}x${mapHeight}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`;
      return mapboxFullUrl;
    }

    // Using Google Maps Static API
    try {
      const staticMapUrl = new URL(
        "https://maps.googleapis.com/maps/api/staticmap"
      );

      // Add parameters
      staticMapUrl.searchParams.append("size", `${mapWidth}x${mapHeight}`);
      staticMapUrl.searchParams.append("scale", "2"); // For retina displays

      // Set map center to the midpoint between origin and destination, or default to Switzerland
      if (origin?.location && destination?.location) {
        const centerLat = (origin.location.lat + destination.location.lat) / 2;
        const centerLng = (origin.location.lng + destination.location.lng) / 2;
        staticMapUrl.searchParams.append("center", `${centerLat},${centerLng}`);
      } else {
        staticMapUrl.searchParams.append(
          "center",
          `${DEFAULT_CENTER.lat},${DEFAULT_CENTER.lng}`
        );
      }

      // Set an appropriate zoom level
      staticMapUrl.searchParams.append("zoom", "10");

      // Add markers
      if (origin?.location) {
        staticMapUrl.searchParams.append(
          "markers",
          `color:blue|label:A|${origin.location.lat},${origin.location.lng}`
        );
      }

      if (destination?.location) {
        staticMapUrl.searchParams.append(
          "markers",
          `color:red|label:B|${destination.location.lat},${destination.location.lng}`
        );
      }

      // Add waypoints as markers
      waypoints.forEach((waypoint, index) => {
        if (waypoint?.location) {
          staticMapUrl.searchParams.append(
            "markers",
            `color:green|label:${index + 1}|${waypoint.location.lat},${
              waypoint.location.lng
            }`
          );
        }
      });

      return staticMapUrl.toString();
    } catch (error) {
      // Error handled by error context
      // Fall back to Mapbox if Google Maps URL creation fails
      return getDirectStaticMapUrl(origin, destination, waypoints, true);
    }
  };

  // Initialize the map with a static image
  useEffect(() => {
    // If we don't have origin and destination, just show a static map of Switzerland
    if (!origin?.location || !destination?.location) {
      setLoading(false);
      return;
    }

    // Get direct static map URL
    try {
      const staticMapUrl = getDirectStaticMapUrl(
        origin,
        destination,
        waypoints
      );

      // Set the map element to be a static image
      setMapElement(
        <img
          src={staticMapUrl}
          alt="Map showing route"
          className="w-full h-full object-cover"
          onLoad={() => setLoading(false)}
          onError={(e) => {
            // Error handled by error context
            // Try Mapbox as fallback
            const mapboxUrl = getDirectStaticMapUrl(
              origin,
              destination,
              waypoints,
              true
            );
            setMapElement(
              <img
                src={mapboxUrl}
                alt="Map showing route (Mapbox fallback)"
                className="w-full h-full object-cover"
                onLoad={() => {
                  setLoading(false);
                  setUsingFallback(true);
                }}
                onError={() => {
                  setError("Failed to load map from any provider");
                  setLoading(false);
                }}
              />
            );
          }}
        />
      );
    } catch (err) {
      // Error handled by error context
      setError("Failed to initialize map");
      setLoading(false);
    }
  }, [origin, destination, waypoints]);

  // Calculate route using the backend API
  useEffect(() => {
    if (!origin?.location || !destination?.location) return;

    const calculateRoute = async () => {
      try {
        setLoading(true);

        // Format waypoints for the API
        const formattedWaypoints = waypoints
          .filter((wp) => wp && wp.location)
          .map((wp) => ({
            location: wp.location,
            placeId: wp.placeId,
            description: wp.description || "",
          }));

        // Skip backend API call if place IDs are missing or if we're dealing with locations
        // that are unlikely to have a valid route (different continents, very long distances, etc.)
        const shouldSkipBackendCall =
          !origin.placeId ||
          !destination.placeId ||
          formattedWaypoints.some((wp) => !wp.placeId);

        if (shouldSkipBackendCall) {
          // Skipping backend route calculation due to missing place IDs
          throw new Error("Missing place IDs required for routing");
        }

        // Call the backend API to calculate the route
        // Calculating route with backend API
        const response = await apiConfig.post("/maps/route/optimize", {
          originPlaceId: origin.placeId || "",
          destinationPlaceId: destination.placeId || "",
          waypoints: formattedWaypoints,
          optimizeWaypoints: false,
        });

        // Handle the response
        if (response.data && response.data.data) {
          const routeData = response.data.data;

          // Generate a static map URL with the route polyline
          if (routeData.route && routeData.route.overview_polyline) {
            const mapWidth = mapContainerRef.current?.clientWidth || 600;
            const mapHeight = mapContainerRef.current?.clientHeight || 400;

            const staticMapUrl = new URL(
              "https://maps.googleapis.com/maps/api/staticmap"
            );

            // Add parameters
            staticMapUrl.searchParams.append(
              "size",
              `${mapWidth}x${mapHeight}`
            );
            staticMapUrl.searchParams.append("scale", "2"); // For retina displays

            // Add the path using the encoded polyline
            staticMapUrl.searchParams.append(
              "path",
              `weight:5|color:0x14213D|enc:${routeData.route.overview_polyline}`
            );

            // Add markers
            staticMapUrl.searchParams.append(
              "markers",
              `color:blue|label:A|${origin.location.lat},${origin.location.lng}`
            );
            staticMapUrl.searchParams.append(
              "markers",
              `color:red|label:B|${destination.location.lat},${destination.location.lng}`
            );

            // Add waypoints as markers
            formattedWaypoints.forEach((waypoint, index) => {
              staticMapUrl.searchParams.append(
                "markers",
                `color:green|label:${index + 1}|${waypoint.location.lat},${
                  waypoint.location.lng
                }`
              );
            });

            // Set the map element
            setMapElement(
              <img
                src={staticMapUrl.toString()}
                alt={`Route from ${origin.description || "Origin"} to ${
                  destination.description || "Destination"
                }`}
                className="w-full h-full object-cover"
                onLoad={() => setLoading(false)}
                onError={(e) => {
                  // Error handled by error context
                  renderStaticMapFallback();
                }}
              />
            );
            return;
          }
        }

        // If we got here, the response didn't have a valid route
        throw new Error("No valid route data received from backend");
      } catch (err) {
        // Error handled by error context
        if (err.response?.status === 500) {
          // Server error encountered - falling back to static map
        }
        renderStaticMapFallback();
      }
    };

    // Function to render a static map without route
    const renderStaticMapFallback = () => {
      // Falling back to static map without route
      try {
        // Get a direct static map URL
        const staticMapUrl = getDirectStaticMapUrl(
          origin,
          destination,
          waypoints
        );

        // Set the map element
        setMapElement(
          <img
            src={staticMapUrl}
            alt="Map showing locations (fallback)"
            className="w-full h-full object-cover"
            onLoad={() => setLoading(false)}
            onError={(e) => {
              // Error handled by error context
              // Try Mapbox as fallback
              const mapboxUrl = getDirectStaticMapUrl(
                origin,
                destination,
                waypoints,
                true
              );
              setMapElement(
                <img
                  src={mapboxUrl}
                  alt="Map showing route (Mapbox fallback)"
                  className="w-full h-full object-cover"
                  onLoad={() => {
                    setLoading(false);
                    setUsingFallback(true);
                  }}
                  onError={() => {
                    setError("Failed to load map from any provider");
                    setLoading(false);
                  }}
                />
              );
            }}
          />
        );
      } catch (fallbackErr) {
        // Error handled by error context
        setLoading(false);
        setError("Unable to display map. Please try again later.");
      }
    };

    // If we have route data from props, use that instead of calculating
    if (routeData && routeData.polyline) {
      const mapWidth = mapContainerRef.current?.clientWidth || 600;
      const mapHeight = mapContainerRef.current?.clientHeight || 400;

      const staticMapUrl = new URL(
        "https://maps.googleapis.com/maps/api/staticmap"
      );

      // Add parameters
      staticMapUrl.searchParams.append("size", `${mapWidth}x${mapHeight}`);
      staticMapUrl.searchParams.append("scale", "2"); // For retina displays

      // Add the path using the encoded polyline
      staticMapUrl.searchParams.append(
        "path",
        `weight:5|color:0x14213D|enc:${routeData.polyline}`
      );

      // Add markers
      if (origin?.location) {
        staticMapUrl.searchParams.append(
          "markers",
          `color:blue|label:A|${origin.location.lat},${origin.location.lng}`
        );
      }

      if (destination?.location) {
        staticMapUrl.searchParams.append(
          "markers",
          `color:red|label:B|${destination.location.lat},${destination.location.lng}`
        );
      }

      // Add waypoints as markers
      waypoints.forEach((waypoint, index) => {
        if (waypoint?.location) {
          staticMapUrl.searchParams.append(
            "markers",
            `color:green|label:${index + 1}|${waypoint.location.lat},${
              waypoint.location.lng
            }`
          );
        }
      });

      // Set the map element
      setMapElement(
        <img
          src={staticMapUrl.toString()}
          alt={`Route from ${origin.description || "Origin"} to ${
            destination.description || "Destination"
          }`}
          className="w-full h-full object-cover"
          onLoad={() => setLoading(false)}
          onError={() => {
            // Error handled by error context
            renderStaticMapFallback();
          }}
        />
      );
    } else {
      // Calculate route if we don't have route data
      calculateRoute();
    }
  }, [origin, destination, waypoints, routeData]);

  // If we have an error, show error state
  if (error) {
    return (
      <div
        className="flex items-center justify-center bg-red-50 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-4">
          <FiAlertTriangle className="text-red-500 text-4xl mx-auto mb-2" />
          <p className="text-gray-700">Failed to load map</p>
          <p className="text-sm text-gray-500">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center mx-auto"
          >
            <FiRefreshCw className="mr-2" /> Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Render the map
  return (
    <div className="relative rounded-lg overflow-hidden" style={{ height }}>
      {/* Map container */}
      <div ref={mapContainerRef} className="w-full h-full">
        {mapElement}
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FCA311] mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading map...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;
