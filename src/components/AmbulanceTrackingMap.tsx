import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useApp } from '@/context/AppContext';

// Fix default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const hospitalIcon = new L.Icon({
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ambulanceIcon = new L.DivIcon({
  html: `<div style="font-size:28px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.5))">🚑</div>`,
  className: '',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
});

function interpolate(from: { lat: number; lng: number }, to: { lat: number; lng: number }, progress: number) {
  const t = progress / 100;
  return {
    lat: from.lat + (to.lat - from.lat) * t,
    lng: from.lng + (to.lng - from.lng) * t,
  };
}

interface Props {
  filterHospitalIds?: string[];
}

export default function AmbulanceTrackingMap({ filterHospitalIds }: Props) {
  const { hospitals, activeAmbulances } = useApp();

  const hospitalsWithCoords = hospitals.filter(h => h.coordinates);
  const visibleAmbulances = filterHospitalIds
    ? activeAmbulances.filter(a => filterHospitalIds.includes(a.fromHospitalId) || filterHospitalIds.includes(a.toHospitalId))
    : activeAmbulances;

  // Default center on Indore
  const center: [number, number] = [22.72, 75.86];

  return (
    <div className="rounded-lg overflow-hidden border border-border" style={{ height: 400 }}>
      <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Hospital markers */}
        {hospitalsWithCoords.map(h => (
          <Marker key={h.id} position={[h.coordinates!.lat, h.coordinates!.lng]} icon={hospitalIcon}>
            <Popup>
              <div className="text-sm">
                <strong>{h.name}</strong><br />
                {h.location}<br />
                <span style={{ color: h.alertLevel === 'Red' ? '#ef4444' : h.alertLevel === 'Orange' ? '#f97316' : h.alertLevel === 'Yellow' ? '#eab308' : '#22c55e' }}>
                  ● {h.alertLevel}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Ambulance routes and markers */}
        {visibleAmbulances.map(amb => {
          const fromH = hospitals.find(h => h.id === amb.fromHospitalId);
          const toH = hospitals.find(h => h.id === amb.toHospitalId);
          if (!fromH?.coordinates || !toH?.coordinates) return null;

          const currentPos = interpolate(fromH.coordinates, toH.coordinates, amb.progress);
          const routeLine: [number, number][] = [
            [fromH.coordinates.lat, fromH.coordinates.lng],
            [toH.coordinates.lat, toH.coordinates.lng],
          ];

          return (
            <div key={amb.id}>
              <Polyline positions={routeLine} pathOptions={{ color: '#ef4444', weight: 3, dashArray: '10 5' }} />
              <Marker position={[currentPos.lat, currentPos.lng]} icon={ambulanceIcon}>
                <Popup>
                  <div className="text-sm">
                    <strong>🚑 Ambulance</strong><br />
                    Patient: {amb.patientName}<br />
                    {fromH.name} → {toH.name}<br />
                    Progress: {amb.progress}%
                  </div>
                </Popup>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}
