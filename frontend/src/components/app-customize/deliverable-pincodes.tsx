/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useCallback, useRef } from 'react';
import { GoogleMap, OverlayView, Autocomplete, useJsApiLoader } from '@react-google-maps/api';
import { useStore } from '../../context/StoreContext';
import AppCustomApi from '../../api/app-customize';
import type { OutletCoordinate } from '../../types/appContentTypes';
import { FaLocationDot, FaTrashCan, FaPlus, FaMagnifyingGlass } from 'react-icons/fa6';

const mapContainerStyle = {
  width: '100%',
  height: '380px',
  borderRadius: '1rem',
};

const DEFAULT_CENTER = {
  lat: 16.314209,
  lng: 80.435028,
};

const LIBRARIES: ('places')[] = ['places'];

export default function DeliverablePincodes() {
  const { siteContent, setSiteContent, showToast } = useStore();
  const { saveOutletCoordinates, fetchSiteContent } = AppCustomApi();

  const googleMapsApiKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || '';

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey,
    libraries: LIBRARIES,
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const [outlets, setOutlets] = useState<OutletCoordinate[]>([]);
  const [selectedPos, setSelectedPos] = useState<{ lat: number; lng: number }>(DEFAULT_CENTER);
  const [outletName, setOutletName] = useState('');
  const [outletAddress, setOutletAddress] = useState('');
  const [saving, setSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  useEffect(() => {
    const saved = siteContent?.outletCoordinates;
    if (saved && Array.isArray(saved)) {
      setOutlets(saved);
      if (saved.length > 0) {
        setSelectedPos({ lat: saved[0].lat, lng: saved[0].lng });
      }
    }
  }, [siteContent?.outletCoordinates]);

  useEffect(() => {
    if (isLoaded && window.google) {
      geocoderRef.current = new window.google.maps.Geocoder();
    }
  }, [isLoaded]);

  // Reverse geocode position to get formatted address
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;
    setIsGeocoding(true);
    try {
      const results = await geocoderRef.current.geocode({ location: { lat, lng } });
      if (results.results && results.results.length > 0) {
        setOutletAddress(results.results[0].formatted_address);
      }
    } catch (err) {
      console.error('Reverse geocoding error:', err);
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  const handlePositionChange = useCallback((newLat: number, newLng: number) => {
    setSelectedPos({ lat: newLat, lng: newLng });
    reverseGeocode(newLat, newLng);
  }, [reverseGeocode]);

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      handlePositionChange(e.latLng.lat(), e.latLng.lng());
    }
  };

  const handleAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
    autocompleteRef.current = autocomplete;
  };

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setSelectedPos({ lat, lng });
        setOutletAddress(place.formatted_address || place.name || '');
        if (mapRef.current) {
          mapRef.current.panTo({ lat, lng });
          mapRef.current.setZoom(17);
        }
      }
    }
  };

  const handleAddOutlet = () => {
    if (!selectedPos.lat || !selectedPos.lng) {
      showToast('Please select a position on the map.', 'warning');
      return;
    }

    const newOutlet: OutletCoordinate = {
      _id: Date.now().toString(),
      name: outletName.trim() || `Outlet #${outlets.length + 1}`,
      address: outletAddress.trim(),
      lat: selectedPos.lat,
      lng: selectedPos.lng,
    };

    setOutlets((prev) => [...prev, newOutlet]);
    setOutletName('');
    setOutletAddress('');
    showToast('Outlet location added to list. Click "Save Outlet Locations" to persist.', 'info');
  };

  const handleRemoveOutlet = (idOrIndex: string | number) => {
    setOutlets((prev) =>
      prev.filter((item, index) => item._id !== idOrIndex && index !== idOrIndex)
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const result = await saveOutletCoordinates(outlets);
      if (result?.success) {
        const refreshed = await fetchSiteContent();
        if (refreshed?.success) {
          setSiteContent((prev) => ({
            ...prev,
            outletCoordinates: refreshed.outletCoordinates || prev.outletCoordinates,
          }));
        }
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6">
      <div className="rounded-2xl border border-[#e8c86c]/70 bg-[#fff8ef] p-5 shadow-xs">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[#5f1021]">Manage Outlet Coordinates</h3>
          <p className="text-xs text-[#8a6a4a]">
            Search for places or click on the map to add outlet coordinates. Orders can be verified for delivery distance based on these outlet locations.
          </p>
        </div>

        {/* Map Section */}
        {isLoaded ? (
          <div className="space-y-3">
            {/* Places Search Bar */}
            <div className="relative">
              <label className="mb-1 block text-xs font-semibold text-[#5f1021]">
                Search Place / Landmark
              </label>
              <Autocomplete
                onLoad={handleAutocompleteLoad}
                onPlaceChanged={handlePlaceChanged}
              >
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a6a4a]">
                    <FaMagnifyingGlass className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search address, city or landmark..."
                    className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] py-2.5 pl-10 pr-4 text-sm text-[#4d2b1f] outline-none shadow-xs transition focus:border-[#5f1021] focus:ring-2 focus:ring-[#f3d48a]"
                  />
                </div>
              </Autocomplete>
            </div>

            {/* Google Map Container */}
            <div className="relative overflow-hidden rounded-2xl border border-[#e8c86c] shadow-sm">
              <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={selectedPos}
                zoom={16}
                onLoad={(map) => {
                  mapRef.current = map;
                }}
                onClick={handleMapClick}
                options={{
                  scrollwheel: true,
                  fullscreenControl: false,
                  streetViewControl: false,
                  mapTypeControl: false,
                }}
              >
                {/* Marker for current selection */}
                <OverlayView
                  position={selectedPos}
                  mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                >
                  <div
                    style={{
                      transform: 'translate(-50%, -100%)',
                      fontSize: '2.25rem',
                      color: '#5f1021',
                      filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.4))',
                    }}
                  >
                    <FaLocationDot />
                  </div>
                </OverlayView>

                {/* Existing Outlets Markers */}
                {outlets.map((outlet, idx) => (
                  <OverlayView
                    key={outlet._id || idx}
                    position={{ lat: outlet.lat, lng: outlet.lng }}
                    mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                  >
                    <div
                      title={outlet.name || `Outlet #${idx + 1}`}
                      style={{
                        transform: 'translate(-50%, -100%)',
                        fontSize: '1.75rem',
                        color: '#d4533e',
                      }}
                    >
                      <FaLocationDot />
                    </div>
                  </OverlayView>
                ))}
              </GoogleMap>
              <div className="absolute bottom-2 left-2 rounded-lg bg-[#fffdf7]/95 px-3 py-1.5 text-[11px] font-medium text-[#4d2b1f] shadow-md border border-[#e8c86c]">
                Click anywhere on map to reposition marker
              </div>
            </div>

            {/* Selection Form Inputs */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f1021]">
                  Outlet Name / Label
                </label>
                <input
                  type="text"
                  value={outletName}
                  onChange={(e) => setOutletName(e.target.value)}
                  placeholder="e.g. Main Branch, Kothapet"
                  className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-sm text-[#4d2b1f] outline-none transition focus:border-[#5f1021]"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#5f1021]">
                  Coordinates (Lat, Lng)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`${selectedPos.lat.toFixed(6)}, ${selectedPos.lng.toFixed(6)}`}
                  className="w-full rounded-xl border border-[#e8c86c]/60 bg-[#fff8ef] px-3 py-2 text-sm text-[#8a6a4a]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-[#5f1021]">
                  Formatted Address
                </label>
                <input
                  type="text"
                  value={outletAddress}
                  onChange={(e) => setOutletAddress(e.target.value)}
                  placeholder={isGeocoding ? 'Fetching address...' : 'Enter formatted address'}
                  className="w-full rounded-xl border border-[#e8c86c] bg-[#fffdf7] px-3 py-2 text-sm text-[#4d2b1f] outline-none transition focus:border-[#5f1021]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleAddOutlet}
                className="flex items-center gap-2 rounded-xl bg-[#5f1021] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#fff8ef] shadow-sm transition hover:bg-[#7a1a2d] active:scale-95"
              >
                <FaPlus className="h-3 w-3" /> Add Location to List
              </button>
            </div>
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#e8c86c] bg-[#fffdf7]">
            <p className="text-sm font-medium text-[#8a6a4a]">Loading Map API...</p>
          </div>
        )}

        {/* Saved Outlets List */}
        <div className="mt-6 border-t border-[#e8c86c]/60 pt-4">
          <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-[#5f1021]">
            Saved Outlets ({outlets.length})
          </h4>

          {outlets.length === 0 ? (
            <p className="text-xs italic text-[#8a6a4a]">
              No outlet locations added yet. Select a location above and click "Add Location to List".
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {outlets.map((outlet, idx) => (
                <div
                  key={outlet._id || idx}
                  className="relative flex items-start justify-between rounded-xl border border-[#e8c86c] bg-[#fffdf7] p-3 shadow-xs"
                >
                  <div className="space-y-1 pr-6">
                    <span className="inline-block rounded-md bg-[#5f1021] px-2 py-0.5 text-[10px] font-bold text-[#fff8ef]">
                      {outlet.name || `Outlet #${idx + 1}`}
                    </span>
                    {outlet.address && (
                      <p className="line-clamp-2 text-xs text-[#4d2b1f]">{outlet.address}</p>
                    )}
                    <p className="text-[11px] font-mono text-[#8a6a4a]">
                      Lat: {outlet.lat.toFixed(6)}, Lng: {outlet.lng.toFixed(6)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveOutlet(outlet._id || idx)}
                    className="absolute right-3 top-3 text-[#5f1021] transition hover:text-red-700"
                    title="Remove Outlet"
                  >
                    <FaTrashCan className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Save Button */}
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-[#5f1021] px-6 py-2.5 text-sm font-bold text-[#fff8ef] shadow-md transition hover:bg-[#7a1a2d] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Saving...' : 'Save Outlet Locations'}
          </button>
        </div>
      </div>
    </form>
  );
}
