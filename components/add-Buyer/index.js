"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { RegisterCompanyByAdmin } from "@/utils/services/buyer-management";
import { getCountryCodes } from "@/utils/services/location-management";
import Image from "next/image";

// Function to generate a default password if none is provided
const generatePassword = (orgName, mobile) => {
  if (!orgName || !mobile) return "Default@123"; // Fallback password

  const specialChars = "!@#$%^&*";
  const randomSpecialChar =
    specialChars[Math.floor(Math.random() * specialChars.length)];

  const orgPart = orgName.replace(/\s+/g, "").substring(0, 4).toLowerCase();
  const mobilePart = mobile.slice(-4);

  // Generate one random uppercase letter
  const randomUpperChar = String.fromCharCode(65 + Math.floor(Math.random() * 26));

  return `${randomUpperChar}${orgPart}${randomSpecialChar}${mobilePart}`;
};

export default function AddBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState(""); // To store password
  const [apiError, setApiError] = useState(null);
  const [countryCode, setCountryCode] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    fetchCountryCodes();
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

  // Initial form values
  const initialValues = {
    countryCode:"+91",
    name: "",
    email: "",
    mobile: "",
    organization_name: "",
    register_as: "7",
    password: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    postal_code: "",
    gstin: "",
    cin: "",
    profile: null, // Changed to null for file upload
    nature_of_business: "",
    type_of_business: "Private Limited",
    turnover: "",
    no_of_employess: "",
    import_export_code: "",
    established_year: "",
    website: "",
    max_top_management: 2,
    max_procurement: 5,
    max_engineering: 15,
    max_finance: 3
  };

  // Validation schema using Yup
  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    countryCode: yup.string().required("Country code is required"),
    mobile: yup.string().matches(/^\d{7,15}$/, "Please enter a valid mobile number").required("Mobile is required"),
    organization_name: yup.string().required("Organization name is required"),
    password: yup.string(),
    address: yup.string().required("Address is required"),
    country: yup.string().required("Country is required"),
    gstin: yup.string(),
    cin: yup.string(),
    profile: yup.mixed().nullable(), // Made optional
    nature_of_business: yup.string().required("Nature of business is required"),
    type_of_business: yup.string().required("Type of business is required"),
    website: yup.string().url("Enter a valid website URL").nullable(),
    max_top_management: yup.number().min(1, "At least 1 top management user allowed").required("Required"),
    max_procurement: yup.number().min(1, "At least 1 procurement user allowed").required("Required"),
    max_engineering: yup.number().min(1, "At least 1 engineering user allowed").required("Required"),
    max_finance: yup.number().min(1, "At least 1 finance user allowed").required("Required")
  });

  // Changes by Agnij 2025-06-22 [Added profile image upload functionality to save to S3]
  const handleProfileChange = (event, setFieldValue) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setFieldValue("profile", file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Form submission handler
  const submitHandler = async (values, { resetForm }) => {
    setLoading(true);

    // Concatenate country code and mobile number
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
    
    // Generate password if not provided
    const password = values.password.trim() || generatePassword(values.organization_name, values.mobile);
    setGeneratedPassword(password);

    // Create FormData for file upload
    const formData = new FormData();
    
    // Add all text fields to FormData
    formData.append("name", values.name.trim());
    formData.append("email", values.email.trim());
    formData.append("mobile", fullMobile);
    formData.append("organization_name", values.organization_name.trim());
    formData.append("user_type", 7); // As per API specification
    formData.append("password", password);
    formData.append("address", values.address.trim());
    formData.append("created_by", 1); // Default admin value
    formData.append("country", values.country.trim());
    
    if (values.state.trim()) formData.append("state", values.state.trim());
    if (values.city.trim()) formData.append("city", values.city.trim());
    if (values.postal_code.trim()) formData.append("postal_code", values.postal_code.trim());
    if (values.gstin.trim()) formData.append("gstin", values.gstin.trim());
    if (values.cin.trim()) formData.append("cin", values.cin.trim());
    // Changes by Agnij 2025-05-27 [Made profile image optional - only append if file exists]
    if (values.profile && values.profile instanceof File) formData.append("profile", values.profile);
    formData.append("token", "abcdef123456"); // Default token
    
    formData.append("nature_of_business", values.nature_of_business.trim());
    formData.append("type_of_business", values.type_of_business.trim());
    if (values.turnover.trim()) formData.append("turnover", values.turnover.trim());
    if (values.no_of_employess) formData.append("no_of_employess", parseInt(values.no_of_employess) || 0);
    if (values.import_export_code.trim()) formData.append("import_export_code", values.import_export_code.trim());
    if (values.established_year.trim()) formData.append("established_year", values.established_year.trim());
    if (values.website.trim()) formData.append("website", values.website.trim());
    
    formData.append("max_top_management", parseInt(values.max_top_management));
    formData.append("max_procurement", parseInt(values.max_procurement));
    formData.append("max_engineering", parseInt(values.max_engineering));
    formData.append("max_finance", parseInt(values.max_finance));

    await RegisterCompanyByAdmin(formData)
      .then((response) => {
        toast.success("Company registered successfully!");
        console.log("API Response:", response);
        router.push("/buyer-management"); // Redirect to buyer list page
      })
      .catch((error) => {
        console.error("Error Registering Company:", error);
        setApiError(error?.message?.response?.data?.errors || "Registration failed");
        toast.error("Failed to register company. Please try again.");
      });

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Add New Buyer</h2>
      <div className="card p-4 shadow-sm">
        {apiError && (
          <div
            style={{
              color: "red",
              fontWeight: "bold",
              borderBottom: "2px solid red",
              margin: "15px",
            }}
          >
            <h2> Failed To Add Buyer </h2>
            <ol>
              {Object.values(apiError).map((error, index) => (
                <li className="mb-0" key={index}>
                  {error}
                </li>
              ))}
            </ol>
          </div>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={submitHandler}
        >
          {({ values, setFieldValue }) => (
            <Form>
              {/* Basic Information Section */}
              <h4 className="mb-3">Basic Information</h4>
              
              {/* Name Field */}
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <Field type="email" name="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </div>

              {/* Mobile Field with Country Code */}
              <div className="mb-3">
                <label className="form-label">Mobile *</label>
                <div className="d-flex">
                  {/* Country Code Dropdown */}
                  <Field as="select" name="countryCode" className="form-select me-2" style={{ width: "30%", maxWidth: "160px" }}>
                    {countryCode.map((item) => (
                      <option key={item.id} value={item.phone_code}>
                        {item.country_code} ({item.phone_code})
                      </option>
                    ))}
                  </Field>

                  {/* Mobile Number Input */}
                  <Field type="text" name="mobile" className="form-control" style={{ flex: "1" }} />
                </div>
                <ErrorMessage name="mobile" component="div" className="text-danger" />
              </div>

              {/* Password Field */}
              <div className="mb-3">
                <label className="form-label">Password</label>
                <Field type="text" name="password" className="form-control" value={values.password || generatedPassword} />
                <small className="text-muted">Leave blank to use auto generated password.</small>
              </div>

              {/* Company Information Section */}
              <h4 className="mt-4 mb-3">Company Information</h4>
              
              {/* Organization Name Field */}
              <div className="mb-3">
                <label className="form-label">Organization Name *</label>
                <Field type="text" name="organization_name" className="form-control" />
                <ErrorMessage name="organization_name" component="div" className="text-danger" />
              </div>

              {/* Address Field */}
              <div className="mb-3">
                <label className="form-label">Address *</label>
                <Field type="text" name="address" className="form-control" />
                <ErrorMessage name="address" component="div" className="text-danger" />
              </div>

              {/* Country, State, City Fields in a row */}
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Country *</label>
                  <Field type="text" name="country" className="form-control" />
                  <ErrorMessage name="country" component="div" className="text-danger" />
                </div>
                <div className="col">
                  <label className="form-label">State</label>
                  <Field type="text" name="state" className="form-control" />
                </div>
                <div className="col">
                  <label className="form-label">City</label>
                  <Field type="text" name="city" className="form-control" />
                </div>
              </div>

              {/* Postal Code Field */}
              <div className="mb-3">
                <label className="form-label">Postal Code</label>
                <Field type="text" name="postal_code" className="form-control" />
              </div>

              {/* Business Details */}
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">GSTIN</label>
                  <Field type="text" name="gstin" className="form-control" />
                </div>
                <div className="col">
                  <label className="form-label">CIN</label>
                  <Field type="text" name="cin" className="form-control" />
                </div>
              </div>

              {/* Company Profile Image Upload */}
              <div className="mb-3">
                <label className="form-label">Company Profile Image (Optional)</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(event) => handleProfileChange(event, setFieldValue)}
                />
                {profilePreview && (
                  <div className="mt-2">
                    <Image
                      src={profilePreview}
                      width={100}
                      height={100}
                      className="img-thumbnail"
                      alt="Profile Preview"
                    />
                  </div>
                )}
              </div>

              {/* Business Details */}
              <h4 className="mt-4 mb-3">Business Details</h4>
              
              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Nature of Business *</label>
                  <Field type="text" name="nature_of_business" className="form-control" />
                  <ErrorMessage name="nature_of_business" component="div" className="text-danger" />
                </div>
                <div className="col">
                  <label className="form-label">Type of Business *</label>
                  <Field as="select" name="type_of_business" className="form-select">
                    <option value="Private Limited">Private Limited</option>
                    <option value="Public Limited">Public Limited</option>
                    <option value="Proprietorship">Proprietorship</option>
                    <option value="Partnership">Partnership</option>
                    <option value="LLP">LLP</option>
                    <option value="Other">Other</option>
                  </Field>
                  <ErrorMessage name="type_of_business" component="div" className="text-danger" />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Turnover</label>
                  <Field type="text" name="turnover" className="form-control" />
                </div>
                <div className="col">
                  <label className="form-label">Number of Employees</label>
                  <Field type="number" name="no_of_employess" className="form-control" />
                </div>
              </div>

              <div className="row mb-3">
                <div className="col">
                  <label className="form-label">Import/Export Code</label>
                  <Field type="text" name="import_export_code" className="form-control" />
                </div>
                <div className="col">
                  <label className="form-label">Established Year</label>
                  <Field type="text" name="established_year" className="form-control" />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Website</label>
                <Field type="text" name="website" className="form-control" />
                <ErrorMessage name="website" component="div" className="text-danger" />
              </div>

              {/* Account Limits */}
              <h4 className="mt-4 mb-3">Account Limits</h4>
              
              <div className="row mb-3">
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Max Top Management *</label>
                  <Field type="number" name="max_top_management" className="form-control" />
                  <ErrorMessage name="max_top_management" component="div" className="text-danger" />
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Max Procurement *</label>
                  <Field type="number" name="max_procurement" className="form-control" />
                  <ErrorMessage name="max_procurement" component="div" className="text-danger" />
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Max Engineering *</label>
                  <Field type="number" name="max_engineering" className="form-control" />
                  <ErrorMessage name="max_engineering" component="div" className="text-danger" />
                </div>
                <div className="col-md-6 col-lg-3">
                  <label className="form-label">Max Finance *</label>
                  <Field type="number" name="max_finance" className="form-control" />
                  <ErrorMessage name="max_finance" component="div" className="text-danger" />
                </div>
              </div>

              {/* Submit Button with Loader */}
              <div className="d-grid mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Adding Buyer...
                    </>
                  ) : (
                    "Add Buyer"
                  )}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>

      <ToastContainer />
    </div>
  );
}
