import React, { useState, useEffect } from "react";

interface Country {
  id: number;
  country_name: string;
}

interface State {
  id: number;
  state_name: string;
}

interface City {
  id: number;
  city_name: string;
}

interface LocationData {
  address: string;
  postal_code: string;
}

interface EditingLocation {
  id?: number | string;
  country_id?: string;
  state_id?: string;
  city_id?: string | number;
  address?: string;
  postal_code?: string;
  country?: string | number;
  state?: string | number;
  city?: string | number;
  country_name?: string;
  state_name?: string;
  city_name?: string;
}

interface SavedLocation {
  country: string;
  country_name: string;
  state: string;
  state_name: string;
  city: string | number;
  city_name: string;
  address: string;
  postal_code: string;
  id: number | string;
}

interface ApiResponse<T> {
  data: {
    data: T;
  };
}

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (location: SavedLocation) => void;
  countryList: Country[];
  handleGetStates: (countryId: string | number) => Promise<ApiResponse<State[]> | any>;
  handleGetCities: (stateId: string | number) => Promise<ApiResponse<City[]> | any>;
  editingLocation?: EditingLocation | null;
}

const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSave,
  countryList,
  handleGetStates,
  handleGetCities,
  editingLocation = null
}) => {
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string | number>("");
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({
    address: "",
    postal_code: ""
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (editingLocation) {
      setSelectedCountry(editingLocation.country_id || "");
      setSelectedState(editingLocation.state_id || "");
      setSelectedCity(editingLocation.city_id || "");

      setLocationData({
        address: editingLocation.address || "",
        postal_code: editingLocation.postal_code || ""
      });
    }
  }, [editingLocation]);

  useEffect(() => {
    if (selectedCountry) {
      handleGetStates(selectedCountry)
        .then((res) => {
          setStates(res?.data?.data || []);
        })
        .catch((err) => console.error("Error fetching states:", err));
    } else {
      setStates([]);
      setCities([]);
    }
  }, [selectedCountry]);

  useEffect(() => {
    if (selectedState) {
      handleGetCities(selectedState)
        .then((res) => setCities(res?.data?.data || []))
        .catch((err) => console.error("Error fetching cities:", err));
    } else {
      setCities([]);
    }
  }, [selectedState]);

  const handleSave = async () => {
    if (!selectedCountry || !selectedState) {
      alert("Please select Country, State, and City");
      return;
    }

    const countryName = countryList.find(c => String(c.id) === selectedCountry)?.country_name || "";
    const stateName = states.find(s => String(s.id) === selectedState)?.state_name || "";
    const cityName = cities.find(c => String(c.id) === String(selectedCity))?.city_name || "";

    const location: SavedLocation = {
      country: selectedCountry,
      country_name: countryName,
      state: selectedState,
      state_name: stateName,
      city: selectedCity,
      city_name: cityName,
      address: locationData.address,
      postal_code: locationData.postal_code,
      id: editingLocation?.id || Date.now()
    };

    setIsLoading(true);
    try {
      onSave(location);
      handleClose();
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedCountry("");
    setSelectedState("");
    setSelectedCity("");
    setStates([]);
    setCities([]);
    setLocationData({ address: "", postal_code: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1050
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "8px",
        width: "90%",
        maxWidth: "600px",
        maxHeight: "90vh",
        overflow: "auto",
        padding: "20px"
      }}>
        <h5 className="mb-3">{editingLocation ? "Edit Location" : "Add New Location"}</h5>

        <div className="mb-3">
          <label className="form-label">Country *</label>
          <select
            className="form-control"
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState("");
              setSelectedCity("");
            }}
          >
            <option value="">Select Country</option>
            {countryList?.map((country) => (
              <option key={country.id} value={country.id}>
                {country.country_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">State *</label>
          <select
            className="form-control"
            value={selectedState}
            onChange={(e) => {
              setSelectedState(e.target.value);
              setSelectedCity("");
            }}
            disabled={!selectedCountry}
          >
            <option value="">Select State</option>
            {states?.map((state) => (
              <option key={state.id} value={state.id}>
                {state.state_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">City *</label>
          <select
            className="form-control"
            value={selectedCity}
            onChange={(e) => setSelectedCity(Number(e.target.value))}
            disabled={!selectedState}
          >
            <option value="">Select City</option>
            {cities?.map((city) => (
              <option key={city.id} value={city.id}>
                {city.city_name}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-3">
          <label className="form-label">Address</label>
          <textarea
            className="form-control"
            value={locationData.address}
            onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
            placeholder="Enter address"
            rows={3}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Postal Code</label>
          <input
            type="text"
            className="form-control"
            value={locationData.postal_code}
            onChange={(e) => setLocationData({ ...locationData, postal_code: e.target.value })}
            placeholder="Enter postal code"
          />
        </div>

        <div className="d-flex justify-content-end gap-2">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Location"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
