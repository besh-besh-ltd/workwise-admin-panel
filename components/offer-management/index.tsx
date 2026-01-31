import { deleteOffer, getOfferList } from '@/utils/services/offer-management';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify'
import moment from 'moment';
import DeleteModal from '../modal/delete-modal';
import { capitalize } from '../shared/TitleCase';

interface SubscriptionPlan {
    subscription_plan_id: number;
    subscription_plan_name: string;
}

interface OfferItem {
    id: number;
    text: string;
    price: string | number;
    is_percentage: boolean;
    subscription_plan: SubscriptionPlan[];
    start_date: string;
    end_date: string;
    status: number;
    user_type: string;
}

interface SubscriptionUserTypes {
    [key: string]: string;
}

const OfferManagement: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState<boolean>(false);
    const [offerList, setOfferList] = useState<OfferItem[]>([]);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [selectedUserType, setSelectedUserType] = useState<string>('2');
    const [id, setId] = useState<number | undefined>();

    const handleClose = (): void => setShowModal(false);
    const handleDeleteItem = (itemId: number): void => {
        setShowModal(true);
        setId(itemId);
    };

    const submitDeleteSection = (): void => {
        deleteOffer(id)
            .then((res: { message: string }) => {
                handleClose();
                toast(res.message);
                getOffer();
            })
            .catch((error: unknown) => {
                toast("Internal server error");
                handleClose();
            });
    }

    let subscriptionUserTypes: SubscriptionUserTypes = {
      2: 'Buyer',
      3: 'Vendor',
    }

    const getOffer = (): void => {
        setLoading(true);
        getOfferList(selectedUserType)
            .then((res: { data: OfferItem[] }) => {
                setLoading(false);
                setOfferList(res.data);
            })
            .catch((err: unknown) => {
                setLoading(false);
            });
    }

    const handleOfferUpdate = (item: OfferItem): void => {
        router.push(`/offer-management/edit-offer/${item.id}`);
    }

    const handleUserTypeChange = (user_type: string): void => setSelectedUserType(user_type);

    useEffect(() => {
      getOffer();
    }, [selectedUserType]);

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
            <div className="d-flex justify-content-between gap-2">
            <div className="d-flex gap-2">
              {Object.entries(subscriptionUserTypes).map(
                ([user_type, label]) => (
                  <button
                    key={user_type}
                    onClick={() => handleUserTypeChange(user_type)}
                    className={`btn btn-outline-secondary btn-sm px-4 ${
                      selectedUserType == user_type ? "active" : ""
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
                onClick={() => router.push("/offer-management/add-offer")}
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
                  <th scope="col">User Type</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {offerList &&
                  offerList?.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td>{capitalize(item?.text)}</td>
                        <td>{item?.price}</td>
                        <td>
                          {item?.is_percentage === true ? "true" : "false"}
                        </td>
                        <td>
                          {item.subscription_plan.map((plan, planIndex) => (
                            <span
                              key={planIndex}
                              className="badge bg-primary me-2"
                            >
                              {plan?.subscription_plan_name}
                            </span>
                          ))}
                        </td>
                        <td>{moment(item?.start_date).format("MM/DD/YYYY")}</td>
                        <td>{moment(item?.end_date).format("MM/DD/YYYY")}</td>
                        <td>{item?.status === 1 ? "Active" : "Inactive"}</td>
                        <td>{item?.user_type == "3" ? "Vendor" : "Buyer"}</td>
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
                    );
                  })}
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
    );
}

export default OfferManagement
