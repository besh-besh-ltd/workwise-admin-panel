import React, { useEffect, useState } from "react";
import img1 from "../../public/assets/images/products.png";
import doc from "../../public/assets/images/doc.png";
import Image from "next/image";
import {
  handleDeleteVendorProfile,
  handleDisableVendorProfile,
  handleGetVendorDetails,
} from "@/utils/services/vendor-management";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import DeleteModal from "../modal/delete-modal";
import DisableModal from "../modal/disable-modal";

interface SpocDetail {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  created_at: string;
  updated_at: string;
}

interface BrochureItem {
  brochure_url: string;
}

interface DocumentItem {
  document_url: string;
}

interface PtrFile {
  ptr_url: string;
}

interface ProductItem {
  product: string;
  product_image_url: string | null;
}

interface VendorApprove {
  vendor_approve: string;
}

interface VendorDetailsData {
  name?: string;
  address?: string | null;
  mobile?: string;
  email?: string;
  status?: number;
  new_profile_image?: string | null;
  profile_image?: string | null;
  company_name?: string;
  organization_name?: string;
  nature_of_business?: string | null;
  type_of_business?: string | null;
  no_of_employess?: string | null;
  gstin?: string | null;
  cin?: string | null;
  website?: string | null;
  turnover?: string | null;
  established_year?: string | null;
  import_export_code?: string | null;
  certifications?: string | null;
  profile?: string;
  brochure?: BrochureItem[];
  documents?: DocumentItem[];
  ptr_files?: PtrFile[];
  products?: ProductItem[];
  vendor_approve?: VendorApprove[];
}

