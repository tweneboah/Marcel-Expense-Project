import React, { useState, useCallback, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  DirectionsRenderer,
  Polyline,
  InfoWindow,
} from "@react-google-maps/api";
import { formatDirectionInstruction } from "../../utils/htmlSanitizer";

const containerStyle = {
  width: "100%",
  height: "100%",
  borderRadius: "0.5rem",
};

// Default center in Switzerland
const defaultCenter = {
  lat: 47.3769, // Zurich, Switzerland
  lng: 8.5417,
};

// Use environment variable for API key
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

// Define libraries as a static constant to prevent unnecessary reloads
const libraries = ["places"];

// Predefined waypoint names if not provided
const DEFAULT_WAYPOINT_NAMES = [
  "Calais Ferry Terminal",
  "Eurotunnel Folkestone",
  "Dover",
  "London Victoria Station",
  "Bern HB",
  "Basel SBB",
  "Geneva Airport",
  "Zurich HB",
];

const GoogleMapComponent = ({
  origin,
  destination,
  waypoints = [],
  height = "400px",
}) => {
  const [directions, setDirections] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedStep, setSelectedStep] = useState(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [activeLegIndex, setActiveLegIndex] = useState(0);
  const [selectedMarker, setSelectedMarker] = useState(null);

  // State for summary details
  const [routeSummary, setRouteSummary] = useState({
    totalDistance: 0,
    totalDuration: 0,
    legs: [],
  });

  // Enhance waypoints with proper names if missing
  const enhancedWaypoints = useCallback(() => {
    return waypoints
      .map((waypoint, index) => {
        if (!waypoint) return null;

        // If waypoint has no description or a generic one, assign a default name
        const hasGenericName =
          !waypoint.description ||
          waypoint.description === "Waypoint" ||
          waypoint.description === `Waypoint ${index + 1}`;

        const enhancedWaypoint = { ...waypoint };

        if (hasGenericName) {
          // Use a default name based on the index, or fallback to a generic name with index
          enhancedWaypoint.description =
            DEFAULT_WAYPOINT_NAMES[index % DEFAULT_WAYPOINT_NAMES.length] ||
            `Stop ${index + 1}`;
        }

        return enhancedWaypoint;
      })
      .filter(Boolean);
  }, [waypoints]);

  // Calculate the center point between origin and destination
  const center = React.useMemo(() => {
    if (origin?.location && destination?.location) {
      return {
        lat: (origin.location.lat + destination.location.lat) / 2,
        lng: (origin.location.lng + destination.location.lng) / 2,
      };
    }
    return defaultCenter;
  }, [origin, destination]);

  // Create a bounding box for all points
  const createBoundsForAllPoints = useCallback(
    (maps) => {
      if (
        !maps ||
        (!origin?.location &&
          !destination?.location &&
          waypoints.every((wp) => !wp?.location))
      )
        return null;

      const bounds = new maps.LatLngBounds();

      if (origin?.location) {
        bounds.extend(origin.location);
      }

      if (destination?.location) {
        bounds.extend(destination.location);
      }

      waypoints.forEach((waypoint) => {
        if (waypoint?.location) {
          bounds.extend(waypoint.location);
        }
      });

      return bounds;
    },
    [origin, destination, waypoints]
  );

  // Handle marker click to show InfoWindow
  const handleMarkerClick = (marker) => {
    setSelectedMarker(marker);
  };

  // Process route data to extract summary information
  const processRouteData = useCallback((result) => {
    if (!result || !result.routes || !result.routes[0]) return;

    const route = result.routes[0];
    const legs = route.legs || [];

    let totalDistance = 0;
    let totalDuration = 0;
    const legDetails = [];

    legs.forEach((leg) => {
      if (leg.distance && leg.duration) {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;

        legDetails.push({
          startAddress: leg.start_address,
          endAddress: leg.end_address,
          distance: leg.distance,
          duration: leg.duration,
          steps: leg.steps?.length || 0,
          travelMode: (leg.steps && leg.steps[0]?.travel_mode) || "DRIVING",
        });
      }
    });

    setRouteSummary({
      totalDistance,
      totalDuration,
      legs: legDetails,
    });
  }, []);

  // Calculate route when both origin and destination are available
  const calculateRoute = useCallback(
    (map, maps) => {
      if (!origin?.location || !destination?.location) return;

      setLoading(true);

      try {
        const directionsService = new maps.DirectionsService();

        const formattedWaypoints = waypoints
          .filter((wp) => wp && wp.location)
          .map((wp) => ({
            location: new maps.LatLng(wp.location.lat, wp.location.lng),
            stopover: true,
          }));

        directionsService.route(
          {
            origin: new maps.LatLng(origin.location.lat, origin.location.lng),
            destination: new maps.LatLng(
              destination.location.lat,
              destination.location.lng
            ),
            waypoints: formattedWaypoints,
            travelMode: maps.TravelMode.DRIVING,
            provideRouteAlternatives: false,
          },
          (result, status) => {
            setLoading(false);

            if (status === maps.DirectionsStatus.OK) {
              setDirections(result);
              setError(null);
              processRouteData(result);

              // Route information processed

              // Fit map to the route bounds
              if (map && result.routes[0]?.bounds) {
                map.fitBounds(result.routes[0].bounds);
              }
            } else {
              // Error handled by error context
              setError(`Could not calculate route: ${status}`);

              // Create a bounding box for all points
              const bounds = createBoundsForAllPoints(maps);
              if (bounds && !bounds.isEmpty()) {
                map.fitBounds(bounds);
              }
            }
          }
        );
      } catch (err) {
        // Error handled by error context
        setLoading(false);
        setError("Failed to set up route calculation. Please try again.");

        // Even on error, try to show a map with markers
        if (map && window.google?.maps) {
          const bounds = createBoundsForAllPoints(window.google.maps);
          if (bounds && !bounds.isEmpty()) {
            map.fitBounds(bounds);
          }
        }
      }
    },
    [origin, destination, waypoints, createBoundsForAllPoints, processRouteData]
  );

  // Map loaded handler
  const onMapLoad = useCallback(
    (map) => {
      try {
        // Save map reference
        setMap(map);

        // Check if Google Maps API is loaded
        if (!window.google || !window.google.maps) {
          // Error handled by error context
          setError("Google Maps API not available. Please try again later.");
          return;
        }

        // Access to map and maps objects
        const maps = window.google.maps;

        // If we have both origin and destination, calculate route
        if (origin?.location && destination?.location) {
          calculateRoute(map, maps);
        } else {
          // Otherwise just fit the map to all available points
          const bounds = createBoundsForAllPoints(maps);
          if (bounds && !bounds.isEmpty()) {
            map.fitBounds(bounds);
          }
        }
      } catch (err) {
        // Error handled by error context
        setError("Could not initialize map. Please try again.");
      }
    },
    [calculateRoute, origin, destination, createBoundsForAllPoints]
  );

  // Toggle instructions display
  const handleToggleInstructions = () => {
    setShowInstructions(!showInstructions);
  };

  // Handle step click - focuses the map on that step's location
  const handleStepClick = (leg, step, legIndex, stepIndex) => {
    setActiveStep(step);
    setActiveStepIndex(stepIndex);
    setActiveLegIndex(legIndex);
    setSelectedStep({ leg, step, legIndex, stepIndex });

    if (map && step.start_location) {
      map.panTo(step.start_location);
      map.setZoom(16);
    }
  };

  // If we're missing location data, show a fallback UI
  if (
    !origin?.location &&
    !destination?.location &&
    waypoints.every((wp) => !wp?.location)
  ) {
    return (
      <div
        style={{ height, width: "100%" }}
        className="h-full w-full flex items-center justify-center bg-gray-100 rounded-lg text-center p-4"
      >
        <div className="text-gray-500 max-w-xs">
          <svg
            className="w-12 h-12 mx-auto mb-2 text-gray-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
          <p>
            Location information is incomplete. Please make sure at least one
            location is selected properly.
          </p>
        </div>
      </div>
    );
  }

  // Function to render a simple polyline between points when directions fail
  const renderSimpleRoute = () => {
    if (!map) return null;

    const path = [];
    if (origin?.location) path.push(origin.location);

    // Add waypoints in between
    waypoints
      .filter((wp) => wp && wp.location)
      .forEach((wp) => {
        path.push(wp.location);
      });

    if (destination?.location) path.push(destination.location);

    // Only render if we have at least 2 points
    if (path.length >= 2) {
      return (
        <Polyline
          path={path}
          options={{
            strokeColor: "#14213D",
            strokeOpacity: 0.75,
            strokeWeight: 4,
          }}
        />
      );
    }

    return null;
  };

  // Format duration in a more human-readable way
  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (hours > 0) {
      return `${hours} hr ${minutes} min`;
    }
    return `${minutes} min`;
  };

  // Format distance nicely
  const formatDistance = (meters) => {
    if (meters < 1000) {
      return `${meters} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  };

  // Render route instructions
  const renderRouteInstructions = () => {
    if (!directions || !directions.routes || !directions.routes[0]) return null;

    const route = directions.routes[0];

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg max-h-96 overflow-y-auto mt-4">
        <h3 className="font-semibold text-lg mb-2">Route Instructions</h3>
        {route.legs.map((leg, legIndex) => (
          <div key={`leg-${legIndex}`} className="mb-4">
            <div className="font-medium mb-2 bg-gray-50 p-2 rounded-md">
              <div className="flex items-center justify-between">
                <div>
                  From <span className="font-bold">{leg.start_address}</span>
                </div>
                <div className="text-sm text-gray-600">→</div>
                <div>
                  To <span className="font-bold">{leg.end_address}</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 mt-1 flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {leg.distance.text}
                </span>
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                  {leg.duration.text}
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {leg.steps[0]?.travel_mode || "DRIVING"}
                </span>
              </div>
            </div>
            <ul className="list-none pl-2 space-y-3 mt-3">
              {leg.steps.map((step, stepIndex) => (
                <li
                  key={`step-${legIndex}-${stepIndex}`}
                  className={`mb-1 cursor-pointer p-2 rounded-md transition-colors ${
                    activeStepIndex === stepIndex && activeLegIndex === legIndex
                      ? "bg-blue-50 border-l-4 border-blue-500"
                      : "hover:bg-gray-50 border-l-4 border-transparent"
                  }`}
                  onClick={() =>
                    handleStepClick(leg, step, legIndex, stepIndex)
                  }
                >
                  <div className="flex items-start">
                    <div className="bg-gray-200 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-medium">
                      {stepIndex + 1}
                    </div>
                    <div>
                      <div className="font-medium mb-1">
                        {formatDirectionInstruction(step.html_instructions)}
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                          {step.distance?.text || ""}
                        </span>
                        <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full">
                          {step.duration?.text || ""}
                        </span>
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full">
                          {step.travel_mode}
                        </span>
                        {step.maneuver && (
                          <span className="px-2 py-0.5 bg-yellow-50 text-yellow-600 rounded-full">
                            {step.maneuver.replace(/-/g, " ")}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  // Render waypoints list - a quick overview of the stops on the journey
  const renderWaypointsList = () => {
    if (!waypoints || waypoints.length === 0) return null;

    const processedWaypoints = enhancedWaypoints();

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm mb-2">
        <h3 className="font-semibold text-sm mb-2">
          Waypoints ({processedWaypoints.length})
        </h3>
        <ul className="list-none">
          {processedWaypoints.map((waypoint, index) => (
            <li key={`waypoint-list-${index}`} className="mb-1">
              <div
                className="flex items-center py-1 px-2 text-sm hover:bg-gray-50 rounded cursor-pointer"
                onClick={() => {
                  if (map && waypoint.location) {
                    map.panTo(waypoint.location);
                    map.setZoom(14);
                    handleMarkerClick({
                      position: waypoint.location,
                      title: waypoint.description,
                      type: "waypoint",
                      index: index,
                    });
                  }
                }}
              >
                <div className="bg-yellow-500 text-white rounded-full w-5 h-5 flex items-center justify-center mr-2 text-xs font-medium">
                  {index + 1}
                </div>
                <span className="text-gray-700">{waypoint.description}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  // Render route summary - a condensed view of the route stats
  const renderRouteSummary = () => {
    // Show summary even when directions are not available but we have origin and destination
    if (
      (!directions || !directions.routes || !directions.routes[0]) &&
      origin?.location &&
      destination?.location
    ) {
      // Create a simple summary for direct routes
      return (
        <div className="bg-white p-4 rounded-lg shadow-sm my-2">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold">Route Overview</h3>
            <div className="text-xs text-gray-500">Direct route</div>
          </div>
          <div className="flex items-center text-sm text-gray-700">
            <div className="font-medium">
              From:{" "}
              <span className="font-bold">
                {origin.description || "Starting Point"}
              </span>
            </div>
            <div className="mx-2">→</div>
            <div className="font-medium">
              To:{" "}
              <span className="font-bold">
                {destination.description || "Destination"}
              </span>
            </div>
          </div>
          {waypoints && waypoints.length > 0 && (
            <div className="text-xs text-blue-600 mt-2">
              With {waypoints.filter((wp) => wp?.location).length} waypoints
            </div>
          )}
        </div>
      );
    }

    // Standard summary with detailed info when directions are available
    if (!directions || !directions.routes || !directions.routes[0]) return null;

    const { totalDistance, totalDuration, legs } = routeSummary;

    return (
      <div className="bg-white p-4 rounded-lg shadow-sm my-2">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">Route Summary</h3>
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              {formatDistance(totalDistance)}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              {formatDuration(totalDuration)}
            </span>
          </div>
        </div>

        <div className="text-xs text-gray-500">
          {legs.length > 1
            ? `${legs.length} segments · ${
                waypoints.filter((wp) => wp?.location).length
              } waypoints`
            : "Direct route"}
        </div>
      </div>
    );
  };

  // Get the processed waypoints with proper names
  const waypointsWithNames = enhancedWaypoints();

  // Determine whether the map should display route details
  const shouldShowRouteDetails = origin?.location && destination?.location;

  // Simplified map rendering based on the working example
  return (
    <div style={{ height: "auto", width: "100%" }}>
      <div style={{ height, width: "100%" }}>
        <LoadScript
          googleMapsApiKey={GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={10}
            onLoad={onMapLoad}
            options={{
              fullscreenControl: true,
              streetViewControl: false,
              mapTypeControl: true,
              zoomControl: true,
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {/* Render origin marker if we have location */}
            {origin?.location && (
              <Marker
                position={origin.location}
                label={{
                  text: "A",
                  color: "white",
                  fontWeight: "bold",
                }}
                title={origin.description || "Starting Point"}
                onClick={() =>
                  handleMarkerClick({
                    position: origin.location,
                    title: origin.description || "Starting Point",
                    type: "origin",
                  })
                }
              />
            )}

            {/* Render destination marker if we have location */}
            {destination?.location && (
              <Marker
                position={destination.location}
                label={{
                  text: "B",
                  color: "white",
                  fontWeight: "bold",
                }}
                title={destination.description || "Destination"}
                onClick={() =>
                  handleMarkerClick({
                    position: destination.location,
                    title: destination.description || "Destination",
                    type: "destination",
                  })
                }
              />
            )}

            {/* Render waypoint markers if directions are not calculated */}
            {!directions &&
              waypointsWithNames.map(
                (waypoint, index) =>
                  waypoint?.location && (
                    <Marker
                      key={`waypoint-${index}`}
                      position={waypoint.location}
                      label={{
                        text: (index + 1).toString(),
                        color: "white",
                        fontWeight: "bold",
                      }}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                      }}
                      title={waypoint.description}
                      onClick={() =>
                        handleMarkerClick({
                          position: waypoint.location,
                          title: waypoint.description,
                          type: "waypoint",
                          index: index,
                        })
                      }
                    />
                  )
              )}

            {/* Render directions if available */}
            {directions && (
              <DirectionsRenderer
                directions={directions}
                options={{
                  polylineOptions: {
                    strokeColor: "#14213D",
                    strokeWeight: 5,
                    strokeOpacity: 0.8,
                  },
                  suppressMarkers: true, // We'll show our own custom markers
                  suppressInfoWindows: true,
                }}
              />
            )}

            {/* Custom waypoint markers even when directions are shown */}
            {directions &&
              waypointsWithNames.map(
                (waypoint, index) =>
                  waypoint?.location && (
                    <Marker
                      key={`waypoint-${index}`}
                      position={waypoint.location}
                      label={{
                        text: (index + 1).toString(),
                        color: "white",
                        fontWeight: "bold",
                      }}
                      icon={{
                        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
                      }}
                      title={waypoint.description}
                      onClick={() =>
                        handleMarkerClick({
                          position: waypoint.location,
                          title: waypoint.description,
                          type: "waypoint",
                          index: index,
                        })
                      }
                    />
                  )
              )}

            {/* When directions are shown, still show origin/destination markers */}
            {directions && origin?.location && (
              <Marker
                position={origin.location}
                label={{
                  text: "A",
                  color: "white",
                  fontWeight: "bold",
                }}
                title={origin.description || "Starting Point"}
                onClick={() =>
                  handleMarkerClick({
                    position: origin.location,
                    title: origin.description || "Starting Point",
                    type: "origin",
                  })
                }
              />
            )}

            {directions && destination?.location && (
              <Marker
                position={destination.location}
                label={{
                  text: "B",
                  color: "white",
                  fontWeight: "bold",
                }}
                title={destination.description || "Destination"}
                onClick={() =>
                  handleMarkerClick({
                    position: destination.location,
                    title: destination.description || "Destination",
                    type: "destination",
                  })
                }
              />
            )}

            {/* Render a simple polyline if directions failed but we have points */}
            {!directions && renderSimpleRoute()}

            {/* Display info window for the selected marker */}
            {selectedMarker && (
              <InfoWindow
                position={selectedMarker.position}
                onCloseClick={() => setSelectedMarker(null)}
              >
                <div className="p-2 max-w-md">
                  <div className="font-semibold text-lg">
                    {selectedMarker.title}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {selectedMarker.type === "origin"
                      ? "Starting Point"
                      : selectedMarker.type === "destination"
                      ? "Final Destination"
                      : `Waypoint ${selectedMarker.index + 1}`}
                  </div>
                  {selectedMarker.type === "waypoint" && (
                    <div className="text-xs font-medium mt-2 text-blue-600">
                      Click on the route instructions to see directions to this
                      waypoint
                    </div>
                  )}
                </div>
              </InfoWindow>
            )}

            {/* Display info window for the selected step */}
            {selectedStep && (
              <InfoWindow
                position={selectedStep.step.start_location}
                onCloseClick={() => setSelectedStep(null)}
              >
                <div className="p-2 max-w-md">
                  <div className="font-medium">
                    {formatDirectionInstruction(selectedStep.step.html_instructions)}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedStep.step.distance?.text || ""} -{" "}
                    {selectedStep.step.duration?.text || ""}
                  </div>
                  <div className="text-xs font-semibold mt-1">
                    Travel Mode: {selectedStep.step.travel_mode}
                    {selectedStep.step.maneuver && (
                      <span className="ml-1 text-yellow-600">
                        ({selectedStep.step.maneuver.replace(/-/g, " ")})
                      </span>
                    )}
                  </div>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>

      {error && (
        <div className="mt-2 text-sm text-orange-600 bg-orange-50 p-2 rounded">
          {error}
        </div>
      )}

      {waypointsWithNames.length > 0 && renderWaypointsList()}

      {renderRouteSummary()}

      {directions && (
        <div className="mt-2">
          <button
            onClick={handleToggleInstructions}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors w-full"
          >
            {showInstructions ? "Hide Instructions" : "Show Route Instructions"}
          </button>
        </div>
      )}

      {showInstructions && renderRouteInstructions()}
    </div>
  );
};

export default GoogleMapComponent;
