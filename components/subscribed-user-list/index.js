import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";
import { getSubscribedUserList } from "@/utils/services/subscribed-user-list";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";

const SubscribedUserList = () => {
  const [subscribedUserList, setSubscribeUserList] = useState([]);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [searchString, setSearchString] = useState("");
  const [isExport, setIsExport] = useState(false);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userStatus, setUserStatus] = useState(null);
  const [subscribersCount, setSubscribersCount] = useState("");
  const [subscriptionStatus, setSubscriptionStatus] = useState({
    label: "Active",
    value: false,
  });

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 40,
    }),
  };

  const handlePlanSelect = (option) => {
    setSelectedPlan(option);
  };
  const handleUserTypeSelect = (option) => {
    setUserType(option);
  };
  const handleUserStatusSelect = (option) => {
    setUserStatus(option);
  };
  const handleSubscriptionStatus = (option) => {
    setSubscriptionStatus(option);
  };
  let BuyerData = [
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "1",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "1",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscription_plan: "Gold",
      status: "0",
      subscribed_on: "24 Aug 2023",
      next_renewal: "02 Sep 2024",
    },
  ];
  let ServiceData = [
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)",
    },
    {
      customer_id: "XX",
      customer_info: "Name&Email",
      customer_type: "Buyer",
      subscribed_service: "Buy Extra TPI",
      description: "Buy 2 extra Third-Party Inspections(TPI)",
    },
  ];

  const userTypeArr = [
    { label: "Buyer", value: 2 },
    { label: "Other User", value: 4 },
  ];

  const statusArr = [
    { label: "Verified", value: 1 },
    { label: "Not Verified", value: 0 },
  ];

  const subscriptionStatusArr = [
    { label: "Active", value: false },
    { label: "Expired", value: true },
  ];

  const handleSearch = (e) => {
    setSearchString(e.target.value);
  };
  const handleExport = () => {
    setIsExport(true);
  };

  const getSubscribersCount = () => {
    getSubscribedUserList()
      .then((res) => {
        setSubscribersCount(res?.total_count);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  const getSubscriptionList = () => {
    handleGetSubscriptionList()
      .then((res) => {
        const formattedData = res.data.map((obj) => ({
          label: obj.plan_name,
          value: obj.id.toString(),
        }));
        setSubscriptionList(formattedData);
      })
      .catch((error) => {
        toast.error("Internal server error");
      });
  };
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  const handleSubscribedUsers = () => {
    getSubscribedUserList(
      page,
      limit,
      selectedPlan?.value,
      searchString,
      userType?.value,
      userStatus?.value,
      subscriptionStatus?.value,
      ""
    )
      .then((res) => {
        // settotalPages(Math.ceil(res.total_count / limit));
        settotalPages(res.total_count);
        setSubscribeUserList(res.data);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  const downloadFile = () => {
    getSubscribedUserList(
      page,
      limit,
      selectedPlan?.value,
      searchString,
      userType?.value,
      userStatus?.value,
      subscriptionStatus?.value,
      true
    )
      .then((res) => {
        // const blob = new Blob([res]);
        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(res);
        downloadLink.setAttribute("download", "export_subscribers.xlsx");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  useEffect(() => {
    handleSubscribedUsers();
  }, [
    page,
    searchString,
    selectedPlan,
    userType,
    userStatus,
    subscriptionStatus,
  ]);

  useEffect(() => {
    getSubscriptionList();
    getSubscribersCount();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid"></div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body mb-4">
            <h5 className="heading-container">Subscribed Users</h5>
            <div className="row">
              <div className="col-md-10">
                <div className="form-group d-flex">
                  <label for="staticEmail" class="col-sm-2 col-form-label">
                    {subscribersCount} Subscriptions
                  </label>
                  <div
                    class="input-group mb-4 col-4"
                    style={{ height: "25px" }}
                  >
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">
                        @
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search"
                      aria-label="Username"
                      value={searchString}
                      onChange={handleSearch}
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
                <div className="w-100 d-flex flex-row align-items-center g-4">
                  <Select
                    name="subscription_plan_id"
                    options={subscriptionList}
                    placeholder="Select Subscription Plan"
                    isClearable={true}
                    styles={customSelectStyles}
                    onChange={handlePlanSelect}
                    value={selectedPlan}
                    className="mx-2"
                  />
                  <Select
                    name="userType"
                    options={userTypeArr}
                    placeholder="Select user type"
                    isClearable={true}
                    styles={customSelectStyles}
                    onChange={handleUserTypeSelect}
                    value={userType}
                    className="mx-2"
                  />
                  <Select
                    name="userStatus"
                    options={statusArr}
                    placeholder="Select user status"
                    isClearable={true}
                    styles={customSelectStyles}
                    onChange={handleUserStatusSelect}
                    value={userStatus}
                    className="mx-2"
                  />
                  <Select
                    name="planStatus"
                    options={subscriptionStatusArr}
                    placeholder="Select subscription status"
                    isClearable={true}
                    styles={customSelectStyles}
                    onChange={handleSubscriptionStatus}
                    value={subscriptionStatus}
                    className="mx-2"
                  />
                </div>
              </div>
              <div className="col-2 d-flex flex-column">
                <button
                  type="button"
                  class="btn btn-primary mb-2"
                  onClick={downloadFile}
                >
                  Export
                </button>
                <button type="button" class="btn btn-secondary ">
                  Add Filter
                </button>
              </div>
            </div>
            <div className="row mt-3">
              <div className="product-table">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      {/* <th scope="col">Customer ID</th> */}
                      <th scope="col">Customer info</th>
                      <th scope="col">Customer Type</th>
                      <th scope="col">Subscription Plan</th>
                      <th scope="col">Status</th>
                      <th scope="col">Subscribed On</th>
                      <th scope="col">Next Renewal</th>
                      <th scope="col">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribedUserList &&
                      subscribedUserList?.map((item) => {
                        return (
                          <tr key={item.id}>
                            {/* <td>{item.customer_id}</td> */}
                            <td>
                              <h5>{item?.name}</h5>
                              <h6>{item?.email}</h6>
                            </td>
                            <td>
                              {item.user_type === 2
                                ? "Buyer"
                                : item.user_type === 4
                                  ? "Other user"
                                  : "Vendor"}
                            </td>
                            <td>
                              <span className="badge badge-primary">
                                {item.plan_name}
                              </span>
                            </td>
                            <td>
                              {item.user_status == 1
                                ? "Verified"
                                : "Not Verified"}
                            </td>
                            <td>
                              {moment(item.start_date).format("MM/DD/YYYY")}
                            </td>
                            <td>
                              {moment(item.renew_date).format("MM/DD/YYYY")}
                            </td>
                            <td>
                              {item?.invoice_file ? (
                                <a
                                  href={item?.invoice_file}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    window.open(item?.invoice_file, "_blank");
                                  }}
                                  style={{
                                    color: "inherit",
                                    textDecoration: "underline",
                                  }}
                                >
                                  Invoice
                                </a>
                              ) : (
                                "Invoice"
                              )}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {/* <nav aria-label="Page navigation example">
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
                </nav> */}
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
              {/* <div className="d-flex justify-content-end">
                <button class="btn btn-primary">View All</button>
              </div> */}
            </div>
          </div>
          {/* <div className="card card-body">
            <h5 className="heading-container">
              Users with Custom Add-On Services
            </h5>
            <div className="row">
              <div className="col-md-10">
                <div className="form-group d-flex">
                  <label for="staticEmail" class="col-sm-2 col-form-label">
                    273 Subscriptions
                  </label>
                  <div
                    class="input-group mb-4 col-4"
                    style={{ height: "25px" }}
                  >
                    <div class="input-group-prepend">
                      <span class="input-group-text" id="basic-addon1">
                        @
                      </span>
                    </div>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="Search for ID/Vendor/Buyer/Company"
                      aria-label="Username"
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
                <div className="d-flex">
                  <div className="nav-item dropdown">
                    <Link
                      href="#"
                      className="nav-link dropdown-header"
                      data-bs-toggle="dropdown"
                      aria-expanded="true"
                    >
                      Ch
                    </Link>
                    <div className={`dropdown-menu  "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">
                          System Notification
                        </h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <Link
                      href="#"
                      className="nav-link dropdown-header"
                      data-bs-toggle="dropdown"
                      aria-expanded="true"
                    >
                      Industry
                    </Link>
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logo</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Site Title</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">
                          SMTP Configuration
                        </h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Admin Email</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <Link
                      href="#"
                      className="nav-link dropdown-header"
                      data-bs-toggle="dropdown"
                      aria-expanded="true"
                    >
                      User Type
                    </Link>
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Edit Profile</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logout</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <Link
                      href="#"
                      className="nav-link dropdown-header"
                      data-bs-toggle="dropdown"
                      aria-expanded="true"
                    >
                      Verification Status
                    </Link>
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Edit Profile</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logout</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-2 d-flex flex-column">
                <button type="button" class="btn btn-primary mb-2">
                  Export
                </button>
                <button type="button" class="btn btn-secondary ">
                  Add Filter
                </button>
              </div>
            </div>
            <div className="row mt-3">
              <div className="product-table">
                <table class="table table-striped table-hover">
                  <thead>
                    <tr>
                      <th scope="col">Customer ID</th>
                      <th scope="col">Customer info</th>
                      <th scope="col">Customer Type</th>
                      <th scope="col">Subscribed Service</th>
                      <th scope="col">Description</th>
                      <th scope="col">Invoice</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ServiceData.map((item) => {
                      return (
                        <tr key={item.customer_id}>
                          <td>{item.customer_id}</td>
                          <td>{item.customer_info}</td>
                          <td>{item.customer_type}</td>
                          <td>{item.subscribed_service}</td>
                          <td>{item.description}</td>
                          <td>Invoice</td>
                          <td>View</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="d-flex justify-content-end">
                <button class="btn btn-primary">View All</button>
              </div>
            </div>
          </div> */}
        </div>
      </section>
    </>
  );
};

export default SubscribedUserList;
