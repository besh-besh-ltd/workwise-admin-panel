import React, { useEffect, useState, ChangeEvent } from "react";
import { Form, Formik, Field, ErrorMessage, FormikHelpers } from "formik";
import * as yup from "yup";
import Image from "next/image";
import {
  handleUpdateBuyer,
  handleGetBuyerDetails,
  handleGetBuyerAccountLimits,
  handleUpdateBuyerAccountLimits,
} from "@/utils/services/buyer-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter, NextRouter } from "next/router";
import img1 from "../../public/assets/images/products.png";
import { getCountryCodes } from "@/utils/services/location-management";
import { getAdminProfile } from "@/utils/services/login";
import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";

interface BuyerDetails {
  name: string;
  email: string;
  mobile: string;
  company_name?: string;
  organization_name?: string;
  profile_image?: string;
  subscription_plan_id?: number;
  user_type: number;
  company_id?: number;
}

interface CountryCode {
  id: number;
  country_code: string;
  phone_code: string;
}

interface AccountLimits {
  max_top_management: number;
  max_procurement: number;
  max_engineering: number;
  max_finance: number;
  max_approver: number;
  used_top_management?: number;
  used_procurement?: number;
  used_engineering?: number;
  used_finance?: number;
  used_approver?: number;
}

interface CurrentUser {
  user_type?: number;
}

interface SubscriptionOption {
  label: string;
  value: string;
}

interface SubscriptionPlan {
  id: number;
  plan_name: string;
  duration: string;
}

interface FormValues {
  name: string;
  email: string;
  mobile: string;
  organization_name: string;
  image: File | string | null;
  subscription: string;
  countryCode: string;
}

