import React, { useState, useEffect, useCallback } from 'react';
import Select from 'react-select';
import { getClientCompanylist, getClientRfqList } from '@/utils/services/rfq-management';
import Link from 'next/link';

const ClientSuccessDashboard = () => {
  const [rfqData, setRfqData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [companyList, setCompanyList] = useState([]);


  const [dateFilter, setDateFilter] = useState('all');
const [customStartDate, setCustomStartDate] = useState('');
const [customEndDate, setCustomEndDate] = useState('');

const handleDateFilterChange = (value) => {
  setDateFilter(value);

  if (value === '3days') {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 3);
    setCustomStartDate(start.toISOString().slice(0, 10));
    setCustomEndDate(end.toISOString().slice(0, 10));
  } else if (value === '7days') {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - 7);
    setCustomStartDate(start.toISOString().slice(0, 10));
    setCustomEndDate(end.toISOString().slice(0, 10));
  } else if (value === 'all') {
    setCustomStartDate('');
    setCustomEndDate('');
  }
  // trigger fetch when date filter changes
  setCurrentPage(1);
};




  // Helper to calculate which page numbers to show (with ellipsis)
  const getPageNumbers = (currentPage, totalPages) => {
    let pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
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

  // Fetch company list for the dropdown
  const fetchCompanyList = async () => {
    try {
      const response = await getClientCompanylist();
      if (response.status === 1) {
        setCompanyList(response.data);
      }
    } catch (error) {
      console.error('Error fetching company list:', error);
      setCompanyList([]);
    }
  };

  useEffect(() => {
    fetchCompanyList();
  }, []);

  // Fetch the RFQ data according to filters/pagination
  const fetchRfqData = useCallback(async () => {
    try {
      setLoading(true);
      // Build companyIds array from selectedCompanies (use id if available)
      const companyIds = selectedCompanies.map((c) => c.id || c.value).filter(Boolean);
      // Build payload: dateFilter, startDate, endDate, companyIds
      const startDate = customStartDate || '';
      const endDate = customEndDate || '';
      const response = await getClientRfqList(currentPage, itemsPerPage, '', dateFilter, startDate, endDate, companyIds);
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
  }, [currentPage, itemsPerPage, selectedCompanies, dateFilter, customStartDate, customEndDate]);

  useEffect(() => {
    fetchRfqData();
  }, [fetchRfqData]);

  // Handler for per-page select
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(parseInt(e.target.value, 10));
    setCurrentPage(1);
  };

  // Handler for pagination button click
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Handler for search submit
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search/filter
    fetchRfqData();
  };

  // Handler for clearing selection
  const clearAllSelected = () => {
    setSelectedCompanies([]);
    setCurrentPage(1);
    fetchRfqData();
  };

  // Download current page data as CSV (Excel can open CSV)
  const downloadCsv = () => {
    if (!rfqData || rfqData.length === 0) return;

    // Define header columns and map rows
    const headers = [
      'id',
      'company_name',
      'rfq_no',
      'timestamp',
      'rfq_status',
      'rfq_type',
      'total_vendors',
      'quotes_received',
      'quote_regrets',
      'vendors_not_responded',
      'products_added',
      'finalization_count'
    ];

    const csvRows = [];
    csvRows.push(headers.join(','));

    rfqData.forEach((row) => {
      const values = headers.map((h) => {
        let val = row[h];
        if (val === null || typeof val === 'undefined') return '';
        // Escape double quotes
        const str = String(val).replace(/"/g, '""');
        // Wrap fields that contain commas or quotes
        return `"${str}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `client_rfqs_page_${currentPage}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Prepare react-select options format
  const companyOptions = companyList.map(c => ({
    value: c.company_name,
    label: c.company_name,
    id: c.id
  }));

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
    <div className="card card-body mb-3">
  <div className="row g-3 align-items-end">
    
    {/* Company Search */}
    <div className="col-lg-4 col-md-6">
      <label className="form-label small mb-1">Company</label>
      <Select
        isMulti
        name="companies"
        options={companyOptions}
        value={selectedCompanies}
        onChange={(selected) => {
          setSelectedCompanies(selected || []);
          setCurrentPage(1);
        }}
        placeholder="Search or select companies..."
        className="react-select-container"
        classNamePrefix="react-select"
      />
      {selectedCompanies.length > 0 && (
        <button
          type="button"
          className="btn btn-sm btn-link text-danger mt-1 p-0"
          onClick={clearAllSelected}
        >
          Clear All
        </button>
      )}
    </div>

    {/* Items Per Page */}
    <div className="col-lg-2 col-md-3 col-sm-6">
      <label className="form-label small mb-1">Items per page</label>
      <select
        className="form-select form-select-sm"
        value={itemsPerPage}
        onChange={handleItemsPerPageChange}
      >
        <option value="5">5</option>
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="50">50</option>
      </select>
    </div>

    {/* Date Filter */}
    <div className="col-lg-3 col-md-6 col-sm-6">
      <label className="form-label small mb-1">Date Filter</label>
      <select
        className="form-select form-select-sm"
        value={dateFilter}
        onChange={(e) => handleDateFilterChange(e.target.value)}
      >
        <option value="all">All Dates</option>
        <option value="3days">Last 3 Days</option>
        <option value="7days">Last 7 Days</option>
        <option value="custom">Custom Range</option>
      </select>

      {dateFilter === "custom" && (
        <div className="row mt-2 gx-1">
          <div className="col">
            <input
              type="date"
              className="form-control form-control-sm"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="col">
            <input
              type="date"
              className="form-control form-control-sm"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
      )}
    </div>

    {/* Total & Download */}
    <div className="col-lg-3 col-md-6">
      <label className="form-label small mb-1 d-block">Summary</label>
      <div className="d-flex justify-content-between align-items-center gap-2">
        <span className="badge bg-primary flex-shrink-0">
          Total RFQs: {totalItems}
        </span>
        <button
          className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1"
          onClick={downloadCsv}
          title="Download current page as CSV"
          disabled={rfqData.length === 0}
        >
          <i className="fa fa-download" /> Download
        </button>
      </div>
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
                          <th>Rfq Type</th>
                          <th>Rfq Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rfqData.length > 0 ? (
                          rfqData.map((rfq, index) => (
                            <tr key={rfq.id || index}>
                              <td>
                                {(currentPage - 1) * itemsPerPage + index + 1}
                              </td>
                              <td>
                                <span className="fw-semibold">
                                  {rfq.company_name}
                                </span>
                              </td>
                              <td>
                                <code>{rfq.rfq_no}</code>
                              </td>
                              <td>
                                <span className="badge bg-info">
                                  {rfq.total_vendors || 0}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-success">
                                  {rfq.quotes_received || 0}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-warning">
                                  {rfq.quote_regrets || 0}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-danger">
                                  {rfq.vendors_not_responded || 0}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-primary">
                                  {rfq.products_added || 0}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-dark">
                                  {rfq.finalization_count || 0}
                                </span>
                              </td>
                              <th>
                                <span className="badge bg-warning">
                                  {rfq.rfq_type || "N/A"}
                                </span>
                              </th>
                              <th>
                                <span
                                  className={`badge ${
                                    rfq.rfq_status == 1
                                      ? "bg-success"
                                      : "bg-danger"
                                  }`}
                                >
                                  {rfq.rfq_status == 1 ? "Open" : "Closed"}
                                </span>
                              </th>
                              <th>
                                <Link
                                  href={`./rfq-management/${rfq.rfq_id}`}
                                  className="page-link "
                                >
                                  View
                                </Link>
                              </th>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="11" className="text-center py-4">
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="row mt-3">
                      <div className="col-md-6">
                        <p className="text-muted">
                          Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                          {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
                          {totalItems} entries
                        </p>
                      </div>
                      <div className="col-md-6 d-flex justify-content-end">
                        <nav aria-label="Page navigation">
                          <ul className="pagination mb-0">
                            <li
                              className={`page-item ${
                                currentPage === 1 ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  handlePageChange(currentPage - 1)
                                }
                              >
                                Previous
                              </button>
                            </li>
                            {getPageNumbers(currentPage, totalPages).map(
                              (page, idx) =>
                                page === "..." ? (
                                  <li
                                    key={`ellipsis-${idx}`}
                                    className="page-item disabled"
                                  >
                                    <span className="page-link">…</span>
                                  </li>
                                ) : (
                                  <li
                                    key={page}
                                    className={`page-item ${
                                      currentPage === page ? "active" : ""
                                    }`}
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
                            <li
                              className={`page-item ${
                                currentPage === totalPages ? "disabled" : ""
                              }`}
                            >
                              <button
                                className="page-link"
                                onClick={() =>
                                  handlePageChange(currentPage + 1)
                                }
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
