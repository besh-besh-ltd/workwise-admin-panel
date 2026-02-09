import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";
import { getSubscribedUserList } from "@/utils/services/subscribed-user-list";
import moment from "moment";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";
import ReactPaginate from "react-paginate";
import { toast } from "react-toastify";

interface SubscribedUser {
  id: number;
  name: string;
  email: string;
  user_type: number;
  plan_name: string;
  user_status: number;
  start_date: string;
  renew_date: string;
  invoice_file?: string;
}

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  user_type: string;
  duration: string;
}

interface SelectOption {
  label: string;
  value: string | number | boolean;
}

interface PageClickEvent {
  selected: number;
}

interface ApiError {
  error?: {
    response?: {
      data?: {
        errors?: Record<string, string>;
      };
    };
  };
}

interface SubscriptionDurationMap {
  [key: string]: string;
}

const SubscribedUserList: React.FC = () => {
  const [subscribedUserList, setSubscribeUserList] = useState<SubscribedUser[]>([]);
  const [subscriptionList, setSubscriptionList] = useState<SelectOption[]>([]);
  const [searchString, setSearchString] = useState<string>("");
  const [isExport, setIsExport] = useState<boolean>(false);
  const [limit, setlimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, settotalPages] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<SelectOption | null>(null);
  const [userType, setUserType] = useState<SelectOption | null>(null);
  const [userStatus, setUserStatus] = useState<SelectOption | null>(null);
  const [subscribersCount, setSubscribersCount] = useState<string | number>("");
  const [subscriptionStatus, setSubscriptionStatus] = useState<SelectOption>({
    label: "Active",
    value: false,
  });

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      height: 50,
      minHeight: 40,
    }),
  };

  const handlePlanSelect = (option: SingleValue<SelectOption>): void => {
    setSelectedPlan(option);
  };
  const handleUserTypeSelect = (option: SingleValue<SelectOption>): void => {
    setUserType(option);
  };
  const handleUserStatusSelect = (option: SingleValue<SelectOption>): void => {
    setUserStatus(option);
  };
  const handleSubscriptionStatus = (option: SingleValue<SelectOption>): void => {
    if (option) {
      setSubscriptionStatus(option);
    }
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

  const userTypeArr: SelectOption[] = [
    { label: "Buyer", value: 2 },
    { label: "Vendor", value: 3 },
  ];

  const statusArr: SelectOption[] = [
    { label: "Verified", value: 1 },
    { label: "Not Verified", value: 0 },
  ];

  const subscriptionStatusArr: SelectOption[] = [
    { label: "Active", value: false },
    { label: "Expired", value: true },
  ];

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchString(e.target.value);
  };
  const handleExport = (): void => {
    setIsExport(true);
  };

  const getSubscribersCount = (): void => {
    getSubscribedUserList(1, 10, '', '', '', '', '', '')
      .then((res: { total_count?: string | number }) => {
        setSubscribersCount(res?.total_count || "");
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  let getSubscriptionDuration: SubscriptionDurationMap = {
    '-1': "Lifetime",
		'1': "Monthly",
		'3': "Quarterly",
		'12': "Yearly",
	};

  const getSubscriptionList = (): void => {
    handleGetSubscriptionList('-1')
      .then((res: { data: SubscriptionPlan[] }) => {
        const formattedData: SelectOption[] = res.data.map((obj) => ({
          label: `(${obj.user_type == '2' ? 'Buyer' : 'Vendor'}) ${obj.plan_name} (${getSubscriptionDuration[parseInt(obj.duration).toString()] || obj.duration + ' Months'})`,
          value: obj.id.toString(),
        }));
        setSubscriptionList(formattedData);
      })
      .catch((error: Error) => {
        toast.error("Internal server error");
      });
  };
  const handlePageClick = (e: PageClickEvent): void => {
    setPage(e.selected + 1);
  };

  const handleSubscribedUsers = (): void => {
    getSubscribedUserList(
      page,
      limit,
      selectedPlan?.value as string | undefined,
      searchString,
      userType?.value as number | undefined,
      userStatus?.value as number | undefined,
      subscriptionStatus?.value as boolean,
      ""
    )
      .then((res: { total_count: number; data: SubscribedUser[] }) => {
        // settotalPages(Math.ceil(res.total_count / limit));
        settotalPages(res.total_count);
        setSubscribeUserList(res.data);
      })
      .catch((error: ApiError) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  const downloadFile = (): void => {
    getSubscribedUserList(
      page,
      limit,
      selectedPlan?.value as string | undefined,
      searchString,
      userType?.value as number | undefined,
      userStatus?.value as number | undefined,
      subscriptionStatus?.value as boolean,
      true
    )
      .then((res: Blob) => {
        // const blob = new Blob([res]);
        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(res);
        downloadLink.setAttribute("download", "export_subscribers.xlsx");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((error: ApiError) => {
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
                  <label htmlFor="staticEmail" className="col-sm-2 col-form-label">
                    {subscribersCount} Subscriptions
                  </label>
                  <div
                    className="input-group mb-4 col-4"
                    style={{ height: "25px" }}
                  >
                    <div className="input-group-prepend">
                      <span className="input-group-text" id="basic-addon1">
                        @
                      </span>
                    </div>
                    <input
                      type="text"
                      className="form-control"
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
                  className="btn btn-primary mb-2"
                  onClick={downloadFile}
                >
                  Export
                </button>
                <button type="button" className="btn btn-secondary ">
                  Add Filter
                </button>
              </div>
            </div>
            <div className="row mt-3">
              <div className="product-table">
                <table className="table table-striped table-hover">
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
                                  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
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
                {Math.ceil((totalPages || 0) / 10) > 1 && (
                  <>
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={<i className="fa fa-angle-right"></i>}
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={2}
                      pageCount={Math.ceil((totalPages || 0) / 10)}
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
                        max={Math.ceil((totalPages || 0) / 10)}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const pageNum = Math.max(
                            1,
                            Math.min(
                              Math.ceil((totalPages || 0) / 10),
                              parseInt(e.target.value) || 1
                            )
                          );
                          setPage(pageNum);
                        }}
                      />
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          const input = document.querySelector(
                            'input[type="number"]'
                          ) as HTMLInputElement;
                          const pageNum = parseInt(input.value);
                          if (
                            pageNum &&
                            pageNum >= 1 &&
                            pageNum <= Math.ceil((totalPages || 0) / 10)
                          ) {
                            setPage(pageNum);
                          }
                        }}
                      >
                        Go
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SubscribedUserList;
