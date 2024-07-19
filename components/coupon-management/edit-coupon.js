import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { Form, Formik } from "formik";
import * as yup from "yup";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { getCouponDetails, updateCoupon } from "@/utils/services/coupon-management";

const EditCoupon = () => {
    const router = useRouter();
    const [couponDetail, setCouponDetail] = useState(null);
    const couponCheckingCondition = couponDetail && couponDetail?.length > 0;
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const initialValues = {
        coupon: couponCheckingCondition ? couponDetail[0]?.coupon : "",
        is_percentage: couponCheckingCondition ? couponDetail[0]?.is_percentage === true ? "true" : "false" : "",
        discount_amount: couponCheckingCondition ? (parseInt(couponDetail[0]?.discount_amount)).toFixed(0) : "",
        start_date: couponCheckingCondition ? formatDateForInput(couponDetail[0]?.start_date) : "",
        end_date: couponCheckingCondition ? formatDateForInput(couponDetail[0]?.end_date) : "",
        status: couponCheckingCondition ? (couponDetail[0]?.status).toString() : ""
    }

    const validationSchema = yup.object().shape({
        coupon: yup.string().required("Coupon Name is required"),
        is_percentage: yup.string().required("Percentage is required"),
        discount_amount: yup.string().required("Discount Amount is required"),
        start_date: yup.string().required("Start Date is required"),
        end_date: yup.string().required("End Date is required"),
        status: yup.string().required("Status is required"),
    });

    const getCoupon = () => {
        getCouponDetails(router?.query?.id)
            .then((res) => {
                setCouponDetail(res.data);
            })
            .catch((err) => {
                setloading(false);
            });
    }

    const submitHandler = (values, resetForm) => {
        const payload = {
            ...values,
            is_percentage: values.is_percentage === "true" ? true : false,
            discount_amount: (values.discount_amount).toString(),
        }
        updateCoupon(payload, couponCheckingCondition && couponDetail[0]?.id)
            .then((res) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/coupon-management");
				}, 2000);
            })
            .catch((error) => {
                let txt = "";
                for (let x in error?.error?.response?.data?.errors) {
                    txt = error?.error?.response?.data?.errors[x];
                }
                toast.error(txt);
            });
    }

    useEffect(() => {
        getCoupon()
    }, [router])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Edit Coupon</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/coupon-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>

                    <div class="card col-12">
                        <div class="card-body mt-3">
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
                                                    <div className="row">
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Coupon Name"
                                                                    isRequired={true}
                                                                    name="coupon"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Percentage"
                                                                    type="select"
                                                                    isRequired={true}
                                                                    selectOptions={
                                                                        [
                                                                            { label: "Select Percentage", value: '', disabled: true },
                                                                            { label: "false", value: "false" },
                                                                            { label: "true", value: "true" },
                                                                        ]
                                                                    }
                                                                    name="is_percentage"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Discount"
                                                                    type="number"
                                                                    isRequired={true}
                                                                    name="discount_amount"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Start Date"
                                                                    type="date"
                                                                    isRequired={true}
                                                                    name="start_date"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="row">
                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="End Date"
                                                                    type="date"
                                                                    isRequired={true}
                                                                    name="end_date"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
                                                        </div>

                                                        <div className="col-sm-4">
                                                            <div className="form-group">
                                                                <FormikField
                                                                    label="Status"
                                                                    type="select"
                                                                    isRequired={true}
                                                                    selectOptions={
                                                                        [
                                                                            { label: "Select Status", value: '', disabled: true },
                                                                            { label: "active", value: '1' },
                                                                            { label: "inactive", value: '0' },
                                                                        ]
                                                                    }
                                                                    name="status"
                                                                    touched={touched}
                                                                    errors={errors}
                                                                />
                                                            </div>
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

export default EditCoupon