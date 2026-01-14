"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { MapPin, Plus, Pencil, Trash2, Loader2, Clock, MousePointer2 } from "lucide-react";
import {
  createBuildLocation,
  updateBuildLocation,
  deleteBuildLocation
} from "@/lib/db/build";
import type { BuildLocation } from "@/lib/types/db";

// Dynamic imports for map components (must be client-side only)
const Map = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.Map),
  { ssr: false }
);
const MapTileLayer = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapTileLayer),
  { ssr: false }
);
const MapMarker = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapMarker),
  { ssr: false }
);
const MapCircle = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapCircle),
  { ssr: false }
);
const MapZoomControl = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapZoomControl),
  { ssr: false }
);
const MapPopup = dynamic(
  () => import("@/components/ui/map").then((mod) => mod.MapPopup),
  { ssr: false }
);

// Click handler component that needs useMapEvents from react-leaflet
const MapClickHandler = dynamic(
  () =>
    import("react-leaflet").then((mod) => {
      const { useMapEvents } = mod;
      return function ClickHandler({
        onClick
      }: {
        onClick: (lat: number, lng: number) => void;
      }) {
        useMapEvents({
          click(e) {
            onClick(e.latlng.lat, e.latlng.lng);
          }
        });
        return null;
      };
    }),
  { ssr: false }
);

type ValidHours = {
  enabled: boolean;
  start: string; // HH:mm format
  end: string; // HH:mm format
};

type LocationsTabProps = {
  locations: BuildLocation[];
  isLoading: boolean;
  onRefresh: () => void;
};

type LocationFormData = {
  location_name: string;
  latitude: string;
  longitude: string;
  radius_meters: string;
  is_active: boolean;
  valid_hours: ValidHours;
};

const defaultValidHours: ValidHours = {
  enabled: false,
  start: "08:00",
  end: "18:00"
};

const defaultFormData: LocationFormData = {
  location_name: "",
  latitude: "",
  longitude: "",
  radius_meters: "100",
  is_active: true,
  valid_hours: defaultValidHours
};

function parseValidHours(json: unknown): ValidHours {
  if (json && typeof json === "object" && "enabled" in json) {
    const vh = json as ValidHours;
    return {
      enabled: Boolean(vh.enabled),
      start: vh.start || "08:00",
      end: vh.end || "18:00"
    };
  }
  return defaultValidHours;
}

function formatTimeDisplay(time: string): string {
  const [hours, minutes] = time.split(":");
  const h = parseInt(hours);
  const suffix = h >= 12 ? "PM" : "AM";
  const displayHour = h === 0 ? 12 : h > 12 ? h - 12 : h;
  return `${displayHour}:${minutes} ${suffix}`;
}

