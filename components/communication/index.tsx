import React, { useState, useEffect, ChangeEvent } from "react";
import ReactPaginate from "react-paginate";
import { Button, Modal, Badge } from "react-bootstrap";
import { getContactUsPage, updateCommunicationRemark } from "@/utils/services/contact-us";
import { toast } from "react-toastify";

interface ContactItem {
  id: number;
  customer_id: number;
  name: string;
  email: string;
  phone: string;
  subject: string;
  comment: string;
  createdAt: string;
  remark: string | null;
  isChecked: boolean;
}

const Message: React.FC = () => {
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


  const [contactData, setContactData] = useState<ContactItem[]>([]);
  const [limit, setLimit] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);

  const [selectedMessage, setSelectedMessage] = useState<ContactItem | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editRow, setEditRow] = useState<number | null>(null);
  const [tempRemark, settempRemark] = useState<string>("");
  const [isRemoving, setIsRemoving] = useState<boolean>(false);

  const handleShowMessage = (item: ContactItem): void => {
    setSelectedMessage(item);
    setShowModal(true);
  };

  const startAddRemark = (item: ContactItem): void => {
    setEditRow(item.id);
    settempRemark(item.remark || "");
  };

  const cancelEdit = (): void => {
    setEditRow(null);
    settempRemark("");
  };

  const saveRemark = (item: ContactItem, remove: boolean = false): void => {
    const remarkToSave = remove ? null : tempRemark.trim();

    updateCommunicationRemark(item.id, remarkToSave)
      .then((res) => {
        toast.success("Comment updated successfully");
      })
      .catch((err) => {
        toast.error("Error updating comment");
      });
    item.remark = remarkToSave;
    setEditRow(null);
    settempRemark("");
    setIsRemoving(false);
  };

  const getContactUs = (): void => {
    setContactData([]);
    getContactUsPage(page, limit)
      .then((res : any) => {
        setTotalPages(res.count || 0);
        setContactData(res.data.map((item: Omit<ContactItem, 'isChecked'>) => ({ ...item, isChecked: false })));
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    getContactUs();
  }, [page, limit]);

  const handlePageClick = (e: { selected: number }): void => {
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
            <div className="card card-body product-table overflow overflow-x-auto">
              <table className="table table-hover mb-3 max-w-max">
                <thead>
                  <tr>
                    <th scope="col">Customer Name</th>
                    <th scope="col">Email</th>
                    <th scope="col">Phone</th>
                    <th scope="col">Message</th>
                    <th scope="col">Date</th>
                    <th scope="col">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {contactData &&
                    contactData.map((item) => (
                      <tr key={item.customer_id}>
                        <td>{item.name}</td>
                        <td>{item.email}</td>
                        <td>{item.phone}</td>
                        <td style={{width:'150px'}}>
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
                        <td className="d-flex justify-content-between align-items-center gap-2">
                          {editRow === item.id ? (
                            <>
                              <input
                                type="text"
                                className="form-control"
                                placeholder="Add remark here"
                                value={tempRemark}
                                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                  const value = e.target.value.trim();
                                  settempRemark(e.target.value);
                                  setIsRemoving(value === "--");
                                }}
                              />
                              {isRemoving ? (
                                <Badge bg="success" onClick={() => saveRemark(item, true)}>Save</Badge>
                              ) : tempRemark.trim() === "" ? (
                                <Badge bg="danger" onClick={cancelEdit}>Cancel</Badge>
                              ) : (
                                <Badge bg="success" onClick={() => saveRemark(item, false)}>Save</Badge>
                              )}
                            </>
                          ) : item.remark ? (
                            <>
                              <span>{item.remark}</span>
                              <Badge bg="secondary" onClick={() => startAddRemark(item)}>Edit</Badge>
                            </>
                          ) : (
                            <>
                              <span>--</span>
                              <Badge onClick={() => startAddRemark(item)}>Add Remark</Badge>
                            </>
                          )}
                        </td>
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
              <>
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
                <div className="d-flex align-items-center gap-2 mt-2">
                  <input
                    type="number"
                    className="form-control"
                    style={{ width: "125px" }}
                    placeholder="Go to page"
                    min="1"
                    max={Math.ceil(totalPages / limit)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / limit), parseInt(e.target.value) || 1));
                      setPage(pageNum);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      const pageNum = parseInt(input.value);
                      if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / limit)) {
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
      </section>
    </>
  );
};

export default Message;
