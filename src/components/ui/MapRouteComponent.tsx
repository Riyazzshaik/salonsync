import { useEffect, useState, useRef } from 'react';
import { useMap, Marker, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { handleError } from '../../utils/errorHandler';

interface MapRouteComponentProps {
  destination: { lat: number; lng: number };
  customIcon: L.Icon;
  onRouteCalculated?: (distance: number, duration: number) => void;
  onLocationError?: (error: string) => void;
}

export const MapRouteComponent: React.FC<MapRouteComponentProps> = ({ 
  destination, 
  customIcon, 
  onRouteCalculated,
  onLocationError
}) => {
  const map = useMap();
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  
  // Ref to prevent excessive identical API calls (Debounce/Lock)
  const hasFetched = useRef(false);

  // Custom user location icon (blue dot)
  const userIcon = new L.Icon({
    iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    let isMounted = true;
    
    // Reset fetch lock if destination changes
    hasFetched.current = false;

    const fetchRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }) => {
      if (hasFetched.current) return;
      hasFetched.current = true;
      
      try {
        const apiKey = import.meta.env.VITE_ORS_API_KEY;
        if (!apiKey) throw new Error("ORS API Key missing");

        const response = await fetch(
          `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.lng},${start.lat}&end=${end.lng},${end.lat}`
        );

        if (!response.ok) throw new Error("Failed to fetch route");

        const data = await response.json();
        
        if (data.features && data.features.length > 0) {
          const feature = data.features[0];
          const coords = feature.geometry.coordinates;
          // ORS returns [lng, lat], Leaflet needs [lat, lng]
          const latLngs: [number, number][] = coords.map((c: number[]) => [c[1], c[0]]);
          
          if (isMounted) {
            setRouteCoords(latLngs);
            if (onRouteCalculated) {
              // Convert meters to km, seconds to minutes
              const dist = feature.properties.summary.distance / 1000;
              const dur = feature.properties.summary.duration / 60;
              onRouteCalculated(dist, dur);
            }

            // Fit bounds dynamically to show entire route + user + salon
            const bounds = L.latLngBounds([
              [start.lat, start.lng],
              [end.lat, end.lng],
              ...latLngs
            ]);
            map.fitBounds(bounds, { padding: [50, 50], animate: true, duration: 1 });
          }
        }
      } catch (err) {
        handleError("MapRouteComponent.fetchRoute", err);
        if (isMounted && onLocationError) onLocationError("Failed to calculate route");
      }
    };

    // Attempt Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
          const userCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(userCoords);
          
          // Small debounce before fetching
          setTimeout(() => {
            fetchRoute(userCoords, destination);
          }, 300);
        },
        () => {
          if (isMounted && onLocationError) onLocationError("Enable location access to get live directions");
          // Center on destination gracefully if user location fails
          map.setView([destination.lat, destination.lng], 14, { animate: true });
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
    } else {
      if (onLocationError) onLocationError("Enable location access to get live directions");
      map.setView([destination.lat, destination.lng], 14, { animate: true });
    }

    return () => {
      isMounted = false;
    };
  }, [destination.lat, destination.lng]);

  return (
    <>
      <Marker position={[destination.lat, destination.lng]} icon={customIcon} />
      {userLocation && <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />}
      {routeCoords.length > 0 && (
        <Polyline 
          positions={routeCoords} 
          color="#3B82F6" 
          weight={5} 
          opacity={0.8} 
          lineCap="round"
          lineJoin="round"
        />
      )}
    </>
  );
};
