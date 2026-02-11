import React, { useEffect, useState, ChangeEvent } from "react";
import Link from "next/link";
import {
  handleDeleteBanner,
  handleDeleteVendorProfile,
  handleGetFaqList,
  handleDeleteFaq,
} from "@/utils/services/faq-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import parse from "html-react-parser";

interface FaqItem {
  id: number | string;
  question: string;
  content: string;
  status: number;
  created_at: string;
}

interface PageClickEvent {
  selected: number;
}

const FaqManagement: React.FC = () => {
  const [bannerData, setBannerData] = useState<FaqItem[]>([]);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [id, setId] = useState<number | string | undefined>();
  const router = useRouter();
  const handleClose = (): void => setShowModal(false);
  const getFaqList = (): void => {
    handleGetFaqList(page)
      .then((res : any) => {
        setBannerData(res.data);
        setTotalPages(res.total_count);
      })
      .catch((err) => console.log("err", err));
  };

  const submitDeleteBlog = (): void => {
    handleDeleteFaq(id)
      .then((res : any) => {
        toast(res.message);
        getFaqList();
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

  const handleUpdateBanner = (item: FaqItem): void => {
    router.push(`/faq-management/edit/${item.id}`);
  };

  useEffect(() => {
    getFaqList();
  }, [page]);
  const handlePageClick = (e: PageClickEvent): void => {
    setPage(e.selected + 1);
  };
  const handleDeleteBannerClick = (id: number | string): void => {
    setShowModal(true);
    setId(id);
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">FAQ</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <div className="row">
              <div className="col-md-8">
              </div>
              <div className="col-md-4">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    className="btn btn-primary mr-2"
                    onClick={() => router.push("/faq-management/add-faq")}
                  >
                    <i className="fa fa-plus mr-2"></i>Add FAQ
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-body product-table mt-3">
            <table className="table table-striped table-hover mb-3">
              <thead>
                <tr>
                  <th scope="col">Question</th>
                  <th scope="col">Content</th>

                  <th scope="col">Status</th>
                  <th scope="col">Created at</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {bannerData.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td>{item.question}</td>
                      <td>{parse(item.content || "")}</td>

                      <td>{item.status == 0 ? "Inactive" : "Active"}</td>
                      <td>{moment(item.created_at).format("MM/DD/YYYY")}</td>
                      <td>
                        <div className="card-footer bg-transparent border-secondary">
                          <div className="actionStyle">
                            <span
                              className="fa fa-edit mr-3"
                              onClick={() => handleUpdateBanner(item)}
                            ></span>
                            <span
                              className="fa fa-trash"
                              onClick={() => handleDeleteBannerClick(item.id)}
                            ></span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {Math.ceil(totalPages / 20) > 1 && (
              <div className="d-flex flex-column align-items-center gap-2">
                <ReactPaginate
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  breakLabel="..."
                  pageCount={Math.ceil(totalPages / 20)}
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
                    max={Math.ceil(totalPages / 20)}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      const pageNum = Math.max(1, Math.min(Math.ceil(totalPages / 20), parseInt(e.target.value) || 1));
                      setPage(pageNum);
                    }}
                  />
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                      const pageNum = parseInt(input.value);
                      if (pageNum && pageNum >= 1 && pageNum <= Math.ceil(totalPages / 20)) {
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
              data={submitDeleteBlog}
            />
            <ToastContainer />
          </div>
        </div>
      </section>
    </>
  );
};

export default FaqManagement;
