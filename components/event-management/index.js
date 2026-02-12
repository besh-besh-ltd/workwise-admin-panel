import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import Image from "next/image";
import ReactPaginate from "react-paginate";
import {
  handleGetMarquee,
  handleCreateMarquee,
  handleUpdateMarquee,
  handleGetEventList,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
} from "@/utils/services/cms-management";
import { Editor } from "@tinymce/tinymce-react";
import parse from "html-react-parser";
import { formatDate } from "@/utils/dateUtils";

// Default marquee settings
const defaultMarqueeSettings = {
  text: "<p>Welcome to our platform! Check out the latest updates and events.</p>",
  direction: "left",
  speed: 50,
  isVisible: true,
  backgroundColor: "transparent",
};

// Direction options
const directionOptions = [
  { value: "left", label: "Left to Right" },
  { value: "right", label: "Right to Left" },
//   { value: "up", label: "Bottom to Top" }, // Commented out as per current implementation
//   { value: "down", label: "Top to Bottom" },    
];

// Role options
const roleOptions = [
  { value: "", label: "Select Role" },
  { value: "Speaker", label: "Speaker" },
  { value: "Organizer", label: "Organizer" },
  { value: "Sponsor", label: "Sponsor" },
  { value: "Exhibitor", label: "Exhibitor" },
  { value: "Attendee", label: "Attendee" },
  { value: "Volunteer", label: "Volunteer" },
  { value: "Partner", label: "Partner" },
  { value: "Other", label: "Other" },
];

