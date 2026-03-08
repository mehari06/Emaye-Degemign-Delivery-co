"use client";

import * as React from "react";
import type * as Leaflet from "leaflet";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

type LeafletModule = typeof import("leaflet");

type OrderMarker = {
    id: string;
    lat: number;
    lng: number;
    customerName: string;
    status: string;
};

export function DeliveryMap({ orders }: { orders: OrderMarker[] }) {
    const containerRef = React.useRef<HTMLDivElement | null>(null);
    const mapRef = React.useRef<Leaflet.Map | null>(null);
    const markersRef = React.useRef<Leaflet.Marker[]>([]);

    // Hawassa Bounds
    const HAWASSA_CENTER: [number, number] = [7.06, 38.48];
    const HAWASSA_BOUNDS: [[number, number], [number, number]] = [
        [7.00, 38.40], // Southwest
        [7.12, 38.56], // Northeast
    ];

    React.useEffect(() => {
        let cancelled = false;

        async function setup() {
            if (!containerRef.current || mapRef.current) return;

            const mod = await import("leaflet");
            if (cancelled) return;
            await import("leaflet/dist/leaflet.css");

            const L = mod as unknown as LeafletModule;

            L.Icon.Default.mergeOptions({
                iconUrl: markerIcon.src,
                shadowUrl: markerShadow.src,
            });

            const map = L.map(containerRef.current, {
                maxBounds: HAWASSA_BOUNDS,
                minZoom: 12,
            }).setView(HAWASSA_CENTER, 14);

            mapRef.current = map;

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "OpenStreetMap contributors",
            }).addTo(map);

            updateMarkers(L, map);
        }

        void setup();

        return () => {
            cancelled = true;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    const updateMarkers = (L: LeafletModule, map: Leaflet.Map) => {
        // Clear old markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add new markers
        orders.forEach(order => {
            const marker = L.marker([order.lat, order.lng])
                .addTo(map)
                .bindPopup(`
          <div class="p-2">
            <p class="font-bold text-slate-900">${order.customerName}</p>
            <p class="text-xs text-slate-500">Order #${order.id.slice(0, 6).toUpperCase()}</p>
            <p class="mt-1 text-xs font-semibold text-brand">${order.status}</p>
          </div>
        `);
            markersRef.current.push(marker);
        });

        if (orders.length > 0) {
            const group = L.featureGroup(markersRef.current);
            map.fitBounds(group.getBounds().pad(0.1));
        }
    };

    React.useEffect(() => {
        if (mapRef.current) {
            import("leaflet").then(L => {
                updateMarkers(L as any, mapRef.current!);
            });
        }
    }, [orders]);

    return (
        <div className="relative h-[400px] w-full overflow-hidden rounded-2xl border border-border shadow-soft">
            <div ref={containerRef} className="h-full w-full" />
            <div className="absolute bottom-4 right-4 z-[1000] rounded-lg bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 shadow-sm backdrop-blur-sm">
                Hawassa Distribution Area
            </div>
        </div>
    );
}
