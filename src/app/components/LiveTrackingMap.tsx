'use client';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect } from 'react';

// Custom icons
const carIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/744/744465.png', // Delivery Car/Motor icon
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20],
});

const deliveryIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

interface LiveTrackingMapProps {
    agentPos?: [number, number];
    destinationPos?: [number, number];
    zoom?: number;
    agentName?: string;
}

function RecenterMap({ pos }: { pos: [number, number] }) {
    const map = useMap();
    useEffect(() => {
        if (pos) {
            map.flyTo(pos, map.getZoom());
        }
    }, [pos, map]);
    return null;
}

export default function LiveTrackingMap({
    agentPos,
    destinationPos = [5.6037, -0.1870],
    zoom = 13,
    agentName = 'Agent'
}: LiveTrackingMapProps) {
    return (
        <div className="w-full h-full rounded-lg overflow-hidden border border-border">
            <MapContainer
                center={agentPos || destinationPos}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {/* Destination Marker */}
                <Marker position={destinationPos} icon={deliveryIcon}>
                    <Popup>Destination</Popup>
                </Marker>

                {/* Agent Marker */}
                {agentPos && (
                    <>
                        <Marker position={agentPos} icon={carIcon}>
                            <Popup>
                                <div className="text-center">
                                    <div className="font-bold">{agentName}</div>
                                    <div className="text-xs text-muted-foreground">Live Location</div>
                                </div>
                            </Popup>
                        </Marker>
                        <RecenterMap pos={agentPos} />
                    </>
                )}
            </MapContainer>
        </div>
    );
}