const EventManagement = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(router.query.tab || "marquee");

  // Marquee state
  const [marqueeSettings, setMarqueeSettings] = useState(defaultMarqueeSettings);
  const [marqueeId, setMarqueeId] = useState(null);
  const [isSavingMarquee, setIsSavingMarquee] = useState(false);
  const [isLoadingMarquee, setIsLoadingMarquee] = useState(false);

  // Event state
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [eventForm, setEventForm] = useState({
    title: "",
    startDate: "",
    endDate: "",
    city: "",
    venue: "",
    role: "",
    description: "",
    image: null,
    imagePreview: null,
  });

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push(
      { pathname: router.pathname, query: { ...router.query, tab } },
      undefined,
      { shallow: true }
    );
  };

  // Marquee handlers
  const handleMarqueeChange = (field, value) => {
    setMarqueeSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveMarqueeSettings = async () => {
    setIsSavingMarquee(true);
    try {
      const payload = {
        text: marqueeSettings.text,
        direction: marqueeSettings.direction,
        speed: marqueeSettings.speed,
        is_visible: marqueeSettings.isVisible,
        background_color: marqueeSettings.backgroundColor,
      };

      if (marqueeId) {
        // Update existing marquee
        await handleUpdateMarquee(marqueeId, payload);
        toast.success("Marquee settings updated successfully!");
      } else {
        // Create new marquee
        const response = await handleCreateMarquee(payload);
        if (response.data?.id) {
          setMarqueeId(response.data.id);
        }
        toast.success("Marquee settings created successfully!");
      }
    } catch (error) {
      const errorMsg = error?.error?.response?.data?.message || "Failed to save marquee settings";
      toast.error(errorMsg);
    } finally {
      setIsSavingMarquee(false);
    }
  };

  const resetMarqueeSettings = () => {
    setMarqueeSettings(defaultMarqueeSettings);
  };

  // Event handlers
  const handleEventFormChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Clear endDate if startDate is changed to after current endDate
      if (name === "startDate" && prev.endDate && value > prev.endDate) {
        updated.endDate = "";
      }
      return updated;
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEventForm((prev) => ({
        ...prev,
        image: file,
        imagePreview: URL.createObjectURL(file),
      }));
    }
  };

  const openAddEventModal = () => {
    setSelectedEvent(null);
    setEventForm({
      title: "",
      startDate: "",
      endDate: "",
      city: "",
      venue: "",
      role: "",
      description: "",
      image: null,
      imagePreview: null,
    });
    setShowEventModal(true);
  };

  const openEditEventModal = (event) => {
    setSelectedEvent(event);
    setEventForm({
      title: event.title,
      startDate: event.startDate,
      endDate: event.endDate,
      city: event.city,
      venue: event.venue,
      role: event.role,
      description: event.description,
      image: null,
      imagePreview: event.imageUrl,
    });
    setShowEventModal(true);
  };

  const openDeleteModal = (event) => {
    setSelectedEvent(event);
    setShowDeleteModal(true);
  };

  const saveEvent = async () => {
    if (!eventForm.title || !eventForm.startDate || !eventForm.endDate || !eventForm.city || !eventForm.venue || !eventForm.role || !eventForm.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Image is required: for new events, image must be uploaded; for existing events, must have existing image or new upload
    const hasImage = eventForm.image || (selectedEvent && eventForm.imagePreview);
    if (!hasImage) {
      toast.error("Please upload an event image");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("title", eventForm.title);
      formData.append("start_date", eventForm.startDate);
      formData.append("end_date", eventForm.endDate);
      formData.append("city", eventForm.city);
      formData.append("venue", eventForm.venue);
      formData.append("role", eventForm.role);
      formData.append("description", eventForm.description);
      if (eventForm.image) {
        formData.append("image", eventForm.image);
      }

      if (selectedEvent) {
        // Update existing event
        await handleUpdateEvent(selectedEvent.id, formData);
        toast.success("Event updated successfully!");
      } else {
        // Add new event
        await handleCreateEvent(formData);
        toast.success("Event added successfully!");
      }
      setShowEventModal(false);
      fetchEvents();
    } catch (error) {
      const errorMsg = error?.error?.response?.data?.message || "Failed to save event";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async () => {
    setLoading(true);
    try {
      await handleDeleteEvent(selectedEvent.id);
      toast.success("Event deleted successfully!");
      setShowDeleteModal(false);
      fetchEvents();
    } catch (error) {
      const errorMsg = error?.error?.response?.data?.message || "Failed to delete event";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };


  // Get animation duration based on speed (inverse relationship)
  const getAnimationDuration = () => {
    return `${Math.max(2.5, (105 - marqueeSettings.speed) * 0.5)}s`;
  };

  // Marquee animation keyframes
  const marqueeKeyframes = `
    .marquee-wrapper {
      display: flex;
      width: 100%;
    }
    .marquee-wrapper.direction-left {
      justify-content: flex-start;
    }
    .marquee-wrapper.direction-right {
      justify-content: flex-end;
    }
    @keyframes marquee-left {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(-100% - 400px)); }
    }
    @keyframes marquee-right {
      0% { transform: translateX(0); }
      100% { transform: translateX(calc(100% + 400px)); }
    }
    @keyframes marquee-up {
      0% { transform: translateY(100%); }
      100% { transform: translateY(-100%); }
    }
    @keyframes marquee-down {
      0% { transform: translateY(-100%); }
      100% { transform: translateY(100%); }
    }
    .marquee-content p,
    .marquee-content h1,
    .marquee-content h2,
    .marquee-content h3,
    .marquee-content h4,
    .marquee-content h5,
    .marquee-content h6,
    .marquee-content span,
    .marquee-content div {
      margin: 0;
      padding: 0;
      display: inline;
    }
  `;

  // Fetch marquee settings
  const fetchMarquee = async () => {
    setIsLoadingMarquee(true);
    try {
      const response = await handleGetMarquee();
      if (response.data) {
        const data = response.data;
        setMarqueeId(data.id);
        setMarqueeSettings({
          text: data.text || defaultMarqueeSettings.text,
          direction: data.direction || defaultMarqueeSettings.direction,
          speed: data.speed || defaultMarqueeSettings.speed,
          isVisible: data.is_visible ?? defaultMarqueeSettings.isVisible,
          backgroundColor: data.background_color || defaultMarqueeSettings.backgroundColor,
        });
      }
    } catch (error) {
      console.log("No existing marquee found, using defaults");
    } finally {
      setIsLoadingMarquee(false);
    }
  };

  // Fetch events list
  const fetchEvents = async () => {
    setIsLoadingEvents(true);
    try {
      const response = await handleGetEventList(page);
      if (response.data) {
        const eventsList = response.data.map((event) => ({
          id: event.id,
          title: event.title,
          startDate: event.start_date,
          endDate: event.end_date,
          city: event.city,
          venue: event.venue,
          role: event.role,
          description: event.description,
          imageUrl: event.image_url,
        }));
        setEvents(eventsList);
        setTotalPages(response.total_count || 1);
      }
    } catch (error) {
      console.log("Error fetching events:", error);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  useEffect(() => {
  if (router?.isReady && router?.query?.tab) {
    setActiveTab(router.query.tab);
  }
}, [router?.isReady, router?.query?.tab]);

  // Load marquee on mount
  useEffect(() => {
    fetchMarquee();
  }, []);

  // Load events when page changes or tab is events
  useEffect(() => {
    if (activeTab === "events") {
      fetchEvents();
    }
  }, [page, activeTab]);

  return (
    <>
      <style>{marqueeKeyframes}</style>
      <ToastContainer />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">CMS Management</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card">
            {/* Tab Navigation */}
            <div className="card-header p-0 pt-1">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === "marquee" ? "active" : ""}`}
                    onClick={() => handleTabChange("marquee")}
                    style={{ cursor: "pointer" }}
                  >
                    Marquee Management
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === "events" ? "active" : ""}`}
                    onClick={() => handleTabChange("events")}
                    style={{ cursor: "pointer" }}
                  >
                    Event Management
                  </a>
                </li>
              </ul>
            </div>

            <div className="card-body">
              {/* Marquee Management Tab */}
              {activeTab === "marquee" && (
                <div className="row">
                  {/* Settings Panel */}
                  <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="card-title mb-0">Marquee Settings</h5>
                      </div>
                      <div className="card-body">
                        {isLoadingMarquee ? (
                          <div className="text-center py-5">
                            <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                            <p className="text-muted mt-2 mb-0">Loading settings...</p>
                          </div>
                        ) : (
                          <>
                        {/* Text */}
                        <div className="form-group">
                          <label>Marquee Text *</label>
                          <Editor
                            apiKey={process.env.NEXT_PUBLIC_TINY_MCE_API_KEY}
                            value={marqueeSettings.text}
                            onEditorChange={(newValue) =>
                              handleMarqueeChange("text", newValue)
                            }
                            init={{
                              height: 200,
                              menubar: false,
                              plugins: ["link", "lists", "code"],
                              toolbar:
                                "bold italic underline strikethrough | forecolor backcolor | " +
                                "fontfamily fontsize | link | removeformat | code",
                              content_style:
                                "body { font-family: 'Source Sans Pro', sans-serif; font-size: 16px; }",
                              placeholder: "Enter marquee text...",
                            }}
                          />
                        </div>

                        {/* Background Color */}
                        <div className="form-group">
                          <label>Background Color</label>
                          <div className="d-flex align-items-center">
                            <input
                              type="color"
                              className="form-control form-control-color"
                              value={marqueeSettings.backgroundColor}
                              onChange={(e) =>
                                handleMarqueeChange("backgroundColor", e.target.value)
                              }
                              style={{ width: "50px", height: "38px", padding: "2px" }}
                            />
                            <input
                              type="text"
                              className="form-control ml-2"
                              value={marqueeSettings.backgroundColor}
                              onChange={(e) =>
                                handleMarqueeChange("backgroundColor", e.target.value)
                              }
                              placeholder="#000080"
                            />
                          </div>
                        </div>

                        {/* Direction */}
                        <div className="form-group">
                          <label>Direction</label>
                          <select
                            className="form-control"
                            value={marqueeSettings.direction}
                            onChange={(e) =>
                              handleMarqueeChange("direction", e.target.value)
                            }
                          >
                            {directionOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Speed */}
                        <div className="form-group">
                          <label>Speed: {marqueeSettings.speed}%</label>
                          <input
                            type="range"
                            className="form-control-range"
                            min="10"
                            max="100"
                            value={marqueeSettings.speed}
                            onChange={(e) =>
                              handleMarqueeChange("speed", parseInt(e.target.value))
                            }
                          />
                          <div className="d-flex justify-content-between">
                            <small className="text-muted">Slow</small>
                            <small className="text-muted">Fast</small>
                          </div>
                        </div>

                        {/* Show/Hide Toggle */}
                        <div className="form-group">
                          <div className="custom-control custom-switch">
                            <input
                              type="checkbox"
                              className="custom-control-input"
                              id="marqueeVisibility"
                              checked={marqueeSettings.isVisible}
                              onChange={(e) =>
                                handleMarqueeChange("isVisible", e.target.checked)
                              }
                            />
                            <label className="custom-control-label" htmlFor="marqueeVisibility">
                              {marqueeSettings.isVisible ? "Visible" : "Hidden"}
                            </label>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="d-flex mt-4">
                          <button
                            className="btn btn-success mr-2"
                            onClick={saveMarqueeSettings}
                            disabled={isSavingMarquee}
                          >
                            {isSavingMarquee ? "Saving..." : "Save Settings"}
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={resetMarqueeSettings}
                          >
                            Reset
                          </button>
                        </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Preview Panel */}
                  <div className="col-lg-6 col-md-12 mb-4">
                    <div className="card">
                      <div className="card-header">
                        <h5 className="card-title mb-0">Live Preview</h5>
                      </div>
                      <div className="card-body">
                        <div className="border rounded overflow-hidden">
                          {marqueeSettings.isVisible ? (
                            <div
                              style={{
                                backgroundColor: marqueeSettings.backgroundColor,
                                padding: "12px 0",
                                overflow: "hidden",
                                position: "relative",
                                minHeight: marqueeSettings.direction === "up" || marqueeSettings.direction === "down" ? "100px" : "40px",
                                width: "100%",
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              <div
                                className="marquee-content"
                                key={`${marqueeSettings.text}-${marqueeSettings.direction}-${marqueeSettings.speed}`}
                                style={{
                                  position: "absolute",
                                  right: marqueeSettings.direction === "left" ? "0" : undefined,
                                  left: marqueeSettings.direction === "right" ? "0" : undefined,
                                  animation: `marquee-${marqueeSettings.direction} ${getAnimationDuration()} linear infinite`,
                                  whiteSpace: "nowrap",
                                  lineHeight: "1.4",
                                }}
                              >
                                {parse(marqueeSettings.text || "")}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center text-muted py-5">
                              <i className="fa fa-eye-slash fa-3x mb-2"></i>
                              <p className="mb-0">Marquee is hidden</p>
                            </div>
                          )}
                        </div>
                        <small className="text-muted mt-2 d-block">
                          This is a preview of how the marquee will appear on the website.
                        </small>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Event Management Tab */}
              {activeTab === "events" && (
                <div>
                  {/* Header with Add Button */}
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="mb-0">Events</h5>
                    <button
                      className="btn btn-primary"
                      onClick={openAddEventModal}
                    >
                      <i className="fa fa-plus mr-2"></i>Add Event
                    </button>
                  </div>

                  {/* Events Table */}
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Title</th>
                          <th>Date</th>
                          <th>City</th>
                          <th>Venue</th>
                          <th>Role</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {isLoadingEvents ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <i className="fa fa-spinner fa-spin fa-2x text-primary"></i>
                              <p className="text-muted mt-2 mb-0">Loading events...</p>
                            </td>
                          </tr>
                        ) : events.length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-5">
                              <i className="fa fa-calendar-o fa-3x mb-3 d-block text-muted"></i>
                              <p className="text-muted mb-0">No events found. Click "Add Event" to create one.</p>
                            </td>
                          </tr>
                        ) : (
                          events.map((event) => (
                            <tr key={event.id}>
                              <td>
                                {event.imageUrl ? (
                                  <Image
                                    src={event.imageUrl}
                                    alt={event.title}
                                    width={60}
                                    height={60}
                                    className="rounded"
                                    style={{ objectFit: "cover" }}
                                    unoptimized
                                  />
                                ) : (
                                  <div
                                    className="bg-light rounded d-flex align-items-center justify-content-center"
                                    style={{ width: 60, height: 60 }}
                                  >
                                    <i className="fa fa-image text-muted"></i>
                                  </div>
                                )}
                              </td>
                              <td className="font-weight-medium">{event.title}</td>
                              <td>
                                <div>{formatDate(event.startDate)}</div>
                                <small className="text-muted">to</small>
                                <div>{formatDate(event.endDate)}</div>
                              </td>
                              <td>{event.city}</td>
                              <td>{event.venue}</td>
                              <td>{event.role || "-"}</td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary mr-2"
                                  onClick={() => openEditEventModal(event)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => openDeleteModal(event)}
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {Math.ceil(totalPages / 20) > 1 && (
                    <div className="d-flex justify-content-center mt-3">
                      <ReactPaginate
                        previousLabel={<i className="fa fa-angle-left"></i>}
                        nextLabel={<i className="fa fa-angle-right"></i>}
                        breakLabel="..."
                        pageCount={Math.ceil(totalPages / 20)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={(e) => setPage(e.selected + 1)}
                        forcePage={page - 1}
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
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Add/Edit Event Modal */}
      <Modal show={showEventModal} onHide={() => setShowEventModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent ? "Edit Event" : "Add New Event"}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="row">
            {/* Title */}
            <div className="col-12">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={eventForm.title}
                  onChange={handleEventFormChange}
                  placeholder="Enter event title"
                />
              </div>
            </div>

            {/* Start Date */}
            <div className="col-md-6">
              <div className="form-group">
                <label>Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  className="form-control"
                  value={eventForm.startDate}
                  onChange={handleEventFormChange}
                />
              </div>
            </div>

            {/* End Date */}
            <div className="col-md-6">
              <div className="form-group">
                <label>End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  className="form-control"
                  value={eventForm.endDate}
                  disabled={!eventForm.startDate}
                  min={eventForm.startDate}
                  onChange={handleEventFormChange}
                />
              </div>
            </div>

            {/* City */}
            <div className="col-md-6">
              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  className="form-control"
                  value={eventForm.city}
                  onChange={handleEventFormChange}
                  placeholder="Enter city"
                />
              </div>
            </div>

            {/* Venue */}
            <div className="col-md-6">
              <div className="form-group">
                <label>Venue *</label>
                <input
                  type="text"
                  name="venue"
                  className="form-control"
                  value={eventForm.venue}
                  onChange={handleEventFormChange}
                  placeholder="Enter venue name"
                />
              </div>
            </div>

            {/* Role */}
            <div className="col-12">
              <div className="form-group">
                <label>Role *</label>
                <select
                  name="role"
                  className="form-control"
                  value={eventForm.role}
                  onChange={handleEventFormChange}
                >
                  {roleOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Description */}
            <div className="col-12">
              <div className="form-group">
                <label>Description *</label>
                <textarea
                  name="description"
                  className="form-control"
                  rows={3}
                  value={eventForm.description}
                  onChange={handleEventFormChange}
                  placeholder="Enter event description"
                />
              </div>
            </div>

            {/* Image Upload */}
            <div className="col-12">
              <div className="form-group">
                <label>Event Image *</label>
                <div className="d-flex align-items-start">
                  <div className="flex-grow-1 mr-3">
                    <input
                      type="file"
                      className="form-control-file"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </div>
                  {eventForm.imagePreview && (
                    <Image
                      src={eventForm.imagePreview}
                      alt="Preview"
                      width={80}
                      height={80}
                      className="rounded"
                      style={{ objectFit: "cover" }}
                      unoptimized
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEventModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={saveEvent} disabled={loading}>
            {loading ? "Saving..." : selectedEvent ? "Update Event" : "Add Event"}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Delete Event</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Are you sure you want to delete "{selectedEvent?.title}"? This action
            cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={deleteEvent} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default EventManagement;
