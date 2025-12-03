import React, { useEffect, useState } from "react";
import {
  handleGetVendorList,
  handleDeleteVendorProfile,
  handleApproveVendor,
  rejectList,
  getAdminsList,
  getSubscriptionList
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
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [id, setId] = useState();
  const [limit] = useState(10);
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [totalPages, settotalPages] = useState(null);
  const [vendorCount, setVendorCount] = useState(intializeVendorCount);
  const [rejectListData, setRejectListData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectVal, setSelectValue] = useState("");
  const [userType, setUserType] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [filter, setFilter] = useState({
    verified: router.query.verified || "",
    organization: router.query.organization || "",
    name: router.query.name || "",
    email: router.query.email || "",
    dateFrom: router.query.dateFrom || "",
    dateTo: router.query.dateTo || "",
    status: router.query.status || "",
    created_by: router.query.created_by || "",
    source : router.query.source || "",
    subscription_plan : router.query.subscription_plan || "",
    is_private : router.query.is_private || ""
  });

  const getBuyerList = () => {
    setVendorData([]);
    handleGetVendorList(
      limit,
      page,
      filter.verified,
      filter.organization,
      filter.name,
      filter.email,
      filter.dateFrom,
      filter.dateTo,
      filter.status,
      filter.created_by,
      filter.source,
      filter.subscription_plan,
      filter.is_private
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
        console.error("Error fetching vendor list:", err);
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

  const updateUrlParams = (newParams) => {
    const query = { ...router.query, ...newParams };
    // Remove empty params with proper check
    Object.keys(query).forEach(key => {
      if (query[key] === undefined || query[key] === null || query[key] === "") {
        delete query[key];
      }
    });
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const handleSearch = (e) => {
    const newFilter = { ...filter, [e.target.name]: e.target.value };
    setFilter(newFilter);
    setPage(1);
    updateUrlParams({ ...newFilter, page: 1 });
  };

  const handlePageClick = (e) => {
    const newPage = e.selected + 1;
    setPage(newPage);
    updateUrlParams({ ...filter, page: newPage });
  };

  const handleDeleteBudget = (id) => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = (values) => {
    setFilter(values);
    setPage(1);
    setVendorData([]);
    updateUrlParams({ ...values, page: 1 });
    
    handleGetVendorList(
      limit,
      1,
      values.verified,
      values.organization,
      values.name,
      values.email,
      values.dateFrom,
      values.dateTo,
      values.status,
      values.created_by,
      values.source,
      values.subscription_plan,
      values.is_private
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
      })
      .catch((err) => {
        console.error("Error fetching vendor list:", err);
        setVendorCount(intializeVendorCount);
      });
  };

  useEffect(() => {
    if (!router.isReady) return;

// Extract all possible filter query params and default to empty string
    const {
     page: urlPage,
     organization,
     name,
     verified,
     email,
     dateFrom,
     dateTo,
     status,
     created_by,
     source,
     subscription_plan,
     is_private
   } = router.query;
   const newPage = urlPage ? parseInt(urlPage) : 1;
   const newFilter = {
     verified: verified ?? "",
     organization: organization ?? "",
     name: name ?? "",
     email: email ?? "",
     dateFrom: dateFrom ?? "",
     dateTo: dateTo ?? "",
     status: status ?? "",
     created_by: created_by ?? "",
     source: source ?? "",
     subscription_plan: subscription_plan ?? "",
     is_private: is_private ?? ""
   };

    setPage(newPage);
    setFilter(newFilter);
    getBuyerList();
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    getBuyerList();
  }, [page, filter, router.isReady]);

  const handleClose = () => setShowModal(false);
  
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedVendorId("");
    setInputValue("");
    setSelectValue("");
  };

  const handleInputDisapprove = (e) => {
    setInputValue(e.target.value);
  };

  const handleSelect = (e) => {
    setSelectValue(e.target.value);
  };

  useEffect(() => {
    getUserProfile();
    getRejectList();
    getAdminsList()
      .then((res) => {
        setAdminUsers(res.data);
      })
      .catch((err) => {
        console.log("Error loading admin users:", err);
      });

      // Getting and setting the subscription list for filtering.
      getSubscriptionList()
      .then((res) => {
        setSubscriptionList(res.data);
      })
      .catch((err) => {
        console.log("Error loading subscription List:", err);
      });
  }, []);

  const resetFilters = () => {
    const emptyFilter = {
      verified: "",
      organization: "",
      name: "",
      email: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      created_by: "",
      source : "",
      subscription_plan : "",
      is_private : ""
    };
    setFilter(emptyFilter);
    setPage(1);
    // Clear URL parameters by pushing empty query
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
    
    // Reset the data with empty filters
    handleGetVendorList(
      limit,
      1,
      "", // verified - empty to show all verification statuses
      "", // organization - empty to show all organizations
      "", // name - empty to show all names
      "", // email - empty to show all emails
      "", // dateFrom - empty for no start date filter
      "", // dateTo - empty for no end date filter
      "", // status - empty to show all statuses
      ""  // created_by - empty to show vendors created by all admins
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
      })
      .catch((err) => {
        console.error("Error fetching vendor list:", err);
        setVendorCount(intializeVendorCount);
      });
  };

  return (
    <>
      <div className="content-header d-flex justify-content-between align-items-center">
        <h1 className="m-0 text-dark">Vendor</h1>
        <div className="d-flex gap-2">
          {(userType === 1 || userType === 5) && (
            <button
              type="button"
              className="btn btn-info"
              onClick={() => router.push(`/vendor-management/spoc-management`)}
            >
              <i className="fa fa-id-badge"></i> SPOC Management
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push(`/vendor-management/add-vendor`)}
          >
            <i className="fa fa-plus"></i> Add Vendor
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => router.push(`/vendor-management/vendor-profile-documents`)}
          >
            <i className="fa fa-plus"></i> Vendor Profile
          </button>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <Formik
              enableReinitialize={true}
              initialValues={{
                verified: filter.verified,
                organization: filter.organization,
                email: filter.email,
                dateFrom: filter.dateFrom,
                dateTo: filter.dateTo,
                status: filter.status,
                created_by: filter.created_by,
                source : filter.source,
                subscription_plan : filter.subscription_plan,
                is_private : filter.is_private
              }}
              validationSchema={yup.object().shape({
                verified: yup.string(),
                organization: yup.string(),
                email: yup.string(),
                dateFrom: yup.string(),
                dateTo: yup.string(),
                status: yup.string(),
                created_by: yup.string(),
                source: yup.string(),
                subscription_plan: yup.string(),
                is_private: yup.string()
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
                  <div className="row align-items-end g-3">
                    <div className="col-md-3 mb-2">
                      <Field
                        type="text"
                        name="organization"
                        className="form-control"
                        placeholder="Search organization"
                        value={values.organization}
                      />
                    </div>
                    <div className="col-md-3 mb-2">
                      <Field
                        type="text"
                        name="email"
                        className="form-control"
                        placeholder="Search by email"
                        value={values.email}
                      />
                    </div>
                    {/* Dropdown filter for Source */}
                    <div className="col-md-3 mb-2">
                      <Field
                        as="select"
                        name="source"
                        className="form-control"
                        value={values.source}
                      >
                        <option value="">Filter by Source</option>
                        <option value="self">Self</option>
                        <option value="admin">Admin</option>
                        <option value="whatsapp">Whatsapp</option>
                        <option value="facebook">Facebook</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="google">Google</option>
                        <option value="null">Unknown</option>
                      </Field>
                    </div>
                    {/* Dropdown filter for Subscription Plan */}
                    <div className="col-md-3 mb-2">
                      <Field
                        as="select"
                        name="subscription_plan"
                        className="form-control"
                        value={values.subscription_plan}
                      >
                        <option value="">Filter by Subscription</option>
                        <option value='0'>Free</option>
                        {subscriptionList.map(sub => (
                          <option key={sub.id} value={sub.id}>
                            {sub.plan_name}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Field
                        as="select"
                        name="is_private"
                        className="form-control"
                        value={values.is_private}
                      >
                        <option value="-1">Filter by Type</option>
                        <option value="1">Private</option>
                        <option value="0">Public</option>
                      </Field>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Field
                        as="select"
                        name="status"
                        className="form-control"
                        value={values.status}
                      >
                        <option value="">Filter by Status</option>
                        <option value="1">Approved</option>
                        <option value="0">Disapproved</option>
                      </Field>
                    </div>
                    <div className="col-md-3 mb-2">
                      <Field
                        as="select"
                        name="created_by"
                        className="form-control"
                        value={values.created_by}
                      >
                        <option value="">Filter by Created</option>
                        {adminUsers.map(user => (
                          <option key={user.id} value={user.id}>
                            {user.name}
                          </option>
                        ))}
                      </Field>
                    </div>
                    <div className="col-md-3 mb-2">
                      <div className="date-input-container">
                        <Field
                          type="text"
                          name="dateFrom"
                          className="form-control date-input"
                          placeholder="Start Date"
                          onFocus={(e) => (e.target.type = 'date')}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.type = 'text'
                            }
                          }}
                          value={values.dateFrom}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-2">
                      <div className="date-input-container">
                        <Field
                          type="text"
                          name="dateTo"
                          className="form-control date-input"
                          placeholder="End Date"
                          onFocus={(e) => (e.target.type = 'date')}
                          onBlur={(e) => {
                            if (!e.target.value) {
                              e.target.type = 'text'
                            }
                          }}
                          value={values.dateTo}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mb-2 d-flex gap-2">
                      <button type="submit" className="btn btn-info flex-grow-1">
                        Search
                      </button>
                      <button
                        type="button"
                        className="btn btn-secondary flex-grow-1"
                        onClick={() => {
                          resetForm();
                          resetFilters();
                        }}
                      >
                        Reset
                      </button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="card card-body product-table mt-3 table-responsive">
            <table className="table table-striped table-hover mb-3">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Mobile</th>
                  <th scope="col">Organization</th>
                  <th scope="col">Approval Status</th>
                  <th scope="col">Created</th>
                  <th scope="col">Updated</th>
                  <th scope="col">Source</th>
                  <th scope="col">Subscription</th>
                  <th scope="col">Private</th>
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
                      <td style={{textAlign:'center'}}>
                        {item.created_by_name || 'N/A'} 
                        <br />
                       {new Date(item.created_at).toLocaleDateString("en-GB", {
                         day: "numeric",
                         month: "short",
                         year: "numeric",
                       })}
                      </td>
                      <td style={{textAlign:'center'}}>
                        {item.updated_by_name || 'N/A'}
                        <br/>
                        {item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        }) : 'N/A'}
                        </td>
                      <td>{item.source || 'N/A'}</td>
                      {/* If subscription id is 20 then show premium, if 21 show Enterprise, else Free*/}
                      <td>{item.subscription_plan_id === 20 ? "Premium" : item.subscription_plan_id === 21 ? "Enterprise" : "Free"}</td>
                      <td>{item.is_private === 1 ? "Yes" : "No"}</td>
                      <td>
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
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="row d-flex justify-content-between align-items-center">
              <div className="col-md-5">
                <div className="row">
                  <p className="col-md-6 mb-1"> <b>Total Vendors: </b> {vendorCount.total} </p>
                  <p className="col-md-6 mb-1"><b>Total Deleted Vendors: </b> {vendorCount.deleted} </p>
                  <p className="col-md-6 mb-1"><b>Total Active Vendors: </b> {vendorCount.approved} </p>
                  <p className="col-md-6 mb-1"><b>Total Deactive Vendors: </b> {vendorCount.disapproved} </p>
                </div>
              </div>

              <div className="col-md-7">
                {Math.ceil(totalPages / limit) > 1 && (
                  <div className="d-flex flex-column align-items-center gap-2">
                    <ReactPaginate
                      previousLabel={<i className="fa fa-angle-left"></i>}
                      nextLabel={<i className="fa fa-angle-right"></i>}
                      breakLabel="..."
                      pageCount={Math.ceil(totalPages / limit)}
                      marginPagesDisplayed={2}
                      pageRangeDisplayed={5}
                      onPageChange={handlePageClick}
                      forcePage={page - 1}
                      containerClassName="pagination mb-0"
                      pageClassName="page-item"
                      pageLinkClassName="page-link"
                      previousClassName="page-item"
                      previousLinkClassName="page-link"
                      nextClassName="page-item"
                      nextLinkClassName="page-link"
                      activeClassName="active"
                    />
                    <div className="d-flex align-items-center gap-2 mt-2">
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "125px" }}
                        placeholder="Go to page"
                        min="1"
                        max={Math.ceil(totalPages / limit)}
                        onChange={(e) => {
                          const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / limit), parseInt(e.target.value) || 1));
                          setPage(pageNum);
                          updateUrlParams({ 
                            page: pageNum,
                            search: filter.name,
                            approvedBy: "",
                            status: filter.verified
                          });
                        }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const input = document.querySelector('input[type="number"]');
                          const pageNum = parseInt(input.value);
                          if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / limit)) {
                            setPage(pageNum);
                            updateUrlParams({ 
                              page: pageNum,
                              search: filter.name,
                              approvedBy: "",
                              status: filter.verified
                            });
                          }
                        }}
                      >
                        Go
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
