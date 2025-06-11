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
import { generateRandomPassword } from "@/utils/services/buyer-management";

export default function AddBuyerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState("");
  const [countryCode, setCountryCode] = useState([]);
  const [profilePreview, setProfilePreview] = useState(null);

  useEffect(() => {
    getCountryCodes()
      .then((res) => setCountryCode(res?.data || []))
      .catch(() => setCountryCode([]));
  }, []);

  const initialValues = {
    countryCode: "+91",
    name: "",
    email: "",
    mobile: "",
    password: "",
    organization_name: "",
    gstin: "",
    cin: "",
    profile: null,
    max_top_management: 2,
    max_procurement: 5,
    max_engineering: 15,
    max_finance: 3
  };

  const validationSchema = yup.object().shape({
    name: yup.string().required("Name is required"),
    email: yup.string().email("Invalid email").required("Email is required"),
    countryCode: yup.string().required("Required"),
    mobile: yup.string().when("countryCode", {
      is: "+91",
      then: () => yup.string().matches(/^\d{10}$/, "Invalid number").required("Mobile is required"),
      otherwise: () => yup.string().matches(/^\d{7,15}$/, "Invalid number").required("Mobile is required")
    }),
    password: yup.string(),
    organization_name: yup.string().required("Organization name is required"),
    gstin: yup.string(),
    cin: yup.string(),
    max_top_management: yup.number().min(1).required("Required"),
    max_procurement: yup.number().min(1).required("Required"),
    max_engineering: yup.number().min(1).required("Required"),
    max_finance: yup.number().min(1).required("Required")
  });

  const handleProfileChange = (event, setFieldValue) => {
    const file = event.target.files?.[0];
    if (file) {
      setFieldValue("profile", file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const submitHandler = async (values) => {
    setLoading(true);
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
    const password = values.password.trim() || generateRandomPassword();
    setGeneratedPassword(password);

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("email", values.email.trim());
    formData.append("mobile", fullMobile);
    formData.append("organization_name", values.organization_name.trim());
    formData.append("user_type", 7);
    formData.append("password", password);
    if (values.gstin) formData.append("gstin", values.gstin);
    if (values.cin) formData.append("cin", values.cin);
    if (values.profile instanceof File) formData.append("file", values.profile);
    formData.append("max_top_management", values.max_top_management);
    formData.append("max_procurement", values.max_procurement);
    formData.append("max_engineering", values.max_engineering);
    formData.append("max_finance", values.max_finance);

    try {
      await RegisterCompanyByAdmin(formData);
      toast.success("Company registered successfully!");
      router.push("/buyer-management");
    } catch (error) {
      console.error("Registration Error:", error);
      toast.error("Failed to register company. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Add New Buyer</h2>
      <div className="card p-4 shadow-sm">
        <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={submitHandler}>
          {({ values, setFieldValue }) => (
            <Form>
              <h4 className="mb-3">Basic Information</h4>

              <div className="mb-3">
                <label className="form-label">Name *</label>
                <Field type="text" name="name" className="form-control" />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label className="form-label">Email *</label>
                <Field type="email" name="email" className="form-control" />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label className="form-label">Mobile *</label>
                <div className="d-flex">
                  <Field as="select" name="countryCode" className="form-select me-2" style={{ width: "30%", maxWidth: "160px" }}>
                    {countryCode.map((item) => (
                      <option key={item.id} value={item.phone_code}>
                        {item.country_code} ({item.phone_code})
                      </option>
                    ))}
                  </Field>
                  <Field type="text" name="mobile" className="form-control" style={{ flex: "1" }} />
                </div>
                <ErrorMessage name="mobile" component="div" className="text-danger" />
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <Field type="text" name="password" className="form-control" value={values.password || generatedPassword} />
                <small className="text-muted">Leave blank to use auto generated password.</small>
              </div>

              <div className="mb-3">
                <label className="form-label">Organization Name *</label>
                <Field type="text" name="organization_name" className="form-control" />
                <ErrorMessage name="organization_name" component="div" className="text-danger" />
              </div>

              <h4 className="mt-4 mb-3">Company Information</h4>

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

              <div className="mb-3">
                <label className="form-label">Company Profile Image (Optional)</label>
                <input type="file" className="form-control" accept="image/*" onChange={(event) => handleProfileChange(event, setFieldValue)} />
                {profilePreview && (
                  <div className="mt-2">
                    <Image src={profilePreview} width={100} height={100} className="img-thumbnail" alt="Profile Preview" />
                  </div>
                )}
              </div>

              <h4 className="mt-4 mb-3">Account Limits</h4>

              <div className="row mb-3">
                {["max_top_management", "max_procurement", "max_engineering", "max_finance"].map((field) => (
                  <div className="col-md-6 col-lg-3" key={field}>
                    <label className="form-label">
                      {field.replace("max_", "Max ").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())} *
                    </label>
                    <Field type="number" name={field} className="form-control" />
                    <ErrorMessage name={field} component="div" className="text-danger" />
                  </div>
                ))}
              </div>

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
