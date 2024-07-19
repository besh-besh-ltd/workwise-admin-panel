import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, Field, ErrorMessage } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { createSubAdmin } from '@/utils/services/subadmin-management';

const AddSubadmin = () => {
    const router = useRouter();
    const initialValues = {
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirm_password: "",
        image: ""
    }

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
                "please enter valid mobile number"
            )
            .min(10)
            .max(11)
            .required("mobile is required"),
        password: yup.string().required("Password field is required"),
        // .matches(/^(?=.*\d)(?=.*[A-Z]).{6,16}$/, "Password should be atleast 6 characters one UpperCase one Number"),
        confirm_password: yup.string()
            .oneOf([yup.ref("password"),], "Password must match")
            .required("Cinfirm Password field is required"),
        // .matches(/^(?=.*\d)(?=.*[A-Z]).{6,16}$/, "Password should be atleast 6 characters one UpperCase one Number"),
        image: yup.mixed().nullable().required("Please select a file"),
    });

    const submitHandler = (values, resetForm) => {
        createSubAdmin(values)
            .then((res) => {
                resetForm();
                toast(res.message);
                setTimeout(() => {
                    router.push("/subadmin-management");
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
                        <h1 className="m-0 text-dark">Add Subadmin</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/subadmin-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>

                    <div class="card col-12">
                        <div class="card-body">
                            <div className="container-fluid">
                                <div className="col-md-12">
                                    <Formik
                                        enableReinitialize={true}
                                        initialValues={initialValues}
                                        validationSchema={validationSchema}
                                        onSubmit={(values, { resetForm }) => {
                                            submitHandler(values, resetForm);
                                        }}
                                    >
                                        {({ errors, touched, values, handleChange, setFieldValue }) => (
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
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Mobile"
                                                                    type="number"
                                                                    isRequired={true}
                                                                    name="mobile"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
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

                                                    <div class="row mb-4">
                                                        <div class="col">
                                                            <label htmlFor="subadmin-image">Image</label>
                                                            <Field
                                                                name="image"
                                                                type="file"
                                                                value={undefined}
                                                                className="form-control p-1"
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
                                                    </div>

                                                    <div className="d-flex float-left">
                                                        <button type="submit" class="btn btn-primary justify">
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
    )
}

export default AddSubadmin