const VendorDetails: React.FC = () => {
  const router = useRouter();
  const id = router?.query?.id as string | undefined;
  const [vendorDeails, setVendorDeails] = useState<VendorDetailsData | string>("");
  const [vendorSpocDeails, setVendorSpocDeails] = useState<SpocDetail[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDisableModal, setShowDisableModal] = useState<boolean>(false);

  const handleClose = (): void => {
    setShowModal(false);
    setShowDisableModal(false);
  };

  useEffect(() => {
    getVendorDetailsData();
  }, [id]);

  const handleDeleteBudget = (id?: number): void => {
    setShowModal(true);
  };

  const getVendorDetailsData = (): void => {
    if (id != undefined) {
      handleGetVendorDetails(id)
        .then((res: any) => {
          setVendorDeails(res.data[0]);
          setVendorSpocDeails(res?.spocDetails);
        })
        .catch((error: any) => {
          let txt = "";
          for (let x in error.error.response.data.errors) {
            txt = error.error.response.data.errors[x];
          }
          toast(txt);
        });
    }
  };

  const submitDisableModal = (): void => {
    handleDisableVendorProfile(id!)
      .then((res: any) => {
        toast(res.message);
        handleClose();
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };

  const submitDeleteBlog = (): void => {
    handleDeleteVendorProfile(id!)
      .then((res: any) => {
        handleClose();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast(txt);
        handleClose();
      });
  };

  const details = vendorDeails as VendorDetailsData;

  return (
    <>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
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
                  className="btn btn-warning"
                  onClick={() => setShowDisableModal(true)}
                >
                  {details?.status == 1
                    ? "DISABLE PROFILE"
                    : "ENABLE PROFILE"}
                </button>
              </li>
              <li className="mr-4">
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDeleteBudget()}
                >
                  DELETE PROFILE
                </button>
              </li>
            </ol>
          </div>
          <div className="d-flex justify-content w-100">
            <div className="card col-6">
              <div className="card-header">Basic Information</div>
              <div className="card-body mt-3">
                <div className="d-flex">
                  <div className="text-center">
                    <Image
                      fill
                      src={
                        details?.new_profile_image || details?.profile_image || img1
                      }
                      unoptimized
                      className="rounded prof-img-vendor"
                      alt="..."
                    />
                  </div>
                  <div className="ml-4">
                    <p>Name- {details?.name},</p>
                    {details?.address != null && (
                      <p>Address- {details?.address}</p>
                    )}

                    <p>Mobile Number- {details?.mobile}</p>
                    <p>Email- {details?.email}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="card col-6">
              <div className="card-header">Company Information</div>
              <ul className="list-group list-group-flush">
                <li className="list-group-item">
                  Company Name- {details?.company_name || details?.organization_name || "N/A"}
                </li>
                <li className="list-group-item">
                  Nature of business- {details?.nature_of_business || "N/A"}
                </li>
                <li className="list-group-item">
                  Type of business- {details?.type_of_business || "N/A"}
                </li>
                <li className="list-group-item">
                  Number of employee- {details?.no_of_employess || "N/A"}
                </li>
                {details?.gstin != null && (
                  <li className="list-group-item">
                    GSTIN/TRN- {details?.gstin}
                  </li>
                )}
                {details?.cin != null && (
                  <li className="list-group-item">
                    CIN- {details?.cin}
                  </li>
                )}
                {details?.website != null && (
                  <li className="list-group-item">
                    Website- {details?.website}
                  </li>
                )}
                {details?.turnover != null && (
                  <li className="list-group-item">
                    Turnover- {details?.turnover}
                  </li>
                )}
                {details?.established_year != null && (
                  <li className="list-group-item">
                    Established Year- {details?.established_year}
                  </li>
                )}
                <li className="list-group-item">
                  Import Export Code- {details?.import_export_code || "N/A"}
                </li>
                <li className="list-group-item">
                  Certification- {details?.certifications || "N/A"}
                </li>
              </ul>
            </div>
          </div>

          <h4 className=" mt-4 ml-2"> Vendor SPOCs </h4>
          <div className="d-flex flex-wrap">
            {vendorSpocDeails?.map((item, index) => {
              return (
                <div
                  className="card m-2 p-3"
                  style={{ width: "24rem" }}
                  key={index}
                >
                  <div className="card-body">
                    <p className="card-text">
                      <strong>Name:</strong> {item.name || "N/A"}
                    </p>
                    <p className="card-text">
                      <strong>Email:</strong> {item.email || "N/A"}
                    </p>
                    <p className="card-text">
                      <strong>Mobile:</strong> {item.mobile || "N/A"}
                    </p>
                    <p className="card-text">
                      <strong>Role:</strong> {item.role || "N/A"}
                    </p>
                    <p className="card-text">
                      <strong>Created At:</strong>{" "}
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                    <p className="card-text">
                      <strong>Last Updated At:</strong>{" "}
                      {new Date(item.updated_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {details?.profile && (
            <div className="d-flex ">
              <div className="card col-12 mr-5" style={{ height: "200px" }}>
                <div className="card-header">Profile</div>
                <ul className="h-100 d-inline-block pt-3">
                  <p>{details?.profile}</p>
                </ul>
              </div>
            </div>
          )}
          {details?.brochure &&
            details?.brochure[0]?.brochure_url && (
              <div className="d-flex vendor-brochure">
                <div className="card col-12 mr-5">
                  <div className="card-header">Brochure</div>
                  <ul className="listitem">
                    <li>
                      {typeof vendorDeails !== 'string' && (
                        <a
                          target="_blank"
                          href={details?.brochure[0]?.brochure_url}
                          download
                        >
                          <div>
                            <Image
                              fill
                              src={
                                details.brochure[0]?.brochure_url == null
                                  ? img1
                                  : details.brochure[0]?.brochure_url
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
          {details.documents && details.documents.length > 0 && (
            <div className="d-flex vendor-documents">
              <div className="card col-12 mr-5">
                <div className="card-header">Documents</div>
                <ul className="listitem">
                  {details.documents?.map((item, index) => {
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
          {details.ptr_files && details.ptr_files.length > 0 && (
            <div className="d-flex vendor-ptr">
              <div className="card col-12 mr-5">
                <div className="card-header">Past Track Record (PTR)</div>
                <ul className="listitem">
                  {details.ptr_files?.map((item, index) => {
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
          {details.products && details.products.length > 0 && (
            <div className="d-flex vendor-products">
              <div className="card col-12 mr-5">
                <div className="card-header">Products</div>

                <ul className="listitem listitem-cobte">
                  {details.products?.map((item, index) => {
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
          {details.vendor_approve && details.vendor_approve.length > 0 && (
            <div className="d-flex ">
              <div className="card col-12 mr-5">
                <div className="card-header">Vendor Approved By</div>
                <ul className="d-flex justify-content-left p-1">
                  <div className="table-search float-right mt-3"></div>

                  {details.vendor_approve?.map((item, index) => {
                    return (
                      <div className="mt-3 ml-2" key={index}>
                        <button type="button" className="btn btn-secondary">
                          {item.vendor_approve}
                        </button>
                      </div>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
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
