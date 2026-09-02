import React, { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import {
  handleGetBuyerList,
  handleApproveBuyer,
  handleDeleteBuyerProfile,
} from "@/utils/services/buyer-management";
import DeleteModal from "../modal/delete-modal";
import { useRouter } from "next/router";
import { Field, Form, Formik, FormikHelpers } from "formik";
import ReactPaginate from "react-paginate";
import * as yup from "yup";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import {
  BUYER_USER_TYPES,
  getUserTypeLabel,
  SUBSCRIPTION_CYCLE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
} from "@/utils/userTypes";

interface BuyerItem {
  id: number;
  name: string;
  email: string;
  mobile: string;
  user_type: number;
  company_name?: string;
  organization_name?: string;
  status: number;
  created_at: string;
  is_deleted: number;
  country?: string;
  // Returned by buyer-list so the table can show a subscription at a glance,
  // instead of one buyer-subscription-details call per row.
  subscription_status?: "active" | "expired" | "none";
  subscription_plan_name?: string | null;
  subscription_end_date?: string | null;
}

interface FilterValues {
  verified: string;
  search: string;
  organization: string;
  name: string;
  email: string;
  mobile: string;
  user_type: string;
  subscription_status: string;
  subscription_cycle: string;
}

const EMPTY_FILTER: FilterValues = {
  verified: "",
  search: "",
  organization: "",
  name: "",
  email: "",
  mobile: "",
  user_type: "",
  subscription_status: "",
  subscription_cycle: "",
};

interface PageClickData {
  selected: number;
}

const BuyerManagement: React.FC = () => {
  const router = useRouter();
  const [BuyerData, setBuyerData] = useState<BuyerItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [id, setId] = useState<number | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [limit] = useState<number>(10);
  const [page, setPage] = useState<number>(parseInt(router.query.page as string) || 1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [filter, setFilter] = useState<FilterValues>({
    ...EMPTY_FILTER,
    search: (router.query.search as string) || "",
    organization: (router.query.organization as string) || "",
    name: (router.query.name as string) || "",
    email: (router.query.email as string) || "",
    mobile: (router.query.mobile as string) || "",
    user_type: (router.query.user_type as string) || "",
    subscription_status: (router.query.subscription_status as string) || "",
    subscription_cycle: (router.query.subscription_cycle as string) || "",
  });

  const handleClose = (): void => setShowModal(false);

  const updateUrlParams = (newParams: Record<string, string | number>): void => {
    const query = { ...router.query, ...newParams };
    // Remove empty params
    Object.keys(query).forEach((key) => !query[key] && delete query[key]);
    router.push(
      {
        pathname: router.pathname,
        query,
      },
      undefined,
      { shallow: true }
    );
  };

  const getBuyerList = async (
    currentPage: number = page,
    currentFilter: FilterValues = filter
  ): Promise<void> => {
    setIsLoading(true);
    setBuyerData([]);
    try {
      const res: any = await handleGetBuyerList({
        limit,
        page: currentPage,
        ...currentFilter,
      });
      if (res?.data) {
        setBuyerData(res.data);
        setTotalPages(parseInt(res.total_count));
      }
    } catch (err) {
      console.error("Error fetching buyer data:", err);
      toast.error("Failed to fetch buyer data");
    } finally {
      setIsLoading(false);
    }
  };

  const submitDeleteBlog = (): void => {
    handleDeleteBuyerProfile(id as number)
      .then((res: any) => {
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
    setTimeout(handleClose, 10000);
  };

  const handleUpdateVendor = (item: BuyerItem): void => {
    localStorage.setItem("buyerUpdate", JSON.stringify(item));
    router.push(`/buyer-management/update-buyer/${item.id}`);
  };

  const handlePageClick = async (e: PageClickData): Promise<void> => {
    const newPage = e.selected + 1;
    await getBuyerList(newPage, filter);
    setPage(newPage);
    updateUrlParams({ ...filter, page: newPage });
  };

  const handleDeleteBudget = (id: number): void => {
    setShowModal(true);
    setId(id);
  };

  const submitHandler = async (values: FilterValues): Promise<void> => {
    const newFilter: FilterValues = { ...EMPTY_FILTER, ...values };
    setFilter(newFilter);
    await getBuyerList(1, newFilter);
    setPage(1);
    updateUrlParams({ ...newFilter, page: 1 });
  };

  // Effect to handle initial load and URL parameter changes
  useEffect(() => {
    if (!router.isReady) return;

    const newPage = router.query.page ? parseInt(router.query.page as string) : 1;
    // Every filter key is read back from the URL, so a shared or reloaded
    // link restores the whole search — not just the three it used to carry.
    const newFilter: FilterValues = { ...EMPTY_FILTER };
    (Object.keys(EMPTY_FILTER) as Array<keyof FilterValues>).forEach((k) => {
      newFilter[k] = (router.query[k] as string) || "";
    });

    setPage(newPage);
    setFilter(newFilter);
    getBuyerList(newPage, newFilter);
  }, [router.isReady]);

  // Effect to handle filter changes
  useEffect(() => {
    if (!router.isReady) return;
    getBuyerList(page, filter);
  }, [filter, page]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="d-flex justify-content-between ">
            <h1 className="m-0 text-dark">Buyers</h1>
            <Link
              href={"/buyer-management/add-buyer"}
              className="btn btn-secondary  "
              style={{ maxWidth: "200px" }}
            >
              {" "}
              Add New Buyer{" "}
            </Link>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body mb-4">
            <Formik
              enableReinitialize
              initialValues={{ ...EMPTY_FILTER, ...filter }}
              validationSchema={yup
                .object()
                .shape(
                  (Object.keys(EMPTY_FILTER) as Array<keyof FilterValues>).reduce(
                    (acc, k) => ({ ...acc, [k]: yup.string() }),
                    {}
                  )
                )}
              onSubmit={(values: FilterValues, { resetForm }: FormikHelpers<FilterValues>) => {
                submitHandler(values);
              }}
            >
              {({ errors, touched, values, handleChange, setFieldValue, resetForm }) => (
                <Form>
                  {/* Row 1 — the one box most searches start from, then the
                      two identifiers an admin is most likely to be handed. */}
                  <div className="row mb-2">
                    <div className="col-4">
                      <Field
                        type="text"
                        name="search"
                        className="form-control"
                        placeholder="Search name, email, mobile, organisation…"
                        value={values.search}
                      />
                    </div>

                    <div className="col-4">
                      <Field
                        type="text"
                        name="email"
                        className="form-control"
                        placeholder="Email"
                        value={values.email}
                      />
                    </div>

                    <div className="col-4">
                      <Field
                        type="text"
                        name="mobile"
                        className="form-control"
                        placeholder="Mobile no."
                        value={values.mobile}
                      />
                    </div>
                  </div>

                  {/* Row 2 — narrowing filters. */}
                  <div className="row mb-2">
                    <div className="col-3">
                      <Field
                        type="text"
                        name="organization"
                        className="form-control"
                        placeholder="Organisation / company"
                        value={values.organization}
                      />
                    </div>

                    <div className="col-3">
                      <Field
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Buyer name"
                        value={values.name}
                      />
                    </div>

                    <div className="col-3">
                      <Field
                        as="select"
                        name="user_type"
                        className="form-control"
                        value={values.user_type}
                      >
                        <option value="">All User Types</option>
                        {BUYER_USER_TYPES.map((t) => (
                          <option key={t.value} value={String(t.value)}>
                            {t.label}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <div className="col-3">
                      <Field
                        as="select"
                        name="verified"
                        className="form-control"
                        value={values.verified}
                      >
                        <option value="">Any status</option>
                        <option value="t">Active</option>
                        <option value="f">Inactive</option>
                      </Field>
                    </div>
                  </div>

                  {/* Row 3 — subscription, plus the actions. */}
                  <div className="row">
                    <div className="col-3">
                      <Field
                        as="select"
                        name="subscription_status"
                        className="form-control"
                        value={values.subscription_status}
                      >
                        <option value="">Any subscription</option>
                        {SUBSCRIPTION_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <div className="col-3">
                      <Field
                        as="select"
                        name="subscription_cycle"
                        className="form-control"
                        value={values.subscription_cycle}
                      >
                        <option value="">Any billing cycle</option>
                        {SUBSCRIPTION_CYCLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Field>
                    </div>

                    <div className="col-3 d-flex flex-column">
                      <button type="submit" className="btn btn-info ">
                        Search
                      </button>
                    </div>
                    <div className="col-3 d-flex flex-column">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          resetForm({ values: EMPTY_FILTER });
                          submitHandler(EMPTY_FILTER);
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
                        <th scope="col">Email</th>
                        <th scope="col">Contacts</th>
                        <th scope="col">User Type</th>
                        <th scope="col">Company Name</th>
                        <th scope="col">Subscription</th>
                        <th scope="col">Status</th>
                        <th scope="col">Created At</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BuyerData.map((item) => {
                        return (
                          <tr key={item.name} className={item.is_deleted == 1 ? "deleted-row" : ""}>
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.mobile}</td>
                            <td>{getUserTypeLabel(item.user_type)}</td>
                            <td>{item.company_name || item.organization_name}</td>
                            <td>
                              {item.subscription_status === "none" ? (
                                <span className="text-muted">—</span>
                              ) : (
                                <>
                                  <span
                                    className={`badge ${
                                      item.subscription_status === "active"
                                        ? "bg-success"
                                        : "bg-warning"
                                    }`}
                                  >
                                    {item.subscription_status === "active" ? "Active" : "Expired"}
                                  </span>
                                  {item.subscription_plan_name && (
                                    <div className="small text-muted">
                                      {item.subscription_plan_name}
                                    </div>
                                  )}
                                </>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${item.status === 1 ? "bg-success" : "bg-danger"}`}
                              >
                                {item.status === 1 ? "Active" : "Inactive"}
                              </span>
                            </td>
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
                                    router.push(`/buyer-management/buyer-details/${item.id}`)
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

                  {Math.ceil(totalPages / 10) > 1 && (
                    <div className="d-flex flex-column align-items-center gap-2">
                      <ReactPaginate
                        previousLabel={<i className="fa fa-angle-left"></i>}
                        nextLabel={<i className="fa fa-angle-right"></i>}
                        breakLabel="..."
                        pageCount={Math.ceil(totalPages / 10)}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        forcePage={page - 1}
                        containerClassName="pagination mb-0"
                        pageClassName="page-item"
                        pageLinkClassName="page-link"
                        previousClassName="page-item"
                        previousLinkClassName="page-link"
                        nextClassName="page-item"
                        nextLinkClassName="page-link"
                        activeClassName="active"
                      />
                      <div className="d-flex align-items-center gap-2 mt-2">
                        <input
                          type="number"
                          className="form-control"
                          style={{ width: "125px" }}
                          placeholder="Go to page"
                          min="1"
                          max={Math.ceil(totalPages / 10)}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => {
                            const pageNum = Math.max(
                              1,
                              Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1)
                            );
                            setPage(pageNum);
                            updateUrlParams({
                              page: pageNum,
                              organization: filter.organization,
                              name: filter.name,
                              verified: filter.verified,
                              user_type: filter.user_type,
                            });
                          }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const input = document.querySelector(
                              'input[type="number"]'
                            ) as HTMLInputElement;
                            const pageNum = parseInt(input.value);
                            if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
                              setPage(pageNum);
                              updateUrlParams({
                                page: pageNum,
                                organization: filter.organization,
                                name: filter.name,
                                verified: filter.verified,
                                user_type: filter.user_type,
                              });
                            }
                          }}
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  )}

                  <DeleteModal show={showModal} onHide={handleClose} data={submitDeleteBlog} />
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default BuyerManagement;
