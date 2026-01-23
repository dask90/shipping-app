'use client';

import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
const DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapPickerProps {
    onLocationSelect: (lat: number, lng: number, address?: string) => void;
    initialPos?: [number, number];
    zoom?: number;
}

function LocationMarker({ onLocationSelect, initialPos }: { onLocationSelect: (lat: number, lng: number, address?: string) => void, initialPos?: [number, number] }) {
    const [position, setPosition] = useState<[number, number] | null>(initialPos || [5.6037, -0.1870]); // Default to Accra

    const map = useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            setPosition([lat, lng]);

            // Attempt reverse geocoding
            let addressName = '';
            try {
                // Nominatim requires a User-Agent header to identify the app
                const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`, {
                    headers: {
                        'User-Agent': 'ShipExpress-App/1.0 (contact: dasok@example.com)'
                    }
                });
                if (response.ok) {
                    const data = await response.json();
                    addressName = data.display_name || `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                } else {
                    addressName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                }
            } catch (err) {
                console.error('Geocoding error:', err);
                addressName = `Location at ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            }

            onLocationSelect(lat, lng, addressName);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position} />
    );
}

export default function MapPicker({ onLocationSelect, initialPos = [5.6037, -0.1870], zoom = 13 }: MapPickerProps) {
    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={initialPos}
                zoom={zoom}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker onLocationSelect={onLocationSelect} initialPos={initialPos} />
            </MapContainer>
        </div>
    );
}
