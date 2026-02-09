"use client";

import React, { useEffect, useState } from "react";
import { Formik, Form, Field, ErrorMessage, FormikErrors } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { ToastContainer, toast } from "react-toastify";
import "bootstrap/dist/css/bootstrap.min.css";
import { RegisterCompanyByAdmin } from "@/utils/services/buyer-management";
import { getCountryCodes } from "@/utils/services/location-management";
import { generateRandomPassword } from "@/utils/services/buyer-management";

interface CountryCodeItem {
  id: number;
  phone_code: string;
  country_code: string;
}

interface FormValues {
  countryCode: string;
  name: string;
  email: string;
  mobile: string;
  password: string;
  organization_name: string;
  max_top_management: number;
  max_procurement: number;
  max_engineering: number;
  max_finance: number;
}

interface ValidationErrors {
  account_limits?: string;
}

const AddBuyerPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const [generatedPassword, setGeneratedPassword] = useState<string>("");
  const [countryCode, setCountryCode] = useState<CountryCodeItem[]>([]);

  useEffect(() => {
    getCountryCodes()
      .then((res: any) => setCountryCode(res?.data || []))
      .catch(() => setCountryCode([]));
  }, []);

  const initialValues: FormValues = {
    countryCode: "+91",
    name: "",
    email: "",
    mobile: "",
    password: "",
    organization_name: "",
    max_top_management: 0,
    max_procurement: 0,
    max_engineering: 0,
    max_finance: 0
  };

  // Custom validation function to check if at least one account type is > 0
  const validateAccountLimits = (values: FormValues): ValidationErrors => {
    const errors: ValidationErrors = {};
    const accountTypes = [
      values.max_top_management,
      values.max_procurement,
      values.max_engineering,
      values.max_finance
    ];

    if (!accountTypes.some(val => val > 0)) {
      errors.account_limits = "At least one account type must have a limit greater than 0";
    }

    return errors;
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
    max_top_management: yup.number().min(0).required("Required"),
    max_procurement: yup.number().min(0).required("Required"),
    max_engineering: yup.number().min(0).required("Required"),
    max_finance: yup.number().min(0).required("Required")
  });

  const submitHandler = async (
    values: FormValues,
    { setErrors }: { setErrors: (errors: FormikErrors<FormValues> & ValidationErrors) => void }
  ): Promise<void> => {
    // Validate that at least one account type is > 0
    const validationErrors = validateAccountLimits(values);
    if (validationErrors.account_limits) {
      setErrors(validationErrors as FormikErrors<FormValues> & ValidationErrors);
      return;
    }

    setLoading(true);
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
    const password = values.password.trim() || generateRandomPassword();
    setGeneratedPassword(password);

    const formData = new FormData();
    formData.append("name", values.name.trim());
    formData.append("email", values.email.trim());
    formData.append("mobile", fullMobile);
    formData.append("organization_name", values.organization_name.trim());
    formData.append("user_type", "7");
    formData.append("password", password);
    formData.append("max_top_management", values.max_top_management.toString());
    formData.append("max_procurement", values.max_procurement.toString());
    formData.append("max_engineering", values.max_engineering.toString());
    formData.append("max_finance", values.max_finance.toString());

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
          {({ values, errors, touched, setErrors }) => (
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

              <h4 className="mt-4 mb-3">Account Limits</h4>
              <p className="text-muted">At least one account type must have a limit greater than 0.</p>

              {(errors as FormikErrors<FormValues> & ValidationErrors).account_limits && (
                <div className="alert alert-danger">{(errors as FormikErrors<FormValues> & ValidationErrors).account_limits}</div>
              )}

              <div className="row mb-3">
                {(["max_top_management", "max_procurement", "max_engineering", "max_finance"] as const).map((field) => (
                  <div className="col-md-6 col-lg-3" key={field}>
                    <label className="form-label">
                      {field.replace("max_", "Max ").replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                    </label>
                    <Field type="number" min="0" name={field} className="form-control" />
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
};

export default AddBuyerPage;
