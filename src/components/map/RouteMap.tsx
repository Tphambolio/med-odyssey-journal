import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Stop, Phase } from '../../types';

// Fix for default marker icons in React-Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface RouteMapProps {
  stops: Stop[];
  phases: Phase[];
  height?: string;
  highlightedStops?: number[];
  onStopClick?: (stop: Stop) => void;
  showAllStops?: boolean;
  className?: string;
}

// Component to fit bounds when stops change
function FitBounds({ stops }: { stops: Stop[] }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length > 0) {
      const bounds = L.latLngBounds(stops.map((s) => [s.lat, s.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, stops]);

  return null;
}

// Create a colored circle marker
function createColoredIcon(color: string, isHighlighted: boolean = false): L.DivIcon {
  const size = isHighlighted ? 14 : 10;
  const borderWidth = isHighlighted ? 3 : 2;

  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: ${size}px;
      height: ${size}px;
      background-color: ${color};
      border: ${borderWidth}px solid white;
      border-radius: 50%;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [size + borderWidth * 2, size + borderWidth * 2],
    iconAnchor: [(size + borderWidth * 2) / 2, (size + borderWidth * 2) / 2],
  });
}

export function RouteMap({
  stops,
  phases,
  height = '400px',
  highlightedStops = [],
  onStopClick,
  showAllStops = true,
  className = '',
}: RouteMapProps) {
  // Create phase color lookup
  const phaseColors = useMemo(() => {
    const colors: Record<string, string> = {};
    phases.forEach((p) => {
      colors[p.name] = p.color;
    });
    return colors;
  }, [phases]);

  // Get route coordinates for polyline
  const routeCoordinates = useMemo(() => {
    return stops.map((stop) => [stop.lat, stop.lon] as [number, number]);
  }, [stops]);

  // Mediterranean center (roughly)
  const center: [number, number] = [38.5, 20.0];

  // Determine which stops to show
  const visibleStops = showAllStops ? stops : stops.filter((s) => highlightedStops.includes(s.id));

  return (
    <div className={`rounded-lg overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={6}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route line */}
        <Polyline
          positions={routeCoordinates}
          color="#06b6d4"
          weight={3}
          opacity={0.8}
        />

        {/* Stop markers */}
        {visibleStops.map((stop) => {
          const color = phaseColors[stop.phase] || '#6b7280';
          const isHighlighted = highlightedStops.includes(stop.id);

          return (
            <Marker
              key={stop.id}
              position={[stop.lat, stop.lon]}
              icon={createColoredIcon(color, isHighlighted)}
              eventHandlers={{
                click: () => onStopClick?.(stop),
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{stop.name}</div>
                  <div className="text-gray-600">{stop.country}</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {stop.arrival} - {stop.departure}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}

        <FitBounds stops={stops} />
      </MapContainer>
    </div>
  );
}
