import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { ErrorMessage, Form, Formik } from "formik";
import * as yup from "yup";
import Link from 'next/link'
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Select from "react-select";
import { getOfferDetails, updateOffer } from '@/utils/services/offer-management';
import { handleGetSubscriptionList } from '@/utils/services/price-subscription-management';

const EditOffer = () => {
    const router = useRouter();
    const [editOfferData, setEditOfferData] = useState(null);
    const [subscriptionList, setSubscriptionList] = useState([]);

    const offerCheckingCondition = editOfferData && Object.keys(editOfferData)?.length > 0;
    const formatDateForInput = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const customSelectStyles = {
        control: (base) => ({
            ...base,
            height: 50,
            minHeight: 40,
        }),
    };
    const initialValues = {
        text: offerCheckingCondition ? editOfferData?.text : "",
        is_percentage: offerCheckingCondition ? editOfferData?.is_percentage === true ? "true" : "false" : "",
        subscription_plan_id: offerCheckingCondition ? editOfferData?.subscription_plan?.map(item => (item?.subscription_plan_id).toString()) : [],
        price: offerCheckingCondition ? (parseInt(editOfferData?.price)).toFixed(0) : "",
        start_date: offerCheckingCondition ? formatDateForInput(editOfferData?.start_date) : "",
        end_date: offerCheckingCondition ? formatDateForInput(editOfferData?.end_date) : "",
        status: offerCheckingCondition ? (editOfferData?.status)?.toString() : ""
    }

    const validationSchema = yup.object().shape({
        text: yup.string().required("Offer Name is required"),
        is_percentage: yup.string().required("Percentage is required"),
        price: yup.string().required("Price is required"),
        subscription_plan_id: yup.array().required("Subscription plan is required"),
        start_date: yup.string().required("Start Date is required"),
        end_date: yup.string().required("End Date is required"),
        status: yup.string().required("Status is required"),
    });

    const getOfferUpdate = () => {
        getOfferDetails(router?.query?.id)
            .then((res) => {
                setEditOfferData(res?.data);
            })
            .catch((error) => {
                toast("Internal server error");
            });
    }
    const getSubscriptionList = () => {
        handleGetSubscriptionList()
            .then((res) => {
                const formattedData = res.data.map(obj => ({
                    label: obj.plan_name,
                    value: (obj.id).toString(),
                }));
                setSubscriptionList(formattedData);
            })
            .catch((error) => {
                toast("Internal server error");
            });
    }
    const submitHandler = (values, resetForm) => {
        const payload = {
            ...values,
            price: (values.price).toString()
        }
        updateOffer(payload, router?.query?.id)
            .then((res) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/offer-management");
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

    useEffect(() => {
        if (router?.query?.id) {
            getOfferUpdate();
        }
    }, [router])
    useEffect(() => {
        getSubscriptionList();
    }, [])
    return (
        <>
            <ToastContainer />
            <div className="content-header">
                <div className="container-fluid">
                    <div className="row mb-2">
                        <h1 className="m-0 text-dark">Edit Offer</h1>
                    </div>
                </div>
            </div>

            <section className="content p-2">
                <div className="container-fluid">
                    <div className="text-left pb-4">
                        <Link className="btn btn-primary" href="/offer-management">
                            <span className="fa fa-angle-left mr-2"></span>Go Back
                        </Link>
                    </div>

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
                                {
                                    ({ errors, touched, values, handleChange, setFieldValue }) => (
                                        <Form>
                                            <div className="add-product">
                                                <div className="row">
                                                    <div className="col-sm-5">
                                                        <div className="form-group">
                                                            <FormikField
                                                                label="Offer Name"
                                                                isRequired={true}
                                                                name="text"
                                                                touched={touched}
                                                                errors={errors}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-5">
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
                                                    <div className="col-sm-5">
                                                        <div className="form-group">
                                                            <FormikField
                                                                label="Price"
                                                                type="number"
                                                                isRequired={true}
                                                                name="price"
                                                                touched={touched}
                                                                errors={errors}
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="col-sm-5">
                                                        <div className="form-group">
                                                            <label htmlFor="plan">
                                                                Subscription Plan<sup>*</sup>
                                                            </label>
                                                            <Select
                                                                isMulti
                                                                name={'subscription_plan_id'}
                                                                options={subscriptionList}
                                                                placeholder="Select Subscription Plan"
                                                                isClearable={true}
                                                                styles={customSelectStyles}
                                                                value={subscriptionList.filter(option => values.subscription_plan_id.includes(option.value))}
                                                                onChange={(selectedOptions) => {
                                                                    const selectedValues = selectedOptions ? selectedOptions.map(option => option.value) : [];
                                                                    setFieldValue("subscription_plan_id", selectedValues);
                                                                }}
                                                            />
                                                            <ErrorMessage name={'subscription_plan_id'} component="div" className="form-error" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="row">
                                                    <div className="col-sm-5">
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

                                                    <div className="col-sm-5">
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
                                                </div>

                                                <div className="col-sm-5">
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
            </section>
        </>
    )
}

export default EditOffer