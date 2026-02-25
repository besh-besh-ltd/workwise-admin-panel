import { handleApprovePrivateVendor, handleGetPrivateVendorList } from '@/utils/services/private-vendor-management';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import VendorApprovalModal from '../modal/vendor-approval-modal';
import Loader from '../shared/Loader';
import { useRouter, NextRouter } from 'next/router';

interface ModalState {
    title: string;
    prod_string: string;
    type: "approve" | "reject";
    is_open: boolean;
}

interface VendorItem {
    id: number;
    buyer_name: string;
    vendor_name: string;
    email: string;
    mobile: string;
    product_list: string;
    status: number;
    reject_reason: string | null;
}

interface ApprovePayload {
    buyerName: string;
    vendorTempId: number;
    status: number;
    productdetails?: string[];
    reject_reason?: string;
}

const initialState: ModalState = {
    title: "",
    prod_string: "",
    type: "approve",
    is_open: false
};


const PrivateVendorManagement: React.FC = () => {
    const router: NextRouter = useRouter();
    const [vendorReviewList, setVendorReviewList] = useState<VendorItem[]>([]);
    const [selectedVendor, setSelectedVendor] = useState<VendorItem | Record<string, never>>({});
    const [limit, setlimit] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [totalPages, settotalPages] = useState<number>(1);
    const [modalState, setModalState] = useState<ModalState>(initialState);
    const [loading, setLoading] = useState<boolean>(false);


    // Function to fetch all vendors
    const getVendorReviewList = (): void => {
        handleGetPrivateVendorList()
            .then((res: { data: VendorItem[] }) => {
                setVendorReviewList(res.data);
            })
            .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
                console.log(error)
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    };

    // Function to approve/disapprove vendor
    const handleVendorStatusChange = (vendorObj: VendorItem, status: number, dynamicParam: string | string[]): void => {
        let payload: ApprovePayload = {
            buyerName: vendorObj.buyer_name,
            vendorTempId: vendorObj.id,
            status: status,
        };

        if (modalState.type === "approve") {
            payload = {
                ...payload,
                productdetails: []
            }
        } else {
            payload = {
                ...payload,
                reject_reason: dynamicParam as string
            }
        }

        setLoading(true);
        if(modalState.type === "reject") handleCloseModal();

        handleApprovePrivateVendor(payload)
            .then((res: { message: string }) => {
                toast.success(res.message)
                getVendorReviewList();
            })
            .catch((error: { response?: { data?: { error: string } } }) => {
                console.log(error)
                toast.error(error.response?.data?.error)
            })
            .finally(() => {
                setModalState(initialState)
                setLoading(false);
            });
    }

    const handleOpenModal = (title: string, type: "approve" | "reject", vendorItem: VendorItem): void => {
        setSelectedVendor(vendorItem);
        setModalState({
            title,
            type,
            prod_string: vendorItem?.product_list || "",
            is_open: true
        });
    }

    const handleCloseModal = (): void => {
        setModalState((prevState) => ({
            ...prevState,
            is_open: false
        }));
    }

    const handleBulkMapping = (): void => {
        router.push('/private-vendor-management/bulk-mapping');
    };

    useEffect(() => {
        getVendorReviewList();
    }, [])

    return (
        <>
            {loading && <Loader />}
            {/* Page Name Section */}
            <section className="content-header">
                <div className="container-fluid">
                    <div className="row justify-content-between align-items-center">
                        <div className="col">
                            <h1 className="m-0 text-dark">Private Vendors</h1>
                        </div>
                        <div className="col-auto">
                            <button
                                type="button"
                                className="btn btn-primary"
                                onClick={handleBulkMapping}
                            >
                                <i className="fa fa-upload"></i> Map Buyer with Vendors
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Vendor List Section */}
            <section className="content">
                <div className="card card-body product-table mt-3">
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
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
                                            <td>{item?.buyer_name}</td>
                                            <td>{item?.vendor_name}</td>
                                            <td>{item?.email}</td>
                                            <td>{item?.mobile}</td>
                                            <td>{item?.product_list}</td>
                                            <td>
                                                <span className={`badge ${(item.status === -1 || item.status === 3) ? 'badge-warning'
                                                    : item.status === 1 ? 'badge-success'
                                                        : item.status === 2 ? 'badge-danger' : "badge-primary"}`}>
                                                    {
                                                        item.status === -1 ? "Pending"
                                                            : item.status === 3 ? "Pending(Public)"
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
                                                        onClick={()=> handleVendorStatusChange(item, 3, [])}
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
                    handleVendorStatusChange={() => handleVendorStatusChange}
                    data={selectedVendor}
                />
            }

        </>
    )
}

export default PrivateVendorManagement;
