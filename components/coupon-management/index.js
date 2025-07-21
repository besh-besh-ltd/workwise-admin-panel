import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import ReactPaginate from "react-paginate";
import { getCouponList, deleteCoupon } from "@/utils/services/coupon-management";
import moment from 'moment';
import DeleteModal from '../modal/delete-modal';
import { capitalize } from '../shared/TitleCase';

const CouponManagement = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [couponList, setCouponList] = useState([]);
    const [updateCoupon, setUpdateCoupon] = useState(null);
    const [limit, setlimit] = useState(10);
    const [page, setPage] = useState(1);
    const [totalPages, settotalPages] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState();
    const [searchString, setSearchString] = useState('');
    const [selectedUserType, setSelectedUserType] = useState('2');

    let subscriptionUserTypes = {
      2: 'Buyer',
      3: 'Vendor',
    }

    const handleUserTypeChange = (user_type) => setSelectedUserType(user_type);

    const handleClose = () => setShowModal(false);

    const handleDeleteItem = (id) => {
        setShowModal(true);
        setId(id);
    };

    const handleSearch = (e) => {
        setSearchString(e.target.value);
    }
    const handlePageClick = (e) => {
        setPage(e.selected + 1);
    };

    const submitDeleteSection = () => {
        deleteCoupon(id)
            .then((res) => {
                handleClose();
                toast(res.message);
                getCoupon();
            })
            .catch((error) => {
                toast("Internal server error");
                handleClose();
            });
    }

    const getCoupon = () => {
        setLoading(true);
        getCouponList(page, limit, searchString, selectedUserType)
            .then((res) => {
                setLoading(false);
                settotalPages(res.total_count);
                setCouponList(res.data);
            })
            .catch((err) => {
                setloading(false);
            });
    }

    const handleCouponUpdate = (item) => {
        router.push(`/coupon-management/edit-coupon/${item.coupon}`);
    }

    useEffect(() => {
        getCoupon()
    }, [page, searchString, selectedUserType]);


    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Coupon List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-between">
                        <div className="d-flex gap-2">
                            {Object.entries(subscriptionUserTypes).map(
                                ([user_type, label]) => (
                                <button
                                    onClick={() => handleUserTypeChange(user_type)}
                                    className={`btn btn-outline-secondary btn-sm px-4 ${
                                    selectedUserType == user_type ? "active" : null
                                    }`}
                                    style={{
                                    padding: 8,
                                    }}
                                >
                                    {label}
                                </button>
                                )
                            )}
                        </div>
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/coupon-management/add-coupon")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Coupon
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <div className="row justify-content-end">
                        <div className="col-sm-4 mb-4">
                            <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Search Coupon"
                                onChange={handleSearch}
                            />
                        </div>
                    </div>
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">Coupon</th>
                                <th scope="col">Percentage</th>
                                <th scope="col">Discount</th>
                                <th scope="col">Start Date</th>
                                <th scope="col">End Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                couponList && couponList?.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{(item?.coupon)}</td>
                                            <td>{item?.is_percentage === true ? 'true' : 'false'}</td>
                                            <td>{item?.discount_amount}</td>
                                            <td>{moment(item?.start_date).format("MM/DD/YYYY")}</td>
                                            <td>{moment(item?.end_date).format("MM/DD/YYYY")}</td>
                                            <td>{item?.status === 1 ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                <span
                                                    className="fa fa-edit mr-3"
                                                    onClick={() => handleCouponUpdate(item)}
                                                ></span>
                                                <span
                                                    className="fa fa-trash ml-3"
                                                    onClick={() => handleDeleteItem(item?.id)}
                                                ></span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                    {Math.ceil(totalPages / 10) > 1 && (
                        <div className="d-flex flex-column align-items-center gap-2">
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
                            <div className="d-flex align-items-center gap-2 mt-2">
                                <input
                                    type="number"
                                    className="form-control"
                                    style={{ width: "125px" }}
                                    placeholder="Go to page"
                                    min="1"
                                    max={Math.ceil(totalPages / 10)}
                                    onChange={(e) => {
                                        const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1));
                                        setPage(pageNum);
                                    }}
                                />
                                <button
                                    className="btn btn-primary btn-sm"
                                    onClick={() => {
                                        const input = document.querySelector('input[type="number"]');
                                        const pageNum = parseInt(input.value);
                                        if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
                                            setPage(pageNum);
                                        }
                                    }}
                                >
                                    Go
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </section>
            <DeleteModal
                show={showModal}
                onHide={handleClose}
                data={submitDeleteSection}
            />
        </>
    )
}

export default CouponManagement