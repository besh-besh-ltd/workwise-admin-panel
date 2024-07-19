import React, { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import * as yup from "yup";
import Image from "next/image";
import {
  handleAddVendor,
  handleGetVendorDetails,
  handleUpdateVendor,
  handleGetStates,
  handleGetCities,
  handleGetVendorEditDetails
} from "@/utils/services/vendor-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import img1 from "../../public/assets/images/products.png";

const UpdateVendor = () => {
  const [dtaCount, setdtaCount] = useState(0);
  const [editDetails, seteditDetails] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryOption, setSelectedCountryOption] = useState('');
  const [selectedStateOption, setSelectedStateOption] = useState('');
  const [selectedCityOption, setSelectedCityOption] = useState('');
  const [isStateDisabled, setIsStateDisabled] = useState(true);
  const [isCityDisabled, setIsCityDisabled] = useState(true);
  const router = useRouter();
  let id = router.query.id;
  
  const submitHandler = (values, resetForm) => {
    handleUpdateVendor(values, id)
      .then((res) => {
        resetForm();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((error) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };

  useEffect(() => {
    handleGetStates()
      .then(res => {
        setStates(res.data.data)
      })
      .catch((err) => console.log("err", err));
  }, [])
  
  const handleCountryChange = (event) => {
    setSelectedCountryOption(event.target.value)
    if (event.target.value !== '') {
      setIsStateDisabled(false);
    } else {
      setIsStateDisabled(true)
      setIsCityDisabled(true)
      setSelectedCountryOption('')
      setSelectedStateOption('')
      setSelectedCityOption('')
    }
  };
  const handleStateChange = (event) => {
    let id = event.target.value;
    setSelectedStateOption(id)
    if (id !== '') {
      setIsCityDisabled(false)
      handleGetCities(id)
        .then(res => {
          setCities(res.data.data)
        })
        .catch((err) => console.log("err", err));
    } else {
      setIsCityDisabled(true)
      setSelectedStateOption('')
      setSelectedCityOption('')
    }
  };
  const handleCityChange = (event) => {
    let id = event.target.value;
    setSelectedCityOption(id)
  };
    
  const initialValues = {
    name: editDetails?.vendorDetails?.name || "",
    email: editDetails?.vendorDetails?.email || "",
    mobile: editDetails?.vendorDetails?.mobile || "",
    organization_name: editDetails?.vendorDetails?.organization_name || "",
    image: editDetails?.vendorDetails?.new_profile_image || "",
    logo: editDetails?.logo,
    ptr_track: editDetails?.ptr_track,
    address: editDetails?.vendorDetails?.address || "",
    website: editDetails?.vendorDetails?.website || "",
    postal_code: editDetails?.vendorDetails?.postal_code || "",
    about_vendor_company: editDetails?.companyDetails?.profile || "",
    nature_business: editDetails?.companyDetails?.nature_of_business || "",
    estd_year: editDetails?.companyDetails?.established_year || "",
    sales_spoc_name: editDetails?.companyDetails?.spoc_name || "",
    sales_spoc_position: editDetails?.companyDetails?.spoc_role || "",
    sales_spoc_business_email: editDetails?.companyDetails?.spoc_email || "",
    sales_spoc_mobile: editDetails?.companyDetails?.spoc_mobile || "",
    gstin: editDetails?.companyDetails?.gstin || "",
    import_export_code: editDetails?.companyDetails?.import_export_code || "",
    cin: editDetails?.companyDetails?.cin || "",
    turn_over: editDetails?.companyDetails?.turnover || "",
    total_employees: editDetails?.companyDetails?.no_of_employess || "",
    ptr_project_name: editDetails?.companyDetails?.project_name || "",
    ptr_project_description: editDetails?.companyDetails?.project_description || "",
    ptr_project_start_date: editDetails?.companyDetails?.project_start_date || "",
    ptr_project_end_date: editDetails?.companyDetails?.project_end_date || ""
  };
  useEffect(() => {
    if (id) {
      handleGetVendorEditDetails(id)
        .then(res => {
          console.log("edit details data..", res.data)
          seteditDetails(res.data)
          if(editDetails?.vendorDetails?.city){
            setIsCityDisabled(false)
          }else{
            setIsCityDisabled(true)
          }
          setIsStateDisabled(false)
          setSelectedCountryOption(editDetails?.vendorDetails?.country)
          setSelectedStateOption(editDetails?.vendorDetails?.state)
          setSelectedCityOption(editDetails?.vendorDetails?.city)
        })
        .catch((err) => console.log("err", err));

      handleGetCities(editDetails?.vendorDetails?.state)
        .then(res => {
          setCities(res.data.data)
        })
        .catch((err) => console.log("err", err));
    }
  }, [id, editDetails?.vendorDetails?.country, editDetails?.vendorDetails?.state, editDetails?.vendorDetails?.city])

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Update Vendor</h5>
            </ol>
          </div>
          <div class="card col-12">
            <div class="card-body mt-3">
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={yup.object().shape({
                  name: yup.string().required("Name is required"),
                  organization_name: yup
                    .string()
                    .required("Organization is required"),
                  email: yup
                    .string()
                    .email()
                    .matches(
                      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                      "please enter valid email address"
                    )
                    .required("email is required"),
                  mobile: yup
                    .string()
                    .matches(
                      /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                      "please enter valid mobile number"
                    )
                    .min(10)
                    .max(11)
                    .required("mobile is required"),
                })}
                onSubmit={(values, { resetForm }) => {
                  values.country =  selectedCountryOption || editDetails?.vendorDetails?.country;
                  values.state = selectedStateOption || editDetails?.vendorDetails?.state;
                  values.city = selectedCityOption || editDetails?.vendorDetails?.city; 
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => (
                  <Form>

                    {editDetails && <div className="row form-common-row mb-4">
                      <div className="col-6">
                        <label htmlFor="Organization-Address">Name</label>
                        <Field
                          type="text"
                          name="name"
                          className="form-control"
                          placeholder="Name"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div className="col-6">
                        <label htmlFor="Organization-Address">Email</label>
                        <Field
                          type="email"
                          name="email"
                          className="form-control"
                          placeholder="Email"
                        />
                        <ErrorMessage
                          name="email"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="Organization-Address">Mobile</label>
                        <Field
                          type="number"
                          name="mobile"
                          class="form-control"
                          placeholder="Mobile"
                        />
                        <ErrorMessage
                          name="mobile"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="organization-name">
                          Organization
                        </label>
                        <Field
                          type="text"
                          name="organization_name"
                          class="form-control"
                          placeholder="Organization"
                        />
                        <ErrorMessage
                          name="organization_name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="image">Image</label>
                        <Field
                          name="image"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("image", files);
                          }}
                        />
                        {editDetails?.vendorDetails?.new_profile_image != null && (
                          <div className="mt-3" style={{ display: "flex" }}>
                            <label htmlFor="year">
                              Prefilled Image -&nbsp;{" "}
                            </label>
                            <p htmlFor="year">
                             <Image
                                width={30}
                                height={30}
                                src={
                                  editDetails?.vendorDetails?.new_profile_image == null
                                    ? img1
                                    : editDetails?.vendorDetails?.new_profile_image
                                }
                                unoptimized
                                className="rounded prof-img"
                                alt="..."
                              />
                            </p>
                          </div>
                        )}
                        <ErrorMessage
                          name="image"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="logo">Logo</label>
                        <Field
                          name="logo"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("logo", files);
                          }}
                        />
                        {editDetails?.companyDetails?.logo != null && (
                          <div className="mt-3" style={{ display: "flex" }}>
                            <label htmlFor="year">
                              Prefilled Image -&nbsp;{" "}
                            </label>
                            <p htmlFor="year">
                             <Image
                                width={30}
                                height={30}
                                src={
                                  editDetails?.companyDetails?.logo == null
                                    ? img1
                                    : editDetails?.companyDetails?.logo
                                }
                                unoptimized
                                className="rounded prof-img"
                                alt="..."
                              />
                            </p>
                          </div>
                        )}
                        <ErrorMessage
                          name="logo"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Address</label>
                        <Field
                          type="text"
                          name="address"
                          class="form-control"
                          placeholder="Address"
                        />
                        <ErrorMessage
                          name="about_vendor"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendor">About Vendor</label>
                        <Field
                          name="about_vendor_company"
                          as="textarea"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="about_vendor_company"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Postal Code</label>
                        <Field
                          type="number"
                          name="postal_code"
                          class="form-control"
                          placeholder="Postal code"
                        />
                        <ErrorMessage
                          name="postal_code"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-4">
                        <label htmlFor="city">Country</label>
                        <Field
                          onChange={handleCountryChange}
                          value={selectedCountryOption}
                          as="select" className="form-control" name="country">
                          <option value="">Select</option>
                          <option value="1">India</option>
                        </Field>
                      </div>
                      <div class="col-4">
                        <label htmlFor="state">State</label>
                        <Field
                          value={selectedStateOption}
                          onChange={handleStateChange}
                          disabled={isStateDisabled}
                          as="select" className="form-control" name="state">
                          <option value="">Select</option>
                          {states.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.state_name}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div class="col-4">
                        <label htmlFor="city">City</label>
                        <Field
                          value={selectedCityOption}
                          onChange={handleCityChange}
                          disabled={isCityDisabled}
                          as="select" className="form-control" name="city">
                          <option value="">Select</option>
                          {cities?.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.city_name}
                            </option>
                          ))}
                        </Field>
                      </div>
                      <div class="col-6">
                        <label htmlFor="website">Website</label>
                        <Field
                          type="text"
                          name="website"
                          class="form-control"
                          placeholder="Website"
                        />
                        <ErrorMessage
                          name="postal_code"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="nature_of_business">Nature of Business</label>
                        <Field
                          type="text"
                          name="nature_business"
                          class="form-control"
                          placeholder="Ex. Manufacturer, Dealer, Trader"
                        />
                        <ErrorMessage
                          name="nature_business"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Estd year</label>
                        <Field
                          type="number"
                          name="estd_year"
                          class="form-control"
                          placeholder="Estd year"
                        />
                        <ErrorMessage
                          name="estd_year"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Sales Spoc Name</label>
                        <Field
                          type="text"
                          name="sales_spoc_name"
                          class="form-control"
                          placeholder="Sales SPOC Name"
                        />
                        <ErrorMessage
                          name="sales_spoc_name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Sales Spoc position</label>
                        <Field
                          type="text"
                          name="sales_spoc_position"
                          class="form-control"
                          placeholder="Sales SPOC Position"
                        />
                        <ErrorMessage
                          name="sales_spoc_position"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">Sales Spoc Business Email</label>
                        <Field
                          type="email"
                          name="sales_spoc_business_email"
                          class="form-control"
                          placeholder="Sales spoc business email"
                        />
                        <ErrorMessage
                          name="sales_spoc_business_email"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="sales_spoc_mobile">Sales Spoc Mobile</label>
                        <Field
                          type="number"
                          name="sales_spoc_mobile"
                          class="form-control"
                          placeholder="Sales spoc mobile"
                        />
                        <ErrorMessage
                          name="sales_spoc_mobile"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="gstin">Gstin</label>
                        <Field
                          type="text"
                          name="gstin"
                          class="form-control"
                          placeholder="gstin"
                        />
                        <ErrorMessage
                          name="gstin"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="import_export_code">Import Export Code</label>
                        <Field
                          type="number"
                          name="import_export_code"
                          class="form-control"
                          placeholder="Import export code"
                        />
                        <ErrorMessage
                          name="import_export_code"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">CIN</label>
                        <Field
                          type="text"
                          name="cin"
                          class="form-control"
                          placeholder="cin"
                        />
                        <ErrorMessage
                          name="cin"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="turn_over">Turn Over</label>
                        <Field
                          type="text"
                          name="turn_over"
                          class="form-control"
                          placeholder="Ex. 50 cr"
                        />
                        <ErrorMessage
                          name="turn_over"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="total_employes">Total Employees</label>
                        <Field
                          type="number"
                          name="total_employees"
                          class="form-control"
                          placeholder="Total employes"
                        />
                        <ErrorMessage
                          name="total_employees"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="ptr">PTR</label>
                        <Field
                          name="ptr_track"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("ptr_track", files);
                          }}
                        />
                        {editDetails?.files && editDetails?.files.length != 0 
                          && editDetails?.files.map((data) =>(
                            (data.doc_type == 'ptr' && <span><a href={data.file_path} target="_blank">
                              <i class="fa fa-file"></i> {data.file_name}
                            </a></span>)
                            ))
                          }
                      </div>
                      <div class="col-6">
                        <label htmlFor="total_employes">Ptr Project Name</label>
                        <Field
                          type="text"
                          name="ptr_project_name"
                          class="form-control"
                          placeholder="Ptr project name"
                        />
                        <ErrorMessage
                          name="ptr_project_name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="about-vendro">PTR Project Description</label>
                        <Field
                          name="ptr_project_description"
                          as="textarea"
                          className="form-control"
                        />
                        <ErrorMessage
                          name="ptr_project_description"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="gstin">Ptr Project Start Date</label>
                        <Field
                          type="date"
                          name="ptr_project_start_date"
                          class="form-control"
                          placeholder="ptr_project_start_date"
                        />
                        <ErrorMessage
                          name="ptr_project_start_date"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="gstin">Ptr Project End Date</label>
                        <Field
                          type="date"
                          name="ptr_project_end_date"
                          class="form-control"
                          placeholder="ptr_project_end_date"
                        />
                        <ErrorMessage
                          name="ptr_project_end_date"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div>
                      <div class="col-6">
                        <label htmlFor="certifications">Certification</label>
                        <Field
                          name="certifications"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("certifications", files);
                          }}
                        />
                        {editDetails?.files && editDetails?.files.length != 0 
                          && editDetails?.files.map((data) =>(
                            (data.doc_type == 'crt' && <span><a href={data.file_path} target="_blank">
                              <i class="fa fa-file"></i> {data.file_name}
                            </a></span>)
                            ))
                          } 
                        </div>
                      <div class="col-6">
                        <label htmlFor="brochure">Brochure</label>
                        <Field
                          name="brochure"
                          type="file"
                          value={undefined}
                          className="form-control"
                          onChange={(event) => {
                            let files = event.target.files[0];
                            setFieldValue("brochure", files);
                          }}
                        />
                        {editDetails?.files && editDetails?.files.length != 0 
                          && editDetails?.files.map((data) =>(
                            (data.doc_type == 'brochure' && <span><a href={data.file_path} target="_blank">
                              <i class="fa fa-file"></i> {data.file_name}
                            </a></span>)
                            ))
                          } 
                      </div>
                    </div>}
                    <div className="d-flex justify-content-end">
                      <button type="submit" class="btn btn-secondary">
                        Save
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>
        </div>

        <ToastContainer />
      </section>
    </>
  );
};

export default UpdateVendor;
