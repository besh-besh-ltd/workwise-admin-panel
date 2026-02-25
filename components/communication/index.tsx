import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import {
  Button,
  Spinner,
  Card,
  InputGroup,
  Form,
  Collapse,
} from "react-bootstrap";
import {
  getContactUsPage,
  updateCommunicationRemark,
} from "@/utils/services/contact-us";
import { toast } from "react-toastify";
import { Avatar, DateDisplay, FileAttachments } from "@/components/shared";

interface ContactItem {
  id: number;
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  comment: string;
  createdAt: string;
  remark: string | null;
  isChecked: boolean;
  attachments?: any[];
}

// Remark Section Component
type RemarkSectionProps = {
  item: any;
  isEditing: boolean;
  tempRemark: string;
  isRemoving: boolean;
  onEdit: () => void;
  onSave: (remove: boolean) => void;
  onCancel: () => void;
  onRemarkChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
};

const RemarkSection: React.FC<RemarkSectionProps> = ({
  item,
  isEditing,
  tempRemark,
  isRemoving,
  onEdit,
  onSave,
  onCancel,
  onRemarkChange,
}) => {
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
              disabled={tempRemark?.trim() === ""}
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
interface MessageCardProps {
  item: ContactItem;
  isEditing: boolean;
  isExpanded: boolean;
  tempRemark: string;
  isRemoving: boolean;
  onToggleExpand: () => void;
  onEditRemark: (item: ContactItem) => void;
  onSaveRemark: (item: ContactItem, remove: boolean) => void;
  onCancelEdit: () => void;
  onRemarkChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
  item,
  isEditing,
  isExpanded,
  tempRemark,
  isRemoving,
  onToggleExpand,
  onEditRemark,
  onSaveRemark,
  onCancelEdit,
  onRemarkChange,
}) => (
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
                  <i
                    className="fa fa-envelope me-2 text-primary"
                    style={{ width: 14 }}
                  ></i>
                  <span className="text-truncate">{item.email}</span>
                </div>
              </div>

              {/* Phone */}
              <div className="col-12 col-sm-6 col-lg-4">
                <label className="text-uppercase small fw-semibold text-muted mb-1 d-block">
                  Phone
                </label>
                <div className="d-flex align-items-center text-dark small">
                  <i
                    className="fa fa-phone me-2 text-primary"
                    style={{ width: 14 }}
                  ></i>
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
                <i
                  className={`fa fa-chevron-${isExpanded ? "up" : "down"} me-1`}
                ></i>
                {isExpanded ? "Hide Message" : "View Message"}
              </Button>
            </div>

            {/* Collapsible Message Section */}
            <Collapse
              in={isExpanded}
              children={
                <div className="mt-2">
                  <div className="bg-light border rounded p-3">
                    <p
                      className="mb-0 text-dark"
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {item.comment}
                    </p>
                  </div>
                  {/* Attachments Section */}
                  <FileAttachments attachments={item.attachments} />
                </div>
              }
            />
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
const LoadingState: React.FC = () => (
  <div className="text-center py-5">
    <Spinner animation="border" variant="primary" />
    <p className="mt-2 text-muted mb-0">Loading messages...</p>
  </div>
);

// Empty State Component
const EmptyState: React.FC = () => (
  <Card className="border-0 shadow-sm">
    <Card.Body className="text-center py-5">
      <i className="fa fa-inbox fa-3x text-muted mb-3 d-block"></i>
      <p className="text-muted mb-0">No messages found</p>
    </Card.Body>
  </Card>
);

// Pagination Component
interface PaginationSectionProps {
  page: number;
  totalPageCount: number;
  goToPage: string;
  onPageChange: (event: { selected: number }) => void;
  onGoToPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onGoToPage: () => void;
}

const PaginationSection: React.FC<PaginationSectionProps> = ({
  page,
  totalPageCount,
  goToPage,
  onPageChange,
  onGoToPageChange,
  onGoToPage,
}) => (
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

const Message: React.FC = () => {
  const [contactData, setContactData] = useState<ContactItem[]>([]);
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const [expandedCard, setExpandedCard] = useState(null);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [tempRemark, setTempRemark] = useState("");
  const [isRemoving, setIsRemoving] = useState(false);
  const [goToPage, setGoToPage] = useState("");

  const totalPageCount = Math.ceil(totalPages / limit);

  const toggleExpandCard = (itemId) => {
    setExpandedCard(expandedCard === itemId ? null : itemId);
  };

  const startAddRemark = (item: ContactItem): void => {
    setEditRow(item.id);
    setTempRemark(item.remark || "");
  };

  const cancelEdit = (): void => {
    setEditRow(null);
    setTempRemark("");
  };

  const saveRemark = async (
    item: ContactItem,
    remove: boolean = false,
  ): Promise<void> => {
    const remarkToSave = remove ? null : tempRemark.trim();

    try {
      await updateCommunicationRemark(item.id, remarkToSave);
      toast.success("Comment updated successfully");
    } catch (error) {
      toast.error("Error updating comment");
    }

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

  const getContactUs = async () => {
    setIsLoading(true);
    setContactData([]);
    try {
      const res: any = await getContactUsPage(page, limit);
      setTotalPages(res.count || 0);
      setContactData(
        res.data.map((item: Omit<ContactItem, "isChecked">) => ({
          ...item,
          isChecked: false,
        })),
      );
    } catch (err) {
      console.log(err);
      toast.error("Failed to load messages");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getContactUs();
  }, [page, limit]);

  const handlePageClick = (e: { selected: number }): void => {
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
