import React, { useEffect, useState, ChangeEvent } from "react";
import {
  handleGetVendorList,
  handleDeleteVendorProfile,
  handleApproveVendor,
  toggleVendorVerified,
  rejectList,
  getAdminsList,
  getSubscriptionList
} from "@/utils/services/vendor-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { Field, Form, Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import DisapproveModal from "../modal/disapprove-modal";
import { getAdminProfile } from "@/utils/services/login";

interface VendorCount {
  total: number;
  approved: number;
  disapproved: number;
  deleted: number;
}

interface Filter {
  verified: string;
  organization: string;
  name: string;
  email: string;
  dateFrom: string;
  dateTo: string;
  status: string;
  created_by: string;
  source: string;
  subscription_plan: string;
  is_private: string;
  mobile?: string;
}

interface VendorItem {
  id: number;
  name: string;
  email: string;
  mobile: string;
  organization_name: string;
  status: number;
  is_verified: number;
  is_deleted: number;
  created_by_name: string | null;
  created_at: string;
  updated_by_name: string | null;
  updated_at: string | null;
  source: string | null;
  subscription_plan_id: number | null;
  is_private: number;
  isChecked?: boolean;
}

interface RejectItem {
  id: number;
  reject_reason: string;
}

interface AdminUser {
  id: number;
  name: string;
}

interface SubscriptionItem {
  id: number;
  plan_name: string;
}

const intializeVendorCount: VendorCount = {
  total: 0,
  approved: 0,
  disapproved: 0,
  deleted: 0,
};

