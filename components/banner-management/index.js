import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  handleDeleteBanner,
  handleDeleteVendorProfile,
  handleGetBannerList,
} from "@/utils/services/banner-management";
import ReactPaginate from "react-paginate";
import { useRouter } from "next/router";
import DeleteModal from "../modal/delete-modal";
import { ToastContainer, toast } from "react-toastify";
import moment from "moment";
import ReactHtmlParser from "react-html-parser";

const BannerManagement = () => {
  const [bannerData, setBannerData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [page, setPage] = useState(1);
  const [id, setId] = useState();
  const router = useRouter();
  const handleClose = () => setShowModal(false);
  const getBuyerList = () => {
    handleGetBannerList(page)
      .then((res) => {
        setBannerData(res.data);
        setTotalPages(res.total_count);
      })
      .catch((err) => console.log("err", err));
  };

  const submitDeleteBlog = () => {
    handleDeleteBanner(id)
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

  const handleUpdateBanner = (item) => {
    // localStorage.setItem("vendorUpdate", JSON.stringify(item));
    router.push(`/banner-management/edit/${item.id}`);
  };

  useEffect(() => {
    getBuyerList();
  }, [page]);
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
  };
  const handleDeleteBannerClick = (id) => {
    setShowModal(true);
    setId(id);
  };
  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 class="m-0 text-dark">Banner</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="card card-body">
            <div className="row">
              <div className="col-md-8">
                {/* <div class="input-group buyers-search">
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
                </div> */}
                {/* <div className="d-flex mt-4">
                  <div className="nav-item dropdown">
                    <div className={`dropdown-menu  "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">
                          System Notification
                        </h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title"></h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logo</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Site Title</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">
                          SMTP Configuration
                        </h3>
                      </button>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Admin Email</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Edit Profile</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logout</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                  <div className="nav-item dropdown ml-3">
                    <div className={`dropdown-menu "show"`}>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Edit Profile</h3>
                      </button>

                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item">
                        <h3 className="dropdown-item-title">Logout</h3>
                      </button>
                      <div className="dropdown-divider"></div>
                    </div>
                  </div>
                </div> */}
              </div>
              <div className="col-md-4">
                <div className="d-flex justify-content-end">
                  <button
                    type="button"
                    class="btn btn-primary mr-2"
                    onClick={() => router.push("/add-banner")}
                  >
                    <i className="fa fa-plus mr-2"></i>Add Banner
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="card card-body product-table mt-3">
            <table class="table table-striped table-hover mb-3">
              <thead>
                <tr>
                  <th scope="col">Page</th>
                  <th scope="col">Content</th>
                  <th scope="col">Banner</th>
                  <th scope="col">Status</th>
                  <th scope="col">Created at</th>
                  <th scope="col">Action</th>
                </tr>
              </thead>
              <tbody>
                {bannerData.map((item) => {
                  return (
                    <tr key={item.name}>
                      <td>{item.name}</td>
                      <td>{ReactHtmlParser(item.content)}</td>
                      <td>
                        <img
                          src={item.image_url}
                          alt="Banner"
                          width={180}
                          height={70}
                          priority={true}
                        />
                      </td>
                      <td>{item.status == 0 ? "Inactive" : "Active"}</td>
                      <td>{moment(item.createdAt).format("MM/DD/YYYY")}</td>
                      <td>
                        <div class="card-footer bg-transparent border-secondary">
                          <div className="actionStyle">
                            {/* <span
                              className="fa fa-eye mr-3"
                              onClick={() =>
                                router.push(`/banner-management/edit/${item.id}`)
                              }
                            ></span> */}
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
              <ReactPaginate
                breakLabel="..."
                nextLabel=">"
                onPageChange={handlePageClick}
                pageRangeDisplayed={2}
                pageCount={Math.ceil(totalPages / 20)}
                previousLabel="<"
                renderOnZeroPageCount={null}
                className="pagination"
              />
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

export default BannerManagement;
