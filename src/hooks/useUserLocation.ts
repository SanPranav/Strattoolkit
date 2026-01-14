"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchBuildLocations, calculateDistance } from "@/lib/db/build";
import type { BuildLocation } from "@/lib/types/db";

export type LocationState = {
  loading: boolean;
  error: string | null;
  position: GeolocationPosition | null;
  validLocation: BuildLocation | null;
  isAtValidLocation: boolean;
  nearestLocation: {
    location: BuildLocation;
    distance: number;
  } | null;
};

export type UseUserLocationOptions = {
  /** Auto-start watching location on mount */
  autoStart?: boolean;
  /** Enable high accuracy GPS (slower but more precise) */
  enableHighAccuracy?: boolean;
  /** Maximum age of cached position in ms */
  maximumAge?: number;
  /** Timeout for getting position in ms */
  timeout?: number;
  /** Interval for re-checking location validation in ms */
  validationInterval?: number;
};

const defaultOptions: UseUserLocationOptions = {
  autoStart: false,
  enableHighAccuracy: true,
  maximumAge: 30000, // 30 seconds
  timeout: 10000, // 10 seconds
  validationInterval: 5000 // Re-validate every 5 seconds
};

export function useUserLocation(options: UseUserLocationOptions = {}) {
  const opts = { ...defaultOptions, ...options };

  const [state, setState] = useState<LocationState>({
    loading: false,
    error: null,
    position: null,
    validLocation: null,
    isAtValidLocation: false,
    nearestLocation: null
  });

  const [locations, setLocations] = useState<BuildLocation[]>([]);
  const [locationsLoading, setLocationsLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  const validationIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isWatchingRef = useRef(false);
  const locationsRef = useRef<BuildLocation[]>([]);

  // Load build locations
  const loadLocations = useCallback(async () => {
    setLocationsLoading(true);
    const [error, data] = await fetchBuildLocations(true);
    setLocationsLoading(false);

    if (error) {
      setState((prev) => ({
        ...prev,
        error: `Failed to load locations: ${error}`
      }));
      return [];
    }

    setLocations(data ?? []);
    locationsRef.current = data ?? [];
    return data ?? [];
  }, []);

  // Validate position against locations
  const validatePosition = useCallback(
    (position: GeolocationPosition, locs: BuildLocation[]) => {
      const { latitude, longitude } = position.coords;

      let nearestLoc: { location: BuildLocation; distance: number } | null =
        null;
      let validLoc: BuildLocation | null = null;

      for (const location of locs) {
        const distance = calculateDistance(
          latitude,
          longitude,
          location.latitude,
          location.longitude
        );

        // Track nearest location
        if (!nearestLoc || distance < nearestLoc.distance) {
          nearestLoc = { location, distance };
        }

        // Check if within radius
        if (distance <= location.radius_meters) {
          validLoc = location;
          break; // Found a valid location, no need to continue
        }
      }

      setState((prev) => ({
        ...prev,
        position,
        validLocation: validLoc,
        isAtValidLocation: validLoc !== null,
        nearestLocation: nearestLoc,
        loading: false,
        error: null
      }));

      return validLoc;
    },
    []
  );

  // Handle position update
  const handlePositionUpdate = useCallback(
    (position: GeolocationPosition) => {
      const locs = locationsRef.current;
      if (locs.length > 0) {
        validatePosition(position, locs);
      } else {
        setState((prev) => ({
          ...prev,
          position,
          loading: false
        }));
      }
    },
    [validatePosition]
  );

  // Handle position error
  const handlePositionError = useCallback((error: GeolocationPositionError) => {
    let errorMessage: string;

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage =
          "Location permission denied. Please enable location access.";
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = "Location information unavailable.";
        break;
      case error.TIMEOUT:
        errorMessage = "Location request timed out.";
        break;
      default:
        errorMessage = "An unknown error occurred.";
    }

    setState((prev) => ({
      ...prev,
      loading: false,
      error: errorMessage
    }));
  }, []);

  // Start watching location
  const startWatching = useCallback(async () => {
    // Prevent duplicate watches
    if (isWatchingRef.current || watchIdRef.current !== null) {
      return;
    }

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser."
      }));
      return;
    }

    isWatchingRef.current = true;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Load locations first
    const locs = await loadLocations();

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePositionUpdate,
      handlePositionError,
      {
        enableHighAccuracy: opts.enableHighAccuracy,
        maximumAge: opts.maximumAge,
        timeout: opts.timeout
      }
    );
  }, [
    loadLocations,
    handlePositionUpdate,
    handlePositionError,
    opts.enableHighAccuracy,
    opts.maximumAge,
    opts.timeout
  ]);

  // Stop watching location
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    if (validationIntervalRef.current) {
      clearInterval(validationIntervalRef.current);
      validationIntervalRef.current = null;
    }

    isWatchingRef.current = false;
    setState((prev) => ({ ...prev, loading: false }));
  }, []);

  // Get current position once (without watching)
  const getCurrentPosition = useCallback(async () => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by this browser."
      }));
      return null;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    // Load locations if not loaded
    let locs = locationsRef.current;
    if (locs.length === 0) {
      locs = await loadLocations();
    }

    return new Promise<BuildLocation | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const validLoc =
            locs.length > 0 ? validatePosition(position, locs) : null;
          resolve(validLoc);
        },
        (error) => {
          handlePositionError(error);
          resolve(null);
        },
        {
          enableHighAccuracy: opts.enableHighAccuracy,
          maximumAge: opts.maximumAge,
          timeout: opts.timeout
        }
      );
    });
  }, [
    loadLocations,
    validatePosition,
    handlePositionError,
    opts.enableHighAccuracy,
    opts.maximumAge,
    opts.timeout
  ]);

  // Refresh locations (re-fetch from server)
  const refreshLocations = useCallback(async () => {
    const locs = await loadLocations();
    if (state.position && locs.length > 0) {
      validatePosition(state.position, locs);
    }
  }, [loadLocations, state.position, validatePosition]);

  // Auto-start if enabled
  useEffect(() => {
    if (opts.autoStart) {
      startWatching();
    }

    return () => {
      stopWatching();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.autoStart]);

  // Re-validate when locations change
  useEffect(() => {
    if (state.position && locations.length > 0) {
      validatePosition(state.position, locations);
    }
  }, [locations, state.position, validatePosition]);

  return {
    ...state,
    locations,
    locationsLoading,
    startWatching,
    stopWatching,
    getCurrentPosition,
    refreshLocations
  };
}

/**
 * Format distance for display
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
