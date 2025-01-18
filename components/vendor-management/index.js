import React, { useEffect, useState } from "react";
import {
  handleDeleteVendorProfile,
  handleGetVendorList,
  handleApproveVendor,
  rejectList,
} from "@/utils/services/vendor-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { Field, Form, Formik } from "formik";
import * as yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import DisapproveModal from "../modal/disapprove-modal";
import { getAdminProfile } from "@/utils/services/login";

const intializeVendorCount = {
  total: 0,
  approved: 0,
  disapproved: 0,
  deleted: 0,
};

const VendorManagement = () => {
  const [vendorData, setVendorData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [filter, setFilter] = useState({
    verified: "",
    organization: "",
    name: "",
  });
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [vendorCount, setVendorCount] = useState(intializeVendorCount);
  const [rejectListData, setRejectListData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [id, setId] = useState();
  const router = useRouter();
  const [userType, setUserType] = useState(null);

  const [inputValue, setInputValue] = useState("");
  const [selectVal, setSelectValue] = useState("");

  const handleInputDisapprove = (e) => {
    setInputValue(e.target.value);
  };
  const handleSelect = (e) => {
    setSelectValue(e.target.value);
  };
  const handleClose = () => setShowModal(false);
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedVendorId("");
    setInputValue("");
    setSelectValue("");
  };
  const getBuyerList = () => {
    setVendorData([]);
    handleGetVendorList(
      limit,
      page,
      filter.verified,
      filter.organization,
      filter.name
    )
      .then((res) => {
        settotalPages(res.total_count);
        setVendorCount({
          total: res.total_count,
          approved: res.active_vendors,
          disapproved: res.deactivated_vendors,
          deleted: res.deleted_vendors,
        });
        res.data.map((item) => (item.isChecked = false));
        setVendorData(res.data);
      })
      .catch((err) => {
        console.log("err", err);
        setVendorCount(intializeVendorCount);
      });
  };

  const submitDeleteBlog = () => {
    handleDeleteVendorProfile(id)
      .then((res) => {
        toast(res.message);
        getBuyerList();
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
      });
    setTimeout(handleClose(), 10000);
  };

  const getRejectList = () => {
    rejectList()
      .then((res) => {
        setRejectListData(res?.data);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response?.data.errors) {
          txt = error.error.response?.data.errors[x];
        }
        toast(txt);
      });
  };

  const openRejectModal = (id) => {
    setShowRejectModal(true);
    setSelectedVendorId(id);
  };

  const submitApproveVendor = (id, status) => {
    handleApproveVendor(id, status)
      .then((res) => {
        setShowRejectModal(false);
        setSelectedVendorId("");
        setInputValue("");
        setSelectValue("");
        toast(res.message);
        getBuyerList();
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
    setTimeout(handleClose(), 10000);
  };

  const handleUpdateVendor = (item) => {
    localStorage.setItem("vendorUpdates", JSON.stringify(item));
    router.push(`/vendor-management/update-vendor/${item.id}`);
  };

  const getUserProfile = async () => {
    try {
      const res = await getAdminProfile();
      setUserType(res.data?.user_type || null);
    } catch (error) {
      console.log(error);
    }
  }

  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };
  const handleDeleteBudget = (id) => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = (values) => {
    setVendorData([]);
    setFilter(values);
    setPage(1);
    handleGetVendorList(
      limit,
      1,
      values.verified,
      values.organization,
      values.name
    )
      .then((res) => {
        setVendorData(res.data);
        settotalPages(Math.ceil(res.total_count / limit));
        setVendorCount({
          total: res.total_count,
          approved: res.active_vendors,
          disapproved: res.deactivated_vendors,
          deleted: res.deleted_vendors,
        });
        console.log("res", res);
      })
      .catch((err) => {
        console.log("err", err);
        setVendorCount(intializeVendorCount);
      });
  };

  useEffect(() => {
    getBuyerList();
  }, [page]);

  useEffect(() => {
    getUserProfile();
    getRejectList();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">Vendor</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <Formik
              enableReinitialize={true}
              initialValues={{
                verified: "",
                organization: "",
                name: "",
              }}
              validationSchema={yup.object().shape({
                verified: yup.string(),
                organization: yup.string(),
                name: yup.string(),
              })}
              onSubmit={(values, { resetForm }) => {
                submitHandler(values);
              }}
            >
              {({
                errors,
                touched,
                values,
                handleChange,
                setFieldValue,
                resetForm,
              }) => (
                <Form>
                  <div className="row">
                    <div class="col-3">
                      <Field
                        type="text"
                        name="organization"
                        class="form-control"
                        placeholder="Search organization"
                      />
                    </div>

                    <div className="col-1 d-flex flex-column">
                      <button type="submit" class="btn btn-info ">
                        Search
                      </button>
                    </div>
                    <div className="col-1 d-flex flex-column">
                      <button
                        type="button"
                        class="btn btn-secondary"
                        onClick={() => {
                          resetForm(),
                            submitHandler({
                              verified: "",
                              organization: "",
                              name: "",
                            });
                        }}
                      >
                        Reset
                      </button>
                    </div>
                    <div className="col-2 d-flex flex-column">
                      <button
                        type="button"
                        class="btn btn-info"
                        onClick={() =>
                          router.push(`/vendor-management/add-vendor`)
                        }
                      >
                        <i className="fa fa-plus"></i> Add Vendor
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="card card-body product-table mt-3">
            <table class="table table-striped table-hover mb-3">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Mobile</th>
                  <th scope="col">Organization</th>
                  <th scope="col">Approval Status</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {vendorData.map((item) => {
                  return (
                    <tr key={item.name} className={item.is_deleted == 1 ? 'deleted-row' : ''} >
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.mobile}</td>
                      <td>{item.organization_name}</td>
                      <td>
                        {userType && userType == 6 ? (
                          <p>{item.status === 0 ? 'Disapproved' : 'Approved'}</p>
                        ) : (
                          <div className="d-flex flex-row align-items-center">
                            {item.status === 0 ? (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`approve-tooltip-${item.id}`}>Click to approve</Tooltip>}
                              >
                                <button
                                  className="btn btn-secondary bg-success"
                                  onClick={() => submitApproveVendor(item.id, 1)}
                                >
                                  Approve
                                </button>
                              </OverlayTrigger>
                            ) : (
                              <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`disapprove-tooltip-${item.id}`}>Click to disapprove</Tooltip>}
                              >
                                <button
                                  className="btn btn-secondary bg-danger"
                                  onClick={() => submitApproveVendor(item.id, 0)}
                                >
                                  Disapprove
                                </button>
                              </OverlayTrigger>
                            )}
                          </div>
                        )}
                      </td>

                      <td>
                        {/* <div className="card-footer bg-transparent border-secondary"> */}
                        <div className="d-flex">
                          <span
                            className="fa fa-eye mr-3"
                            onClick={() =>
                              router.push(
                                `/vendor-management/vendor-details/${item.id}`
                              )
                            }
                          ></span>
                          {userType != 6 &&
                            <span
                              className="fa fa-edit mr-3"
                              onClick={() => handleUpdateVendor(item)}
                            ></span>}
                          {/* <span
                            className="fa fa-trash"
                            onClick={() => handleDeleteBudget(item.id)}
                          ></span> */}
                        </div>
                        {/* </div> */}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p> <b>Total Vendors: </b> {vendorCount.total} </p>
                <p><b>Total delete Vendors: </b> {vendorCount.deleted} </p>
                <p><b>Total active Vendors: </b> {vendorCount.approved} </p>
                <p><b>Total deactive Vendors: </b> {vendorCount.disapproved} </p>
              </div>

              {Math.ceil(totalPages / 10) > 1 && (
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
              )}
            </div>

            <DeleteModal
              show={showModal}
              onHide={handleClose}
              data={submitDeleteBlog}
            />
            <DisapproveModal
              show={showRejectModal}
              onHide={handleCloseRejectModal}
              selectedVendorId={selectedVendorId}
              rejectListData={rejectListData}
              inputValue={inputValue}
              selectVal={selectVal}
              handleInputDisapprove={handleInputDisapprove}
              handleSelect={handleSelect}
              submitApproveVendor={submitApproveVendor}
            />
            <ToastContainer />
          </div>
        </div>
      </section>
    </>
  );
};

export default VendorManagement;
