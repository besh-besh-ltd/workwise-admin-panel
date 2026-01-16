import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Button, Spinner, Card, InputGroup, Form, Collapse } from "react-bootstrap";
import { getContactUsPage, updateCommunicationRemark } from "@/utils/services/contact-us";
import { toast } from "react-toastify";


// Avatar Component
const Avatar = ({ name, size = 32, className = "" }) => (
  <div
    className={`rounded-circle bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0 ${className}`}
    style={{ width: size, height: size }}
  >
    <span className={`fw-bold ${size <= 32 ? "small" : ""}`}>
      {name?.charAt(0)?.toUpperCase() || "?"}
    </span>
  </div>
);

// Date Display Component
const DateDisplay = ({ date }) => (
  <div className="d-flex align-items-center text-muted small">
    <i className="fa fa-calendar me-2 text-primary" style={{ width: 14 }}></i>
    <span>
      {new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })}
    </span>
  </div>
);

// Remark Section Component
const RemarkSection = ({ item, isEditing, tempRemark, isRemoving, onEdit, onSave, onCancel, onRemarkChange }) => {
  if (isEditing) {
    return (
      <div className="d-flex flex-column gap-2">
        <Form.Control
          as="textarea"
          rows={3}
          placeholder="Write your remark here..."
          value={tempRemark}
          onChange={onRemarkChange}
          className="resize-none"
          style={{ resize: "none" }}
          autoFocus
        />
        <div className="d-flex justify-content-end gap-2">
          <Button variant="outline-secondary" size="sm" onClick={onCancel}>
            <i className="fa fa-times me-1"></i>
            Cancel
          </Button>
          {isRemoving ? (
            <Button variant="danger" size="sm" onClick={() => onSave(true)}>
              <i className="fa fa-trash me-1"></i>
              Remove
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onSave(false)}
              disabled={tempRemark.trim() === ""}
            >
              <i className="fa fa-save me-1"></i>
              Save
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (item.remark) {
    return (
      <div className="d-flex flex-column gap-2">
        <div
          className="bg-white border rounded p-2 small text-dark"
          style={{ whiteSpace: "pre-wrap", minHeight: "60px" }}
        >
          {item.remark}
        </div>
        <div className="d-flex gap-2 justify-content-end">
          <Button variant="outline-primary" size="sm" onClick={onEdit}>
            <i className="fa fa-edit me-1"></i>
            Edit
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center py-2">
      <Button variant="outline-primary" size="sm" onClick={onEdit}>
        <i className="fa fa-plus me-1"></i>
        Add Remark
      </Button>
    </div>
  );
};

// Message Card Component
const MessageCard = ({ item, isEditing, isExpanded, tempRemark, isRemoving, onToggleExpand, onEditRemark, onSaveRemark, onCancelEdit, onRemarkChange }) => (
  <Card className="mb-3 shadow-sm border-0">
    <Card.Body className="p-0">
      {/* Card Header - Name & Date */}
      <div className="d-flex align-items-center p-3 border-bottom bg-light">
        <Avatar name={item.name} size={42} className="me-3" />
        <div>
          <h6 className="mb-1 fw-semibold">{item.name}</h6>
          <DateDisplay date={item.createdAt} />
        </div>
      </div>

      {/* Card Body */}
      <div className="row g-0">
        {/* Left Section - Email, Phone & Subject */}
        <div className="col-12 col-xl-8">
          <div className="p-3">
            <div className="row g-3">
              {/* Email */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="text-uppercase small fw-semibold text-muted mb-1 d-block">
                  Email
                </label>
                <div className="d-flex align-items-center text-dark small">
                  <i className="fa fa-envelope me-2 text-primary" style={{ width: 14 }}></i>
                  <span className="text-truncate">{item.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="text-uppercase small fw-semibold text-muted mb-1 d-block">
                  Phone
                </label>
                <div className="d-flex align-items-center text-dark small">
                  <i className="fa fa-phone me-2 text-primary" style={{ width: 14 }}></i>
                  <span>{item.phone}</span>
                </div>
              </div>

              {/* Subject */}
              <div className="col-12 col-lg-4">
                <label className="text-uppercase small fw-semibold text-muted mb-1 d-block">
                  Subject
                </label>
                <p
                  className="mb-0 text-dark small"
                  style={{
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {item.subject}
                </p>
              </div>
            </div>

            {/* View Message Toggle Button */}
            <div className="mt-3">
              <Button
                variant="link"
                size="sm"
                className="p-0 text-decoration-none"
                onClick={onToggleExpand}
                aria-expanded={isExpanded}
              >
                <i className={`fa fa-chevron-${isExpanded ? "up" : "down"} me-1`}></i>
                {isExpanded ? "Hide Message" : "View Message"}
              </Button>
            </div>

            {/* Collapsible Message Section */}
            <Collapse in={isExpanded}>
              <div className="mt-2">
                <div className="bg-light border rounded p-3">
                  <p className="mb-0 text-dark" style={{ whiteSpace: "pre-wrap" }}>
                    {item.comment}
                  </p>
                </div>
              </div>
            </Collapse>
          </div>
        </div>

        {/* Right Section - Remark */}
        <div className="col-12 col-xl-4 bg-light">
          <div className="p-3 h-100 d-flex flex-column">
            <label className="text-uppercase small fw-semibold text-muted mb-2 d-block">
              Remark
            </label>
            <RemarkSection
              item={item}
              isEditing={isEditing}
              tempRemark={tempRemark}
              isRemoving={isRemoving}
              onEdit={() => onEditRemark(item)}
              onSave={(remove) => onSaveRemark(item, remove)}
              onCancel={onCancelEdit}
              onRemarkChange={onRemarkChange}
            />
          </div>
        </div>
      </div>
    </Card.Body>
  </Card>
);

// Loading State Component
const LoadingState = () => (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-2 text-muted mb-0">Loading messages...</p>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="text-center py-5">
      <i className="fa fa-inbox fa-3x text-muted mb-3 d-block"></i>
      <p className="text-muted mb-0">No messages found</p>
    </Card.Body>
  </Card>
);

// Pagination Component
const PaginationSection = ({ page, totalPageCount, goToPage, onPageChange, onGoToPageChange, onGoToPage }) => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="py-3">
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div className="text-muted small">
          Page <strong>{page}</strong> of <strong>{totalPageCount}</strong>
        </div>
        <ReactPaginate
          breakLabel="..."
          nextLabel={<i className="fa fa-angle-right"></i>}
          onPageChange={onPageChange}
          pageRangeDisplayed={2}
          pageCount={totalPageCount}
          previousLabel={<i className="fa fa-angle-left"></i>}
          renderOnZeroPageCount={null}
          className="pagination pagination-sm mb-0"
          activeClassName="active"
          forcePage={page - 1}
        />
        <InputGroup size="sm" style={{ width: "auto" }}>
          <Form.Control
            type="number"
            placeholder="Page"
            min="1"
            max={totalPageCount}
            value={goToPage}
            onChange={onGoToPageChange}
            onKeyPress={(e) => e.key === "Enter" && onGoToPage()}
            style={{ width: 70 }}
          />
          <Button variant="primary" onClick={onGoToPage}>
            Go
          </Button>
        </InputGroup>
      </div>
    </Card.Body>
  </Card>
);

// ============================================
// Main Component
// ============================================

const Message = () => {
  const [contactData, setContactData] = useState([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedCard, setExpandedCard] = useState(null);
  const [editRow, setEditRow] = useState(null);
  const [tempRemark, setTempRemark] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [goToPage, setGoToPage] = useState("");

  const totalPageCount = Math.ceil(totalPages / limit);

  const toggleExpandCard = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  const startAddRemark = (item) => {
    setEditRow(item.id);
    setTempRemark(item.remark || "");
  };

  const cancelEdit = () => {
    setEditRow(null);
    setTempRemark("");
  };

  const saveRemark = (item, remove = false) => {
    const remarkToSave = remove ? null : tempRemark.trim();

    updateCommunicationRemark(item.id, remarkToSave)
      .then(() => {
        toast.success("Comment updated successfully");
      })
      .catch(() => {
        toast.error("Error updating comment");
      });

    item.remark = remarkToSave;
    setEditRow(null);
    setTempRemark("");
    setIsRemoving(false);
  };

  const handleRemarkChange = (e) => {
    const value = e.target.value.trim();
    setTempRemark(e.target.value);
    setIsRemoving(value === "--");
  };

  const getContactUs = () => {
    setIsLoading(true);
    setContactData([]);
    getContactUsPage(page, limit)
      .then((res) => {
        setTotalPages(res.count || 0);
        setContactData(res.data.map((item) => ({ ...item, isChecked: false })));
      })
      .catch((err) => {
        console.log(err);
        toast.error("Failed to load messages");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    getContactUs();
  }, [page, limit]);

  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  const handleGoToPage = () => {
    const pageNum = parseInt(goToPage);
    if (pageNum && pageNum >= 1 && pageNum <= totalPageCount) {
      setPage(pageNum);
      setGoToPage("");
    }
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Message</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Loading State */}
          {isLoading && <LoadingState />}

          {/* Empty State */}
          {!isLoading && contactData.length === 0 && <EmptyState />}

          {/* Message Cards List */}
          {!isLoading && contactData.length > 0 && (
            <div className="mb-4">
              {contactData.map((item) => (
                <MessageCard
                  key={item.customer_id}
                  item={item}
                  isEditing={editRow === item.id}
                  isExpanded={expandedCard === item.id}
                  tempRemark={tempRemark}
                  isRemoving={isRemoving}
                  onToggleExpand={() => toggleExpandCard(item.id)}
                  onEditRemark={startAddRemark}
                  onSaveRemark={saveRemark}
                  onCancelEdit={cancelEdit}
                  onRemarkChange={handleRemarkChange}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPageCount > 1 && (
            <PaginationSection
              page={page}
              totalPageCount={totalPageCount}
              goToPage={goToPage}
              onPageChange={handlePageClick}
              onGoToPageChange={(e) => setGoToPage(e.target.value)}
              onGoToPage={handleGoToPage}
            />
          )}
        </div>
      </section>
    </>
  );
};

export default Message;
