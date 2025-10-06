import React, { useState, useEffect, useCallback } from 'react';
import { getClientRfqList } from '@/utils/services/rfq-management';

// Helper to calculate which page numbers to show (with ellipsis)
const getPageNumbers = (currentPage, totalPages) => {
  let pages = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    // Show first, last, current -1, current, current+1, with ellipsis
    if (currentPage <= 3) {
      pages = [1, 2, 3, 4, '...', totalPages];
    } else if (currentPage >= totalPages - 2) {
      pages = [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    }
  }
  return pages;
};

const ClientSuccessDashboard = () => {
  const [rfqData, setRfqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch RFQ data with debounce for search/filter change
  const fetchRfqData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getClientRfqList(currentPage, itemsPerPage, searchTerm);

      console.log('RFQ List Response:', response);
      if (response.status === 1) {
        setRfqData(response.data);
        setTotalPages(response.pagination.total_pages);
        setTotalItems(response.pagination.total_items);
      }
    } catch (error) {
      console.error('Error fetching RFQ data:', error);
      setRfqData([]);
      setTotalPages(1);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, searchTerm]);

  // Load data whenever page/limit/search changes
  useEffect(() => {
    fetchRfqData();
  }, [fetchRfqData]);

  // Event Handlers
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Always reset to page 1 on search
    fetchRfqData();
  };

  const handleItemsPerPageChange = (e) => {
    const newLimit = parseInt(e.target.value);
    setItemsPerPage(newLimit);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Render
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Client Success Dashboard</h4>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="row mb-3">
        <div className="col-md-6">
          <form onSubmit={handleSearch}>
            <div className="input-group">
              <input
                type="text"
                className="form-control"
                placeholder="Search by company name or RFQ number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="btn btn-primary" type="submit">
                <i className="fa fa-search"></i> Search
              </button>
            </div>
          </form>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>
        </div>
        <div className="col-md-3 text-end">
          <div className="badge bg-primary p-2">
            Total RFQs: {totalItems}
          </div>
        </div>
      </div>

      {/* RFQ Table */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <table className="table table-hover table-centered mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>#</th>
                          <th>Company Name</th>
                          <th>RFQ Number</th>
                          <th>Total Vendors</th>
                          <th>Quotes Received</th>
                          <th>Quote Regrets</th>
                          <th>Vendors Not Responded</th>
                          <th>Products Added</th>
                          <th>Finalizations</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqData.length > 0 ? (
                          rfqData.map((rfq, index) => (
                            <tr key={rfq.id || index}>
                              <td>{(currentPage - 1) * itemsPerPage + index + 1}</td>
                              <td>
                                <span className="fw-semibold">{rfq.company_name}</span>
                              </td>
                              <td>
                                <code>{rfq.rfq_no}</code>
                              </td>
                              <td>
                                <span className="badge bg-info">{rfq.total_vendors || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-success">{rfq.quotes_received || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-warning">{rfq.quote_regrets || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-danger">{rfq.vendors_not_responded || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-primary">{rfq.products_added || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-dark">{rfq.finalization_count || 0}</span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="9" className="text-center py-4">
                              <div className="text-muted">
                                <i className="fa fa-inbox fa-2x mb-2"></i>
                                <p>No RFQ data found</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination Bottom */}
                  {totalPages > 1 && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <p className="text-muted">
                          Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                          {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} entries
                        </p>
                      </div>
                      <div className="col-md-6 d-flex justify-content-end">
                        <nav aria-label="Page navigation">
                          <ul className="pagination mb-0">
                            <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                              >
                                Previous
                              </button>
                            </li>
                            {getPageNumbers(currentPage, totalPages).map((page, idx) =>
                              page === '...' ? (
                                <li key={`ellipsis-${idx}`} className="page-item disabled">
                                  <span className="page-link">…</span>
                                </li>
                              ) : (
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
                              )
                            )}
                            <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                              >
                                Next
                              </button>
                            </li>
                          </ul>
                        </nav>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientSuccessDashboard;
