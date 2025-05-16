import React, { useState, useEffect } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
import * as yup from "yup";
import {
  handleAddVendor,
  handleGetStates,
  handleGetCities,
} from "@/utils/services/vendor-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { getCountries ,getCountryCodes } from "@/utils/services/location-management";
import Select from "react-select";

const AddVendor = () => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [spocs, setSpocs] = useState([]);
  const [selectedCountryOption, setSelectedCountryOption] = useState("");
  const [selectedStateOption, setSelectedStateOption] = useState("");
  const [selectedCityOption, setSelectedCityOption] = useState("");
  const [isStateDisabled, setIsStateDisabled] = useState(true);
  const [isCityDisabled, setIsCityDisabled] = useState(true);
  const [countryList,setCountryList] = useState([]);
  const[countryCode , setCountryCode] = useState([]);
  
  const router = useRouter();

  	const businessOptions = [
      {value : "Authorised Distributor", label : "Authorised Distributor"},
      {value : "Authorised Dealer", label : "Authorised Dealer"},
      {value : "Branch", label : "Branch"},
      {value : "Channel Partner", label : "Channel Partner"},
      {value : "Distributor", label : "Distributor"},
      {value : "Constructor", label : "Constructor"},
      {value : "Contractor", label : "Contractor"},
      {value : "Dealer", label: "Dealer" },
      {value : "Designer", label : "Designer"},
      {value : "Exporter", label : "Exporter"},
      {value : "Importer", label : "Importer"},
      {value : 'Manufacturer', label: 'Manufacturer' },
      {value : "OEM (Original EquipmentManufacturer)", label : "OEM (Original EquipmentManufacturer)"},
      {value : "Official Distributor", label : "Official Distributor"},
      {Value : "Partner", label : "Partner"},
      {value : "Retailer", label : "Retailer"},
      {value : "Service Provider", label : "Service Provider"},
      {value : "Supplier", label : "Supplier"},
      {value : "Stockist", label : "Stockist"},
      {value : "Trader", label : "Trader"},
      { value: 'Wholesaler', label: 'Wholesaler' } 
];

  const submitHandler = (values, resetForm) => {
    const orgName = values.organization_name;
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;

   values.spocs.forEach((spoc) => {
     const rawMobile = spoc.spoc_mobile || "";

     // Remove any existing country code or prefix like "+91-", "undefined-", etc.
     const sanitizedMobile = rawMobile
       .replace(/^\+?\w*-/, "")
       .trim()
       .replace(/^0+/, "");

     const countryCode = spoc.country_code || "+91"; // fallback if undefined

     spoc.spoc_mobile = `${countryCode}-${sanitizedMobile}`;
     delete spoc.country_code;
   });

   
    

    const { countryCode, ...updatedValues } = { 
      ...values, 
      mobile: fullMobile,
      name:orgName
    };

   
   
    handleAddVendor(updatedValues )
      .then((res) => {
        resetForm();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((err) => {
        // console.log("err", err);
        // console.error(error.response.data.errors.message);
        let errorFlag = true;
        for (let x in err?.error?.response?.data?.errors) {
          toast.error(err?.error?.response?.data?.errors[x] || "Something went wrong");
          errorFlag = false;
        }

        if (errorFlag){
          toast.error("Something went wrong");
        }

      });
  };
 
  useEffect(() => {
    if (selectedCountryOption) {
      handleGetStates(selectedCountryOption)
        .then((res) => {
          setStates(res.data.data); // Populate the states list
        })
        .catch((err) => console.log("Error fetching states:", err));
    } else {
      setStates([]); // Clear states if no country is selected
    }
  }, [selectedCountryOption]);
  

useEffect(() => {
  fetchCountryCodes()
  getCountries()
  .then((res) => {
       setCountryList(res.data) // Set country list state
    })
    .catch((err) => console.error("Error fetching countries:", err));
}, []);

 const fetchCountryCodes = () => {
    getCountryCodes()
      .then((response) => {
        if (response?.data) {
          setCountryCode(response.data);
        } else {
          setCountryCode([]);
        }
      })
      .catch((error) => {
        console.log("Error fetching countries:", error);
        setCountryCode([]);
      });
  };

const handleCountryChange = (event) => {
  const selectedCountry = event.target.value;
  setSelectedCountryOption(selectedCountry);

  if (selectedCountry !== "") {
    setIsStateDisabled(false); // Enable the state dropdown

    // Fetch states for the selected country
    handleGetStates(selectedCountry)
      .then((res) => {
        setStates(res.data.data); // Populate the states list
        setIsCityDisabled(true);  // Disable city dropdown until a state is selected
        setSelectedStateOption(""); // Clear any previously selected state
        setSelectedCityOption(""); // Clear any previously selected city
      })
      .catch((err) => console.log("Error fetching states:", err));
  } else {
    // Reset all selections if no country is selected
    setIsStateDisabled(true);
    setIsCityDisabled(true);
    setSelectedCountryOption("");
    setSelectedStateOption("");
    setSelectedCityOption("");
    setStates([]); // Clear the state list
  }
};

  const handleStateChange = (event) => {
    let id = event.target.value;
    setSelectedStateOption(id);
    if (id !== "") {
      setIsCityDisabled(false);
      handleGetCities(id)
        .then((res) => {
          setCities(res.data.data);
        })
        .catch((err) => console.log("err", err));
    } else {
      setIsCityDisabled(true);
      setSelectedStateOption("");
      setSelectedCityOption("");
    }
  };
  const handleCityChange = (event) => {
    let id = event.target.value;
    setSelectedCityOption(id);
  };
  const initialValues = {
    countryCode: "+91",
    name: "",
    organization_name: "",
    email: "",
    mobile: "",
    image: "",
    logo: "",
    ptr_track: "",
    certifications: "",
    brochure: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    postal_code: "",
    about_vendor_company: "",
    // contact_number: "",
    nature_business: "",
    estd_year: "",
    gstin: "",
    import_export_code: "",
    cin: "",
    turn_over: "",
    total_employees: "",
    ptr_project_name: "",
    ptr_project_description: "",
    ptr_project_start_date: "",
    ptr_project_end_date: "",
    spocs: [],
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Add Vendor</h5>
            </ol>
          </div>
          <div class="card col-12">
            <div class="card-body mt-3">
              <Formik
                initialValues={initialValues}
                validationSchema={yup.object().shape({
                  // name: yup.string().required("Name is required"),
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
                      /^[\+]?[0-9]{6,15}$/,
                      "Please enter a valid mobile number (6-15 digits)"
                    )
                    .required("mobile is required"),
                })}
                onSubmit={(values, { resetForm }) => {
                  values.country = selectedCountryOption;
                  values.state = selectedStateOption;
                  values.city = selectedCityOption;
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue }) => {
                  return (
                    <Form>
                      <div class="row form-common-row mb-4">
                        {/* <div class="col-6">
                        <label htmlFor="name">Name</label>
                        <Field
                          type="text"
                          name="name"
                          class="form-control"
                          placeholder="Name"
                        />
                        <ErrorMessage
                          name="name"
                          render={(msg) => (
                            <div className="form-error">{msg}</div>
                          )}
                        />
                      </div> */}
                        <div class="col-6">
                          <label htmlFor="organization_Name">
                            Organization Name
                          </label>
                          <Field
                            type="text"
                            name="organization_name"
                            class="form-control"
                            placeholder="Organization Name"
                          />
                          <ErrorMessage
                            name="organization_name"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div class="col-6">
                          <label htmlFor="email">Email</label>
                          <Field
                            type="email"
                            name="email"
                            class="form-control"
                            placeholder="Email"
                          />
                          <ErrorMessage
                            name="email"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile *</label>
                          <div
                            className="d-flex"
                            style={{ width: "30%", maxWidth: "800px" }}
                          >
                            {/* Country Code Dropdown */}
                            <Field
                              as="select"
                              name="countryCode"
                              className="form-select me-2"
                              style={{ width: "40%", maxWidth: "160px" }}
                            >
                              {" "}
                              <option value="+91">IN (+91)</option>{" "}
                              {/* Default selected */}
                              {countryCode.map((item) => (
                                <option key={item.id} value={item.phone_code}>
                                  {item.country_code} ({item.phone_code})
                                </option>
                              ))}
                            </Field>

                            {/* Mobile Number Input */}
                            <Field
                              type="text"
                              name="mobile"
                              className="form-control"
                              style={{ flex: "1" }}
                              placeholder="Mobile"
                            />
                          </div>
                          <ErrorMessage
                            name="mobile"
                            component="div"
                            className="text-danger"
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
                          <ErrorMessage
                            name="logo"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div class="col-6">
                          <label htmlFor="address">Address</label>
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
                          <label htmlFor="about-vendro">About Vendor</label>
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
                            type="string"
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
                            as="select"
                            className="form-control"
                            name="country"
                          >
                            <option value="">Select</option>
                            {countryList?.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.country_name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div class="col-4">
                          <label htmlFor="state">State</label>
                          <Field
                            value={selectedStateOption}
                            onChange={handleStateChange}
                            disabled={isStateDisabled}
                            as="select"
                            className="form-control"
                            name="state"
                          >
                            <option value="">Select</option>
                            {states.map((option) => (
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
                            as="select"
                            className="form-control"
                            name="city"
                          >
                            <option value="">Select</option>
                            {cities.map((option) => (
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
                        <div className="col-6">
                          <label htmlFor="nature_business">
                            Nature of Business
                          </label>
                          <Field name="nature_business">
                            {({ field, form }) => (
                              <Select
                                isMulti
                                // name="nature_business"
                                options={businessOptions}
                                value={
                                  field.value
                                    ? businessOptions.filter((option) =>
                                        field.value
                                          .split(",")
                                          .includes(option.value)
                                      )
                                    : []
                                }
                                onChange={(selectedOptions) => {
                                  const values = selectedOptions
                                    .map((opt) => opt.value)
                                    .join(",");
                                  form.setFieldValue(
                                    "nature_business",
                                    values
                                  );
                                }}
                                onBlur={() =>
                                  form.setFieldTouched(
                                    "nature_business",
                                    true
                                  )
                                }
                                placeholder="Select Nature of Business"
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="nature_business"
                            component="div"
                            className="form-error"
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
                          <label htmlFor="import_export_code">
                            Import Export Code
                          </label>
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
                          <label htmlFor="total_employes">
                            Total Employees
                          </label>
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
                          <ErrorMessage
                            name="ptr_track"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div class="col-6">
                          <label htmlFor="ptr_project_name">
                            Ptr Project Name
                          </label>
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
                          <label htmlFor="about-vendro">
                            PTR Project Description
                          </label>
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
                          <ErrorMessage
                            name="certification"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
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
                          <ErrorMessage
                            name="brochure"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        {/* SPOC Section */}
                        <div className="mt-4">
                          <h5>Vendor SPOCs</h5>
                          <FieldArray
                            name="spocs"
                            render={(arrayHelpers) => (
                              <>
                                {values.spocs.map((spoc, index) => (
                                  <div key={index} className="row mb-3">
                                    <div className="col-3">
                                      <label>Name</label>
                                      <Field
                                        type="text"
                                        name={`spocs[${index}].spoc_name`}
                                        className="form-control"
                                        placeholder="Name"
                                      />
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_name`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>
                                    <div className="col-3">
                                      <label>Email</label>
                                      <Field
                                        type="email"
                                        name={`spocs[${index}].spoc_email`}
                                        className="form-control"
                                        placeholder="Email"
                                      />
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_email`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>
                                    <div className="col-3">
                                      <label>Mobile</label>
                                      <div className="input-group">
                                        {/* Country Code Dropdown - Fixed with proper field name */}
                                        <Field
                                          as="select"
                                          name={`spocs[${index}].country_code`}
                                          className="form-select"
                                          style={{
                                            maxWidth: "120px",
                                            marginRight: "10px",
                                          }}
                                        >
                                          {countryCode.map((item) => (
                                            <option
                                              key={item.id}
                                              value={item.phone_code}
                                            >
                                              {item.country_code} (
                                              {item.phone_code})
                                            </option>
                                          ))}
                                        </Field>

                                        {/* Mobile Number Input */}
                                        {/* <Field
                                        type="text"
                                        name={`spocs[${index}].spoc_mobile`}
                                        className="form-control"
                                        placeholder="Mobile"
                                      /> */}
                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Mobile"
                                          value={
                                            values.spocs[
                                              index
                                            ].spoc_mobile?.replace(
                                              /^\+?\w*-/,
                                              ""
                                            ) || ""
                                          }
                                          onChange={(e) =>
                                            setFieldValue(
                                              `spocs[${index}].spoc_mobile`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_mobile`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>

                                    <div className="col-2">
                                      <label>Position</label>
                                      <Field
                                        type="text"
                                        name={`spocs[${index}].spoc_role`}
                                        className="form-control"
                                        placeholder="Position"
                                      />
                                    </div>
                                    <div className="col-1 d-flex align-items-end mb-2">
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    arrayHelpers.push({
                                      spoc_name: "",
                                      spoc_role: "",
                                      spoc_email: "",
                                      spoc_mobile: "",
                                      country_code: "+91", // Default value set here
                                    })
                                  }
                                >
                                  Add SPOC
                                </button>
                              </>
                            )}
                          />
                        </div>
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button type="submit" className="btn btn-secondary">
                          Save
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
        <ToastContainer />
      </section>
    </>
  );
};

export default AddVendor;