export function LocationsTab({
  locations,
  isLoading,
  onRefresh
}: LocationsTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<BuildLocation | null>(
    null
  );
  const [formData, setFormData] = useState<LocationFormData>(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  // Get user's current location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Silently fail - user location is optional
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const handleOpenCreate = () => {
    setEditingLocation(null);
    setFormData(defaultFormData);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (location: BuildLocation) => {
    setEditingLocation(location);
    setFormData({
      location_name: location.location_name,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      radius_meters: location.radius_meters.toString(),
      is_active: location.is_active,
      valid_hours: parseValidHours(location.valid_hours)
    });
    setIsDialogOpen(true);
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData((prev) => ({
          ...prev,
          latitude: position.coords.latitude.toFixed(6),
          longitude: position.coords.longitude.toFixed(6)
        }));
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        toast.success("Location captured");
        setIsGettingLocation(false);
      },
      (error) => {
        toast.error(`Failed to get location: ${error.message}`);
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async () => {
    if (
      !formData.location_name ||
      !formData.latitude ||
      !formData.longitude ||
      !formData.radius_meters
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    const payload = {
      location_name: formData.location_name,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      radius_meters: parseInt(formData.radius_meters),
      is_active: formData.is_active,
      valid_hours: formData.valid_hours.enabled ? formData.valid_hours : null
    };

    if (editingLocation) {
      const [error] = await updateBuildLocation(editingLocation.id, payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Location updated");
        setIsDialogOpen(false);
        onRefresh();
      }
    } else {
      const [error] = await createBuildLocation(payload);
      if (error) {
        toast.error(error);
      } else {
        toast.success("Location created");
        setIsDialogOpen(false);
        onRefresh();
      }
    }

    setIsSubmitting(false);
  };

  const handleDelete = async (locationId: number) => {
    setDeletingId(locationId);

    const [error] = await deleteBuildLocation(locationId);

    if (error) {
      toast.error(error);
    } else {
      toast.success("Location deleted");
      onRefresh();
    }

    setDeletingId(null);
  };

  const handleToggleActive = async (location: BuildLocation) => {
    const [error] = await updateBuildLocation(location.id, {
      is_active: !location.is_active
    });

    if (error) {
      toast.error(error);
    } else {
      toast.success(
        location.is_active ? "Location deactivated" : "Location activated"
      );
      onRefresh();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Build Locations
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenCreate}>
              <Plus className="h-4 w-4 mr-1" />
              Add Location
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingLocation ? "Edit Location" : "Add Location"}
              </DialogTitle>
              <DialogDescription>
                {editingLocation
                  ? "Update the location details below."
                  : "Add a valid build location. Users must be within the radius to check in."}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="location_name">Location Name *</Label>
                <Input
                  id="location_name"
                  value={formData.location_name}
                  onChange={(e) =>
                    setFormData({ ...formData, location_name: e.target.value })
                  }
                  placeholder="e.g., Main Workshop"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude *</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) =>
                      setFormData({ ...formData, latitude: e.target.value })
                    }
                    placeholder="e.g., 34.0522"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude *</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) =>
                      setFormData({ ...formData, longitude: e.target.value })
                    }
                    placeholder="e.g., -118.2437"
                  />
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleGetCurrentLocation}
                disabled={isGettingLocation}
                className="w-full">
                {isGettingLocation ? (
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                ) : (
                  <MapPin className="h-4 w-4 mr-1" />
                )}
                {isGettingLocation ? "Getting Location..." : "Use Current Location"}
              </Button>

              {/* Interactive Map for selecting location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <MousePointer2 className="h-4 w-4" />
                  Click on map to set location
                </Label>
                <div className="h-48 rounded-md border overflow-hidden">
                  <Map
                    center={
                      formData.latitude && formData.longitude
                        ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
                        : userLocation
                          ? [userLocation.lat, userLocation.lng]
                          : [33.7490, -84.3880] // Default to Atlanta
                    }
                    zoom={formData.latitude && formData.longitude ? 15 : userLocation ? 14 : 10}
                    className="h-full w-full min-h-0">
                    <MapTileLayer />
                    <MapZoomControl />
                    <MapClickHandler
                      onClick={(lat, lng) => {
                        setFormData((prev) => ({
                          ...prev,
                          latitude: lat.toFixed(6),
                          longitude: lng.toFixed(6)
                        }));
                        toast.success("Location selected from map");
                      }}
                    />
                    {formData.latitude && formData.longitude && (
                      <>
                        <MapMarker
                          position={[
                            parseFloat(formData.latitude),
                            parseFloat(formData.longitude)
                          ]}
                        />
                        {formData.radius_meters && (
                          <MapCircle
                            center={[
                              parseFloat(formData.latitude),
                              parseFloat(formData.longitude)
                            ]}
                            radius={parseInt(formData.radius_meters) || 100}
                            pathOptions={{
                              color: "hsl(var(--primary))",
                              fillColor: "hsl(var(--primary))",
                              fillOpacity: 0.2
                            }}
                          />
                        )}
                      </>
                    )}
                  </Map>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="radius_meters">Radius (meters) *</Label>
                <Input
                  id="radius_meters"
                  type="number"
                  value={formData.radius_meters}
                  onChange={(e) =>
                    setFormData({ ...formData, radius_meters: e.target.value })
                  }
                  placeholder="e.g., 100"
                />
                <p className="text-xs text-muted-foreground">
                  Users must be within this distance to check in
                </p>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="is_active">Active</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
              </div>

              <div className="space-y-3 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Label htmlFor="valid_hours_enabled">
                      Restrict Valid Hours
                    </Label>
                  </div>
                  <Switch
                    id="valid_hours_enabled"
                    checked={formData.valid_hours.enabled}
                    onCheckedChange={(checked) =>
                      setFormData({
                        ...formData,
                        valid_hours: {
                          ...formData.valid_hours,
                          enabled: checked
                        }
                      })
                    }
                  />
                </div>

                {formData.valid_hours.enabled && (
                  <div className="grid grid-cols-2 gap-4 pl-6">
                    <div className="space-y-2">
                      <Label htmlFor="valid_hours_start">Start Time</Label>
                      <Input
                        id="valid_hours_start"
                        type="time"
                        value={formData.valid_hours.start}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valid_hours: {
                              ...formData.valid_hours,
                              start: e.target.value
                            }
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="valid_hours_end">End Time</Label>
                      <Input
                        id="valid_hours_end"
                        type="time"
                        value={formData.valid_hours.end}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            valid_hours: {
                              ...formData.valid_hours,
                              end: e.target.value
                            }
                          })
                        }
                      />
                    </div>
                    <p className="text-xs text-muted-foreground col-span-2">
                      Users can only check in during these hours
                    </p>
                  </div>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isSubmitting}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : editingLocation ? (
                  "Update"
                ) : (
                  "Create"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : locations.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            No locations configured yet. Add one to enable location-based
            check-in.
          </div>
        ) : (
          <>
            {/* Overview Map showing all locations */}
            <div className="h-64 rounded-md border overflow-hidden">
              <Map
                center={[
                  locations.reduce((sum, loc) => sum + loc.latitude, 0) /
                    locations.length,
                  locations.reduce((sum, loc) => sum + loc.longitude, 0) /
                    locations.length
                ]}
                zoom={12}
                className="h-full w-full min-h-0">
                <MapTileLayer />
                <MapZoomControl />
                {locations.map((location) => (
                  <div key={location.id}>
                    <MapMarker
                      position={[location.latitude, location.longitude]}>
                      <MapPopup>
                        <div className="text-sm font-medium">
                          {location.location_name}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Radius: {location.radius_meters}m
                        </div>
                        {!location.is_active && (
                          <div className="text-xs text-destructive">
                            Inactive
                          </div>
                        )}
                      </MapPopup>
                    </MapMarker>
                    <MapCircle
                      center={[location.latitude, location.longitude]}
                      radius={location.radius_meters}
                      pathOptions={{
                        color: location.is_active
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground))",
                        fillColor: location.is_active
                          ? "hsl(var(--primary))"
                          : "hsl(var(--muted-foreground))",
                        fillOpacity: 0.15
                      }}
                    />
                  </div>
                ))}
              </Map>
            </div>

            {/* Locations Table - Hidden on mobile, show card list instead */}
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Coordinates</TableHead>
                    <TableHead>Radius</TableHead>
                    <TableHead>Valid Hours</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">
                        {location.location_name}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {location.latitude.toFixed(4)},{" "}
                        {location.longitude.toFixed(4)}
                      </TableCell>
                      <TableCell>{location.radius_meters}m</TableCell>
                      <TableCell>
                        {(() => {
                          const vh = parseValidHours(location.valid_hours);
                          if (!vh.enabled) {
                            return (
                              <span className="text-muted-foreground text-xs">
                                Any time
                              </span>
                            );
                          }
                          return (
                            <div className="flex items-center gap-1 text-xs">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span>{formatTimeDisplay(vh.start)}</span>
                              <span className="text-muted-foreground">–</span>
                              <span>{formatTimeDisplay(vh.end)}</span>
                            </div>
                          );
                        })()}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={location.is_active}
                          onCheckedChange={() => handleToggleActive(location)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleOpenEdit(location)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleDelete(location.id)}
                            disabled={deletingId === location.id}>
                            {deletingId === location.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden space-y-2">
              {locations.map((location) => {
                const vh = parseValidHours(location.valid_hours);
                return (
                  <Card key={location.id} className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {location.location_name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {location.latitude.toFixed(4)},{" "}
                          {location.longitude.toFixed(4)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Radius: {location.radius_meters}m
                        </div>
                        {vh.enabled && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatTimeDisplay(vh.start)} –{" "}
                            {formatTimeDisplay(vh.end)}
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Switch
                          checked={location.is_active}
                          onCheckedChange={() => handleToggleActive(location)}
                        />
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleOpenEdit(location)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-11 w-11"
                            onClick={() => handleDelete(location.id)}
                            disabled={deletingId === location.id}>
                            {deletingId === location.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
