import React, { useEffect, useState } from "react";
import img1 from "../../public/assets/images/products.png";
import doc from "../../public/assets/images/doc.png";
import Image from "next/image";

import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../modal/delete-modal";
import DisableModal from "../modal/disable-modal";
import {
  handleDeleteVendorProfile,
  handleDisableVendorProfile,
} from "@/utils/services/vendor-management";
import { handleGetBuyerDetails, handleGetBuyerRfqList, handleGetSubscriptionDetails } from "../../utils/services/buyer-management";
import moment from "moment";
const BuyersDetails = () => {
  const router = useRouter();
  const id = router?.query?.id;
  const [vendorDeails, setVendorDeails] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [buyerRfqList, setBuyerRfqList] = useState([]);
  const [buyerSubscriptionList, setBuyerSubscriptionList] = useState([]);
  const [limit, setlimit] = useState(10);
  const [page, setpage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const handleClose = () => {
    setShowModal(false);
    setShowDisableModal(false);
  };
  useEffect(() => {
    getVendorDetails();
  }, [id]);
  const handleDeleteBudget = (id) => {
    setShowModal(true);
  };
  const getVendorDetails = () => {
    if (id != undefined) {
      handleGetBuyerDetails(id)
        .then((res) => setVendorDeails(res.data[0]))
        .catch((error) => {
          let txt = "";
          for (let x in error.error.response.data.errors) {
            txt = error.error.response.data.errors[x];
          }
          toast(txt);
        });
    }
  };

  const getBuyerRfqList = () => {
    handleGetBuyerRfqList(page, limit, id)
      .then((res) => {
        setBuyerRfqList(res.data);
        settotalPages(Math.ceil(res.total_items / limit));
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  }

  const getBuyerSubscriptionList = () => {
    handleGetSubscriptionDetails(id)
      .then((res) => setBuyerSubscriptionList(res.data[0]))
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  }

  const submitDisableModal = () => {
    handleDisableVendorProfile(id)
      .then((res) => {
        toast(res.message);
        handleClose();
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };
  const submitDeleteBlog = () => {
    handleDeleteVendorProfile(id)
      .then((res) => {
        handleClose();
        toast(res.message);
        router.push("/buyer-management");
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };

  useEffect(() => {
    if(id){
      getBuyerRfqList();
      getBuyerSubscriptionList();
    }
  },[id, page])
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            {/* <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Dashboard</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <NavLink to="#">Home</NavLink>
                                </li>
                                <li className="breadcrumb-item active">Dashboard</li>
                            </ol>
                        </div> */}
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Buyers </h5>
              <li className="breadcrumb-item active">
                {" "}
                / {vendorDeails?.name}
              </li>
            </ol>
            <ol className="breadcrumb float-sm-right">
              {/* <li className="mr-4 ">
                <button type="button" class="btn btn-info">
                  EDIT
                </button>
              </li> */}
              <li className="mr-4">
                <button type="button" class="btn btn-warning">
                  DISABLE PROFILE
                </button>
              </li>
              <li className="mr-4">
                <button type="button" class="btn btn-danger">
                  DELETE PROFILE
                </button>
              </li>
            </ol>
          </div>
          <div className="d-flex justify-content w-100">
            <div className="card col-6">
              <div className="card-header">Basic Information</div>
              <div className="card-body">
                <div className="d-flex">
                  <div className="text-center mr-5">
                    <Image
                      fill
                      src={
                        vendorDeails?.profile_image == null
                          ? img1
                          : vendorDeails?.profile_image
                      }
                      unoptimized
                      className="rounded prof-img"
                      alt="..."
                    />
                  </div>
                  <div>
                    <p>Buyer Name : {vendorDeails?.name},</p>
                    <p>Address : {vendorDeails?.address}</p>
                    <p>Phone: {vendorDeails?.mobile}</p>
                    <p>Email: {vendorDeails?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-6">
              <div className="card-header">SPOC Details</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">Cras justo odio</li>
                <li className="list-group-item">Dapibus ac facilisis in</li>
                <li className="list-group-item">Vestibulum at eros</li>
              </ul>
            </div>
          </div>
          {/* <div className="d-flex">
            <div className="card col-7 mr-5">
              <div className="card-header">Profile Information</div>
              {vendorDeails?.profile}
            </div>
            <div className="card col-4 ml-4">
              <div className="card-header">Notification</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Enabled
                  </button>
                </li>
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Disabled
                  </button>
                </li>
                <li className="list-group-item d-flex">
                  <p className="col-8">Cras justo odio</p>
                  <button type="button" class="btn btn-secondary col-4">
                    Enabled
                  </button>
                </li>
              </ul>
            </div>
          </div> */}
          <div>
            <h5 className="heading-p mt-4">Subscription Information</h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Customer Id</th>
                        <th scope="col">Subscription Info</th>
                        <th scope="col">status</th>
                        <th scope="col">Subscription on</th>
                        <th scope="col">Next renewal</th>
                        <th scope="col">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{buyerSubscriptionList?.user_id}</td>
                        <td>{buyerSubscriptionList?.plan_name}</td>
                        <td>{buyerSubscriptionList?.status === 1 ? 'Active' : 'In-Active'}</td>
                        <td>{moment(buyerSubscriptionList?.start_date)?.format("MM/DD/YYYY")}</td>
                        <td>{moment(buyerSubscriptionList?.renew_date)?.format("MM/DD/YYYY")}</td>
                        <td>invoice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h5 className="heading-p mt-4">RFQ List</h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">Company Name</th>
                        <th scope="col">Contact Number</th>
                        <th scope="col">Comment</th>
                        <th scope="col">email</th>
                        <th scope="col">Bid End Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {
                        buyerRfqList && buyerRfqList?.map((item) => {
                          return (
                            <tr key={item?.id}>
                              <td>{item?.contact_name}</td>
                              <td>{item?.company_name}</td>
                              <td>{item?.contact_number}</td>
                              <td>{item?.comment}</td>
                              <td>{item?.response_email}</td>
                              <td>{item?.bid_end_date}</td>
                            </tr>
                          )
                        })
                      }
                    </tbody>
                  </table>
                  <nav aria-label="Page navigation example">
                    <ul className="pagination">
                      {Array.from(Array(totalPages), (e, i) => {
                        if (i + 1 === page) {
                          return (
                            <li className="active page-item" key={i + 1}>
                              <a
                                className="page-link"
                                href=""
                                onClick={(e) => {
                                  e.preventDefault();
                                  setpage(i + 1);
                                }}
                              >
                                {i + 1}
                              </a>
                            </li>
                          );
                        } else {
                          return (
                            <li className="page-item" key={i + 1}>
                              <a
                                className="page-link"
                                href=""
                                onClick={(e) => {
                                  e.preventDefault();
                                  setpage(i + 1);
                                }}
                              >
                                {i + 1}
                              </a>
                            </li>
                          );
                        }
                      })}
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
          {/* <div>
            <h5 className="heading-p mt-4">
              Custom Premimum Services Subscribed
            </h5>
          </div>
          <div className="row">
            <div className="col-12">
              <div className="card product-table">
                <div className="card-body">
                  <table class="table table-striped table-hover">
                    <thead>
                      <tr>
                        <th scope="col">Customer Id</th>
                        <th scope="col">Subscription Service</th>
                        <th scope="col">Description</th>
                        <th scope="col">Invoice</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>xxx</td>
                        <td>Banner Ad-Homepage</td>
                        <td>display Banner ad(__px x_px) on Homepage</td>
                        <td>invoice</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default BuyersDetails;
