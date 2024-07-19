import { deleteOffer, getOfferList } from '@/utils/services/offer-management';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import moment from 'moment';
import DeleteModal from '../modal/delete-modal';
import { capitalize } from '../shared/TitleCase';

const OfferManagement = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [offerList, setOfferList] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [id, setId] = useState();

    const handleClose = () => setShowModal(false);
    const handleDeleteItem = (id) => {
        setShowModal(true);
        setId(id);
    };

    const submitDeleteSection = () => {
        deleteOffer(id)
            .then((res) => {
                handleClose();
                toast(res.message);
                getOffer();
            })
            .catch((error) => {
                toast("Internal server error");
                handleClose();
            });
    }


    const getOffer = () => {
        setLoading(true);
        getOfferList()
            .then((res) => {
                setLoading(false);
                setOfferList(res.data);
            })
            .catch((err) => {
                setloading(false);
            });
    }
    const handleOfferUpdate = (item) => {
        router.push(`/offer-management/edit-offer/${item.id}`);
    }
    useEffect(() => {
        getOffer();
    }, [])
    return (
        <>
            <ToastContainer />

            <div className="content-header">
                <div className="container-fluid">
                    <div className="row">
                        <h1 className="m-0 text-dark">Offer List</h1>
                    </div>
                </div>
            </div>

            <section className="content">
                <div className="container-fluid">
                    <div className="d-flex justify-content-end">
                        <button
                            type="button"
                            onClick={() =>
                                router.push("/offer-management/add-offer")
                            }
                            className="btn btn-primary mr-2"
                        >
                            <i className="fa fa-plus"></i> Add Offer
                        </button>
                    </div>
                </div>

                <div className="card card-body product-table mt-3">
                    <table className="table table-striped table-hover mb-3">
                        <thead>
                            <tr>
                                <th scope="col">Offer</th>
                                <th scope="col">Price</th>
                                <th scope="col">Percentage</th>
                                <th scope="col">Plan</th>
                                <th scope="col">Start Date</th>
                                <th scope="col">End Date</th>
                                <th scope="col">Status</th>
                                <th scope="col">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                offerList && offerList?.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{capitalize(item?.text)}</td>
                                            <td>{item?.price}</td>
                                            <td>{item?.is_percentage === true ? 'true' : 'false'}</td>
                                            <td>
                                                {item.subscription_plan.map((plan, planIndex) => (
                                                    <span key={planIndex} className="badge bg-primary me-2">{plan?.subscription_plan_name}</span>
                                                ))}
                                            </td>
                                            <td>{moment(item?.start_date).format("MM/DD/YYYY")}</td>
                                            <td>{moment(item?.end_date).format("MM/DD/YYYY")}</td>
                                            <td>{item?.status === 1 ? 'Active' : 'Inactive'}</td>
                                            <td>
                                                <span
                                                    className="fa fa-edit mr-3"
                                                    onClick={() => handleOfferUpdate(item)}
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

export default OfferManagement