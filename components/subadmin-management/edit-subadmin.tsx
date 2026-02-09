import Link from 'next/link'
import React, { useEffect, useState, ChangeEvent } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { updateSubAdmin, getSubAdminDetails } from '@/utils/services/subadmin-management';
import { getCountryCodes } from '@/utils/services/location-management';

interface CountryCodeItem {
    id: number;
    phone_code: string;
    country_code: string;
}

interface SubAdminDataItem {
    name: string;
    email: string;
    mobile: string;
    image_url?: string;
}

interface FormValues {
    name: string;
    mobile: string;
    image: File | string;
    country_code: string;
}

const EditSubadmin: React.FC = () => {
    const router = useRouter();

    const [subAdminData, setSubAdminData] = useState<SubAdminDataItem[] | null>(null);
    const [countryCode, setcountryCode] = useState<CountryCodeItem[]>([]);
    const [onecountrycode, setonecountrycode] = useState<string>("");

    const initialValues: FormValues = {
        name: subAdminData ? subAdminData[0]?.name : "",
        mobile: subAdminData ? subAdminData[0]?.mobile.trim().replace(/^[^-]*-/, "") : "",
        image: "",
        country_code: ""
    }

    const validationSchema = yup.object().shape({
        name: yup.string().required("Name is required"),
        mobile: yup
            .string()
            .matches(
                /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im,
                "please enter valid mobile number"
            )
            .min(7)
            .max(15)
            .required("mobile is required"),
        image: yup.mixed().nullable().required("Please select a file"),
    });

    const handleSubadminData = (): void => {
        getSubAdminDetails(router?.query?.id as string)
            .then((res: any) => {
                setSubAdminData(res.data)
            })
            .catch((err: any) => console.log("err", err));
    }

    const submitHandler = (values: FormValues, resetForm: () => void): void => {
        let fullMobile: string;
        if (onecountrycode == "") {
            fullMobile = `${selectedCountryCode?.phone_code || '+91'}-${String(values.mobile).trim()
                .replace(/^0+/, "")}`;
            console.log("fullMobile without selection", fullMobile);
        }
        else {
            fullMobile = `${onecountrycode}-${String(values.mobile).trim()
                .replace(/^0+/, "")}`;
            console.log("fullMobile with selection this is executed", fullMobile);
        }
        const { country_code, ...updatedData } = {
            ...values,
            mobile: fullMobile,
        }

        updateSubAdmin(updatedData, router?.query?.id as string)
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

    useEffect(() => {
        getCountryCodes().then((res: any) => {
            setcountryCode(res.data);
        }).catch(() => {
            console.log("error");
        })
    }, [])

    useEffect(() => {
        if (router?.query?.id) {
            handleSubadminData();
        }
    }, [router])

    const extractCountryCode = subAdminData ? subAdminData[0].mobile.match(/^\+\d{1,4}/)?.[0] || "" : "";
    const selectedCountryCode = countryCode.find(
        (item) => item.phone_code === extractCountryCode
    );

    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Edit Subadmin</h1>
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
                                                        <div className="row mb-4 align-items-center">
                                                            {/* Name Field */}
                                                            <div className="col-sm-4">
                                                                <FormikField
                                                                    label="Name"
                                                                    isRequired={true}
                                                                    name="name"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>

                                                            {/* Country Code + Mobile Input (Aligned Properly) */}
                                                            <div className="row mb-4">
                                                                <div className="col-sm-6">
                                                                    <label className="form-label">
                                                                        Mobile{" "}
                                                                        <span className="text-danger">*</span>
                                                                    </label>
                                                                    <div className="input-group">
                                                                        {/* Country Code Dropdown */}
                                                                        <Field
                                                                            as="select"
                                                                            name="country_code"
                                                                            className="form-select"
                                                                            style={{
                                                                                maxWidth: "120px",
                                                                                marginRight: "10px",
                                                                            }}
                                                                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                                                                setFieldValue(
                                                                                    "country_code",
                                                                                    e.target.value
                                                                                );
                                                                                setonecountrycode(e.target.value);
                                                                            }}
                                                                        ><option value={selectedCountryCode ? selectedCountryCode.phone_code : "+91"}>
                                                                                {selectedCountryCode
                                                                                    ? `${selectedCountryCode.country_code} (${selectedCountryCode.phone_code})`
                                                                                    : "+91"}
                                                                            </option>

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
                                                                            style={{
                                                                                height: "44px",
                                                                                marginLeft: "10px",
                                                                                maxWidth: "230px",
                                                                            }}
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
                                                        </div>
                                                    </div>

                                                    <div className="row mb-4">
                                                        <div className="col">
                                                            <label htmlFor="subadmin-image">Image</label>
                                                            <Field
                                                                name="image"
                                                                type="file"
                                                                value={undefined}
                                                                className="form-control p-1"
                                                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                                                    const files = event.target.files?.[0];
                                                                    setFieldValue("image", files);
                                                                }}
                                                            />
                                                            <ErrorMessage
                                                                name="image"
                                                                render={(msg: string) => (
                                                                    <div className="form-error">{msg}</div>
                                                                )}
                                                            />
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

export default EditSubadmin
