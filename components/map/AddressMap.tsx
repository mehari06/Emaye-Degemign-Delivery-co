"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";
import type { AddressInput } from "@/lib/types";
import type * as Leaflet from "leaflet";

import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type SearchResult = {
  display_name: string;
  lat: string;
  lon: string;
};

type LeafletModule = typeof import("leaflet");

export function AddressMap({
  value,
  onChange,
  className,
}: {
  value: AddressInput;
  onChange: (next: AddressInput) => void;
  className?: string;
}) {
  const leafletRef = React.useRef<LeafletModule | null>(null);
  const mapRef = React.useRef<Leaflet.Map | null>(null);
  const markerRef = React.useRef<Leaflet.Marker | null>(null);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const valueRef = React.useRef<AddressInput>(value);
  const onChangeRef = React.useRef(onChange);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [mapReady, setMapReady] = React.useState(false);

  React.useEffect(() => {
    valueRef.current = value;
  }, [value]);

  React.useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  React.useEffect(() => {
    let cancelled = false;

    async function setup() {
      if (!containerRef.current || mapRef.current) return;

      const mod = await import("leaflet");
      if (cancelled) return;

      const L = mod as unknown as LeafletModule;
      leafletRef.current = L;

      // Hawassa Focus
      const HAWASSA_CENTER: [number, number] = [7.06, 38.48];
      const HAWASSA_BOUNDS: [[number, number], [number, number]] = [
        [7.00, 38.40], // Southwest
        [7.12, 38.56], // Northeast
      ];

      L.Icon.Default.mergeOptions({
        iconUrl: markerIcon.src,
        shadowUrl: markerShadow.src,
      });

      const initial = valueRef.current;
      const initialCoords: [number, number] = initial.latitude === 7.06 && initial.longitude === 38.48
        ? HAWASSA_CENTER
        : [initial.latitude, initial.longitude];

      const map = L.map(containerRef.current, {
        maxBounds: HAWASSA_BOUNDS,
        minZoom: 12,
      }).setView(initialCoords, 14);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap contributors",
      }).addTo(map);

      const marker = L.marker([initial.latitude, initial.longitude], {
        draggable: true,
      }).addTo(map);
      markerRef.current = marker;

      const updateFromLatLng = async (lat: number, lng: number) => {
        const current = valueRef.current;
        onChangeRef.current({ ...current, latitude: lat, longitude: lng });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`,
          );
          const data = (await response.json()) as { display_name?: string };
          if (data?.display_name) {
            onChangeRef.current({
              latitude: lat,
              longitude: lng,
              address: data.display_name,
            });
          }
        } catch {
          const current = valueRef.current;
          onChangeRef.current({ ...current, latitude: lat, longitude: lng });
        }
      };

      map.on("click", (event) => {
        const { lat, lng } = event.latlng;
        marker.setLatLng([lat, lng]);
        updateFromLatLng(lat, lng);
      });

      marker.on("dragend", () => {
        const position = marker.getLatLng();
        updateFromLatLng(position.lat, position.lng);
      });

      setMapReady(true);
    }

    void setup();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markerRef.current = null;
      setMapReady(false);
    };
  }, []);

  React.useEffect(() => {
    if (!mapRef.current || !markerRef.current || !leafletRef.current) return;
    const L = leafletRef.current;
    const position = new L.LatLng(value.latitude, value.longitude);
    markerRef.current.setLatLng(position);
    mapRef.current.setView(position, mapRef.current.getZoom());
  }, [value.latitude, value.longitude]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery,
        )}`,
      );
      const data = (await response.json()) as SearchResult[];
      setResults(data.slice(0, 5));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectResult = (result: SearchResult) => {
    const lat = Number(result.lat);
    const lng = Number(result.lon);
    onChange({ latitude: lat, longitude: lng, address: result.display_name });
    setResults([]);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        onChange({ ...value, latitude, longitude });
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          );
          const data = (await response.json()) as { display_name?: string };
          if (data?.display_name) {
            onChange({
              latitude,
              longitude,
              address: data.display_name,
            });
          }
        } finally {
          setLoading(false);
        }
      },
      () => setLoading(false),
    );
  };

  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Input
          placeholder="Search for an address or landmark"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          aria-label="Search for an address"
        />
        <Button variant="secondary" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
        <Button variant="ghost" onClick={handleLocate} disabled={loading}>
          Use my location
        </Button>
      </div>
      {results.length > 0 ? (
        <div className="rounded-2xl border border-border bg-white p-3 shadow-soft">
          {results.map((result) => (
            <button
              key={`${result.lat}-${result.lon}`}
              className="w-full rounded-xl px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-50"
              onClick={() => handleSelectResult(result)}
            >
              {result.display_name}
            </button>
          ))}
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="h-72 w-full rounded-2xl border border-border shadow-soft"
        aria-label="Delivery location map"
      />
      {!mapReady ? (
        <p className="text-xs text-slate-500">
          Loading map… If you don&apos;t see tiles, check your network access.
        </p>
      ) : null}
    </div>
  );
}
