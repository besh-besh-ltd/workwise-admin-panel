import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { getContactUsPage } from "@/utils/services/contact-us";

const Message = () => {
  // let BuyerData = [
  //   {
  //     customer_id: "XX",
  //     customer_info: "Name&Email",
  //     customer_type: "Buyer",
  //     subscription_plan: "Gold",
  //     status: "0",
  //     subscribed_on: "24 Aug 2023",
  //     next_renewal: "02 Sep 2024"
  //   },
  //   {
  //     customer_id: "XX",
  //     customer_info: "Name&Email",
  //     customer_type: "Buyer",
  //     subscription_plan: "Gold",
  //     status: "1",
  //     subscribed_on: "24 Aug 2023",
  //     next_renewal: "02 Sep 2024"
  //   },
  //   {
  //     customer_id: "XX",
  //     customer_info: "Name&Email",
  //     customer_type: "Buyer",
  //     subscription_plan: "Gold",
  //     status: "0",
  //     subscribed_on: "24 Aug 2023",
  //     next_renewal: "02 Sep 2024"
  //   },
  //   {
  //     customer_id: "XX",
  //     customer_info: "Name&Email",
  //     customer_type: "Buyer",
  //     subscription_plan: "Gold",
  //     status: "1",
  //     subscribed_on: "24 Aug 2023",
  //     next_renewal: "02 Sep 2024"
  //   },
  //   {
  //     customer_id: "XX",
  //     customer_info: "Name&Email",
  //     customer_type: "Buyer",
  //     subscription_plan: "Gold",
  //     status: "0",
  //     subscribed_on: "24 Aug 2023",
  //     next_renewal: "02 Sep 2024"
  //   }
  // ];

  const [contactData, setContactData] = useState([]);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);

  const getContactUs = () => {
    setContactData([]);
    getContactUsPage(page, limit)
      .then((res) => {
        settotalPages(res.count);
        res.data.map((item) => (item.isChecked = false));
        setContactData(res.data);
      })
      .catch((err) => {
        console.log(err)
      });
  };

  useEffect(() => {
    getContactUs();
  }, [page, limit])

  const dateFormatHandler = (dt) => {
    const date = new Date(dt);
    let formattedDate;
    return formattedDate = date.toDateString();
  }
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">Message</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="card card-body mb-4">
          <div className="container-fluid">
            {/* <div className="card card-body product-table">
              <h6 className="mb-2">
                Check your message and moderate all message from site users
              </h6>
              <div className="row">
                <div className="col-md-4">
                  <div class="input-group">
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
                      aria-describedby="basic-addon1"
                    />
                  </div>
                </div>
                <div className="col-md-2">
                  <button type="button" class="btn btn-secondary col-12">
                    Inbox
                  </button>
                </div>
              </div>
            </div> */}

            <div className="card card-body product-table">
              <table class="table table-hover mb-3">
                <thead>
                  <tr>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contactData && contactData?.map((item) => {
                    return (
                      <tr key={item.customer_id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>{dateFormatHandler(item.createdAt)}</td>
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
          </div>
        </div>
      </section>
    </>
  );
};

export default Message;
