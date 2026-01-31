import { paymentHistoryAPI } from "@/utils/services/payment-history";
import moment from "moment";
import React, { useEffect, useState, ChangeEvent } from "react";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Select, { SingleValue, StylesConfig } from "react-select";

interface PaymentHistoryItem {
  id: number;
  name: string;
  email: string;
  mobile: string;
  amount: number;
  coupon_price: number;
  date: string;
  offer_price: number;
  status: number;
  subscription_charge: number;
}

interface PaymentStatusOption {
  label: string;
  value: number;
}

interface PaginateEvent {
  selected: number;
}

interface SelectControlBase {
  height: number;
  minHeight: number;
}

const PaymentHistory: React.FC = () => {
  const [paymentHistoryList, setPaymentHistoryList] = useState<PaymentHistoryItem[]>([]);
  const [limit, setlimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, settotalPages] = useState<number | null>(null);
  const [isExport, setIsExport] = useState<boolean>(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [searchString, setSearchString] = useState<string>("");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatusOption | null>(null);

  const customSelectStyles: StylesConfig<PaymentStatusOption, false> = {
    control: (base) => ({
      ...base,
      height: 27,
      minHeight: 40,
    }),
  };

  const formatDate = (dateVal: Date | null): string | undefined => {
    if (dateVal) {
      const dateString = dateVal;
      const date = new Date(dateString);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      return `${year}-${month}-${day}`;
    }
    return undefined;
  };

  const paymentStatusArr: PaymentStatusOption[] = [
    { label: "Pending", value: 0 },
    { label: "Paid", value: 1 },
  ];

  const handlePaymentStatus = (option: SingleValue<PaymentStatusOption>): void => {
    setPaymentStatus(option);
  };

  const handlePageClick = (e: PaginateEvent): void => {
    setPage(e.selected + 1);
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchString(e.target.value);
  };

  const handlePaymentHistory = (): void => {
    paymentHistoryAPI(
      page,
      limit,
      formatDate(startDate),
      formatDate(endDate),
      paymentStatus?.value,
      searchString,
      ""
    )
      .then((res: { total_count: number; data: PaymentHistoryItem[] }) => {
        settotalPages(res.total_count);
        setPaymentHistoryList(res.data);
      })
      .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast.error(txt);
      });
  };

  const downloadFile = (): void => {
    paymentHistoryAPI(
      page,
      limit,
      formatDate(startDate),
      formatDate(endDate),
      paymentStatus?.value,
      searchString,
      true
    )
      .then((res: Blob) => {
        const downloadLink = document.createElement("a");
        downloadLink.href = window.URL.createObjectURL(res);
        downloadLink.setAttribute("download", "export_payment_history.xlsx");
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      })
      .catch((error: { error?: { response?: { data?: { errors?: Record<string, string> } } } }) => {
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
                onChange={(date: Date | null) => setStartDate(date)}
                isClearable
                placeholderText="Start Date"
                className="form-control"
              />
              <DatePicker
                selected={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
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
              <div className="input-group mb-2 col-3" style={{ height: "25px" }}>
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
            <div className="col-2 d-flex flex-column">
              <button
                type="button"
                className="btn btn-primary mb-2"
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
          {totalPages && Math.ceil(totalPages / 10) > 1 && (
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
          <div className="d-flex align-items-center gap-2 mt-2">
            <input
              type="number"
              className="form-control"
              style={{ width: "125px" }}
              placeholder="Go to page"
              min="1"
              max={totalPages ? Math.ceil(totalPages / 10) : 1}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const maxPage = totalPages ? Math.ceil(totalPages / 10) : 1;
                const pageNum = Math.max(
                  1,
                  Math.min(maxPage, parseInt(e.target.value) || 1)
                );
                setPage(pageNum);
              }}
            />
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                const pageNum = parseInt(input.value);
                const maxPage = totalPages ? Math.ceil(totalPages / 10) : 1;
                if (pageNum && pageNum >= 1 && pageNum <= maxPage) {
                  setPage(pageNum);
                }
              }}
            >
              Go
            </button>
          </div>
        </div>
      </section>
    </>
  );
};

export default PaymentHistory;
