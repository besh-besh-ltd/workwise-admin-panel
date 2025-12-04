import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEdit, faEye } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from "react-toastify";
import FullLoading from '@/components/loading/FullLoading';
import VendorCard from './vendor-card';
import StatusModal from '@/components/modal/status-modal';
import VendorSelectionModal from '@/components/modal/VendorSelectionModal';
import { getRFQDetails, updateStatus, getVendorsForReminder, sendSelectiveReminder } from '@/utils/services/rfq-management';

const RFQDetails = () => {
    const router = useRouter();
    const { rfq_id } = router.query;
    const [rfqDetails, setRfqDetails] = useState(null);
    const [vendorDetails, setVendorDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openUpdateStatus, setOpenUpdateStatus] = useState(false);
    const [showVendorModal, setShowVendorModal] = useState(false);
    const [vendors, setVendors] = useState([]);
    const [modalLoading, setModalLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('vendor-details'); // 'vendor-details' or 'product-wise'

    const textCapitalize = (str) => {
        if (!str) return str;
        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    const updateAdminStatus = ({ status, comment }) => {
        let payload = {
            rfq_id: parseInt(rfq_id),
            status,
            comment
        }
        setLoading(true);
        setOpenUpdateStatus(false);

        updateStatus(payload)
            .then((res) => {
                toast.success(res.data.message)
                getRfqById();
            })
            .catch((error) => {
                console.log(error)
                toast.error(error.message)
            })
            .finally(() => setLoading(false))
    }

    const getRfqById = () => {
        setLoading(true);
        getRFQDetails(rfq_id)
            .then((res) => {
                setRfqDetails(res.data[0]);
                setVendorDetails(res.data[0]?.vendor_details)
            })
            .catch((error) => {
                console.log(error)
            })
            .finally(() => {
                setLoading(false)
            })
    }

    const handleOpenVendorModal = async () => {
        setModalLoading(true);
        setShowVendorModal(true);
        
        try {
            const response = await getVendorsForReminder(rfq_id);
            setVendors(response.data || []);
        } catch (err) {
            toast.error("Failed to fetch vendors for reminder");
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setShowVendorModal(false);
        setVendors([]);
    };

    const handleSendSelectiveReminder = async (vendorIds) => {
        try {
            const response = await sendSelectiveReminder(rfq_id, vendorIds);
            toast.success(response.data?.message || "Reminder sent successfully to selected vendors!");
        } catch (err) {
            console.error("Error sending selective reminder:", err);
            toast.error(err?.response?.data?.message || "Failed to send reminder");
            throw err;
        }
    };

    const isAllProductsFinalized = (vendorDetails) => {
        if (!vendorDetails || vendorDetails.length === 0) return false;
        for (const vendor of vendorDetails) {
            if (!vendor.products || vendor.products.length === 0) return false;
            for (const prod of vendor.products) {
                if (!prod.finalization || !prod.finalization.vendor_id) {
                    return false;
                }
            }
        }
        return true;
    };

    // Get product-wise data
    const getProductWiseData = () => {
        if (!vendorDetails || vendorDetails.length === 0) return [];
        
        const productMap = new Map();
        
        vendorDetails.forEach(vendor => {
            vendor.products?.forEach(product => {
                const key = product.product_id;
                
                if (!productMap.has(key)) {
                    productMap.set(key, {
                        product_id: product.product_id,
                        product_name: product.product_name,
                        product_description: product.product_description,
                        specs: product.product_specs || [],
                        vendors: []
                    });
                }
                
                const hasResponded = product.quotation_details !== null;
                
                productMap.get(key).vendors.push({
                    vendor_id: vendor.vendor_id,
                    vendor_name: vendor.vendor_name,
                    vendor_email: vendor.vendor_email,
                    vendor_mobile: vendor.vendor_mobile,
                    vendor_organization: vendor.vendor_organization,
                    has_responded: hasResponded,
                    quotation_details: product.quotation_details,
                    finalization: product.finalization
                });
            });
        });
        
        return Array.from(productMap.values());
        
    };

    const handleViewVendor = (vendorId) => {
        router.push(`https://letsworkwise.com/vendor/vendor-profile?id=${vendorId}`);
    };

    useEffect(() => {
        if (rfq_id) {
            getRfqById();
        }
    }, [router, rfq_id])

    const productWiseData = getProductWiseData();

    return (
        <>
            {loading && <FullLoading />}
            
            {/* Title section */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">RFQ Details</h1>
                    </div>
                </div>
            </section>

            {/* RFQ Details Section */}
            <section className="content">
                <div className="container-fluid">
                    <div className="card card-body">

                        {/* RFQ Details Section */}
                        {rfqDetails &&
                            <>
                                <div className="d-flex justify-content-between mb-2">
                                    <h2 className="fs-5 ">Rfq No. #{` ${rfqDetails?.rfq_no}`}</h2>
                                    <div>
                                        <button
                                            type="button"
                                            className="btn btn-secondary mr-3"
                                            onClick={handleOpenVendorModal}
                                            disabled={rfqDetails?.status !== 1 || isAllProductsFinalized(vendorDetails)}
                                        >
                                            <FontAwesomeIcon icon={faPaperPlane} className="me-2" />
                                            Send Reminder
                                        </button>

                                        <button type="button" className="btn btn-primary" onClick={() => setOpenUpdateStatus(true)}>
                                            <FontAwesomeIcon icon={faEdit} className="me-2" />
                                            Status
                                        </button>
                                    </div>
                                </div>
                                <div className="row border rounded-2 p-2">
                                    <div className="col-md-5">
                                        <div className="mb-2">
                                            <strong>Buyer Name : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.contact_name || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Company Name : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.company_name || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Buyer Email : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.response_email || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Contact No : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.contact_number || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Bid End Date : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.bid_end_date || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
                                        <div className="mb-2">
                                            <strong>Project Name : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.project_name || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Created At : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.timestamp ? new Date(rfqDetails.timestamp).toLocaleString('en-IN', { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: true }) : "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>RFQ Status : </strong>
                                            {rfqDetails?.status == 1
                                                ? <span className="badge badge-success">Open</span>
                                                : <span className="badge badge-danger">Closed</span>
                                            }
                                        </div>
                                        <div className="mb-2">
                                            <strong>RFQ Type : </strong>
                                            <span className="fw-medium text-muted px-2">{textCapitalize(rfqDetails?.rfq_type || "---")}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>location: </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.location || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
                                        <div className="mb-2">
                                            <strong>Reverse Auction : </strong>
                                            {rfqDetails?.reverse_auction == 1
                                                ? <span className="fw-medium text-muted px-2">Enabled</span>
                                                : <span className="fw-medium text-muted px-2">Disabled</span>
                                            }
                                        </div>
                                        <div className="mb-2">
                                            <strong>Reverse Auction Start Date : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.ra_start_date || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Reverse Auction End Date : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.ra_end_date || "---"}</span>
                                        </div>
                                        <div className="mb-2">
                                            <strong>Admin Status : </strong>
                                            {rfqDetails.admin_service_details ?
                                                rfqDetails.admin_service_details[0]?.status == "Working" ?
                                                    <span className="badge badge-info">Working</span> :
                                                    rfqDetails.admin_service_details[0]?.status == "Complete" ?
                                                        <span className="badge badge-success">Complete</span>
                                                        : <span className="badge badge-warning">Pending</span>
                                                : <span className="badge badge-warning">Pending</span>
                                            }
                                        </div>
                                        <div className="mb-2">
                                            <strong>Comment : </strong>
                                            {rfqDetails.admin_service_details ? rfqDetails.admin_service_details[0]?.comment : "---"}
                                        </div>
                                    </div>
                                </div>
                            </>
                        }

                        {/* Tabs Section */}
                        {vendorDetails &&
                            <>
                                <div className="mt-4">
                                    <ul className="nav nav-tabs" role="tablist">
                                        <li className="nav-item">
                                            <a 
                                                className={`nav-link ${activeTab === 'vendor-details' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('vendor-details')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Vendor Details
                                            </a>
                                        </li>
                                        <li className="nav-item">
                                            <a 
                                                className={`nav-link ${activeTab === 'product-wise' ? 'active' : ''}`}
                                                onClick={() => setActiveTab('product-wise')}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                Product-wise Chart
                                            </a>
                                        </li>
                                    </ul>

                                    <div className="tab-content mt-3">
                                        {/* Vendor Details Tab */}
                                        {activeTab === 'vendor-details' && (
                                            <div className="row rounded-2 p-2 overflow-y-auto" style={{ maxHeight: "100vh" }}>
                                                {vendorDetails && vendorDetails.length > 0 ?
                                                    vendorDetails.map((vendorItem) => {
                                                        return (
                                                            <VendorCard key={vendorItem.vendor_id} data={vendorItem} />
                                                        )
                                                    })
                                                    :
                                                    <p className="text-center">No Vendors Found</p>
                                                }
                                            </div>
                                        )}

                                        {/* Product-wise Chart Tab */}
                                        {activeTab === 'product-wise' && (
                                            <div className="overflow-y-auto" style={{ maxHeight: "100vh" }}>
                                                {productWiseData && productWiseData.length > 0 ? (
                                                    productWiseData.map((product, index) => {
                                                        const totalVendors = product.vendors.length;
                                                        const respondedVendors = product.vendors.filter(v => v.has_responded).length;
                                                        
                                                        return (
                                                            <div key={product.product_id} className="mb-4">
                                                                {/* Product Header */}
                                                                <div className="border rounded-2 p-3 mb-2 bg-light">
                                                                    <h5 className="mb-3">{product.product_name}</h5>
                                                                    <div className="row">
                                                                        <div className="col-md-8">
                                                                            <div className="d-flex flex-wrap">
                                                                                {product.specs && product.specs.map((spec, idx) => (
                                                                                    <div key={idx} className="mr-4 mb-2">
                                                                                        <strong>{spec.title}: </strong>
                                                                                        <span className="text-muted">{spec.value}</span>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                        <div className="col-md-4">
                                                                            <div className="mb-2">
                                                                                <strong>Total Selected Vendors: </strong>
                                                                                <span className="badge badge-primary ml-2">{totalVendors}</span>
                                                                            </div>
                                                                            <div className="mb-2">
                                                                                <strong>Vendors Responded: </strong>
                                                                                <span className="badge badge-success ml-2">{respondedVendors}</span>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Vendors Table */}
                                                                <div className="table-responsive">
                                                                    <table className="table table-bordered table-hover">
                                                                        <thead className="thead-light">
                                                                            <tr>
                                                                                <th>S.No</th>
                                                                                <th>Vendor Name</th>
                                                                                <th>Organization</th>
                                                                                <th>Email</th>
                                                                                <th>Mobile</th>
                                                                                <th>Response Status</th>
                                                                                <th>Finalization</th>
                                                                                <th>Action</th>
                                                                            </tr>
                                                                        </thead>
                                                                        <tbody>
                                                                            { 
                                                                            product.vendors.map((vendor, vIdx) =>
                                                                              
                                                                               (
                                                                                <tr key={vendor.vendor_id}>
                                                                                    <td>{vIdx + 1}</td>
                                                                                    <td>{vendor.vendor_name}</td>
                                                                                    <td>{vendor.vendor_organization}</td>
                                                                                    <td>{vendor.vendor_email}</td>
                                                                                    <td>{vendor.vendor_mobile}</td>
                                                                                    <td>
                                                                                        {vendor.has_responded ? (
                                                                                            <span className="badge badge-success">Responded</span>
                                                                                        ) : (
                                                                                            <span className="badge badge-warning">Pending</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        {vendor.finalization && vendor.finalization.vendor_id === vendor.vendor_id ? (
                                                                                            <span className="badge badge-info">Finalized</span>
                                                                                        ) : (
                                                                                            <span className="badge badge-secondary">Not Finalized</span>
                                                                                        )}
                                                                                    </td>
                                                                                    <td>
                                                                                        <button 
                                                                                            className="btn btn-sm btn-info"
                                                                                            onClick={() => handleViewVendor(vendor.vendor_id)}
                                                                                        >
                                                                                            <FontAwesomeIcon icon={faEye} className="mr-1" />
                                                                                            View
                                                                                        </button>
                                                                                    </td>
                                                                                </tr>
                                                                            ))}
                                                                        </tbody>
                                                                    </table>
                                                                </div>
                                                            </div>
                                                        );
                                                    })
                                                ) : (
                                                    <p className="text-center">No Products Found</p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        }

                    </div>
                </div>
            </section>

            {/* Update Admin Status Modal Section */}
            {openUpdateStatus &&
                <StatusModal
                    openModal={openUpdateStatus}
                    closeModal={() => setOpenUpdateStatus(false)}
                    data={rfqDetails.admin_service_details ? rfqDetails.admin_service_details[0] : null}
                    updateAdminStatus={updateAdminStatus}
                />
            }

            {/* Vendor Selection Modal */}
            <VendorSelectionModal
                isOpen={showVendorModal}
                onClose={handleCloseModal}
                onSendReminder={handleSendSelectiveReminder}
                vendors={vendors}
                loading={modalLoading}
            />

            <ToastContainer />
        </>
    )
}

export default RFQDetails;