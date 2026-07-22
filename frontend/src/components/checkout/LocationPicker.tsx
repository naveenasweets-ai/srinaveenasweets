/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect } from 'react';
import { MapContainer, Marker, TileLayer, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { DEFAULT_POSITION, type LocationPickerProps } from '../../types/types';
import { MapController } from '../../utils/customer';
import { useStore } from '../../context/StoreContext';

const redMarkerIcon = L.divIcon({
  className: 'red-marker-icon',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#ef4444" width="40" height="40"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5" fill="#fff"/></svg>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});


function LocationMarker({
  position,
  onPositionChange,
}: {
  position: [number, number];
  onPositionChange: (pos: [number, number]) => void;
}) {
  const map = useMapEvents({
    dragend() {
      onPositionChange([map.getCenter().lat, map.getCenter().lng]);
    },
    moveend() {
      onPositionChange([map.getCenter().lat, map.getCenter().lng]);
    },
  });

  return <Marker position={position} icon={redMarkerIcon} />;
}

const LocationPicker = ({
  lat = 16.314209,
  lng = 80.435028,
  onAddressSelect,
}: LocationPickerProps) => {
  const { showToast } = useStore();
  const [position, setPosition] = useState<[number, number]>([
    Number.isFinite(lat) ? lat : DEFAULT_POSITION[0],
    Number.isFinite(lng) ? lng : DEFAULT_POSITION[1],
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const handlePositionChange = useCallback((value: [number, number]) => {
    setPosition(value);
  }, []);

  const handleSelectAddress = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${position[0]}&lon=${position[1]}`,
      );
      const data = await response.json();

      const addressParts = [
        data.address?.building,
        data.address?.house_number,
        data.name,
        data.address?.road,
        data.address?.suburb,
        data.address?.county,
      ].filter(Boolean);

      const addressLine = addressParts.join(', ');
      console.log('data: ', data);
      onAddressSelect({
        address: addressLine,
        city:
          data.address.city ||
          data.address.town ||
          data.address.village ||
          data.address.state_district ||
          '',
        state: data.address.state || '',
        pincode: data.address.postcode || '',
        lat: position[0],
        lng: position[1],
      });
      showToast(
        'Address details filled from the selected location.',
        'success',
      );
    } catch {
      showToast('Unable to fetch location details right now.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by this browser.', 'error');
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (coords) => {
        const nextPosition: [number, number] = [
          coords.coords.latitude,
          coords.coords.longitude,
        ];
        setPosition(nextPosition);
        showToast(
          'Your current location has been placed on the map.',
          'success',
        );
        setIsLoading(false);
      },
      () => {
        showToast('Using the default Guntur location.', 'success');
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  useEffect(() => {
    handleCurrentLocation();
  }, [handleCurrentLocation]);

  return (
    <div className="space-y-3">
      <div className="relative h-96 overflow-hidden rounded-2xl border border-(--color-border)">
        <MapContainer
          center={position}
          zoom={18}
          scrollWheelZoom
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapController position={position} />
          <LocationMarker
            position={position}
            onPositionChange={handlePositionChange}
          />
        </MapContainer>
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCurrentLocation}
          className="flex-1 rounded-2xl border border-(--color-accent) bg-(--color-surface) px-4 py-2.5 text-sm font-semibold text-(--color-accent) transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          current location
        </button>
        <button
          type="button"
          onClick={handleSelectAddress}
          className="flex-1 rounded-2xl bg-(--color-accent) px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Fetching address...' : 'Select address'}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
