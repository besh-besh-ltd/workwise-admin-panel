import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '../shared/Loader';
import { handleBulkVendorUpload } from '../../utils/services/vendor-management';

const BulkVendorUpload = () => {
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [results, setResults] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    if (!validTypes.includes(selectedFile.type) && !selectedFile.name.match(/\.(xlsx|xls)$/i)) {
      toast.error('Please select a valid Excel file (.xlsx or .xls)');
      return;
    }

    // Validate file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }

    setFile(selectedFile);
    setFileName(selectedFile.name);
    setResults(null);
  };

  const downloadSampleFile = () => {
    const link = document.createElement('a');
    link.href = '/Bulk_Upload_Format.xlsx';
    link.download = 'Bulk_Upload_Format.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    setLoading(true);
    setResults(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await handleBulkVendorUpload(formData);

      if (response.status === 1) {
        const summary = response.data?.summary;
        const successMsg = summary
          ? `Upload successful! ${summary.vendorsCreated || 0} vendors created, ${summary.productsMapped || 0} products mapped.`
          : (response.message || 'Upload completed successfully');
        toast.success(successMsg);
        setResults(response.data);
        setActiveTab('summary');
        // Clear file input
        setFile(null);
        setFileName('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const summary = response.data?.summary;
        const errorMsg = summary
          ? `Upload failed! ${summary.vendorsFailed || 0} vendors failed, ${summary.productsFailed || 0} products failed. ${response.message || ''}`
          : (response.message || 'Upload failed');
        toast.error(errorMsg);
        if (response.data) {
          setResults(response.data);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorData = error?.response?.data;
      const summary = errorData?.data?.summary;
      const errorMsg = summary
        ? `Upload failed! ${summary.vendorsFailed || 0} vendors failed, ${summary.productsFailed || 0} products failed. ${errorData?.message || ''}`
        : (errorData?.message || 'Upload failed. Please try again.');
      toast.error(errorMsg);
      if (errorData?.data) {
        setResults(errorData.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    router.push('/vendor-management');
  };

  const clearResults = () => {
    setResults(null);
    setFile(null);
    setFileName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Download full report as Excel
  const downloadReport = () => {
    if (!results) return;

    const escapeHtml = (str) => (str || '-').toString().replace(/</g, '&lt;').replace(/>/g, '&gt;');

    const tableHTML = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
        <head>
          <meta charset="UTF-8">
          <style>
            table { border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #000; padding: 8px; }
            th { background-color: #4472C4; color: white; font-weight: bold; }
            .section-title { background-color: #2E75B6; color: white; font-size: 14px; font-weight: bold; }
            .success { background-color: #C6EFCE; }
            .warning { background-color: #FFEB9C; }
            .danger { background-color: #FFC7CE; }
          </style>
        </head>
        <body>
          <!-- Summary Section -->
          <table>
            <tr><th colspan="2" class="section-title">Summary</th></tr>
            <tr><th>Metric</th><th>Value</th></tr>
            <tr><td>Total Rows</td><td>${results.summary?.totalRows || 0}</td></tr>
            <tr><td>Total Vendors</td><td>${results.summary?.totalVendors || 0}</td></tr>
            <tr class="success"><td>Vendors Created</td><td>${results.summary?.vendorsCreated || 0}</td></tr>
            <tr class="warning"><td>Vendors Existing</td><td>${results.summary?.vendorsExisting || 0}</td></tr>
            <tr class="danger"><td>Vendors Failed</td><td>${results.summary?.vendorsFailed || 0}</td></tr>
            <tr><td>Total Products</td><td>${results.summary?.totalProducts || 0}</td></tr>
            <tr class="success"><td>Products Mapped</td><td>${results.summary?.productsMapped || 0}</td></tr>
            <tr><td>Products Skipped</td><td>${results.summary?.productsSkipped || 0}</td></tr>
            <tr class="danger"><td>Products Failed</td><td>${results.summary?.productsFailed || 0}</td></tr>
            <tr><td>Approvals Mapped</td><td>${results.summary?.approvalsMapped || 0}</td></tr>
            <tr><td>Processing Time</td><td>${results.summary?.processingTimeMs || 0}ms</td></tr>
          </table>

          <!-- Vendors Section -->
          <table>
            <tr><th colspan="9" class="section-title">Vendors</th></tr>
            <tr>
              <th>Row</th>
              <th>Company</th>
              <th>Email</th>
              <th>Status</th>
              <th>Vendor ID</th>
              <th>Products</th>
              <th>Mapped</th>
              <th>Skipped</th>
              <th>Failed</th>
            </tr>
            ${(results.vendors || []).map(vendor => `
              <tr>
                <td>${vendor.startRow || '-'}</td>
                <td>${escapeHtml(vendor.company_name)}</td>
                <td>${escapeHtml(vendor.email)}</td>
                <td>${vendor.isNew ? 'NEW' : (vendor.status?.toUpperCase() || '-')}</td>
                <td>${vendor.vendorId || '-'}</td>
                <td>${vendor.productsProcessed || 0}</td>
                <td>${vendor.productsMapped || 0}</td>
                <td>${vendor.productsSkipped || 0}</td>
                <td>${vendor.productsFailed || 0}</td>
              </tr>
            `).join('')}
          </table>

          <!-- Row Details Section -->
          <table>
            <tr><th colspan="5" class="section-title">Row Details</th></tr>
            <tr>
              <th>Excel Row</th>
              <th>Type</th>
              <th>Status</th>
              <th>Message</th>
              <th>Details</th>
            </tr>
            ${(results.rows || []).map(row => `
              <tr>
                <td>${row.excelRow || '-'}</td>
                <td>${row.type || '-'}</td>
                <td>${row.status || '-'}</td>
                <td>${escapeHtml(row.message)}</td>
                <td>${escapeHtml([
                  row.data?.email ? `Email: ${row.data.email}` : '',
                  row.data?.variant_id ? `Variant: ${row.data.variant_id}` : '',
                  row.data?.vendor_id ? `Vendor ID: ${row.data.vendor_id}` : ''
                ].filter(Boolean).join(' | '))}</td>
              </tr>
            `).join('')}
          </table>

          <!-- Errors Section -->
          ${results.errors?.length > 0 ? `
            <table>
              <tr><th colspan="3" class="section-title">Errors (${results.errors.length})</th></tr>
              <tr>
                <th>Row</th>
                <th>Vendor</th>
                <th>Error</th>
              </tr>
              ${results.errors.map(error => `
                <tr class="danger">
                  <td>${error.row || '-'}</td>
                  <td>${escapeHtml(error.vendor)}</td>
                  <td>${escapeHtml(error.error)}</td>
                </tr>
              `).join('')}
            </table>
          ` : ''}
        </body>
      </html>
    `;

    const blob = new Blob([tableHTML], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}`;
    link.download = `bulk_upload_report_${dateStr}_${timeStr}.xls`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  };

  return (
    <>
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop closeOnClick pauseOnHover />
      {loading && <Loader />}

      {/* Page Header */}
      <section className="content-header">
        <div className="container-fluid">
          <div className="row justify-content-between align-items-center">
            <div className="col">
              <h1 className="m-0 text-dark">Bulk Vendor Upload</h1>
              <small className="text-muted">Upload Excel file to bulk create vendors and map products</small>
            </div>
            <div className="col-auto">
              <button type="button" className="btn btn-primary mr-2" onClick={downloadSampleFile}>
                <i className="fa fa-download"></i> Download Sample File
              </button>
              <button type="button" className="btn btn-secondary" onClick={handleGoBack}>
                <i className="fa fa-arrow-left"></i> Back to Vendors
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="content">
        <div className="container-fluid">

          {/* Instructions Card */}
          <div className="card card-outline card-info mb-3">
            <div className="card-header">
              <h3 className="card-title"><i className="fa fa-info-circle"></i> Excel Format Instructions</h3>
            </div>
            <div className="card-body py-2">
              <div className="row">
                <div className="col-md-6">
                  <ul className="mb-0 pl-3">
                    <li><strong>Required fields (first row of vendor):</strong> company_name, register_email, register_mobile</li>
                    <li><strong>One vendor = continuous rows</strong> (no blank rows between same vendor)</li>
                    <li><strong>Product fields:</strong> product_variant_id, product_variant_name</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <ul className="mb-0 pl-3">
                    <li><strong>approved_by_list:</strong> comma-separated without spaces (e.g., ongc,iocl,sail)</li>
                    <li><strong>make_list:</strong> comma-separated makes (optional)</li>
                    <li><strong>Max file size:</strong> 10MB</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Card */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title"><i className="fa fa-upload"></i> Upload Excel File</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-8 mx-auto">
                  {/* File Drop Area */}
                  <div
                    className="file-drop-area text-center rounded py-5 mb-3"
                    style={{
                      border: `2px dashed ${file ? '#28a745' : '#007bff'}`,
                      cursor: 'pointer',
                      backgroundColor: file ? '#f8fff8' : '#f8f9fa',
                      transition: 'all 0.3s ease'
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const droppedFile = e.dataTransfer.files[0];
                      if (droppedFile) {
                        handleFileSelect({ target: { files: [droppedFile] } });
                      }
                    }}
                  >
                    <i
                      className={`fa ${file ? 'fa-file-excel text-success' : 'fa-cloud-upload-alt text-primary'}`}
                      style={{ fontSize: '50px' }}
                    ></i>
                    <p className="fw-semibold mt-3 mb-1" style={{ color: file ? '#28a745' : '#007bff' }}>
                      {fileName || 'Click to select or drag and drop your Excel file here'}
                    </p>
                    {file && (
                      <small className="text-muted">
                        File size: {(file.size / 1024).toFixed(2)} KB
                      </small>
                    )}
                    <p className="text-muted small mt-2 mb-0">
                      Supported formats: .xlsx, .xls
                    </p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx,.xls"
                    style={{ display: 'none' }}
                    onChange={handleFileSelect}
                  />

                  {/* Action Buttons */}
                  <div className="text-center">
                    <button
                      type="button"
                      className="btn btn-success btn-lg mr-2"
                      onClick={handleUpload}
                      disabled={!file || loading}
                    >
                      <i className="fa fa-upload"></i> Upload & Process
                    </button>
                    {file && (
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-lg"
                        onClick={clearResults}
                      >
                        <i className="fa fa-times"></i> Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {results && (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title"><i className="fa fa-chart-bar"></i> Processing Results</h3>
                <div className="card-tools">
                  {results.summary?.processingTimeMs && (
                    <span className="badge badge-info mr-2">
                      <i className="fa fa-clock"></i> {results.summary.processingTimeMs}ms
                    </span>
                  )}
                  <button
                    type="button"
                    className="btn btn-sm btn-success"
                    onClick={downloadReport}
                  >
                    <i className="fa fa-download"></i> Download Report
                  </button>
                </div>
              </div>
              <div className="card-body">

                {/* Summary Stats */}
                <div className="row mb-4">
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-info mb-2">
                      <span className="info-box-icon"><i className="fa fa-file"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Total Rows</span>
                        <span className="info-box-number">{results.summary?.totalRows || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-primary mb-2">
                      <span className="info-box-icon"><i className="fa fa-users"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Vendors</span>
                        <span className="info-box-number">{results.summary?.totalVendors || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-success mb-2">
                      <span className="info-box-icon"><i className="fa fa-user-plus"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Created</span>
                        <span className="info-box-number">{results.summary?.vendorsCreated || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-warning mb-2">
                      <span className="info-box-icon"><i className="fa fa-user-check"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Existing</span>
                        <span className="info-box-number">{results.summary?.vendorsExisting || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-teal mb-2">
                      <span className="info-box-icon"><i className="fa fa-link"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Mapped</span>
                        <span className="info-box-number">{results.summary?.productsMapped || 0}</span>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-2 col-sm-4 col-6">
                    <div className="info-box bg-danger mb-2">
                      <span className="info-box-icon"><i className="fa fa-exclamation-triangle"></i></span>
                      <div className="info-box-content">
                        <span className="info-box-text">Errors</span>
                        <span className="info-box-number">{results.summary?.errorCount || results.errors?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs for detailed results */}
                <ul className="nav nav-tabs" role="tablist">
                  <li className="nav-item">
                    <a
                      className={`nav-link ${activeTab === 'summary' ? 'active' : ''}`}
                      onClick={() => setActiveTab('summary')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fa fa-chart-pie"></i> Summary
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${activeTab === 'vendors' ? 'active' : ''}`}
                      onClick={() => setActiveTab('vendors')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fa fa-building"></i> Vendors ({results.vendors?.length || 0})
                    </a>
                  </li>
                  <li className="nav-item">
                    <a
                      className={`nav-link ${activeTab === 'rows' ? 'active' : ''}`}
                      onClick={() => setActiveTab('rows')}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="fa fa-list"></i> Row Details ({results.rows?.length || 0})
                    </a>
                  </li>
                  {results.errors?.length > 0 && (
                    <li className="nav-item">
                      <a
                        className={`nav-link text-danger ${activeTab === 'errors' ? 'active' : ''}`}
                        onClick={() => setActiveTab('errors')}
                        style={{ cursor: 'pointer' }}
                      >
                        <i className="fa fa-exclamation-circle"></i> Errors ({results.errors.length})
                      </a>
                    </li>
                  )}
                </ul>

                <div className="tab-content mt-3">
                  {/* Summary Tab */}
                  {activeTab === 'summary' && (
                    <div className="tab-pane active">
                      <div className="row">
                        <div className="col-md-6">
                          <h5>Vendor Statistics</h5>
                          <table className="table table-sm table-bordered">
                            <tbody>
                              <tr>
                                <td>Total Vendors Processed</td>
                                <td className="text-right"><strong>{results.summary?.totalVendors || 0}</strong></td>
                              </tr>
                              <tr className="table-success">
                                <td>New Vendors Created</td>
                                <td className="text-right"><strong>{results.summary?.vendorsCreated || 0}</strong></td>
                              </tr>
                              <tr className="table-warning">
                                <td>Existing Vendors Used</td>
                                <td className="text-right"><strong>{results.summary?.vendorsExisting || 0}</strong></td>
                              </tr>
                              <tr className="table-danger">
                                <td>Vendors Failed</td>
                                <td className="text-right"><strong>{results.summary?.vendorsFailed || 0}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                        <div className="col-md-6">
                          <h5>Product Mapping Statistics</h5>
                          <table className="table table-sm table-bordered">
                            <tbody>
                              <tr>
                                <td>Total Products</td>
                                <td className="text-right"><strong>{results.summary?.totalProducts || 0}</strong></td>
                              </tr>
                              <tr className="table-success">
                                <td>Successfully Mapped</td>
                                <td className="text-right"><strong>{results.summary?.productsMapped || 0}</strong></td>
                              </tr>
                              <tr className="table-info">
                                <td>Skipped (Already Exists)</td>
                                <td className="text-right"><strong>{results.summary?.productsSkipped || 0}</strong></td>
                              </tr>
                              <tr className="table-danger">
                                <td>Failed</td>
                                <td className="text-right"><strong>{results.summary?.productsFailed || 0}</strong></td>
                              </tr>
                              <tr>
                                <td>Approvals Mapped</td>
                                <td className="text-right"><strong>{results.summary?.approvalsMapped || 0}</strong></td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Vendors Tab */}
                  {activeTab === 'vendors' && (
                    <div className="tab-pane active">
                      <div className="table-responsive">
                        <table className="table table-striped table-sm table-hover">
                          <thead className="thead-dark">
                            <tr>
                              <th>Row</th>
                              <th>Company</th>
                              <th>Email</th>
                              <th>Status</th>
                              <th>Vendor ID</th>
                              <th>Products</th>
                              <th>Mapped</th>
                              <th>Skipped</th>
                              <th>Failed</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.vendors?.map((vendor) => (
                              <tr key={vendor.vendorId}>
                                <td>{vendor.startRow}</td>
                                <td>{vendor.company_name}</td>
                                <td><small>{vendor.email}</small></td>
                                <td>
                                  <span className={`badge badge-${
                                    vendor.status === 'created' ? 'success' :
                                    vendor.status === 'existing' ? 'warning' :
                                    vendor.status === 'failed' ? 'danger' : 'secondary'
                                  }`}>
                                    {vendor.isNew ? 'NEW' : vendor.status?.toUpperCase()}
                                  </span>
                                </td>
                                <td>{vendor.vendorId || '--'}</td>
                                <td>{vendor.productsProcessed || 0}</td>
                                <td className="text-success">{vendor.productsMapped || 0}</td>
                                <td className="text-info">{vendor.productsSkipped || 0}</td>
                                <td className="text-danger">{vendor.productsFailed || 0}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Rows Tab */}
                  {activeTab === 'rows' && (
                    <div className="tab-pane active">
                      <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <table className="table table-striped table-sm table-hover">
                          <thead className="thead-dark" style={{ position: 'sticky', top: 0 }}>
                            <tr>
                              <th>Excel Row</th>
                              <th>Type</th>
                              <th>Status</th>
                              <th>Message</th>
                              <th>Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {results.rows?.map((row) => (
                              <tr key={row.vendorId}>
                                <td>{row.excelRow}</td>
                                <td>
                                  <span className={`badge badge-${
                                    row.type === 'vendor' ? 'primary' :
                                    row.type === 'product' ? 'info' :
                                    row.type === 'vendor+product' ? 'primary' : 'secondary'
                                  }`}>
                                    {row.type || 'unknown'}
                                  </span>
                                </td>
                                <td>
                                  <span className={`badge badge-${
                                    row.status === 'success' || row.status === 'created' ? 'success' :
                                    row.status === 'existing' || row.status === 'queued' ? 'warning' :
                                    row.status === 'failed' ? 'danger' :
                                    row.status === 'skipped' ? 'info' : 'secondary'
                                  }`}>
                                    {row.status}
                                  </span>
                                </td>
                                <td><small>{row.message ? row.message : '--'}</small></td>
                                <td>
                                  <small className="text-muted">
                                    {[
                                      row.data?.email && `Email: ${row.data.email}`,
                                      row.data?.variant_id && `Variant: ${row.data.variant_id}`,
                                      row.data?.vendor_id && `Vendor ID: ${row.data.vendor_id}`
                                    ].filter(Boolean).join(' | ') || '--'}
                                  </small>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Errors Tab */}
                  {activeTab === 'errors' && results.errors?.length > 0 && (
                    <div className="tab-pane active">
                      <div className="alert alert-danger">
                        <h5><i className="fa fa-exclamation-triangle"></i> Errors Found</h5>
                        <div className="table-responsive">
                          <table className="table table-sm table-bordered mb-0">
                            <thead>
                              <tr>
                                <th>Row</th>
                                <th>Vendor</th>
                                <th>Error</th>
                              </tr>
                            </thead>
                            <tbody>
                              {results.errors.map((error) => (
                                <tr key={`${error.row}-${error.vendor}-${error.error}`}>
                                  <td>{error.row || '-'}</td>
                                  <td>{error.vendor || '-'}</td>
                                  <td>{error.error}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default BulkVendorUpload;