const VendorManagement: React.FC = () => {
  const router = useRouter();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false);
  const [id, setId] = useState<number | undefined>();
  const [limit] = useState<number>(10);
  const [page, setPage] = useState<number>(parseInt(router.query.page as string) || 1);
  const [totalPages, settotalPages] = useState<number | null>(null);
  const [vendorCount, setVendorCount] = useState<VendorCount>(intializeVendorCount);
  const [rejectListData, setRejectListData] = useState<RejectItem[]>([]);
  const [selectedVendorId, setSelectedVendorId] = useState<string>("");
  const [inputValue, setInputValue] = useState<string>("");
  const [selectVal, setSelectValue] = useState<string>("");
  const [userType, setUserType] = useState<number | null>(null);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [vendorData, setVendorData] = useState<VendorItem[]>([]);
  const [filter, setFilter] = useState<Filter>({
    verified: (router.query.verified as string) || "",
    organization: (router.query.organization as string) || "",
    name: (router.query.name as string) || "",
    email: (router.query.email as string) || "",
    dateFrom: (router.query.dateFrom as string) || "",
    dateTo: (router.query.dateTo as string) || "",
    status: (router.query.status as string) || "",
    created_by: (router.query.created_by as string) || "",
    source: (router.query.source as string) || "",
    subscription_plan: (router.query.subscription_plan as string) || "",
    is_private: (router.query.is_private as string) || ""
  });

  const getBuyerList = (): void => {
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
      filter.is_private,
      filter.mobile
    )
      .then((res: any) => {
        settotalPages(res.total_count);
        setVendorCount({
          total: res.total_count,
          approved: res.active_vendors,
          disapproved: res.deactivated_vendors,
          deleted: res.deleted_vendors,
        });
        res.data.map((item: VendorItem) => (item.isChecked = false));
        setVendorData(res.data);
      })
      .catch((err: any) => {
        console.error("Error fetching vendor list:", err);
        setVendorCount(intializeVendorCount);
      });
  };

  const submitDeleteBlog = (): void => {
    handleDeleteVendorProfile(id!)
      .then((res: any) => {
        toast(res.message);
        getBuyerList();
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
      });
    setTimeout(handleClose, 10000);
  };

  const getRejectList = (): void => {
    rejectList()
      .then((res: any) => {
        setRejectListData(res?.data);
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error.error.response?.data.errors) {
          txt = error.error.response?.data.errors[x];
        }
        toast(txt);
      });
  };

  const openRejectModal = (id: number): void => {
    setShowRejectModal(true);
    setSelectedVendorId(id.toString());
  };

  const submitApproveVendor = (id: number | string, statusOrPayload: number | { status: string; reject_reason_id?: number; reject_reason?: string }): void => {
    const status = typeof statusOrPayload === 'number' ? statusOrPayload : parseInt(statusOrPayload.status, 10);
    handleApproveVendor(id, status)
      .then((res: any) => {
        setShowRejectModal(false);
        setSelectedVendorId("");
        setInputValue("");
        setSelectValue("");
        toast(res.message);
        getBuyerList();
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
    setTimeout(handleClose, 10000);
  };

  const submitToggleVendorVerified = (vendorId: number, nextIsVerified: number): void => {
    toggleVendorVerified(vendorId, nextIsVerified)
      .then((res: any) => {
        toast(res.message);
        getBuyerList();
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt || "Something went wrong");
      });
  };

  const handleUpdateVendor = (item: VendorItem): void => {
    localStorage.setItem("vendorUpdates", JSON.stringify(item));
    router.push(`/vendor-management/update-vendor/${item.id}`);
  };

  const getUserProfile = async (): Promise<void> => {
    try {
      const res : any = await getAdminProfile();
      setUserType(res.data?.user_type || null);
    } catch (error) {
      console.log(error);
    }
  };

  const updateUrlParams = (newParams: Record<string, any>): void => {
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

  const handleSearch = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const newFilter = { ...filter, [e.target.name]: e.target.value };
    setFilter(newFilter);
    setPage(1);
    updateUrlParams({ ...newFilter, page: 1 });
  };

  const handlePageClick = (e: { selected: number }): void => {
    const newPage = e.selected + 1;
    setPage(newPage);
    updateUrlParams({ ...filter, page: newPage });
  };

  const handleDeleteBudget = (id: number): void => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = (values: Filter & { mobile?: string }): void => {
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
      values.is_private,
      values.mobile
    )
      .then((res: any) => {
        setVendorData(res.data);
        settotalPages(Math.ceil(res.total_count / limit));
        setVendorCount({
          total: res.total_count,
          approved: res.active_vendors,
          disapproved: res.deactivated_vendors,
          deleted: res.deleted_vendors,
        });
      })
      .catch((err: any) => {
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
   const newPage = urlPage ? parseInt(urlPage as string) : 1;
   const newFilter: Filter & { mobile?: string } = {
     verified: (verified as string) ?? "",
     organization: (organization as string) ?? "",
     name: (name as string) ?? "",
     email: (email as string) ?? "",
     dateFrom: (dateFrom as string) ?? "",
     dateTo: (dateTo as string) ?? "",
     status: (status as string) ?? "",
     created_by: (created_by as string) ?? "",
     source: (source as string) ?? "",
     subscription_plan: (subscription_plan as string) ?? "",
     is_private: (is_private as string) ?? "",
     mobile: "" // Initialize mobile filter to empty string
   };

    setPage(newPage);
    setFilter(newFilter);
    getBuyerList();
  }, [router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    getBuyerList();
  }, [page, filter, router.isReady]);

  const handleClose = (): void => setShowModal(false);

  const handleCloseRejectModal = (): void => {
    setShowRejectModal(false);
    setSelectedVendorId("");
    setInputValue("");
    setSelectValue("");
  };

  const handleInputDisapprove = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  };

  const handleSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectValue(e.target.value);
  };

  useEffect(() => {
    getUserProfile();
    getRejectList();
    getAdminsList()
      .then((res: any) => {
        setAdminUsers(res.data);
      })
      .catch((err: any) => {
        console.log("Error loading admin users:", err);
      });

      // Getting and setting the subscription list for filtering.
      getSubscriptionList(null)
      .then((res: any) => {
        setSubscriptionList(res.data);
      })
      .catch((err: any) => {
        console.log("Error loading subscription List:", err);
      });
  }, []);

  const resetFilters = (): void => {
    const emptyFilter: Filter = {
      verified: "",
      organization: "",
      name: "",
      email: "",
      dateFrom: "",
      dateTo: "",
      status: "",
      created_by: "",
      source: "",
      subscription_plan: "",
      is_private: ""
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
      "",  // created_by - empty to show vendors created by all admins
      "", // source - empty to show all sources
      "", // subscription_plan - empty to show all subscription plans
      "", // mobile - empty to show all mobile numbers
      ""  // is_private - empty to show both private and public vendors
    )
      .then((res: any) => {
        setVendorData(res.data);
        settotalPages(Math.ceil(res.total_count / limit));
        setVendorCount({
          total: res.total_count,
          approved: res.active_vendors,
          disapproved: res.deactivated_vendors,
          deleted: res.deleted_vendors,
        });
      })
      .catch((err: any) => {
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

          {(userType === 1 || userType === 5) && (
            <button
              type="button"
              className="btn btn-info"
              onClick={() => router.push(` /vendor-management/bulk-upload`)}
            >
              <i className="fa fa-upload"></i> Bulk vendor upload
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
                source: filter.source,
                subscription_plan: filter.subscription_plan,
                is_private: filter.is_private,
                name: filter.name,
                mobile: filter.mobile || ""
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
                is_private: yup.string(),
                mobile: yup.number()
              })}
              onSubmit={(values: Filter & { mobile?: string }, { resetForm }: FormikHelpers<Filter & { mobile?: string }>) => {
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
                        as="select"
                        name="verified"
                        className="form-control"
                        value={values.verified}
                      >
                        <option value="">Filter by Verified</option>
                        <option value="t">Verified</option>
                        <option value="f">Not Verified</option>
                      </Field>
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
                    <div className="col-md-3 mb-2">
                      <Field
                        type="number"
                        name="mobile"
                        className="form-control"
                        placeholder="Search by mobile"
                        value={values.mobile}
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
                          onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.type = 'date')}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
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
                          onFocus={(e: React.FocusEvent<HTMLInputElement>) => (e.target.type = 'date')}
                          onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
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
                  <th scope="col">Verified</th>
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
                      <td>
                        <div className="d-flex flex-column gap-2">
                          {item.is_verified === 1 ? (
                            <span
                              className="badge d-inline-flex align-items-center"
                              style={{
                                background:
                                  "linear-gradient(135deg, #0066CC 0%, #0080FF 50%, #0052A3 100%)",
                                color: "#FFFFFF",
                                padding: "6px 12px",
                                borderRadius: "10px",
                                fontWeight: 700,
                                fontSize: "0.8rem",
                                border: "1px solid #0052A3",
                                width: "fit-content",
                              }}
                            >
                              Verified
                            </span>
                          ) : (
                            <span className="badge bg-secondary">Not Verified</span>
                          )}
                          <button
                            type="button"
                            className={`btn btn-sm ${item.is_verified === 1 ? "btn-outline-secondary" : "btn-outline-success"}`}
                            onClick={() =>
                              submitToggleVendorVerified(
                                item.id,
                                item.is_verified === 1 ? 0 : 1
                              )
                            }
                          >
                            {item.is_verified === 1 ? "Unverify" : "Verify"}
                          </button>
                        </div>
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
                {totalPages !== null && Math.ceil(totalPages / limit) > 1 && (
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) => {
                          const pageNum = Math.max(1, Math.min(Math.ceil(totalPages! / limit), parseInt(e.target.value) || 1));
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
                          const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                          const pageNum = parseInt(input.value);
                          if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages! / limit)) {
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
