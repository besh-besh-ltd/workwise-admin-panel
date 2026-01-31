import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import {
  getLocationData,
  searchLocation,
  addCityName,
  updateLocation,
  searchCity, // Import the searchCity function
  getStates,
  addCountryName,
  getCountries,
  addStateName,
} from "@/utils/services/location-management";

interface LocationItem {
  city_id: number;
  city_name: string;
  state_name: string;
  country_name: string;
  total_count: string;
}

interface StateItem {
  id: number;
  state_name: string;
}

interface CountryItem {
  id: number;
  country_name: string;
}

interface PageChangeEvent {
  selected: number;
}

const AddLocation: React.FC = () => {
  const [locationData, setLocationData] = useState<LocationItem[]>([]);
  const [stateFilter, setStateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false); // For Add New Modal
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false); // For Edit Modal
  const [newState, setNewState] = useState<string>(""); // State for new state input
  const [newCity, setNewCity] = useState<string>(""); // State for new city input
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null); // For selected row data (edit)
  const [searchTerm, setSearchTerm] = useState<string>(""); // New state for the search input
  const [isAdding, setIsAdding] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [statesList, setStatesList] = useState<StateItem[]>([]); // State for dynamically loaded states
  const [offsetValue, setOffsetValue] = useState<number>(0);
  const [addStateModalVisible, setAddStateModalVisible] = useState<boolean>(false); // For Add State Modal
  const [addCountryModalVisible, setAddCountryModalVisible] = useState<boolean>(false); // For Add Country Modal
  const [addState , setAddState] = useState<string>("");
  const [addCountry,setAddCountry] = useState<string>("");
  const [countryData,setCountryData] = useState<CountryItem[]>([]);
  const [newStateId, setNewStateId] = useState<string>(""); // State for new state ID input



  const itemsPerPage = 10;


  useEffect(() => {
    fetchStates();
    fetchCountries();
    fetchLocations(currentPage);
  }, [currentPage, stateFilter]);
  // Fetch dynamically loaded states
  const fetchStates = (): void => {
    getStates()
      .then((response: { data: StateItem[] }) => {
        if (response?.data) {
          setStatesList(response.data); // Update states list with response data
        } else {
          setStatesList([]); // Default to an empty list if no data
        }
      })
      .catch((err: unknown) => {
        console.error("Error fetching states:", err);
        setStatesList([]);
      });
  };

  const fetchCountries = (): void => {
    getCountries()
      .then((response: { data: CountryItem[] }) => {
        if (response?.data) {
          setCountryData(response.data);
        } else {
          setCountryData([]);
        }
      })
      .catch((error: unknown) => {
        console.log("Error fetching countries:", error);
        setCountryData([]);
      });
  };

  const fetchLocations = (page: number): void => {
    setIsLoading(true);
    const offset = page * itemsPerPage; // Calculate offset for pagination

    const fetchPromise = stateFilter
      ? searchLocation(offset, itemsPerPage, stateFilter)
      : getLocationData(offset, itemsPerPage);

    fetchPromise
      .then((response: { data: LocationItem[] }) => {
        if (response?.data && response.data.length > 0) {
          setLocationData(response.data);
          setTotalCount(parseInt(response.data[0].total_count));
        } else {
          setLocationData([]);
          setTotalCount(0);
        }
      })
      .catch((error: unknown) => {
        console.error("Error fetching locations:", error);
        setLocationData([]);
        setTotalCount(0);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };



  useEffect(() => {
    fetchStates();
    fetchLocations(currentPage);
    console.log("current page",currentPage);
  }, [currentPage, stateFilter]);

  const handlePageClick = (event: PageChangeEvent): void => {
    const newPage = event.selected;
    setCurrentPage(newPage);
  };

  const handleStateFilterChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setStateFilter(e.target.value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value); // Update search term state
  };

  const handleSearchCity = (): void => {
    if (searchTerm) {
      searchCity(searchTerm)
        .then((response: { data: LocationItem[] }) => {
          setLocationData(response.data); // Update location data with search results
          setTotalCount(response.data.length); // Update total count
        })
        .catch((error: unknown) => {
          console.error("Error searching city:", error);
          window.alert("Failed to search city.");
        });
    } else {
      fetchLocations(currentPage); // If search term is empty, fetch locations again
    }
  };


  // Function to handle form submission for adding a location
  const handleAddLocation = (): void => {
    if (!newState || !newCity) {
      window.alert("Please Enter City OR State.");
      return;
    }
    setIsAdding(true); // Set loading state to true

    addCityName(newState, newCity)
      .then((response: unknown) => {
        if (response) {
          window.alert("Record has been added successfully!");
          setModalVisible(false); // Close the modal
          fetchLocations(currentPage); // Refresh the location list
        }
      })
      .catch((error: { response?: { data?: { error?: string } } }) => {
        console.error("Error adding location:", error);
        window.alert(error.response?.data?.error || "Failed to add location.");
      })
      .finally(() => {
        setIsAdding(false); // Reset loading state
      });
  };


  // Function to handle edit button click
  const handleEditClick = (location: LocationItem): void => {
    setSelectedLocation(location); // Set selected location for editing
    const matchingState = statesList.find((state) => state.state_name === location.state_name);
    if (matchingState) {
      setNewStateId(matchingState.id.toString()); // Set ID as string (because <select> values are strings)
    } else {
      setNewStateId(""); // Or handle no match scenario
    } // Pre-fill state name
    setNewCity(location.city_name); // Pre-fill city name
    setEditModalVisible(true); // Show the edit modal
  };

  // Function to handle update location
  const handleUpdateLocation = (): void => {
    if (!newStateId || !newCity) {
      window.alert("Please fill in all details");
      return;
    }
    setIsUpdating(true); // Set loading state to true

    const { city_id } = selectedLocation!;
   const state_id = newStateId;
    updateLocation(state_id, newState, city_id, newCity)
      .then((response: unknown) => {
        if (response) {
          window.alert("Location updated successfully!");
          setEditModalVisible(false); // Close the modal
          fetchLocations(currentPage); // Refresh the location list
        }
      })
      .catch((error: unknown) => {
        console.error("Error updating location:", error);
        window.alert("Failed to update location.");
      })
      .finally(() => {
        setIsUpdating(false); // Reset loading state
      });
  };


  //
  const handlePageChange = (data: PageChangeEvent): void => {
    setCurrentPage(data.selected);
  };


 const handleAddCountry = (): void => {
  if (addCountry === "") {
    window.alert("Please Enter Country Name");
    return;
  }
  setIsAdding(true);

  addCountryName(addCountry)
    .then((response: unknown) => {
      if (response) {
        window.alert("Record has been added successfully!");
        setAddStateModalVisible(false); // Close the modal
        fetchLocations(currentPage); // Refresh the location list
      }
    })
    .catch((error: { response?: { data?: { error?: string } } }) => {
      console.error("Error adding location:", error);
      window.alert(error.response?.data?.error || "Failed to add location.");
    })
    .finally(() => {
      setIsAdding(false); // Reset loading state
    });
};

const handleAddState = (): void => {
  if (addState === "") {
    window.alert("Please Enter Country Name");
    return;
  }
  setIsAdding(true);

  addStateName(addState, addCountry)
    .then((response: unknown) => {
      if (response) {
        window.alert("Record has been added successfully!");
        setAddStateModalVisible(false); // Close the modal
        fetchLocations(currentPage); // Refresh the location list
      }
    })
    .catch((error: { response?: { data?: { error?: string } } }) => {
      console.error("Error adding location:", error);
      window.alert(error.response?.data?.error || "Failed to add location.");
    })
    .finally(() => {
      setIsAdding(false); // Reset loading state
    });
};


  return (
    <div className="container-fluid p-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="h4">Location Management</h2>
        </div>
        <div className="col-auto">
          <input
            type="text"
            className="form-control"
            placeholder="Search by City"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyUp={handleSearchCity} // Trigger search on keyup
          />
        </div>
        <div className="col-auto">
          <select
            className="form-control"
            value={stateFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewState(e.target.value)}
          >
            <option value="">All States...</option>
            {statesList.map((state) => (
              <option key={state.id} value={state.id}>
                {state.state_name}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setModalVisible(true)}
          >
            Add New City
          </button>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-success"
            onClick={() => setAddCountryModalVisible(true)}
          >
            Add New Country
          </button>
        </div>

        <div className="col-auto">
          <button
            className="btn btn-info"
            onClick={() => setAddStateModalVisible(true)}
          >
            Add New State
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : locationData.length === 0 ? (
        <div className="alert alert-info text-center">No locations found</div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-hover">
              <thead className="table-light">
                <tr>
                  <th
                    scope="col"
                    className="text-center"
                    style={{ width: "80px" }}
                  >
                    S No.
                  </th>
                  <th scope="col">Country</th>
                  <th scope="col">State</th>
                  <th scope="col">City</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locationData
                  .filter((item) => item.city_name && item.state_name) // Filter out rows with null or undefined city_name or state_name
                  .map((item, index) => (
                    <tr key={item.city_id}>
                      <td className="text-center">
                        {currentPage * itemsPerPage + index + 1}
                      </td>
                      <td>{item.country_name}</td>
                      <td>{item.state_name}</td>
                      <td>{item.city_name}</td>
                      <td>
                        <button
                          className="btn btn-outline-primary btn-sm border-0"
                          onClick={() => handleEditClick(item)}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {totalCount > itemsPerPage && (
            <div className="d-flex flex-column align-items-center gap-2 mt-4">
              <ReactPaginate
                previousLabel={
                  <FontAwesomeIcon icon={faChevronLeft} size="sm" />
                }
                nextLabel={<FontAwesomeIcon icon={faChevronRight} size="sm" />}
                breakLabel="..."
                pageCount={Math.ceil(totalCount / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageChange}
                forcePage={currentPage}
                containerClassName="pagination mb-0"
                pageClassName="page-item"
                pageLinkClassName="page-link"
                previousClassName="page-item"
                previousLinkClassName="page-link"
                nextClassName="page-item"
                nextLinkClassName="page-link"
                activeClassName="active"
              />
            </div>
          )}
        </>
      )}

      {/* Add New Location Modal */}
      <div
        className={`modal fade ${modalVisible ? "show" : ""}`}
        id="addLocationModal"
        tabIndex={-1}
        aria-labelledby="addLocationModalLabel"
        aria-hidden={!modalVisible}
        style={{ display: modalVisible ? "block" : "none" }} // Manually manage modal display
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addLocationModalLabel">
                Add New Location
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setModalVisible(false)} // Close the modal
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="state" className="form-label">
                  States
                </label>
                <select
                  className="form-control"
                  id="state"
                  value={newState}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewState(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {statesList.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  value={newCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCity(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setModalVisible(false)} // Close the modal
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddLocation}
                disabled={isAdding} // Disable button if isAdding is true
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/*  Add  New Country Modal*/}
      <div
        className={`modal fade ${addCountryModalVisible ? "show" : ""}`}
        id="addCountryModal"
        tabIndex={-1}
        aria-labelledby="addCountryModalVisible"
        aria-hidden={!addCountryModalVisible}
        style={{ display: addCountryModalVisible ? "block" : "none" }} // Manually manage modal display
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addLocationModalLabel">
                Add New Country
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setAddCountryModalVisible(false)} // Close the modal
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="city" className="form-label">
                  Country
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  value={addCountry}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddCountry(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setAddCountryModalVisible(false)} // Close the modal
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddCountry}
                disabled={isAdding} // Disable button if isAdding is true
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add new State Modal */}
      <div
        className={`modal fade ${addStateModalVisible ? "show" : ""}`}
        id="addStateModal"
        tabIndex={-1}
        aria-labelledby="addLocationModalLabel"
        aria-hidden={!addStateModalVisible}
        style={{ display: addStateModalVisible ? "block" : "none" }} // Manually manage modal display
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="addLocationModalLabel">
                Add New State
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setAddStateModalVisible(false)} // Close the modal
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="state" className="form-label">
                  Country
                </label>
                <select
                  className="form-control"
                  id="state"
                  value={addCountry}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setAddCountry(e.target.value)}
                >
                  <option value="">Select a Country</option>
                  {countryData.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.country_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="city" className="form-label">
                  State
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="city"
                  value={addState}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAddState(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setModalVisible(false)} // Close the modal
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleAddState}
                disabled={isAdding} // Disable button if isAdding is true
              >
                {isAdding ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Location Modal */}
      <div
        className={`modal fade ${editModalVisible ? "show" : ""}`}
        id="editLocationModal"
        tabIndex={-1}
        aria-labelledby="editLocationModalLabel"
        aria-hidden={!editModalVisible}
        style={{ display: editModalVisible ? "block" : "none" }} // Manually manage modal display
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="editLocationModalLabel">
                Edit Location
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
                onClick={() => setEditModalVisible(false)} // Close the modal
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label htmlFor="editState" className="form-label">
                  State
                </label>
                <select
                  className="form-control"
                  id="state"
                  value={newStateId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setNewStateId(e.target.value)}
                >
                  <option value="">Select a state</option>
                  {statesList.map((state) => (
                    <option key={state.id} value={state.id}>
                      {state.state_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label htmlFor="editCity" className="form-label">
                  City
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="editCity"
                  value={newCity}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCity(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
                onClick={() => setEditModalVisible(false)} // Close the modal
              >
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={handleUpdateLocation}
                disabled={isUpdating} // Disable button if isUpdating is true
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddLocation;
