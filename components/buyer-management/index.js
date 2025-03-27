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
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState();
  const [showModal, setShowModal] = useState(false);
  const [limit] = useState(10);
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [totalPages, setTotalPages] = useState(0);
  const [filter, setFilter] = useState({
    verified: "",
    organization: router.query.organization || "",
    name: router.query.name || ""
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

  const getBuyerList = async (currentPage = page, currentFilter = filter) => {
    setIsLoading(true);
    setBuyerData([]);
    try {
      const res = await handleGetBuyerList(
        limit,
        currentPage,
        currentFilter.verified,
        currentFilter.organization,
        currentFilter.name
      );
      if (res?.data) {
        setBuyerData(res.data);
        setTotalPages(Math.ceil(parseInt(res.total_count) / limit));
      }
    } catch (err) {
      console.error("Error fetching buyer data:", err);
      toast.error("Failed to fetch buyer data");
    } finally {
      setIsLoading(false);
    }
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

  const handlePageClick = async (e) => {
    const newPage = e.selected + 1;
    await getBuyerList(newPage, filter);
    setPage(newPage);
    updateUrlParams({ ...filter, page: newPage });
  };

  const handleDeleteBudget = (id) => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = async (values) => {
    const newFilter = {
      verified: values.verified || "",
      organization: values.organization || "",
      name: values.name || "",
    };
    setFilter(newFilter);
    await getBuyerList(1, newFilter);
    setPage(1);
    updateUrlParams({ ...newFilter, page: 1 });
  };

  // Effect to handle initial load and URL parameter changes
  useEffect(() => {
    if (!router.isReady) return;

    const { page: urlPage, verified, organization, name } = router.query;
    const newPage = urlPage ? parseInt(urlPage) : 1;
    const newFilter = {
      verified: verified || "",
      organization: organization || "",
      name: name || ""
    };

    setPage(newPage);
    setFilter(newFilter);
    getBuyerList(newPage, newFilter);
  }, [router.isReady]);

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
                verified: filter.verified,
                organization: filter.organization,
                name: filter.name,
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
                    <div class="col-3">
                      <Field
                        type="text"
                        name="organization"
                        class="form-control"
                        placeholder="Search organization"
                        value={values.organization}
                      />
                    </div>

                    <div class="col-3">
                      <Field
                        type="text"
                        name="name"
                        class="form-control"
                        placeholder="Search name"
                        value={values.name}
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
              {isLoading ? (
                <div className="text-center p-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                  </div>
                </div>
              ) : (
                <>
                  <table className="table table-striped table-hover mb-4">
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

                  {totalPages > 1 && (
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={<i className="fa fa-angle-right"></i>}
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={2}
                      pageCount={totalPages}
                      previousLabel={<i className="fa fa-angle-left"></i>}
                      renderOnZeroPageCount={null}
                      className="pagination"
                      forcePage={page - 1}
                      marginPagesDisplayed={1}
                    />
                  )}
                </>
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
