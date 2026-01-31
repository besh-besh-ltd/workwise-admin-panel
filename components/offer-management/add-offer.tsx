import React, { useEffect, useState, ChangeEvent } from 'react'
import { ToastContainer, toast } from "react-toastify";
import FormikField from "@/components/shared/FormikField";
import Link from 'next/link'
import { ErrorMessage, Form, Formik, FormikHelpers } from "formik";
import * as yup from "yup";
import { useRouter } from "next/router";
import { handleGetSubscriptionList } from '@/utils/services/price-subscription-management';
import Select, { MultiValue, StylesConfig } from "react-select";
import { addOffer } from '@/utils/services/offer-management';

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
  [key: string]: string;
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

const AddOffer: React.FC = () => {
  const router = useRouter();
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionOption[]>([]);
  const [selectedUserType, setSelectedUserType] = useState<string>('2');

  const customSelectStyles: StylesConfig<SubscriptionOption, true> = {
    control: (base) => ({
      ...base,
      height: 50,
      minHeight: 40,
    }),
  };
  const initialValues: OfferFormValues = {
    text: "",
    is_percentage: "",
    subscription_plan_id: [],
    price: "",
    start_date: "",
    end_date: "",
    status: "",
    user_type: selectedUserType,
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

  const getSubscriptionList = (): void => {
    handleGetSubscriptionList(selectedUserType)
      .then((res: { data: SubscriptionItem[] }) => {
        const formattedData = res.data.map(obj => ({
          label: `${obj.plan_name} (${getSubscriptionDuration[parseInt(obj.duration as string)] || obj.duration + ' Months'})`,
          value: (obj.id).toString(),
        }));
        setSubscriptionList(formattedData);
      })
      .catch((error: unknown) => {
        toast.error("Internal server error");
      });
  }

  let getSubscriptionDuration: SubscriptionDuration = {
    "-1": "Lifetime",
		"1": "Monthly",
		"3": "Quarterly",
		"12": "Yearly",
	};

  const submitHandler = (values: OfferFormValues, resetForm: () => void): void => {
    const payload = {
      ...values,
      price: (values.price).toString()
    }

    addOffer(payload)
      .then((res: { message: string }) => {
        resetForm();
        toast.success(res.message);
        setTimeout(() => {
          router.push("/offer-management");
        }, 2000);
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
    getSubscriptionList()
  }, [selectedUserType])

  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <h1 className="m-0 text-dark">Add Offer</h1>
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

          <div className="card col-12">
            <div className="card-body">
              <div className="container-fluid">
                <div className="col-md-12">
                  <Formik
                    enableReinitialize={false}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={(values: OfferFormValues, { resetForm }: FormikHelpers<OfferFormValues>) => {
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
                                  selectOptions={[
                                    {
                                      label: "Select Percentage",
                                      value: "",
                                      disabled: true,
                                    },
                                    { label: "false", value: "false" },
                                    { label: "true", value: "true" },
                                  ]}
                                  name="is_percentage"
                                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    const value = e.target.value;
                                    setFieldValue("is_percentage", value);
                                  }}
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
                                  name={"subscription_plan_id"}
                                  options={subscriptionList}
                                  value={subscriptionList.filter((option) =>
                                    values.subscription_plan_id?.includes(option.value)
                                  )}
                                  placeholder="Select Subscription Plan"
                                  isClearable={true}
                                  styles={customSelectStyles}
                                  onChange={(options: MultiValue<SubscriptionOption>) => {
                                    setFieldValue(
                                      "subscription_plan_id",
                                      options.map((option) => option.value)
                                    );
                                  }}
                                />
                                <ErrorMessage
                                  name={"subscription_plan_id"}
                                  component="div"
                                  className="form-error"
                                />
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
                                selectOptions={[
                                  {
                                    label: "Select Status",
                                    value: "",
                                    disabled: true,
                                  },
                                  { label: "active", value: "1" },
                                  { label: "inactive", value: "0" },
                                ]}
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                    const value = e.target.value;
                                    setFieldValue("status", value);
                                  }}
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
                                onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                  const value = e.target.value;

                                  setSelectedUserType(value);
                                  setFieldValue("user_type", value);
                                  setFieldValue("subscription_plan_id", []);
                                }}
                                name="user_type"
                                touched={touched}
                                errors={errors as any}
                              />
                            </div>
                          </div>
                          </div>
                        </div>

                        <div className="d-flex float-left">
                          <button type="submit" className="btn btn-primary justify">
                            Save
                          </button>
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

export default AddOffer
