import { handleApprovePrivateVendor, handleGetPrivateVendorList } from '@/utils/services/private-vendor-management';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import VendorApprovalModal from '../modal/vendor-approval-modal';
import Loader from '../shared/Loader';


const PrivateVendorManagement = () => {
    const [vendorReviewList, setVendorReviewList] = useState([]);
    const [bulkVendors, setBulkVendors] = useState([]);
    const [selectedVendor, setSelectedVendor] = useState({});
    const [limit, setlimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, settotalPages] = useState(1);
    const [modalState, setModalState] = useState({
        title: "",
        prod_string: "",
        type: "approve",
        is_open: false
    });
    const [loading, setLoading] = useState(false);


    // Function to handle select/diselect all vendors
    const togglebulkVendors = (e) => {
        const isChecked = e.target.checked;
        const updatedbulkVendors = isChecked
            ? vendorReviewList.map((item) => item.id)
            : [];
        setBulkVendors(updatedbulkVendors);
    }

    // Function to handle select/diselect individual vendors
    const selectVendor = (e, item) => {
        const vendorId = item.id;
        const isChecked = e.target.checked;
        let updatedbulkVendors = [...bulkVendors];

        if (isChecked) {
            updatedbulkVendors.push(vendorId);
        } else {
            updatedbulkVendors = updatedbulkVendors.filter(
                (id) => id !== vendorId
            );
        }
        setBulkVendors(updatedbulkVendors);
    }

    // Function to fetch all vendors
    const getVendorReviewList = () => {
        handleGetPrivateVendorList()
            .then((res) => {
                setVendorReviewList(res.data);
            })
            .catch((error) => {
                console.log(error)
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    };

    const handleVendorStatusChange = (vendorObj, status, dynamicParam) => {
        let payload = {
            buyerName: vendorObj.buyer_name,
            vendorTempId: vendorObj.id,
            status: status,
        };

        if (modalState.type === "approve") {
            payload = {
                ...payload,
                productdetails: dynamicParam
            }
        } else {
            payload = {
                ...payload,
                reject_reason: dynamicParam
            }
        }

        setLoading(true);
        handleCloseModal();
        handleApprovePrivateVendor(payload)
            .then((res) => {
                toast.success(res.message)
                getVendorReviewList();
            })
            .catch((error) => {
                console.log(error)
                toast.error(error.response?.data?.error)
            })
            .finally(() => {
                setModalState({
                    title: "",
                    prod_string: "",
                    type: "approve",
                    is_open: false
                })
                setLoading(false);
            });
    }

    const handleOpenModal = (title, type, vendorItem) => {
        setSelectedVendor(vendorItem);
        setModalState({
            title,
            type,
            prod_string: vendorItem?.product_list || "",
            is_open: true
        });
    }

    const handleCloseModal = () => {
        setModalState((prevState) => ({
            ...prevState,
            is_open: false
        }));
    }

    useEffect(() => {
        getVendorReviewList();
    }, [])

    return (
        <>
            {loading && <Loader />}
            {/* Page Name Section */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Private Vendors</h1>
                    </div>
                </div>
            </section>

            {/* Vendor List Section */}
            <section className="content">
                <div className="card card-body product-table mt-3">
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        name="select_all_products"
                                        checked={bulkVendors.length > 0 && bulkVendors.length === vendorReviewList.length}
                                        value=""
                                        onChange={togglebulkVendors}
                                    />
                                </th>
                                <th>Buyer Name</th>
                                <th>Vendor Name</th>
                                <th>Email</th>
                                <th>Phone No.</th>
                                <th>Product List</th>
                                <th>Status</th>
                                <th>Reject Reason</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {vendorReviewList &&
                                vendorReviewList?.map((item) => {
                                    return (
                                        <tr key={item.id}>
                                            <td>
                                                <input
                                                    type="checkbox"
                                                    name="select_product"
                                                    checked={bulkVendors.includes(item.id)}
                                                    value=""
                                                    onClick={(e) => selectVendor(e, item)}
                                                />
                                            </td>
                                            <td>{item?.buyer_name}</td>
                                            <td>{item?.vendor_name}</td>
                                            <td>{item?.email}</td>
                                            <td>{item?.mobile}</td>
                                            <td>{item?.product_list}</td>
                                            <td>
                                                <span className={`badge ${item.status === -1 ? 'badge-warning'
                                                    : item.status === 1 ? 'badge-success'
                                                        : item.status === 2 ? 'badge-danger' : "badge-primary"}`}>
                                                    {
                                                        item.status === -1 ? "Pending"
                                                            : item.status === 1 ? "Approved"
                                                                : item.status === 2 ? "Rejected" : "Reviewed"
                                                    }
                                                </span>
                                            </td>
                                            <td>{item.reject_reason || "---"}</td>
                                            <td>
                                                <div className="d-flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="btn btn-success"
                                                        onClick={() => handleOpenModal("Approve Vendor", "approve", item)}
                                                    >
                                                        Approve
                                                    </button>
                                                    {item.status !== 2 &&
                                                        <button
                                                            type="button"
                                                            className="btn btn-danger"
                                                            onClick={() => handleOpenModal("Reject Vendor", "reject", item)}
                                                        >
                                                            Reject
                                                        </button>}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>

                </div>
            </section>

            {/* Approve-Reject Modal Area  */}
            {modalState.is_open &&
                <VendorApprovalModal
                    modalState={modalState}
                    closeModal={handleCloseModal}
                    handleVendorStatusChange={handleVendorStatusChange}
                    data={selectedVendor}
                />
            }

        </>
    )
}

export default PrivateVendorManagement;
