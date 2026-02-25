import React, { useEffect, useState } from 'react'
import FormikField from "@/components/shared/FormikField";
import { ErrorMessage, Form, Formik, FormikErrors, FormikHelpers } from "formik";
import * as yup from "yup";
import Link from 'next/link'
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import Select, { MultiValue, StylesConfig } from "react-select";
import { getOfferDetails, updateOffer } from '@/utils/services/offer-management';
import { handleGetSubscriptionList } from '@/utils/services/price-subscription-management';

type FormikFieldProps<T extends Record<string, any>> = {
  name: keyof T;
  errors: FormikErrors<T>;
  touched?: Partial<Record<keyof T, boolean>>;
};
interface SubscriptionPlanItem {
    subscription_plan_id: number;
}

interface EditOfferData {
    text?: string;
    is_percentage?: boolean;
    subscription_plan?: SubscriptionPlanItem[];
    price?: string | number;
    start_date?: string;
    end_date?: string;
    status?: number;
    user_type?: string | number;
}

interface SubscriptionOption {
    label: string;
    value: string;
}

interface OfferFormValues {
    text: string;
    is_percentage: string;
    subscription_plan_id: string[];
    price: string;
    start_date: string;
    end_date: string;
    status: string;
    user_type: string;
}

interface SubscriptionDuration {
    [key: number]: string;
}

interface SubscriptionItem {
    id: number;
    plan_name: string;
    duration: string | number;
}

interface ApiError {
    error?: {
        response?: {
            data?: {
                errors?: Record<string, string>;
            };
        };
    };
}

const EditOffer: React.FC = () => {
    const router = useRouter();
    const [editOfferData, setEditOfferData] = useState<EditOfferData | null>(null);
    const [subscriptionList, setSubscriptionList] = useState<SubscriptionOption[]>([]);
    const [selectedUserType, setSelectedUserType] = useState<string>('2');

    const offerCheckingCondition = editOfferData && Object.keys(editOfferData)?.length > 0;
    const formatDateForInput = (dateString: string): string => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const customSelectStyles: StylesConfig<SubscriptionOption, true> = {
        control: (base) => ({
            ...base,
            height: 50,
            minHeight: 40,
        }),
    };
    const initialValues: OfferFormValues = {
        text: offerCheckingCondition ? editOfferData?.text || "" : "",
        is_percentage: offerCheckingCondition ? editOfferData?.is_percentage === true ? "true" : "false" : "",
        subscription_plan_id: offerCheckingCondition ? editOfferData?.subscription_plan?.map(item => (item?.subscription_plan_id).toString()) || [] : [],
        price: offerCheckingCondition ? (parseInt(editOfferData?.price as string)).toFixed(0) : "",
        start_date: offerCheckingCondition ? formatDateForInput(editOfferData?.start_date || "") : "",
        end_date: offerCheckingCondition ? formatDateForInput(editOfferData?.end_date || "") : "",
        status: offerCheckingCondition ? (editOfferData?.status)?.toString() || "" : "",
        user_type: offerCheckingCondition ? (editOfferData?.user_type)?.toString() || "" : ""
    }

    const validationSchema = yup.object().shape({
        text: yup.string().required("Offer Name is required"),
        is_percentage: yup.string().required("Percentage is required"),
        price: yup.string().required("Price is required"),
        subscription_plan_id: yup.array().required("Subscription plan is required"),
        start_date: yup.string().required("Start Date is required"),
        end_date: yup.string().required("End Date is required"),
        status: yup.string().required("Status is required"),
        user_type: yup.string().required("User Type is required"),
    });

    let getSubscriptionDuration: SubscriptionDuration = {
        1: "Monthly",
        3: "Quarterly",
        12: "Yearly",
	};

    const getOfferUpdate = (): void => {
        getOfferDetails(router?.query?.id as string)
            .then((res: { data: EditOfferData }) => {
                setEditOfferData(res?.data);
            })
            .catch((error: unknown) => {
                toast("Internal server error");
            });
    }

    const getSubscriptionList = (): void => {
        handleGetSubscriptionList(editOfferData!.user_type as string)
            .then((res: { data: SubscriptionItem[] }) => {
                const formattedData = res.data.map(obj => ({
                    label: `${obj.plan_name} (${getSubscriptionDuration[parseInt(obj.duration as string)] || obj.duration + ' Months'})`,
                    value: (obj.id).toString(),
                }));
                setSubscriptionList(formattedData);
            })
            .catch((error: unknown) => {
                console.log("ERROR => ", error)
                toast("Internal server error");
            });
    }

    const submitHandler = (values: OfferFormValues, resetForm: () => void): void => {
        const payload = {
            ...values,
            price: (values.price).toString()
        }
        updateOffer(payload, router?.query?.id as string)
            .then((res: { message: string }) => {
                resetForm();
                toast.success(res.message);
                setTimeout(() => {
                    router.push("/offer-management");
                }, 1000);
            })
            .catch((error: ApiError) => {
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
        if(editOfferData)
            getSubscriptionList();
    }, [editOfferData])
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
                                onSubmit={(values: OfferFormValues, { resetForm }: FormikHelpers<OfferFormValues>) => {
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
                                                                errors={errors as any}
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
                                                                errors={errors as any}
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
                                                                errors={errors as any}
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
                                                                onChange={(selectedOptions: MultiValue<SubscriptionOption>) => {
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
                                                                errors={errors as any}
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
                                                                errors={errors as any}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className='row'>
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
                                                                errors={errors as any}
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="col-sm-5">
                                                        <div className="form-group">
                                                        <FormikField
                                                            label="User Type"
                                                            type="select"
                                                            disabled
                                                            isRequired={true}
                                                            selectOptions={[
                                                            {
                                                                label: "Select User Type",
                                                                value: "",
                                                                disabled: true,
                                                            },
                                                            { label: "Buyer", value: "2" },
                                                            { label: "Vendor", value: "3" },
                                                            ]}
                                                            name="user_type"
                                                            touched={touched}
                                                            errors={errors as any}
                                                        />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="d-flex float-left">
                                                    <button type="submit" className="btn btn-primary justify">
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
