import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  getLocationData,
  searchLocation,
  addLocation,
  updateLocation,
  deleteLocation,
  searchCity, // Import the searchCity function
} from "@/utils/services/location-management";

const AddLocation = () => {
  const [locationData, setLocationData] = useState([]);
  const [stateFilter, setStateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false); // For Add New Modal
  const [editModalVisible, setEditModalVisible] = useState(false); // For Edit Modal
  const [newState, setNewState] = useState(""); // State for new state input
  const [newCity, setNewCity] = useState(""); // State for new city input
  const [selectedLocation, setSelectedLocation] = useState(null); // For selected row data (edit)
  const [searchTerm, setSearchTerm] = useState(""); // New state for the search input
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const itemsPerPage = 10;

  // Predefined list of states
  const statesList = [
    "Punjab",
    "Chandigarh",
    "Jharkhand",
    "Tripura",
    "Tamil Nadu",
    "Mizoram",
    "Nagaland",
    "Madhya Pradesh",
    "Andhra Pradesh",
    "Haryana",
    "Himachal Pradesh",
    "Rajasthan",
    "Assam",
    "Odisha",
    "Chhattisgarh",
    "Karnataka",
    "Jammu and Kashmir",
    "Manipur",
    "Kerala",
    "Dadra and Nagar Haveli",
    "Delhi",
    "Puducherry",
    "Uttarakhand",
    "Bihar",
    "Telangana",
    "Gujarat",
    "Meghalaya",
    "Arunachal Pradesh",
    "Goa",
    "Maharashtra",
    "West Bengal",
    "Uttar Pradesh",
    "Andman Nicobar",
  ];

  // Fetch locations
  const fetchLocations = async (page) => {
    setIsLoading(true);
    try {
      const response = stateFilter
        ? await searchLocation(page + 1, itemsPerPage, stateFilter)
        : await getLocationData(page + 1, itemsPerPage);

      if (response?.data && response.data.length > 0) {
        setLocationData(response.data);
        setTotalCount(parseInt(response.data[0].total_count));
      } else {
        setLocationData([]);
        setTotalCount(0);
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      setLocationData([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(currentPage);
  }, [currentPage, stateFilter]);

  const handlePageClick = (event) => {
    const newPage = event.selected;
    setCurrentPage(newPage);
  };

  const handleStateFilterChange = (e) => {
    setStateFilter(e.target.value);
    setCurrentPage(0); // Reset to first page when filter changes
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value); // Update search term state
  };

  const handleSearchCity = async () => {
    if (searchTerm) {
      try {
        const response = await searchCity(searchTerm);
        setLocationData(response.data); // Update location data with search results
        setTotalCount(response.data.length); // Update total count
      } catch (error) {
        console.error("Error searching city:", error);
        window.alert("Failed to search city.");
      }
    } else {
      fetchLocations(currentPage); // If search term is empty, fetch locations again
    }
  };

  // Function to handle form submission for adding a location
  const handleAddLocation = async () => {
    if (!newState || !newCity) {
      window.alert("Please Enter City OR State.");
      return;
    }
    setIsAdding(true); // Set loading state to true
    try {
      const response = await addLocation(newState, newCity);
      if (response) {
        window.alert("Record has been added successfully!");
        setModalVisible(false); // Close the modal
        fetchLocations(currentPage); // Refresh the location list
      }
    } catch (error) {
      console.error("Error adding location:", error);
      window.alert(error.response?.data?.error || "Failed to add location.");
    } finally {
      setIsAdding(false); // Reset loading state
    }
  };
  

  // Function to handle edit button click
  const handleEditClick = (location) => {
    setSelectedLocation(location); // Set selected location for editing
    setNewState(location.state_name); // Pre-fill state name
    setNewCity(location.city_name); // Pre-fill city name
    setEditModalVisible(true); // Show the edit modal
  };

  // Function to handle update location
  const handleUpdateLocation = async () => {
    if (!newState || !newCity) {
      window.alert("Please fill in all details");
      return;
    }
    setIsUpdating(true); // Set loading state to true
    try {
      const { state_id, city_id } = selectedLocation;
      const response = await updateLocation(
        state_id,
        newState,
        city_id,
        newCity
      );
      if (response) {
        window.alert("Location updated successfully!");
        setEditModalVisible(false); // Close the modal
        fetchLocations(currentPage); // Refresh the location list
      }
    } catch (error) {
      console.error("Error updating location:", error);
      window.alert("Failed to update location.");
    } finally {
      setIsUpdating(false); // Reset loading state
    }
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
            onChange={handleStateFilterChange}
          >
            <option value="">All States...</option>
            {statesList.map((state, index) => (
              <option key={index} value={state}>
                {state}
              </option>
            ))}
          </select>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setModalVisible(true)}
          >
            Add New
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
                  <th scope="col">State</th>
                  <th scope="col">City</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {locationData.map((item, index) => (
                  <tr key={item.city_id}>
                    <td className="text-center">
                      {currentPage * itemsPerPage + index + 1}
                    </td>
                    <td>{item.state_name || "N/A"}</td>
                    <td>{item.city_name || "N/A"}</td>
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
                previousLabel={<ChevronLeft size={18} />}
                nextLabel={<ChevronRight size={18} />}
                breakLabel="..."
                pageCount={Math.ceil(totalCount / itemsPerPage)}
                marginPagesDisplayed={2}
                pageRangeDisplayed={5}
                onPageChange={handlePageClick}
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
  tabIndex="-1"
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
            State
          </label>
          <select
            className="form-control"
            id="state"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
          >
            <option value="">Select a state</option>
            {statesList.map((state, index) => (
              <option key={index} value={state}>
                {state}
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
            onChange={(e) => setNewCity(e.target.value)}
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

      {/* Edit Location Modal */}
      <div
  className={`modal fade ${editModalVisible ? "show" : ""}`}
  id="editLocationModal"
  tabIndex="-1"
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
            id="editState"
            value={newState}
            onChange={(e) => setNewState(e.target.value)}
          >
            <option value="">Select a state</option>
            {statesList.map((state, index) => (
              <option key={index} value={state}>
                {state}
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
            onChange={(e) => setNewCity(e.target.value)}
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
