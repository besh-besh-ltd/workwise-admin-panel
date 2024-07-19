import React, { useEffect, useState } from "react";
import img1 from "../../public/assets/images/products.png";
import doc from "../../public/assets/images/doc.png";
import Image from "next/image";
import {
  handleDeleteVendorProfile,
  handleDisableVendorProfile,
  handleGetVendorDetails,
  handleVendorRfqList,
} from "@/utils/services/vendor-management";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../modal/delete-modal";
import DisableModal from "../modal/disable-modal";
const VendorDetails = () => {
  const router = useRouter();
  const id = router?.query?.id;
  const [vendorDeails, setVendorDeails] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [vendorRfqList, setVendorRfqList] = useState([]);
  const handleClose = () => {
    setShowModal(false);
    setShowDisableModal(false);
  };
  useEffect(() => {
    getVendorDetails();
  }, [id]);
  const handleDeleteBudget = (id) => {
    setShowModal(true);
  };

  const getVendorRfqList = () => {
    handleVendorRfqList(id)
      .then((res) => setVendorRfqList(res.data))
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      });
  };
  useEffect(() => {
    console.log(vendorRfqList, "vendorRfqList *");
  }, [vendorRfqList]);
  const getVendorDetails = () => {
    if (id != undefined) {
      handleGetVendorDetails(id)
        .then((res) => setVendorDeails(res.data[0]))
        .catch((error) => {
          let txt = "";
          for (let x in error.error.response.data.errors) {
            txt = error.error.response.data.errors[x];
          }
          toast(txt);
        });
    }
  };
  const submitDisableModal = () => {
    handleDisableVendorProfile(id)
      .then((res) => {
        toast(res.message);
        handleClose();
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };
  const submitDeleteBlog = () => {
    handleDeleteVendorProfile(id)
      .then((res) => {
        handleClose();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };

  useEffect(() => {
    if (id) {
      getVendorRfqList();
    }
  }, [id]);

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            {/* <div className="col-sm-6">
                            <h1 className="m-0 text-dark">Dashboard</h1>
                        </div>
                        <div className="col-sm-6">
                            <ol className="breadcrumb float-sm-right">
                                <li className="breadcrumb-item">
                                    <NavLink to="#">Home</NavLink>
                                </li>
                                <li className="breadcrumb-item active">Dashboard</li>
                            </ol>
                        </div> */}
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Vendor Profile </h5>
            </ol>
            <ol className="breadcrumb float-sm-right">
              <li className="mr-4">
                <button
                  type="button"
                  class="btn btn-warning"
                  onClick={() => setShowDisableModal(true)}
                >
                  {vendorDeails?.status == 1
                    ? "DISABLE PROFILE"
                    : "ENABLE PROFILE"}
                </button>
              </li>
              <li className="mr-4">
                <button
                  type="button"
                  class="btn btn-danger"
                  onClick={() => handleDeleteBudget()}
                >
                  DELETE PROFILE
                </button>
              </li>
            </ol>
          </div>
          <div className="d-flex justify-content w-100">
            <div class="card col-6">
              <div className="card-header">Basic Information</div>
              <div class="card-body mt-3">
                <div className="d-flex">
                  <div class="text-center">
                    <Image
                      fill
                      src={
                        vendorDeails?.profile_image == null
                          ? img1
                          : vendorDeails?.profile_image
                      }
                      unoptimized
                      className="rounded prof-img-vendor"
                      alt="..."
                    />
                  </div>
                  <div className="ml-4">
                    <p>Name- {vendorDeails?.name},</p>
                    {vendorDeails?.address != null && (
                      <p>Address- {vendorDeails?.address}</p>
                      // <p>Address- Address Line 2</p>
                    )}

                    <p>Mobile Number- {vendorDeails?.mobile}</p>
                    <p>Email- {vendorDeails?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-6">
              <div className="card-header">Company Information</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Company Name- {vendorDeails?.organization_name}
                </li>
                <li className="list-group-item">
                  Nature of business- {vendorDeails?.nature_of_business}
                </li>
                <li className="list-group-item">
                  Number of employee- {vendorDeails?.no_of_employess}
                </li>
                {vendorDeails?.gstin != null && (
                  <li className="list-group-item">
                    GSTIN- {vendorDeails?.gstin}
                  </li>
                )}

                <li className="list-group-item">
                  Import Export Code- {vendorDeails?.import_export_code}
                </li>
                <li className="list-group-item">
                  Certification- {vendorDeails?.certifications}
                </li>
              </ul>
            </div>
          </div>
          {vendorDeails?.profile && (
            <div className="d-flex ">
              <div className="card col-12 mr-5" style={{ height: "200px" }}>
                <div className="card-header">Profile</div>
                <ul className="h-100 d-inline-block pt-3">
                  <p>{vendorDeails?.profile}</p>
                </ul>
              </div>
            </div>
          )}
          {vendorDeails?.brochure &&
            vendorDeails?.brochure[0]?.brochure_url && (
              <div className="d-flex vendor-brochure">
                <div className="card col-12 mr-5">
                  <div className="card-header">Brochure</div>
                  <ul className="listitem">
                    <li>
                      {vendorDeails.length != 0 && (
                        <a
                          target="_blank"
                          href={vendorDeails?.brochure[0]?.brochure_url}
                          download
                        >
                          <div>
                            <Image
                              fill
                              src={
                                vendorDeails.brochure[0]?.brochure_url == null
                                  ? img1
                                  : vendorDeails.brochure[0]?.brochure_url
                              }
                              unoptimized
                              className="rounded prof-img"
                              alt="..."
                            />
                          </div>
                        </a>
                      )}
                    </li>
                  </ul>
                </div>
              </div>
            )}
          {vendorDeails.documents?.length > 0 && (
            <div className="d-flex vendor-documents">
              <div className="card col-12 mr-5">
                <div className="card-header">Documents</div>
                <ul className="listitem">
                  {vendorDeails.documents?.map((item, index) => {
                    return (
                      <li key={index}>
                        <div>
                          <a target="_blank" href={item.document_url} download>
                            <Image
                              fill
                              src={
                                item.document_url == null
                                  ? img1
                                  : item.document_url
                              }
                              unoptimized
                              className="rounded prof-img"
                              alt="..."
                            />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          {vendorDeails.ptr_files?.length > 0 && (
            <div className="d-flex vendor-ptr">
              <div className="card col-12 mr-5">
                <div className="card-header">Past Track Record (PTR)</div>
                <ul className="listitem">
                  {vendorDeails.ptr_files?.map((item, index) => {
                    return (
                      <li key={index}>
                        <div>
                          <a target="_blank" href={item.ptr_url} download>
                            <Image
                              fill
                              src={item.ptr_url == null ? img1 : item.ptr_url}
                              unoptimized
                              className="rounded prof-img"
                              alt="..."
                            />
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          {vendorDeails.products?.length > 0 && (
            <div className="d-flex vendor-products">
              <div className="card col-12 mr-5">
                <div className="card-header">Products</div>

                <ul className="listitem listitem-cobte">
                  {vendorDeails.products?.map((item, index) => {
                    return (
                      <li key={index}>
                        <div className="main-pr">
                          <div className="inner-pr">
                            <Image
                              fill
                              src={
                                item.product_image_url == null
                                  ? img1
                                  : item.product_image_url
                              }
                              unoptimized
                              className="rounded prof-img"
                              alt="..."
                            />
                          </div>
                          <span>{item.product}</span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
          {vendorDeails.vendor_approve?.length > 0 && (
            <div className="d-flex ">
              <div className="card col-12 mr-5">
                <div className="card-header">Vendor Approved By</div>
                <ul className="d-flex justify-content-left p-1">
                  <div className="table-search float-right mt-3"></div>

                  {vendorDeails.vendor_approve?.map((item, index) => {
                    return (
                      <div className="mt-3 ml-2" key={index}>
                        <button type="button" class="btn btn-secondary">
                          {item.vendor_approve}
                        </button>
                      </div>
                    );
                  })}

                  {/*   <div className="mt-3 ml-2">
                  <button type="button" class="btn btn-secondary">
                    IOCL
                  </button>
                </div>
                <div className="mt-3 ml-2">
                  <button type="button" class="btn btn-secondary">
                    SAIL
                  </button>
                </div> */}
                </ul>
              </div>
            </div>
          )}

          {vendorRfqList && vendorRfqList.length > 0 && (
            <>
              <div>
                <h5 className="heading-p mt-4">RFQ List</h5>
              </div>
              <div className="row">
                <div className="col-12">
                  <div className="card product-table">
                    <div className="card-body">
                      <table class="table table-striped table-hover">
                        <thead>
                          <tr>
                            <th scope="col">Name</th>
                            <th scope="col">Company Name</th>
                            <th scope="col">Contact Number</th>
                            <th scope="col">Comment</th>
                            <th scope="col">email</th>
                            <th scope="col">Bid End Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {vendorRfqList &&
                            vendorRfqList?.map((item) => {
                              return (
                                <tr key={item?.id}>
                                  <td>{item?.contact_name}</td>
                                  <td>{item?.company_name}</td>
                                  <td>{item?.contact_number}</td>
                                  <td>{item?.comment}</td>
                                  <td>{item?.response_email}</td>
                                  <td>{item?.bid_end_date}</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/*  <div className="d-flex justify-content-end pb-5">
            <button type="button" class="btn btn-success mr-3">
              Approve Vendor
            </button>
            <button type="button" class="btn btn-danger">
              Decline Vendor
            </button>
          </div> */}
        </div>
        <DeleteModal
          show={showModal}
          onHide={handleClose}
          data={submitDeleteBlog}
        />
        <DisableModal
          show={showDisableModal}
          onHide={handleClose}
          data={submitDisableModal}
        />
        <ToastContainer />
      </section>
    </>
  );
};

export default VendorDetails;
