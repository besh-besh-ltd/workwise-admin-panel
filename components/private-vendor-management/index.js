import { handleApprovePrivateVendor, handleGetPrivateVendorList } from '@/utils/services/private-vendor-management';
import React, { useEffect, useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import RejectModal from '../modal/reject-modal';

const PrivateVendorManagement = () => {
    const [vendorReviewList, setVendorReviewList] = useState([]);
    const [selectedVendors, setSelectedVendors] = useState([]);
    const [individualVendor, setIndividualVendor] = useState({});
    const [limit, setlimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, settotalPages] = useState(1);
    const [openRejectModal, setOpenRejectModal] = useState(false);

    // Function to handle select/diselect all vendors
    const toggleSelectedVendors = (e) => {
        const isChecked = e.target.checked;
        const updatedSelectedVendors = isChecked
            ? vendorReviewList.map((item) => item.id)
            : [];
        setSelectedVendors(updatedSelectedVendors);
    }

    // Function to handle select/diselect individual vendors
    const selectVendor = (e, item) => {
        const vendorId = item.id;
        const isChecked = e.target.checked;
        let updatedSelectedVendors = [...selectedVendors];

        if (isChecked) {
            updatedSelectedVendors.push(vendorId);
        } else {
            updatedSelectedVendors = updatedSelectedVendors.filter(
                (id) => id !== vendorId
            );
        }
        setSelectedVendors(updatedSelectedVendors);
    }

    // Function to fetch all vendors
    const getVendorReviewList = () => {
        handleGetPrivateVendorList()
            .then((res) => {
                // settotalPages(res.total_count);
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

    const approveVendor = (vendorObj, status, reason = '') => {
        handleApprovePrivateVendor(vendorObj, status, reason)
            .then((res) => {
                console.log(res)
                toast.success(res.message)
                getVendorReviewList();
            })
            .catch((error) => {
                console.log(error)
                toast.error(error.response?.data?.error)
            })
            .finally(() => setOpenRejectModal(close));
    }

    useEffect(() => {
        getVendorReviewList();
    }, [])

    return (
        <>
            <ToastContainer />

            <section className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Private Vendors</h1>
                    </div>
                </div>
            </section>

            <section className="content">
                <div className="card card-body product-table mt-3">
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">
                                    <input
                                        type="checkbox"
                                        name="select_all_products"
                                        checked={selectedVendors.length > 0 && selectedVendors.length === vendorReviewList.length}
                                        value=""
                                        onChange={toggleSelectedVendors}
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
                                                    checked={selectedVendors.includes(item.id)}
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
                                                        onClick={() => approveVendor(item, 1)}
                                                    >
                                                        Approve
                                                    </button>
                                                    {item.status !== 2 &&
                                                    <button
                                                        type="button"
                                                        className="btn btn-danger"
                                                        onClick={() => {
                                                            setIndividualVendor(item)
                                                            setOpenRejectModal(true)
                                                        }}
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
                    {/* {Math.ceil(totalPages / 10) > 1 && (
                        <ReactPaginate
                            breakLabel="..."
                            nextLabel={<i className="fa fa-angle-right"></i>}
                            onPageChange={handlePageClick}
                            pageRangeDisplayed={2}
                            pageCount={Math.ceil(totalPages / 10)}
                            previousLabel={<i className="fa fa-angle-left"></i>}
                            renderOnZeroPageCount={null}
                            className="pagination"
                        />
                    )} */}

                </div>
            </section>
            {openRejectModal &&
                <RejectModal
                    openRejectModal={openRejectModal}
                    closeModal={() => setOpenRejectModal(false)}
                    approveVendor={approveVendor}
                    data={individualVendor}
                />
            }

        </>
    )
}

export default PrivateVendorManagement;
