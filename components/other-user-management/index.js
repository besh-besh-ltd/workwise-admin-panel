import React, { useEffect, useState } from "react";
import Link from "next/link";
// import { handleGetPageManagement } from "@/utils/services/page-management";
import {
  handleGetOtherUserList,
  handleApproveOtherUser,
  handleDeleteOtherUser,
} from "@/utils/services/other-user-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { Field, Form, Formik } from "formik";
import * as yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import DisapproveModal from "../modal/disapprove-modal";
import { rejectList } from "@/utils/services/vendor-management";

const OtherUserManagement = () => {
  const [pageData, setPageData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [id, setId] = useState();
  const [filter, setFilter] = useState({
    verified: "",
    organization: "",
    name: "",
  });
  const router = useRouter();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectListData, setRejectListData] = useState([]);
  const [selectedVendorId, setSelectedVendorId] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [selectVal, setSelectValue] = useState("");

  const handleInputDisapprove = (e) => {
    setInputValue(e.target.value);
  };
  const handleSelect = (e) => {
    setSelectValue(e.target.value);
  };
  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setSelectedVendorId("");
    setInputValue("");
    setSelectValue("");
  };
  const handleClose = () => setShowModal(false);
  const getPageLists = () => {
    setPageData([]);
    handleGetOtherUserList(
      limit,
      page,
      filter.verified,
      filter.organization,
      filter.name
    )
      .then((res) => {
        settotalPages(res.total_count);
        setPageData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  // const submitDeleteBlog = () => {
  // 	handleDeleteVendorProfile(id)
  // 		.then((res) => toast(res.message))
  // 		.catch((error) => {
  // 			let txt = "";
  // 			for (let x in error.error.response.data.errors) {
  // 				txt = error.error.response.data.errors[x];
  // 			}
  // 			toast(txt);
  // 		});
  // 	setTimeout(handleClose(), 10000);
  // };

  const getRejectList = () => {
    rejectList()
      .then((res) => {
        setRejectListData(res?.data);
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
      });
  };

  const openRejectModal = (id) => {
    setShowRejectModal(true);
    setSelectedVendorId(id);
  };
  const submitApproveOtherUser = (id, status) => {
    handleApproveOtherUser(id, status)
      .then((res) => {
        setShowRejectModal(false);
        setSelectedVendorId("");
        setInputValue("");
        setSelectValue("");
        toast(res.message);
        getPageLists();
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
  const handleUpdateOtherUser = (item) => {
    localStorage.setItem("otherUserUpdate", JSON.stringify(item));
    router.push(`/other-user-management/edit-user-management/${item.id}`);
  };
  useEffect(() => {
    getPageLists();
  }, [page]);
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };
  const handleDeleteBudget = (id) => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = (values) => {
    setFilter(values);
    setPage(1);
    handleGetOtherUserList(
      limit,
      1,
      values.verified,
      values.organization,
      values.name
    )
      .then((res) => {
        setPageData(res.data);
        settotalPages(Math.ceil(res.total_count / limit));
      })
      .catch((err) => console.log("err", err));
  };

  const submitDeleteBlog = () => {
    handleDeleteOtherUser(id)
      .then((res) => {
        toast(res.message);
        getPageLists();
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

  useEffect(() => {
    getRejectList();
  }, []);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">Other User</h1>
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
                    {/* <div class="col-2">
                      <Field
                        as="select"
                        name="verified"
                        class="form-control"
                        placeholder="Verified"
                      >
                        <option value="" disabled>
                          Select Verified
                        </option>
                        <option value="t">True</option>
                        <option value="f">False</option>
                      </Field>
                    </div> */}

                    <div class="col-3">
                      <Field
                        type="text"
                        name="organization"
                        class="form-control"
                        placeholder="Search organization"
                      />
                    </div>

                    <div class="col-3">
                      <Field
                        type="text"
                        name="name"
                        class="form-control"
                        placeholder="Search name"
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
                        class="btn btn-info "
                        onClick={() =>
                          router.push(`/other-user-management/add`)
                        }
                      >
                        <i className="fa fa-plus"></i> Add Other User
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
                  {/* <th scope="col">Address</th>

                  <th scope="col">Nationality</th> */}
                  <th scope="col">Organization</th>
                  <th scope="col">Approval Status</th>

                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.email}</td>
                      <td>{item.mobile}</td>
                      {/* <td>{item.address}</td>

                      <td>{item.nationality}</td> */}
                      <td>{item.organization_name}</td>
                      <td>
                        {item.status == 0 ? (
                          <div className="d-flex flex-row align-items-center">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tooltip1">
                                  Click to approve
                                </Tooltip>
                              }
                            >
                              <button
                                className="btn btn-secondary bg-success"
                                onClick={() =>
                                  submitApproveOtherUser(item.id, 1)
                                }
                              >
                                Approve
                              </button>
                            </OverlayTrigger>

                            {/* {item?.status === 0 && item?.reject_reason &&
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tooltip1">
                                    {item?.reject_reason}
                                  </Tooltip>
                                }
                              >
                                <span className="fa fa-info-circle ml-2"></span>
                              </OverlayTrigger>} */}
                          </div>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip1">
                                Click to Disapprove
                              </Tooltip>
                            }
                          >
                            <button
                              className="btn btn-secondary bg-danger"
                              // onClick={() => openRejectModal(item.id, 0)}
                              onClick={() => submitApproveOtherUser(item.id, 0)}
                            >
                              Disapprove
                            </button>
                          </OverlayTrigger>
                        )}
                      </td>

                      <td>
                        <div class="card-footer bg-transparent border-secondary">
                          <div className="actionStyle d-flex">
                            <span
                              className="fa fa-edit mr-3"
                              onClick={() =>
                                router.push(
                                  `/other-user-management/edit/${item.id}`
                                )
                              }
                            ></span>
                            <span
                              className="fa fa-trash"
                              onClick={() => handleDeleteBudget(item.id)}
                            ></span>
                          </div>
                        </div>
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
              submitApproveVendor={submitApproveOtherUser}
            />
            <ToastContainer />
          </div>
        </div>
      </section>
    </>
  );
};

export default OtherUserManagement;
