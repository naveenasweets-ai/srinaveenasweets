/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, OverlayView, useJsApiLoader } from '@react-google-maps/api';
import { type LocationPickerProps } from '../../types/types';
import { useStore } from '../../context/StoreContext';
import { FaLocationDot } from 'react-icons/fa6';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const LocationPicker = ({
  lat,
  lng,
  onAddressSelect,
  onClose,
}: LocationPickerProps & {
  onClose?: () => void;
}) => {
  const { showToast } = useStore();
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string;
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
  });

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat,
    lng,
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoaded && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  const handlePositionChange = useCallback(
    (newPosition: google.maps.LatLng) => {
      setPosition({
        lat: newPosition.lat(),
        lng: newPosition.lng(),
      });
    },
    [],
  );

  const handleSelectAddress = async () => {
    if (!geocoderRef.current) {
      showToast('Geocoding service not initialized.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const results = await geocoderRef.current.geocode({
        location: {
          lat: position.lat,
          lng: position.lng,
        },
      });

      if (results.results && results.results.length > 0) {
        const result = results.results[0];
        const addressComponents = result.address_components;

        // Extract address components from Google's response
        let city = '';
        let state = '';
        let pincode = '';

        addressComponents.forEach((component) => {
          if (component.types.includes('locality')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_1')) {
            state = component.long_name;
          }
          if (component.types.includes('postal_code')) {
            pincode = component.long_name;
          }
        });

        onAddressSelect({
          address: result.formatted_address,
          city: city || '',
          state: state || '',
          pincode: pincode || '',
          lat: position.lat,
          lng: position.lng,
        });

        showToast(
          'Address details filled from the selected location.',
          'success',
        );
        onClose?.();
      } else {
        showToast('Unable to fetch location details.', 'error');
      }
    } catch (error) {
      showToast('Unable to fetch location details right now.', 'error');
      console.error('Reverse geocoding error:', error);
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
        const nextPosition = {
          lat: coords.coords.latitude,
          lng: coords.coords.longitude,
        };
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
  }, [showToast]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handlePositionChange(e.latLng);
    }
  };

  const handleMapDragEnd = () => {
    if (mapRef.current) {
      const newCenter = mapRef.current.getCenter();
      if (newCenter) {
        handlePositionChange(newCenter);
      }
    }
  };

  if (!isLoaded) {
    return (
      <div className="h-96 flex items-center justify-center">
        Loading map...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative h-96 overflow-hidden rounded-2xl border border-(--color-border)">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={18}
          onLoad={(map) => {
            mapRef.current = map;
          }}
          onClick={handleMapClick}
          onDragEnd={handleMapDragEnd}
          options={{
            scrollwheel: true,
            fullscreenControl: false,
            streetViewControl: false,
          }}
        >
          <OverlayView
            position={position}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              style={{
                transform: 'translate(-50%, -100%)',
                fontSize: '2rem',
                color: 'red',
              }}
            >
              <FaLocationDot />
            </div>
          </OverlayView>
        </GoogleMap>
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
