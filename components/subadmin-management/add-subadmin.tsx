import Link from 'next/link'
import React, { useEffect, useRef, useState, ChangeEvent } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { createSubAdmin } from '@/utils/services/subadmin-management';
import { getCountryCodes } from '@/utils/services/location-management';

interface CountryCodeItem {
    id: number;
    phone_code: string;
    country_code: string;
}

interface FormValues {
    name: string;
    email: string;
    mobile: string;
    password: string;
    confirm_password: string;
    country_code: string;
}

const AddSubadmin: React.FC = () => {
    const router = useRouter();
    const userTypeRef = useRef<number>(5);
    const [countryCode, setCountryCode] = useState<CountryCodeItem[]>([]);
    const [onecountrycode, setonecountrycode] = useState<string>("");

    useEffect(() => {
        getCountryCodes()
            .then((res: any) => {
                setCountryCode(res.data);
            })
            .catch((error: any) => {
                console.log(error);
            });
    }, []);

    const initialValues: FormValues = {
        name: "",
        email: "",
        mobile: "",
        password: "",
        confirm_password: "",
        country_code: "+91"
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
            .max(15)
            .required("mobile is required"),
        password: yup.string().required("Password field is required"),
        confirm_password: yup.string()
            .oneOf([yup.ref("password"),], "Password must match")
            .required("Cinfirm Password field is required"),
    });

    const submitHandler = (values: FormValues, resetForm: () => void): void => {
        const fullMobile = `${values.country_code}-${String(values.mobile).trim()
            .replace(/^0+/, "")}`;

        const { country_code, ...updatedData } = values;
        createSubAdmin({ ...updatedData, userType: userTypeRef.current, mobile: fullMobile })
            .then((res: any) => {
                resetForm();
                toast(res.message);
                setTimeout(() => {
                    router.push("/subadmin-management");
                }, 1000);
            })
            .catch((error: any) => {
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
                                                        <div className="col-sm-6">
                                                            <label className="form-label">
                                                                Mobile <span className="text-danger">*</span>
                                                            </label>
                                                            <div className="input-group">
                                                                {/* Country Code Dropdown */}
                                                                <Field
                                                                    as="select"
                                                                    name="country_code"
                                                                    className="form-select"
                                                                    style={{ maxWidth: "120px", marginRight: "10px" }}
                                                                    onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                                        setFieldValue(
                                                                            "country_code",
                                                                            e.target.value
                                                                        );
                                                                        setonecountrycode(e.target.value);
                                                                    }}
                                                                >
                                                                    <option value="+91">+91 (IN)</option>
                                                                    {countryCode.map((country) => (
                                                                        <option
                                                                            key={country.id}
                                                                            value={country.phone_code}
                                                                        >
                                                                            {country.country_code} (
                                                                            {country.phone_code})
                                                                        </option>
                                                                    ))}
                                                                </Field>

                                                                {/* Mobile Number Input */}
                                                                <Field
                                                                    name="mobile"
                                                                    type="number"
                                                                    className="form-control"
                                                                    placeholder="Enter mobile number"
                                                                    style={{ height: "44px", marginLeft: "10px" }}
                                                                />
                                                            </div>

                                                            {/* Display validation errors */}
                                                            <ErrorMessage
                                                                name="mobile"
                                                                component="div"
                                                                className="text-danger"
                                                            />
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

export default AddSubadmin
