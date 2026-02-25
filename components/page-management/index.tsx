import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  handleDeleteSection,
  handleGetPageManagement,
  handleApprovePageContent,
} from "@/utils/services/page-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

interface PageItem {
  id: number;
  page_name: string;
  section_name: string;
  status: number;
}

interface PageClickEvent {
  selected: number;
}

const predefinedPageSections: string[] = [
  "homepage-section-1",
  "aboutpage-section-1",
  "homepage-section-5",
  "footer-top",
  "homepage-blog-section",
  "homepage-media-section",
  "homepage-company-section",
  "homepage-faq-section",
  "homepage-section-products",
  "aboutpage-section-3",
  "buyer-section-1",
  "vendor-section-1",
  "contactpage-section-1",
  "homepage-section-3",
  "homepage-section-2",
  "aboutpage-section-2",
  "Home-section bottom",
  "banner-contents",
];

const PageManagement: React.FC = () => {
  const [pageData, setPageData] = useState<PageItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [id, setId] = useState<number | undefined>();
  const router = useRouter();
  const handleClose = (): void => setShowModal(false);
  const getPageLists = (): void => {
    handleGetPageManagement(page)
      .then((res: { data: PageItem[]; count: number }) => {
        setPageData(res.data);
        setTotalPages(res.count);
      })
      .catch((err: unknown) => console.log("err", err));
  };

  const submitDeleteSection = (): void => {
    handleDeleteSection(id)
      .then((res: { message: string }) => {
        handleClose();
        toast(res.message);
        getPageLists();
      })
      .catch((error: { error: { response: { data: { errors: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };

  const submitApproveOtherUser = (id: number, status: number): void => {
    handleApprovePageContent(id, status)
      .then((res: { message: string }) => {
        toast(res.message);
        getPageLists();
      })
      .catch((error: { error: { response: { data: { errors: Record<string, string> } } } }) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
      });
    setTimeout(handleClose, 10000);
  };

  useEffect(() => {
    getPageLists();
  }, [page]);
  const handlePageClick = (e: PageClickEvent): void => {
    setPage(e.selected + 1);
  };
  const handleDeleteItem = (id: number): void => {
    setShowModal(true);
    setId(id);
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Page Management</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <div className="row">
              <div className="col-md-12">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={() => router.push("page-management/add")}
                  >
                    <i className="fa fa-plus mr-2"></i> Add Page Section
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-body product-table mt-3">
            <table className="table table-striped table-hover mb-3">
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col">Section</th>

                  <th scope="col">Action</th>
                  <th scope="col">Page Section Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.page_name}</td>
                      <td>{item.section_name}</td>

                      <td>
                        <div className="card-footer bg-transparent border-secondary">
                          <div className="actionStyle">
                            <span
                              className="fa fa-edit mr-3"
                              onClick={() =>
                                router.push(`/page-management/edit/${item.id}`)
                              }
                            ></span>
                            {!predefinedPageSections.includes(
                              item.section_name
                            ) && (
                              <span
                                className="fa fa-trash"
                                onClick={() => handleDeleteItem(item.id)}
                              ></span>
                            )}
                            {/* <span
															className="fa fa-trash"
															onClick={() => handleDeleteItem(item.id)}
														></span> */}
                          </div>
                        </div>
                      </td>
                      <td>
                        {item.status == 0 ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip1">Click to Active</Tooltip>
                            }
                          >
                            <button
                              className="btn btn-secondary bg-success"
                              onClick={() => submitApproveOtherUser(item.id, 1)}
                            >
                              Active
                            </button>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tooltip1">Click to Inactive</Tooltip>
                            }
                          >
                            <button
                              className="btn btn-secondary bg-danger"
                              onClick={() => submitApproveOtherUser(item.id, 0)}
                            >
                              Inactive
                            </button>
                          </OverlayTrigger>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {Math.ceil(totalPages / 5) > 1 && (
              <div className="d-flex flex-column align-items-center gap-2">
                <ReactPaginate
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  breakLabel="..."
                  pageCount={Math.ceil(totalPages / 5)}
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
                    max={Math.ceil(totalPages / 5)}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 5), parseInt(e.target.value) || 1));
                      setPage(pageNum);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      const pageNum = parseInt(input.value);
                      if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 5)) {
                        setPage(pageNum);
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
              data={submitDeleteSection}
            />
            <ToastContainer />
          </div>
        </div>
      </section>
    </>
  );
};

export default PageManagement;
