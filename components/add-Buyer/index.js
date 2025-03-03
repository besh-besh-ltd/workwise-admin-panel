"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { AddBuyerOnPortalByAdmin } from "@/utils/services/buyer-management";
import { getCountryCodes } from "@/utils/services/location-management";

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
    countryCode: "+91", // Default to +91 or any appropriate value
    mobile: "",
    organization_name: "",
    register_as: "2",
    password: "",
  };

  // Validation schema using Yup
  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email format").required("Email is required"),
    countryCode: yup.string().required("Country code is required"),
    mobile: yup.string().matches(/^\d{7,15}$/, "Please enter a valid mobile number").required("Mobile is required"),
    organization_name: yup.string().required("Organization is required"),
    register_as: yup.string().required("Registration type is required"),
  });

  // Form submission handler
  const submitHandler = async (values, { resetForm }) => {
    setLoading(true);

    // Concatenate country code and mobile number
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;

    // Trim all input fields
    const trimmedValues = {
      name: values.name.trim(),
      email: values.email.trim(),
      mobile: fullMobile, // Use concatenated mobile number
      organization_name: values.organization_name.trim(),
      register_as: values.register_as.trim(),
      password: values.password.trim(),
    };

    // Generate password only if not provided
    if (!trimmedValues.password) {
      trimmedValues.password = generatePassword(
        trimmedValues.organization_name,
        trimmedValues.mobile
      );
      setGeneratedPassword(trimmedValues.password);
    }

    // API requires confirm_password
    trimmedValues.confirm_password = trimmedValues.password;

    console.log("Submitting values:", trimmedValues);
    await AddBuyerOnPortalByAdmin(trimmedValues)
      .then((response) => {
        toast.success("Buyer added successfully!");
        console.log("API Response:", response);
        router.push("/buyer-management"); // Redirect to buyer list page
      })
      .catch((error) => {
        console.error("Error Adding Buyer:", error);
        setApiError(error?.message?.response?.data?.errors || "Registration failed");
        toast.error("Failed to add buyer. Please try again.");
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
              {/* Name Field */}
              <div className="mb-3">
                <label className="form-label">Name *</label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage
                  name="name"
                  component="div"
                  className="text-danger"
                />
              </div>

              {/* Email Field */}
              <div className="mb-3">
                <label className="form-label">Email *</label>
                <Field type="email" name="email" className="form-control" />
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-danger"
                />
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

              {/* Organization Name Field */}
              <div className="mb-3">
                <label className="form-label">Organization Name *</label>
                <Field type="text" name="organization_name" className="form-control" />
                <ErrorMessage name="organization_name" component="div" className="text-danger" />
              </div>

              {/* Password Field (Always Displayed) */}
              <div className="mb-3">
                <label className="form-label">Password </label>
                <Field type="text" name="password" className="form-control" value={values.password || generatedPassword} />
                <small className="text-muted">Leave blank to use auto generated password.</small>
              </div>

              {/* Submit Button with Loader */}
              <div className="d-grid">
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
