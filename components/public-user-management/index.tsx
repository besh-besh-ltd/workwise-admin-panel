import { handleGetPublicUserList } from "@/utils/services/public-user-management";
import React, { useEffect, useState, ChangeEvent } from "react";

interface PublicUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  company_name: string;
  platform: string;
  element: string;
  created_at: string;
}

interface PaginationData {
  total_pages: number;
  current_page: number;
}

interface ApiResponse {
  data?: {
    data?: PublicUser[];
    pagination?: PaginationData;
  };
}

const PublicVendorManagement: React.FC = () => {
  const [publicUsers, setPublicUsers] = useState<PublicUser[]>([]);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  // Load data
  const fetchUsers = async (page: number = 1, startDateFilter: string = "", endDateFilter: string = ""): Promise<void> => {
    try {
      setLoading(true);

      const response : ApiResponse = await handleGetPublicUserList(
        page,
        startDateFilter || "",
        endDateFilter || ""
      ) as ApiResponse;

      const result = response?.data || {};

      setPublicUsers(result?.data || []);
      setPageCount(result?.pagination?.total_pages || 0);
      setCurrentPage(result?.pagination?.current_page || 1);

    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load on mount
  useEffect(() => {
    fetchUsers(1, "", "");
  }, []);

  // Pagination click handler
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
    fetchUsers(page, startDate, endDate);
  };

  // Apply date filter
  const handleFilter = (): void => {
    setCurrentPage(1);
    fetchUsers(1, startDate, endDate);
  };

  // Clear filters
  const handleClearFilter = (): void => {
    setStartDate("");
    setEndDate("");
    setCurrentPage(1);
    fetchUsers(1, "", "");
  };

  // Generate page numbers for pagination
  const getPageNumbers = (): number[] => {
    const pages: number[] = [];
    const maxPagesToShow = 5;

    if (pageCount <= maxPagesToShow) {
      // Show all pages if total pages is less than max
      for (let i = 1; i <= pageCount; i++) {
        pages.push(i);
      }
    } else {
      // Show pages around current page
      let startPage = Math.max(1, currentPage - 2);
      let endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);

      // Adjust if we're near the end
      if (endPage - startPage + 1 < maxPagesToShow) {
        startPage = Math.max(1, endPage - maxPagesToShow + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }

    return pages;
  };

  return (
    <div className="container-fluid py-4">
      <div className="card shadow">
        <div className="card-header bg-primary text-white">
          <h2 className="h4 mb-0">Public Vendor Management</h2>
        </div>

        <div className="card-body">
          {/* Filters */}
          <div className="row g-3 mb-4">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setStartDate(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label fw-semibold">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setEndDate(e.target.value)}
              />
            </div>

            <div className="col-md-4 d-flex align-items-end gap-2">
              <button
                onClick={handleFilter}
                className="btn btn-primary"
                disabled={loading}
              >
                <i className="fas fa-filter me-2"></i>
                Apply Filter
              </button>
              {(startDate || endDate) && (
                <button
                  onClick={handleClearFilter}
                  className="btn btn-outline-secondary"
                  disabled={loading}
                >
                  <i className="fas fa-times me-2"></i>
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-2 text-muted">Loading users...</p>
            </div>
          )}

          {/* Table */}
          {!loading && (
            <>
              <div className="table-responsive">
                <table className="table table-hover table-bordered">
                  <thead className="table-light">
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">Mobile</th>
                      <th scope="col">Company</th>
                      <th scope="col">Platform</th>
                      <th scope="col">Element</th>
                      <th scope="col">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {publicUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <div className="text-muted">
                            <i className="fas fa-inbox fa-2x mb-2"></i>
                            <p className="mb-0">No records found</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      publicUsers.map((user) => (
                        <tr key={user.id}>
                          <td className="align-middle">
                            <strong>{user.name}</strong>
                          </td>
                          <td className="align-middle">
                            <a href={`mailto:${user.email}`} className="text-decoration-none">
                              {user.email}
                            </a>
                          </td>
                          <td className="align-middle">{user.mobile}</td>
                          <td className="align-middle">{user.company_name}</td>
                          <td className="align-middle">
                            <span className="badge bg-info text-dark">
                              {user.platform}
                            </span>
                          </td>
                          <td className="align-middle">
                            <span className="badge bg-secondary">
                              {user.element}
                            </span>
                          </td>
                          <td className="align-middle">
                            <small className="text-muted">
                              {new Date(user.created_at).toLocaleString()}
                            </small>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Custom Pagination */}
              {pageCount > 1 && (
                <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                  <div className="text-muted">
                    Showing page {currentPage} of {pageCount}
                  </div>

                  <nav aria-label="Page navigation">
                    <ul className="pagination mb-0">
                      {/* Previous Button */}
                      <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          <i className="fas fa-chevron-left"></i>
                        </button>
                      </li>

                      {/* First Page */}
                      {currentPage > 3 && (
                        <>
                          <li className="page-item">
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(1)}
                            >
                              1
                            </button>
                          </li>
                          {currentPage > 4 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                        </>
                      )}

                      {/* Page Numbers */}
                      {getPageNumbers().map(page => (
                        <li
                          key={page}
                          className={`page-item ${currentPage === page ? 'active' : ''}`}
                        >
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        </li>
                      ))}

                      {/* Last Page */}
                      {currentPage < pageCount - 2 && (
                        <>
                          {currentPage < pageCount - 3 && (
                            <li className="page-item disabled">
                              <span className="page-link">...</span>
                            </li>
                          )}
                          <li className="page-item">
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pageCount)}
                            >
                              {pageCount}
                            </button>
                          </li>
                        </>
                      )}

                      {/* Next Button */}
                      <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                        <button
                          className="page-link"
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === pageCount}
                        >
                          <i className="fas fa-chevron-right"></i>
                        </button>
                      </li>
                    </ul>
                  </nav>

                  <div className="text-muted">
                    <select
                      className="form-select form-select-sm w-auto d-inline"
                      value={currentPage}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => handlePageChange(Number(e.target.value))}
                    >
                      {Array.from({ length: pageCount }, (_, i) => i + 1).map(page => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PublicVendorManagement;
