/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleMap, OverlayView, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { type LocationPickerProps } from '../../types/types';
import { useStore } from '../../context/StoreContext';
import { FaLocationDot, FaMagnifyingGlass } from 'react-icons/fa6';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const LIBRARIES: ('places')[] = ['places'];

const LocationPicker = ({
  lat,
  lng,
  onAddressSelect,
  onClose,
}: LocationPickerProps & {
  onClose?: () => void;
}) => {
  const { showToast } = useStore();
  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';
  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: LIBRARIES,
  });

  const [position, setPosition] = useState<{ lat: number; lng: number }>({
    lat: lat || 16.314209,
    lng: lng || 80.435028,
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

  const handleAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const newLat = place.geometry.location.lat();
        const newLng = place.geometry.location.lng();
        setPosition({ lat: newLat, lng: newLng });
        if (mapRef.current) {
          mapRef.current.panTo({ lat: newLat, lng: newLng });
          mapRef.current.setZoom(17);
        }
      }
    }
  };

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
          'Address details filled from selected location.',
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
        if (mapRef.current) {
          mapRef.current.panTo(nextPosition);
          mapRef.current.setZoom(17);
        }
        showToast(
          'Your current location has been placed on the map.',
          'success',
        );
        setIsLoading(false);
      },
      () => {
        showToast('Using current map center location.', 'info');
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
      <div className="h-96 flex items-center justify-center text-sm text-(--color-muted)">
        Loading Google Maps API...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Places Search Bar */}
      <div className="relative">
        <label className="mb-1 block text-xs font-semibold text-(--color-primary-dark)">
          Search Area, Landmark or Address
        </label>
        <Autocomplete
          onLoad={handleAutocompleteLoad}
          onPlaceChanged={handlePlaceChanged}
        >
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-(--color-muted)">
              <FaMagnifyingGlass className="h-3.5 w-3.5" />
            </span>
            <input
              type="text"
              placeholder="Search area, landmark or street..."
              className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) py-2 pl-9 pr-3 text-xs outline-none transition focus:border-(--color-accent)"
            />
          </div>
        </Autocomplete>
      </div>

      {/* Map View */}
      <div className="relative h-80 overflow-hidden rounded-2xl border border-(--color-border)">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={position}
          zoom={17}
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
          className="flex-1 rounded-xl border border-(--color-accent) bg-(--color-surface) px-3 py-2 text-xs font-semibold text-(--color-accent) transition hover:bg-(--color-accent-light)/20 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          📍 Current Location
        </button>
        <button
          type="button"
          onClick={handleSelectAddress}
          className="flex-1 rounded-xl bg-(--color-accent) px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoading}
        >
          {isLoading ? 'Fetching details...' : 'Confirm Selected Location'}
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