interface AccountLimitsFormValues {
  max_top_management: number;
  max_procurement: number;
  max_engineering: number;
  max_finance: number;
  max_approver: number;
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

const UpdateBuyer: React.FC = () => {
  const [editDetails, setEditDetails] = useState<BuyerDetails | null>(null);
  const [countryCode, setCountryCode] = useState<CountryCode[]>([]);
  const [accountLimits, setAccountLimits] = useState<AccountLimits | null>(null);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionOption[]>([]);

  const router: NextRouter = useRouter();
  const { id } = router.query;

  useEffect(() => {
    if (id) {
      fetchBuyerDetails();
      getCurrentUser();
    }
    fetchCountryCodes();
  }, [id]);

  useEffect(() => {
    if(editDetails) getSubscriptionList();
  }, [editDetails])

  const fetchBuyerDetails = async (): Promise<void> => {
    try {
      setLoading(true);
      const response : any = await handleGetBuyerDetails(id as string);
      const buyerData = response?.data?.[0];

      setEditDetails(buyerData);

      // Fetch account limits if this is a company admin
      if (buyerData?.user_type === 7 && buyerData?.company_id) {
        fetchAccountLimits(buyerData.company_id);
      }
    } catch (error) {
      toast.error("Failed to load buyer details");
      router.push("/buyer-management");
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryCodes = async (): Promise<void> => {
    try {
      const response : any = await getCountryCodes();
      setCountryCode(response?.data || []);
    } catch (error) {
      setCountryCode([]);
    }
  };

  const getCurrentUser = async (): Promise<void> => {
    try {
      const response : any = await getAdminProfile();
      setCurrentUser(response?.data || {});
    } catch (error) {
      setCurrentUser({});
    }
  };

  const fetchAccountLimits = async (company_id: number): Promise<void> => {
    try {
      const response : any = await handleGetBuyerAccountLimits(company_id);
      setAccountLimits(response?.data || null);
    } catch (error) {
      setAccountLimits(null);
    }
  };

  const getSubscriptionDuration: Record<string, string> = {
    "-1": "Lifetime",
    "1": "Monthly",
    "3": "Quarterly",
    "12": "Yearly",
  };

  const getSubscriptionList = (): void => {
    handleGetSubscriptionList(editDetails!.user_type)
      .then((res : any) => {
        const formattedData: SubscriptionOption[] = res.data.map((obj: SubscriptionPlan) => ({
          label: `${obj.plan_name} (${
            getSubscriptionDuration[parseInt(obj.duration).toString()] ||
            obj.duration + " Months"
          })`,
          value: obj.id.toString(),
        }));
        setSubscriptionList(formattedData);
      })
      .catch((error) => {
        toast.error("Internal server error");
      });
  };

  const getUserTypeLabel = (userType: number): string => {
    const userTypeMap: Record<number, string> = {
      2: "Procurement",
      7: "Company Admin",
      8: "Top Management",
      9: "Engineering Account",
      10: "Finance Account"
    };
    return userTypeMap[userType] || `Type ${userType}`;
  };

  const isAdmin = (): boolean => {
    return currentUser?.user_type === 1 || currentUser?.user_type === 5;
  };

  const canEditUser = (): boolean => {
    return editDetails?.user_type === 7 ? isAdmin() : true;
  };

  const submitHandler = (values: FormValues, { resetForm }: FormikHelpers<FormValues>): void => {
    if (!canEditUser()) {
      toast.error("You don't have permission to update this user");
      return;
    }

    const selectedCountry = countryCode.find(
      (item) => item.phone_code === (editDetails?.mobile?.match(/^\+?\d+/)?.[0] || "+91")
    );

    const fullMobile = values.countryCode
      ? `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`
      : `${selectedCountry?.phone_code || "+91"}-${values.mobile.trim().replace(/^0+/, "")}`;

    const { countryCode: _, ...updatedValues } = {
      ...values,
      mobile: fullMobile
    };

    handleUpdateBuyer(updatedValues, editDetails!)
      .then((res : any) => {
        resetForm();
        toast.success(res.message);
        router.push("/buyer-management");
      })
      .catch((error: ApiError) => {
        const errorMsg = Object.values(error?.error?.response?.data?.errors || {})[0] || "Update failed";
        toast.error(errorMsg as string);
      });
  };

  const submitAccountLimits = (values: AccountLimitsFormValues): void => {
    if (!isAdmin()) {
      toast.error("Only Workwise Admin/Subadmin can update account limits");
      return;
    }

    handleUpdateBuyerAccountLimits(editDetails!.company_id!, values)
      .then((res : any) => {
        toast.success(res.message);
        fetchAccountLimits(editDetails!.company_id!);
      })
      .catch((error: ApiError) => {
        const errorMsg = Object.values(error?.error?.response?.data?.errors || {})[0] || "Update failed";
        toast.error(errorMsg as string);
      });
  };

  if (!editDetails) {
    return <div>Loading...</div>;
  }

  const extractedCountryCode = editDetails?.mobile?.match(/^\+?\d+/)?.[0] || "+91";
  const selectedCountry = countryCode.find(
    (item) => item.phone_code === extractedCountryCode
  );

  const initialValues: FormValues = {
    name: editDetails?.name || "",
    email: editDetails?.email || "",
    mobile: editDetails?.mobile ? editDetails.mobile.replace(/^\+?\d+-/, "") : "",
    organization_name: editDetails?.company_name || editDetails?.organization_name || "",
    image: editDetails?.profile_image || null,
    subscription: editDetails?.subscription_plan_id?.toString() || "-1",
    countryCode: "",
  };

  const accountLimitsInitialValues: AccountLimitsFormValues = {
    max_top_management: accountLimits?.max_top_management || 0,
    max_procurement: accountLimits?.max_procurement || 0,
    max_engineering: accountLimits?.max_engineering || 0,
    max_finance: accountLimits?.max_finance || 0,
    max_approver: accountLimits?.max_approver || 0,
  };

  const validationSchema = yup.object({
    name: yup.string().required("Name is required"),
    email: yup
      .string()
      .email("Please enter valid email address")
      .required("Email is required"),
    mobile: yup
      .string()
      .matches(/^[0-9]{10,15}$/, "Enter a valid mobile number")
      .required("Mobile is required"),
  });

  const accountLimitsSchema = yup.object({
    max_top_management: yup.number().min(0).required("Required"),
    max_procurement: yup.number().min(0).required("Required"),
    max_engineering: yup.number().min(0).required("Required"),
    max_finance: yup.number().min(0).required("Required"),
    max_approver: yup.number().min(0).required("Required"),
  });

  return (
    <div className="container mt-4">
      <h5 className="mb-3">Update Buyer</h5>

      {/* User Information Card */}
      <div className="card mb-4">
        <div className="card-header">
          <h6 className="mb-0">User Information</h6>
        </div>
        <div className="card-body">
          <Formik
            initialValues={initialValues}
            enableReinitialize
            validationSchema={validationSchema}
            onSubmit={submitHandler}
          >
            {({ setFieldValue }) => (
              <Form>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Name</label>
                    <Field
                      type="text"
                      name="name"
                      className="form-control"
                      readOnly={!canEditUser()}
                    />
                    <ErrorMessage name="name" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email</label>
                    <Field
                      type="email"
                      name="email"
                      className="form-control"
                      readOnly={!canEditUser()}
                    />
                    <ErrorMessage name="email" component="div" className="text-danger" />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Mobile</label>
                    <div className="d-flex">
                      <Field
                        as="select"
                        name="countryCode"
                        className="form-select me-2 w-auto"
                        disabled={!canEditUser()}
                      >
                        <option value="">{selectedCountry?.country_code} ({selectedCountry?.phone_code})</option>
                        {countryCode.map((item) => (
                          <option key={item.id} value={item.phone_code}>
                            {item.country_code} ({item.phone_code})
                          </option>
                        ))}
                      </Field>
                      <Field
                        type="text"
                        name="mobile"
                        className="form-control"
                        readOnly={!canEditUser()}
                      />
                    </div>
                    <ErrorMessage name="mobile" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Role</label>
                    <input
                      type="text"
                      className="form-control"
                      value={getUserTypeLabel(editDetails.user_type)}
                      readOnly
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Company Name</label>
                    <Field
                      type="text"
                      name="organization_name"
                      className="form-control"
                      readOnly
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Image</label>
                    <input
                      type="file"
                      className="form-control"
                      onChange={(event: ChangeEvent<HTMLInputElement>) => setFieldValue("image", event.target.files?.[0])}
                      disabled={!canEditUser()}
                    />
                    {editDetails?.profile_image && (
                      <div className="mt-2">
                        <Image
                          src={editDetails.profile_image || img1}
                          width={100}
                          height={100}
                          className="img-thumbnail"
                          alt="Profile"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="row md-6 mb-4">
                  <div className="col-md-12">
                    <label htmlFor="subscription">Select Subscription ( Empty for Free )</label>
                    <Field
                      as="select"
                      className="form-control"
                      name="subscription"
                    >
                      <option value="" disabled>Select</option>
                      <option value="-1">No Subscription</option>
                      {subscriptionList?.map((subscription) => (
                        <option key={subscription.value} value={subscription.value}>
                          {subscription.label}
                        </option>
                      ))}
                    </Field>
                  </div>
                </div>
                {canEditUser() && (
                  <div className="text-end">
                    <button type="submit" className="btn btn-primary">Save User Details</button>
                  </div>
                )}
                {!canEditUser() && (
                  <div className="alert alert-info">
                    <small>Only Workwise Admin/Subadmin can edit Company Admin details.</small>
                  </div>
                )}
              </Form>
            )}
          </Formik>
        </div>
      </div>

      {/* Account Limits Card - Only for Company Admin (user_type 7) */}
      {editDetails.user_type === 7 && accountLimits && (
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">Company Account Limits</h6>
          </div>
          <div className="card-body">
            <Formik
              initialValues={accountLimitsInitialValues}
              enableReinitialize
              validationSchema={accountLimitsSchema}
              onSubmit={submitAccountLimits}
            >
              <Form>
                <div className="row mb-3">
                  <div className="col-md-3">
                    <label className="form-label">Max Top Management</label>
                    <Field
                      type="number"
                      name="max_top_management"
                      className="form-control"
                      min="0"
                      readOnly={!isAdmin()}
                    />
                    <small className="text-muted">Used: {accountLimits.used_top_management || 0}</small>
                    <ErrorMessage name="max_top_management" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Max Procurement</label>
                    <Field
                      type="number"
                      name="max_procurement"
                      className="form-control"
                      min="0"
                      readOnly={!isAdmin()}
                    />
                    <small className="text-muted">Used: {accountLimits.used_procurement || 0}</small>
                    <ErrorMessage name="max_procurement" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Max Engineering</label>
                    <Field
                      type="number"
                      name="max_engineering"
                      className="form-control"
                      min="0"
                      readOnly={!isAdmin()}
                    />
                    <small className="text-muted">Used: {accountLimits.used_engineering || 0}</small>
                    <ErrorMessage name="max_engineering" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Max Finance</label>
                    <Field
                      type="number"
                      name="max_finance"
                      className="form-control"
                      min="0"
                      readOnly={!isAdmin()}
                    />
                    <small className="text-muted">Used: {accountLimits.used_finance || 0}</small>
                    <ErrorMessage name="max_finance" component="div" className="text-danger" />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Max Approver</label>
                    <Field
                      type="number"
                      name="max_approver"
                      className="form-control"
                      min="0"
                      readOnly={!isAdmin()}
                    />
                    <small className="text-muted">Used: {accountLimits.used_approver || 0}</small>
                    <ErrorMessage name="max_approver" component="div" className="text-danger" />
                  </div>
                </div>
                {isAdmin() && (
                  <div className="text-end">
                    <button type="submit" className="btn btn-success">Update Account Limits</button>
                  </div>
                )}
                {!isAdmin() && (
                  <div className="alert alert-info">
                    <small>Only Workwise Admin/Subadmin can edit account limits.</small>
                  </div>
                )}
              </Form>
            </Formik>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default UpdateBuyer;
