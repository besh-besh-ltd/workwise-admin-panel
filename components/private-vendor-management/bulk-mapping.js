import React, { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import Loader from '../shared/Loader';
import { handleBulkBuyerVendorMapping } from '../../utils/services/private-vendor-management';

const BulkBuyerVendorMapping = () => {
    const router = useRouter();
    const fileInputRef = useRef(null);
    const [loading, setLoading] = useState(false);
    const [file, setFile] = useState(null);
    const [fileName, setFileName] = useState('');
    const [results, setResults] = useState(null);

    const handleFileUpload = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        setFile(selectedFile);
        setFileName(selectedFile.name);
        setResults(null);
    };

    const downloadSampleFile = () => {
        const link = document.createElement('a');
        link.href = '/buyer_vendor_mapping_sample.xlsx';
        link.download = 'buyer_vendor_mapping_sample.xlsx';
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

        try {
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await handleBulkBuyerVendorMapping(formData);

            if (response.status === 1) {
                toast.success(response.message);
                setResults(response.data);
                setFile(null);
                setFileName('');
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
            } else {
                toast.error(response.message || 'Upload failed');
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Upload failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoBack = () => {
        router.push('/private-vendor-management');
    };

    const successRate = results ? ((results.successfulMappings / results.totalProcessed) * 100).toFixed(1) : 0;

    return (
        <>
            {loading && <Loader />}
            
            {/* Start Page Header */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row justify-content-between align-items-center">
                        <div className="col">
                            <h1 className="m-0 text-dark">Bulk Buyer-Vendor Mapping</h1>
                        </div>
                        <div className="col-auto">
                            <button type="button" className="btn btn-secondary" onClick={handleGoBack}>
                                <i className="fa fa-arrow-left"></i> Back to Private Vendors
                            </button>
                        </div>
                    </div>
                </div>
            </section>
            {/* End Page Header */}

            {/* Start Main Content */}
            <section className="content">
                <div className="container-fluid">
                    {/* Start Download Sample Button */}
                    <div className="mb-3">
                        <button type="button" className="btn btn-primary" onClick={downloadSampleFile}>
                            <i className="fa fa-download"></i> Download Sample File
                        </button>
                    </div>
                    {/* End Download Sample Button */}

                    {/* Start Upload Card */}
                    <div className="card">
                        <div className="card-header">
                            <h3 className="card-title">Upload File</h3>
                        </div>
                        <div className="card-body">
                            <div className="row">
                                <div className="col-md-8 mx-auto">
                                    {/* Start File Upload Area */}
                                    <div
                                        className="file-drop-area text-center rounded py-4 mb-3"
                                        style={{
                                            border: '2px dashed #007bff',
                                            cursor: 'pointer',
                                            backgroundColor: file ? '#f8f9fa' : '#fff',
                                            color: file ? '#28a745' : '#007bff',
                                        }}
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <i className={`fa ${file ? 'fa-file-excel' : 'fa-cloud-upload'}`} style={{ fontSize: "45px" }}></i>
                                        <p className="fw-semibold mt-2">
                                            {fileName || 'Click to select or drag and drop your file here'}
                                        </p>
                                        {file && (
                                            <small className="text-muted">
                                                File size: {(file.size / 1024).toFixed(2)} KB
                                            </small>
                                        )}
                                    </div>
                                    {/* End File Upload Area */}

                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".xlsx"
                                        style={{ display: 'none' }}
                                        onChange={handleFileUpload}
                                    />

                                    {/* Start Upload Button */}
                                    <div className="text-center">
                                        <button
                                            type="button"
                                            className="btn btn-success btn-lg"
                                            onClick={handleUpload}
                                            disabled={!file || loading}
                                        >
                                            <i className="fa fa-upload"></i> Upload and Process
                                        </button>
                                    </div>
                                    {/* End Upload Button */}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* End Upload Card */}

                    {/* Start Results Card */}
                    {results && (
                        <div className="card">
                            <div className="card-header">
                                <h3 className="card-title">Processing Results</h3>
                            </div>
                            <div className="card-body">
                                {/* Start Summary */}
                                <div className="row mb-4">
                                    <div className="col-md-3">
                                        <div className="info-box">
                                            <span className="info-box-icon bg-info">
                                                <i className="fa fa-file"></i>
                                            </span>
                                            <div className="info-box-content">
                                                <span className="info-box-text">Total Processed</span>
                                                <span className="info-box-number">{results.totalProcessed}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-box">
                                            <span className="info-box-icon bg-success">
                                                <i className="fa fa-check"></i>
                                            </span>
                                            <div className="info-box-content">
                                                <span className="info-box-text">Successful</span>
                                                <span className="info-box-number">{results.successfulMappings}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-box">
                                            <span className="info-box-icon bg-danger">
                                                <i className="fa fa-times"></i>
                                            </span>
                                            <div className="info-box-content">
                                                <span className="info-box-text">Failed</span>
                                                <span className="info-box-number">{results.failedMappings}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-3">
                                        <div className="info-box">
                                            <span className="info-box-icon bg-warning">
                                                <i className="fa fa-percent"></i>
                                            </span>
                                            <div className="info-box-content">
                                                <span className="info-box-text">Success Rate</span>
                                                <span className="info-box-number">{successRate}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {/* End Summary */}

                                {/* Start Successful Mappings */}
                                {results.mappedEntries?.length > 0 && (
                                    <div className="mb-4">
                                        <h5 className="text-success">
                                            <i className="fa fa-check-circle"></i> Successful Mappings ({results.mappedEntries.length})
                                        </h5>
                                        <div className="table-responsive">
                                            <table className="table table-striped table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Row</th>
                                                        <th>Buyer Email</th>
                                                        <th>Vendor Email</th>
                                                        <th>Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {results.mappedEntries.map((entry, index) => (
                                                        <tr key={index}>
                                                            <td>{entry.row}</td>
                                                            <td>{entry.buyerEmail}</td>
                                                            <td>{entry.vendorEmail}</td>
                                                            <td>
                                                                <span className="badge badge-success">{entry.status}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {/* End Successful Mappings */}

                                {/* Start Failed Mappings */}
                                {results.unmappedEntries?.length > 0 && (
                                    <div>
                                        <h5 className="text-danger">
                                            <i className="fa fa-exclamation-circle"></i> Failed Mappings ({results.unmappedEntries.length})
                                        </h5>
                                        <div className="table-responsive">
                                            <table className="table table-striped table-sm">
                                                <thead>
                                                    <tr>
                                                        <th>Row</th>
                                                        <th>Buyer Email</th>
                                                        <th>Vendor Email</th>
                                                        <th>Reason</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {results.unmappedEntries.map((entry, index) => (
                                                        <tr key={index}>
                                                            <td>{entry.row}</td>
                                                            <td>{entry.buyerEmail}</td>
                                                            <td>{entry.vendorEmail}</td>
                                                            <td>
                                                                <span className="badge badge-danger">{entry.reason}</span>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                                {/* End Failed Mappings */}
                            </div>
                        </div>
                    )}
                    {/* End Results Card */}
                </div>
            </section>
            {/* End Main Content */}
        </>
    );
};

export default BulkBuyerVendorMapping; 