import React, { useEffect, useState } from "react";
import {
  fetchVendorDocuments,
  approveVendorDocument,
} from "@/utils/services/vendor-management";

interface VendorDocument {
  id: number;
  vendor_name: string;
  vendor_email: string;
  file_type: string;
  file_name?: string;
  file_url?: string;
  text_content?: string;
  payment_terms?: string;
  is_approved: boolean;
}

interface FetchVendorDocumentsResponse {
  status: number;
  data?: VendorDocument[];
  total_pages?: number;
  total_items?: number;
  current_page?: number;
}

const VendorProfile: React.FC = () => {
  const [documents, setDocuments] = useState<VendorDocument[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalItems, setTotalItems] = useState<number>(0);
  const itemsPerPage = 5; // Number of items per page (matches your API example)

  // Load documents with pagination
  const loadDocuments = async (page: number = 1): Promise<void> => {
    try {
      setLoading(true);
      const response: FetchVendorDocumentsResponse = await fetchVendorDocuments(page, itemsPerPage);

      if (response.status === 1 && response.data) {
        setDocuments(response.data);
        setTotalPages(response.total_pages || 1);
        setTotalItems(response.total_items || 0);
        setCurrentPage(response.current_page || page);
      } else {
        setDocuments([]);
        setTotalPages(1);
        setTotalItems(0);
      }
    } catch (err) {
      console.error("Error fetching vendor documents:", err);
      setDocuments([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // Approve document
  const handleApprove = async (id: number): Promise<void> => {
    try {
      await approveVendorDocument({ id: id, is_approved: true });
      await loadDocuments(currentPage); // reload current page
    } catch (err) {
      console.error("Error approving document:", err);
    }
  };

  // Disapprove document
  const handleDisapprove = async (id: number): Promise<void> => {
    try {
      await approveVendorDocument({ id: id, is_approved: false });
      await loadDocuments(currentPage); // reload current page
    } catch (err) {
      console.error("Error disapproving document:", err);
    }
  };

  // Handle page change
  const handlePageChange = (page: number): void => {
    if (page >= 1 && page <= totalPages) {
      loadDocuments(page);
    }
  };

  useEffect(() => {
    loadDocuments(1);
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Vendor Profile Documents</h2>

      {loading ? (
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table table-bordered table-striped align-middle">
              <thead className="table-light">
                <tr>
                  <th>S No.</th>
                  <th>Vendor Name</th>
                  <th>Vendor Email</th>
                  <th>File Type</th>
                  <th>File Name</th>
                  <th>Text Content</th>
                  <th>Payment Terms</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.length > 0 ? (
                  documents.map((doc, id) => (
                    <tr key={doc.id}>
                      <td>{id+1}</td>
                      <td>{doc.vendor_name}</td>
                      <td>{doc.vendor_email}</td>
                      <td>{doc.file_type}</td>
                      <td>
                        {doc.file_url ? (
                          <a
                            href={doc.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-decoration-underline text-primary"
                          >
                            {doc.file_name || "View File"}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{doc.text_content || "-"}</td>
                      <td>{doc.payment_terms || "-"}</td>
                      <td>
                        {doc.is_approved ? (
                          <span className="badge bg-success">Approved</span>
                        ) : (
                          <span className="badge bg-warning text-dark">Pending</span>
                        )}
                      </td>
                      <td>
                        <div className="btn-group" role="group">
                          {!doc.is_approved ? (
                            <>
                              <button
                                onClick={() => handleApprove(doc.id)}
                                className="btn btn-sm btn-success me-2"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleDisapprove(doc.id)}
                                className="btn btn-sm btn-danger"
                              >
                                Disapprove
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleDisapprove(doc.id)}
                              className="btn btn-sm btn-outline-danger"
                            >
                              Revoke Approval
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center">
                      No documents found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <nav aria-label="Page navigation" className="mt-4">
              <ul className="pagination justify-content-center">
                <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Previous
                  </button>
                </li>
                {Array.from({ length: totalPages }, (_, i) => i).map((page) => (
                  <li
                    key={page + 1}
                    className={`page-item ${currentPage === page + 1 ? "active" : ""}`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page + 1)}
                    >
                      {page + 1}
                    </button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                  </button>
                </li>
              </ul>
              <div className="text-center text-muted">
                Showing {documents.length} of {totalItems} documents
              </div>
            </nav>
          )}
        </>
      )}
    </div>
  );
};

export default VendorProfile;
