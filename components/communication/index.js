import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { Button, Modal } from "react-bootstrap";
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
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleShowMessage = (item) => {
    setSelectedMessage(item);
    setShowModal(true);
  };

  const getContactUs = () => {
    setContactData([]);
    getContactUsPage(page, limit)
      .then((res) => {
        setTotalPages(res.count || 0);
        setContactData(res.data.map((item) => ({ ...item, isChecked: false })));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getContactUs();
  }, [page, limit]);

  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Message</h1>
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
              <table className="table table-hover mb-3">
                <thead>
                  <tr>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Message</th>
                    <th scope="col">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {contactData &&
                    contactData.map((item) => (
                      <tr key={item.customer_id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td>
                          <div>
                            {item.subject.length > 50
                              ? `${item.subject.substring(0, 50)}...`
                              : item.subject}
                          </div>
                          <Button
                            variant="link"
                            className="ms-2 p-0 d-block ml-0"
                            onClick={() => handleShowMessage(item)}
                          >
                            View Message
                          </Button>
                         </td>
                        <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
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

              {/* Modal for Full Message */}
              <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                  <Modal.Title>Full Message</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  {selectedMessage && (
                    <>
                      <p>
                        <strong>Subject:</strong> {selectedMessage.subject}
                      </p>
                      <p>
                        <strong>Comment:</strong> {selectedMessage.comment}
                      </p>
                    </>
                  )}
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowModal(false)}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>

            {Math.ceil(totalPages/10) > 1 && (
              <ReactPaginate
                breakLabel="..."
                nextLabel={<i className="fa fa-angle-right"></i>}
                onPageChange={handlePageClick}
                pageRangeDisplayed={2}
                pageCount={Math.ceil(totalPages / limit)}
                previousLabel={<i className="fa fa-angle-left"></i>}
                renderOnZeroPageCount={null}
                className="pagination"
              />
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Message;
