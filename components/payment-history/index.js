import { paymentHistoryAPI } from "@/utils/services/payment-history";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select from "react-select";

const PaymentHistory = () => {
  const [paymentHistoryList, setPaymentHistoryList] = useState([]);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [isExport, setIsExport] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [searchString, setSearchString] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: 27,
      minHeight: 40,
    }),
  };

  const formatDate = (dateVal) => {
    if (dateVal) {
      const dateString = dateVal;
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
  };

  const paymentStatusArr = [
    { label: "Pending", value: 0 },
    { label: "Paid", value: 1 },
  ];

  const handlePaymentStatus = (option) => {
    setPaymentStatus(option);
  };
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  const handleSearch = (e) => {
    setSearchString(e.target.value);
  };

  const handlePaymentHistory = () => {
    paymentHistoryAPI(
      page,
      limit,
      formatDate(startDate),
      formatDate(endDate),
      paymentStatus?.value,
      searchString,
      ""
    )
      .then((res) => {
        settotalPages(res.total_count);
        setPaymentHistoryList(res.data);
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
    paymentHistoryAPI(
      page,
      limit,
      formatDate(startDate),
      formatDate(endDate),
      paymentStatus?.value,
      searchString,
      true
    )
      .then((res) => {
        // const blob = new Blob([res]);
        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(res);
        downloadLink.setAttribute("download", "export_payment_history.xlsx");
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
    handlePaymentHistory();
  }, [page, startDate, endDate, searchString, paymentStatus]);

  return (
    <>
      <ToastContainer />

      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Payment History</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="card card-body product-table mt-3">
          <div className="w-100 d-flex justify-space-between align-items-center">
            <div className="w-100 d-flex flex-row align-items-center my-3 gap-3 flex-wrap">
              <DatePicker
                selected={startDate}
                onChange={(date) => setStartDate(date)}
                isClearable
                placeholderText="Start Date"
                className="form-control"
              />
              <DatePicker
                selected={endDate}
                onChange={(date) => setEndDate(date)}
                isClearable
                placeholderText="End Date"
                maxDate={new Date()}
                className="form-control"
              />
              <Select
                name="subscription_plan_id"
                options={paymentStatusArr}
                placeholder="Select Payment status"
                isClearable={true}
                styles={customSelectStyles}
                onChange={handlePaymentStatus}
                value={paymentStatus}
                className="mx-4"
              />
              <div class="input-group mb-2 col-3" style={{ height: "25px" }}>
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
            <div className="col-2 d-flex flex-column">
              <button
                type="button"
                class="btn btn-primary mb-2"
                onClick={downloadFile}
              >
                Export
              </button>
            </div>
          </div>
          <table className="table table-striped table-hover mb-3">
            <thead>
              <tr>
                <th scope="col">Customer info</th>
                <th scope="col">Mobile</th>
                <th scope="col">Amount</th>
                <th scope="col">Coupon Price</th>
                <th scope="col">Date</th>
                <th scope="col">Offer Price</th>
                <th scope="col">Payment Status</th>
                <th scope="col">Subscription Price</th>
              </tr>
            </thead>
            <tbody>
              {paymentHistoryList &&
                paymentHistoryList?.map((item) => {
                  return (
                    <tr key={item?.id}>
                      <td>
                        <h5>{item?.name}</h5>
                        <h6>{item?.email}</h6>
                      </td>
                      <td>{item?.mobile}</td>
                      <td>{`₹ ${item?.amount}`}</td>
                      <td>{`₹ ${item?.coupon_price}`}</td>
                      <td>{moment(item?.date).format("MM/DD/YYYY")}</td>
                      <td>{`₹ ${item?.offer_price}`}</td>
                      <td>{`${item?.status === 1 ? "Paid" : "Pending"}`}</td>
                      <td>{`₹ ${item?.subscription_charge}`}</td>
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
      </section>
    </>
  );
};

export default PaymentHistory;
