import FullLoading from '@/components/loading/FullLoading';
import { getRFQDetails, sendRFQReminderToVendor, updateStatus } from '@/utils/services/rfq-management';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import VendorCard from './vendor-card';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faEdit } from '@fortawesome/free-solid-svg-icons';
import StatusModal from '@/components/modal/status-modal';
import { ToastContainer, toast } from "react-toastify";

const RFQDetails = () => {
    const router = useRouter();
    const { rfq_id } = router.query;
    const [rfqDetails, setRfqDetails] = useState(null);
    const [vendorDetails, setVendorDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [openUpdateStatus, setOpenUpdateStatus] = useState(false);

    const textCapitalize = (str) => {
        if (!str) return str;

        return str
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))  // Capitalize each word
            .join(' ');                               // Join them back with spaces
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
                console.log(res)
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


    const handleSendReminder = async () => {
       setLoading(true);
         sendRFQReminderToVendor(rfq_id)
            .then((res) => {
                console.log(res)
                toast.success("Reminder sent successfully");
            })
            .catch((error) => {
                toast.error("Reminder sent Failed");
                
            })
            .finally(() => {
                setLoading(false)
            })
    }


    useEffect(() => {
        if (rfq_id) {
            getRfqById();
        }
    }, [router, rfq_id])


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

                                   <button type="button" className="btn btn-secondary mr-3" onClick={() => handleSendReminder(true)}>
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
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.company_name || rfqDetails?.contact_name || "---"}</span>
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
                                            <strong>Project Name : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.project_name || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-3">
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
                                            <strong>Reverse Auction : </strong>
                                            {rfqDetails?.reverse_auction == 1
                                                ? <span className="fw-medium text-muted px-2">Enabled</span>
                                                : <span className="fw-medium text-muted px-2">Disabled</span>
                                            }
                                        </div>
                                        <div className="mb-2">
                                            <strong>Bid End Date : </strong>
                                            <span className="fw-medium text-muted px-2">{rfqDetails?.bid_end_date || "---"}</span>
                                        </div>
                                    </div>

                                    <div className="col-md-4">
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

                        {/* Vendor Details Section */}
                        {vendorDetails &&
                            <>
                                <h2 className="fs-5 mt-3 ">Vendor Details</h2>
                                <div className="row rounded-2 p-2 overflow-y-auto" style={{ maxHeight: "100vh" }}>

                                    {/* Vendor profile */}
                                    {vendorDetails && vendorDetails.length > 0 ?
                                        vendorDetails.map((vendorItem) => {
                                            return (
                                                <VendorCard key={vendorItem.id} data={vendorItem} />
                                            )
                                        })
                                        :
                                        <p className="text-center">No Vendors Found</p>
                                    }

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

           <ToastContainer />
            
        </>
    )
}

export default RFQDetails
