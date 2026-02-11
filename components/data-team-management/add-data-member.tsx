import Link from 'next/link'
import React, { useEffect, useRef, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { createSubAdmin } from '@/utils/services/subadmin-management';
import { getCountryCodes } from '@/utils/services/location-management';

interface FormValues {
    name: string;
    email: string;
    mobile: string;
    password: string;
    confirm_password: string;
    countryCode: string;
}

interface CountryCodeItem {
    country_code: string;
    phone_code: string;
}

const initialValues: FormValues = {
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirm_password: "",
    countryCode: "+91"
}

const AddDataMemberPage: React.FC = () => {
    const router = useRouter();
    const userTypeRef = useRef<number>(6);
    const [countryCode, setCountryCode] = useState<CountryCodeItem[]>([]);

    useEffect(() => {
        fetchCountryCodes();
    }, []);

    const fetchCountryCodes = (): void => {
        getCountryCodes()
            .then((response : any) => {
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

    const validationSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
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
                "Please enter a valid mobile number"
            )
            .min(7)
            .max(15)
            .required("mobile is required"),
        password: yup.string().required("Password field is required"),
        confirm_password: yup
            .string()
            .oneOf([yup.ref("password")], "Password must match")
            .required("Confirm Password field is required"),
    });

    const submitHandler = (values: FormValues, resetForm: () => void): void => {
        const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;
        const { countryCode: _countryCode, ...updatedValues } = {
            ...values,
            mobile: fullMobile
        }
        createSubAdmin({ ...updatedValues, userType: userTypeRef.current })
            .then((res : any) => {
                resetForm();
                toast(res.message);
                setTimeout(() => {
                    router.push("/data-team-management");
                }, 1000);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    }
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Add Data Member</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/data-team-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>

                    <div className="card col-12">
                        <div className="card-body">
                            <div className="container-fluid">
                                <div className="col-md-12">
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
                                            submitHandler(values, resetForm);
                                        }}
                                    >
                                        {({
                                            errors,
                                            touched,
                                            values,
                                            handleChange,
                                            setFieldValue,
                                        }) => (
                                            <Form>
                                                <div className="add-product">
                                                    <div className="row mb-4">
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Name"
                                                                    isRequired={true}
                                                                    name="name"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Email"
                                                                    type="text"
                                                                    isRequired={true}
                                                                    name="email"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row mb-4">
                                                        <div className="col-sm-8">
                                                            <div className="form-group">
                                                                <label htmlFor="mobile">
                                                                    Mobile{" "}
                                                                    <span className="text-danger">*</span>
                                                                </label>
                                                                <div className="d-flex">
                                                                    <Field
                                                                        as="select"
                                                                        name="countryCode"
                                                                        className="form-control"
                                                                        style={{
                                                                            height: "44px",
                                                                            width: "30%",
                                                                            borderTopRightRadius: 0,
                                                                            borderBottomRightRadius: 0,
                                                                        }}
                                                                    >
                                                                        <option value="countryCode">
                                                                            IN (+91)
                                                                        </option>
                                                                        {countryCode.map((item) => (
                                                                            <option
                                                                                key={item.country_code}
                                                                                value={item.phone_code}
                                                                            >
                                                                                {item.country_code} ({item.phone_code}
                                                                                )
                                                                            </option>
                                                                        ))}
                                                                    </Field>
                                                                    <div style={{ marginLeft: "6px", width: "70%" }}>
                                                                        <Field
                                                                            type="text"
                                                                            name="mobile"
                                                                            placeholder="Mobile"
                                                                            className={`form-control ${touched.mobile && errors.mobile
                                                                                ? "is-invalid"
                                                                                : ""
                                                                                }`}
                                                                            style={{
                                                                                height: "44px",
                                                                                borderTopLeftRadius: 0,
                                                                                borderBottomLeftRadius: 0,
                                                                            }}
                                                                        />
                                                                        {touched.mobile && errors.mobile && (
                                                                            <div className="invalid-feedback">
                                                                                {errors.mobile}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row mb-4">
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Password"
                                                                    type="password"
                                                                    isRequired={true}
                                                                    name="password"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Confirm Password"
                                                                    type="password"
                                                                    isRequired={true}
                                                                    name="confirm_password"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex float-left">
                                                        <button
                                                            type="submit"
                                                            className="btn btn-primary justify"
                                                        >
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            </Form>
                                        )}
                                    </Formik>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}

export default AddDataMemberPage
