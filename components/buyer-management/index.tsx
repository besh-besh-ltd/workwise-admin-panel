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
}

interface FilterValues {
  verified: string;
  organization: string;
  name: string;
  user_type: string;
}

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
    verified: "",
    organization: (router.query.organization as string) || "",
    name: (router.query.name as string) || "",
    user_type: (router.query.user_type as string) || ""
  });

  const handleClose = (): void => setShowModal(false);

  const updateUrlParams = (newParams: Record<string, string | number>): void => {
    const query = { ...router.query, ...newParams };
    // Remove empty params
    Object.keys(query).forEach(key => !query[key] && delete query[key]);
    router.push({
      pathname: router.pathname,
      query
    }, undefined, { shallow: true });
  };

  const getBuyerList = async (currentPage: number = page, currentFilter: FilterValues = filter): Promise<void> => {
    setIsLoading(true);
    setBuyerData([]);
    try {
      const res : any = await handleGetBuyerList(
        limit,
        currentPage,
        currentFilter.verified,
        currentFilter.organization,
        currentFilter.name,
        currentFilter.user_type
      );
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
      .then((res : any) => {
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
    const newFilter: FilterValues = {
      verified: values.verified || "",
      organization: values.organization || "",
      name: values.name || "",
      user_type: values.user_type || ""
    };
    setFilter(newFilter);
    await getBuyerList(1, newFilter);
    setPage(1);
    updateUrlParams({ ...newFilter, page: 1 });
  };

  // Effect to handle initial load and URL parameter changes
  useEffect(() => {
    if (!router.isReady) return;

    const { page: urlPage, verified, organization, name, user_type } = router.query;
    const newPage = urlPage ? parseInt(urlPage as string) : 1;
    const newFilter: FilterValues = {
      verified: (verified as string) || "",
      organization: (organization as string) || "",
      name: (name as string) || "",
      user_type: (user_type as string) || ""
    };

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
                user_type: filter.user_type
              }}
              validationSchema={yup.object().shape({
                verified: yup.string(),
                organization: yup.string(),
                name: yup.string(),
                user_type: yup.string()
              })}
              onSubmit={(values: FilterValues, { resetForm }: FormikHelpers<FilterValues>) => {
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
                    <div className="col-3">
                      <Field
                        type="text"
                        name="organization"
                        className="form-control"
                        placeholder="Search organization"
                        value={values.organization}
                      />
                    </div>

                    <div className="col-3">
                      <Field
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Search name"
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
                        <option value="2">Procurement</option>
                        <option value="7">Company Admin</option>
                        <option value="8">Top Management</option>
                        <option value="9">Engineering Account</option>
                        <option value="10">Finance Account</option>
                      </Field>
                    </div>

                    <div className="col-2 d-flex flex-column">
                      <button type="submit" className="btn btn-info ">
                        Search
                      </button>
                    </div>
                    <div className="col-2 d-flex flex-column">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={() => {
                          resetForm();
                          submitHandler({
                            verified: "",
                            organization: "",
                            name: "",
                            user_type: ""
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
                        <th scope="col">Email</th>
                        <th scope="col">Contacts</th>
                        <th scope="col">User Type</th>
                        <th scope="col">Company Name</th>
                        <th scope="col">Status</th>
                        <th scope="col">Created At</th>
                        <th scope="col">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {BuyerData.map((item) => {
                        // User type mapping
                        const userTypeMap: Record<number, string> = {
                          2: "Procurement",
                          7: "Company Admin",
                          8: "Top Management",
                          9: "Engineering Account",
                          10: "Finance Account"
                        };

                        return (
                          <tr key={item.name} className={item.is_deleted == 1 ? 'deleted-row' : ''} >
                            <td>{item.name}</td>
                            <td>{item.email}</td>
                            <td>{item.mobile}</td>
                            <td>{userTypeMap[item.user_type] || `Type ${item.user_type}`}</td>
                            <td>{item.company_name || item.organization_name}</td>
                            <td>
                              <span className={`badge ${item.status === 1 ? 'bg-success' : 'bg-danger'}`}>
                                {item.status === 1 ? 'Active' : 'Inactive'}
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
                            const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 10), parseInt(e.target.value) || 1));
                            setPage(pageNum);
                            updateUrlParams({
                              page: pageNum,
                              organization: filter.organization,
                              name: filter.name,
                              verified: filter.verified,
                              user_type: filter.user_type
                            });
                          }}
                        />
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => {
                            const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                            const pageNum = parseInt(input.value);
                            if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 10)) {
                              setPage(pageNum);
                              updateUrlParams({
                                page: pageNum,
                                organization: filter.organization,
                                name: filter.name,
                                verified: filter.verified,
                                user_type: filter.user_type
                              });
                            }
                          }}
                        >
                          Go
                        </button>
                      </div>
                    </div>
                  )}

                  <DeleteModal
                    show={showModal}
                    onHide={handleClose}
                    data={submitDeleteBlog}
                  />
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
