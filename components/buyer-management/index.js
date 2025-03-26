import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  handleGetBuyerList,
  handleApproveBuyer,
  handleDeleteBuyerProfile,
} from "@/utils/services/buyer-management";
import DeleteModal from "../modal/delete-modal";
import { useRouter } from "next/router";
import { Field, Form, Formik } from "formik";
import ReactPaginate from "react-paginate";
import * as yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";

const BuyerManagement = () => {
  const router = useRouter();
  const [BuyerData, setBuyerData] = useState([]);
  const [id, setId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [totalPages, settotalPages] = useState(null);
  const [filter, setFilter] = useState({
    verified: router.query.verified || "",
    organization: router.query.organization || "",
    name: router.query.name || "",
  });

  const handleClose = () => setShowModal(false);

  const updateUrlParams = (newParams) => {
    const query = { ...router.query, ...newParams };
    // Remove empty params
    Object.keys(query).forEach(key => !query[key] && delete query[key]);
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const getBuyerList = () => {
    setBuyerData([]);
    handleGetBuyerList(
      limit,
      page,
      filter.verified,
      filter.organization,
      filter.name
    )
      .then((res) => {
        settotalPages(res.total_count);
        setBuyerData(res.data);
      })
      .catch((err) => console.log("err", err));
  };

  const submitDeleteBlog = () => {
    handleDeleteBuyerProfile(id)
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

  const handleUpdateVendor = (item) => {
    localStorage.setItem("buyerUpdate", JSON.stringify(item));
    router.push(`/buyer-management/update-buyer/${item.id}`);
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
    setBuyerData([]);
    updateUrlParams({ ...values, page: 1 });

    handleGetBuyerList(
      limit,
      1,
      values.verified,
      values.organization,
      values.name
    )
      .then((res) => {
        setBuyerData(res.data);
        settotalPages(Math.ceil(res.total_count / limit));
      })
      .catch((err) => console.log("err", err));
  };

  // Add effect to sync with URL parameters
  useEffect(() => {
    const { page, verified, organization, name } = router.query;
    if (page) setPage(parseInt(page));
    if (verified || organization || name) {
      setFilter({
        verified: verified || "",
        organization: organization || "",
        name: name || ""
      });
    }
  }, [router.query]);

  useEffect(() => {
    getBuyerList();
  }, [page]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between ">
            <h1 class="m-0 text-dark">Buyers</h1>
            <Link href={"/buyer-management/add-buyer"} className="btn btn-secondary  " style={{maxWidth:"200px"}} > Add New Buyer </Link>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body mb-4">
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
                    <div className="col-2 d-flex flex-column">
                      <button type="submit" class="btn btn-info ">
                        Search
                      </button>
                    </div>
                    <div className="col-2 d-flex flex-column">
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
                  </div>
                </Form>
              )}
            </Formik>
          </div>

          <div className="card product-table">
            <div className="card-body">
              <table class="table table-striped table-hover mb-4">
                <thead>
                  <tr>
                    <th scope="col">Buyer Name</th>
                    <th scope="col">Spoc</th>
                    <th scope="col">Email</th>
                    <th scope="col">Contacts</th>
                    <th scope="col">Created At</th>
                    {/* <th scope="col">Region</th> */}
                    {/* <th scope="col">Approval Status</th> */}
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {BuyerData.map((item) => {
                    return (
                      <tr key={item.name} className={item.is_deleted == 1 ? 'deleted-row' : ''} >
                        <td>{item.name}</td>
                        <td>{item.organization_name}</td>
                        <td>{item.email}</td>
                        <td>{item.mobile}</td>
                        <td style={{ width: "100px" }}>
                         {new Date(item.created_at).toLocaleDateString("en-GB", {
                           day: "numeric",
                           month: "short",
                           year: "numeric",
                         })}
                       </td>
                        {/* <td>{item.country}</td> */}
                        {/* <td>
                          {item.status == 0 ? (
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
                                onClick={() => submitApproveBuyer(item.id, 1)}
                              >
                                Approve
                              </button>
                            </OverlayTrigger>
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
                                onClick={() => submitApproveBuyer(item.id, 0)}
                              >
                                Disapprove
                              </button>
                            </OverlayTrigger>
                          )}
                        </td> */}
                        <td>
                          <span>
                            <span
                              className="fa fa-eye mr-3"
                              onClick={() =>
                                router.push(
                                  `/buyer-management/buyer-details/${item.id}`
                                )
                              }
                            ></span>
                          </span>
                          <span
                            className="fa fa-edit mr-3"
                            onClick={() => handleUpdateVendor(item)}
                          ></span>
                          {/* <span
                            className="fa fa-trash"
                            onClick={() => handleDeleteBudget(item.id)}
                          ></span> */}
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
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BuyerManagement;
