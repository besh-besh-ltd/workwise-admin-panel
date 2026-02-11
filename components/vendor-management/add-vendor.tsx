import React, { useState, useEffect, ChangeEvent } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray, FormikHelpers, FieldProps } from "formik";
import * as yup from "yup";
import {
  handleAddVendor,
  handleGetStates,
  handleGetCities,
  handleGetBuyerCompanyDropdown,
} from "@/utils/services/vendor-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import { getCountries, getCountryCodes, getStates } from "@/utils/services/location-management";
import Select, { MultiValue } from "react-select";
import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";
import LocationModal from "../modal/LocationModal";

interface CountryCodeItem {
  id: number;
  phone_code: string;
  country_code: string;
}

interface CountryItem {
  id: number;
  country_name: string;
}

interface StateItem {
  id: number;
  state_name: string;
}

interface CityItem {
  id: number;
  city_name: string;
}

interface SubscriptionOption {
  label: string;
  value: string;
}

interface BusinessOption {
  value?: string;
  Value?: string;
  label: string;
}

interface BuyerCompanyOption {
  value: number;
  label: string;
}

interface SpocItem {
  spoc_name: string;
  spoc_role: string;
  spoc_email: string;
  spoc_mobile: string;
  country_code: string;
}

interface LocationItem {
  id: string | number;
  country_name: string;
  state_name: string;
  city_name: string;
  address?: string;
  postal_code?: string;
  country?: string | number;
  state?: string | number;
  city?: string | number;
}

interface FormValues {
  countryCode: string;
  name: string;
  organization_name: string;
  email: string;
  mobile: string;
  logo: string | File;
  ptr_track: string | File;
  address: string;
  city: string;
  state: string;
  country: string;
  website: string;
  postal_code: string;
  about_vendor_company: string;
  nature_business: string;
  estd_year: string;
  gstin: string;
  import_export_code: string;
  cin: string;
  turn_over: string;
  total_employees: string;
  spocs: SpocItem[];
  vendor_access_type: string;
  buyer_company_ids: number[];
  is_verified: boolean;
}

interface SubscriptionDurationMap {
  [key: string]: string;
}

const AddVendor: React.FC = () => {
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedCountryOption, setSelectedCountryOption] = useState<string>("");
  const [selectedStateOption, setSelectedStateOption] = useState<string>("");
  const [selectedCityOption, setSelectedCityOption] = useState<string>("");
  const [isStateDisabled, setIsStateDisabled] = useState<boolean>(true);
  const [isCityDisabled, setIsCityDisabled] = useState<boolean>(true);
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionOption[]>([]);
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState<string>("");
  const [countryCode, setCountryCode] = useState<CountryCodeItem[]>([]);
  const [buyerCompanyOptions, setBuyerCompanyOptions] = useState<BuyerCompanyOption[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);

  const handleAddLocation = (newLocation: LocationItem): void => {
    if (editingLocation) {
      setLocations(
        locations.map((loc) => (loc.id === newLocation.id ? newLocation : loc))
      );
    } else {
      setLocations([...locations, newLocation]);
    }
  };

  const router = useRouter();

  const businessOptions: BusinessOption[] = [
    { value: "Authorised Distributor", label: "Authorised Distributor" },
    { value: "Authorised Dealer", label: "Authorised Dealer" },
    { value: "Branch", label: "Branch" },
    { value: "Channel Partner", label: "Channel Partner" },
    { value: "Distributor", label: "Distributor" },
    { value: "Constructor", label: "Constructor" },
    { value: "Contractor", label: "Contractor" },
    { value: "Dealer", label: "Dealer" },
    { value: "Designer", label: "Designer" },
    { value: "Exporter", label: "Exporter" },
    { value: "Importer", label: "Importer" },
    { value: 'Manufacturer', label: 'Manufacturer' },
    { value: "OEM (Original EquipmentManufacturer)", label: "OEM (Original EquipmentManufacturer)" },
    { value: "Official Distributor", label: "Official Distributor" },
    { Value: "Partner", label: "Partner" },
    { value: "Retailer", label: "Retailer" },
    { value: "Service Provider", label: "Service Provider" },
    { value: "Supplier", label: "Supplier" },
    { value: "Subsidiary", label: 'Subsidiary' },
    { value: "Stockist", label: "Stockist" },
    { value: "Trader", label: "Trader" },
    { value: 'Wholesaler', label: 'Wholesaler' }
  ];

  const getSubscriptionDuration: SubscriptionDurationMap = {
    "-1": "Lifetime",
    "1": "Monthly",
    "3": "Quarterly",
    "12": "Yearly",
  };

  const getSubscriptionListData = (): void => {
    handleGetSubscriptionList("3")
      .then((res: any) => {
        const formattedData = res.data.map((obj: any) => ({
          label: `${obj.plan_name} (${getSubscriptionDuration[parseInt(obj.duration).toString()] ||
            obj.duration + " Months"
            })`,
          value: obj.id.toString(),
        }));
        setSubscriptionList(formattedData);
      })
      .catch((error: any) => {
        toast.error("Internal server error");
      });
  };

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
    const orgName = values.organization_name;
    const fullMobile = `${values.countryCode}-${values.mobile.trim().replace(/^0+/, "")}`;

    values.spocs.forEach((spoc) => {
      const rawMobile = spoc.spoc_mobile || "";

      // Remove any existing country code or prefix like "+91-", "undefined-", etc.
      const sanitizedMobile = rawMobile
        .replace(/^\+?\w*-/, "")
        .trim()
        .replace(/^0+/, "");

      const countryCodeVal = spoc.country_code || "+91"; // fallback if undefined

      spoc.spoc_mobile = `${countryCodeVal}-${sanitizedMobile}`;
      delete (spoc as any).country_code;
    });

    const { countryCode: cc, ...updatedValues } = {
      ...values,
      mobile: fullMobile,
      name: orgName,
      locations: [...locations],
    } as any;
    updatedValues.vendor_access_type = values.vendor_access_type;
    updatedValues.buyer_company_ids = JSON.stringify(
      values.buyer_company_ids || []
    );

    handleAddVendor(updatedValues)
      .then((res: any) => {
        resetForm();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((err: any) => {
        let errorFlag = true;
        for (let x in err?.error?.response?.data?.errors) {
          toast.error(err?.error?.response?.data?.errors[x] || "Something went wrong");
          errorFlag = false;
        }

        if (errorFlag) {
          toast.error("Something went wrong");
        }
      });
  };

  useEffect(() => {
    if (selectedCountryOption) {
      handleGetStates(selectedCountryOption)
        .then((res: any) => {
          setStates(res.data.data);
        })
        .catch((err: any) => console.log("Error fetching states:", err));
    } else {
      setStates([]);
    }
  }, [selectedCountryOption]);

  useEffect(() => {
    getSubscriptionListData();
  }, []);

  useEffect(() => {
    handleGetBuyerCompanyDropdown("", 500)
      .then((res: any) => {
        const formatted = Array.isArray(res?.data)
          ? res.data.map((item: any) => ({
            value: Number(item.company_id),
            label: item.company_name
              ? item.buyer_name
                ? `${item.company_name} (${item.buyer_name})`
                : item.company_name
              : item.buyer_email || `Company #${item.company_id}`,
          }))
          : [];
        setBuyerCompanyOptions(formatted);
      })
      .catch(() => {
        toast.error("Failed to load buyer companies");
      });
  }, []);

  useEffect(() => {
    fetchCountryCodes();
    getCountries()
      .then((res: any) => {
        setCountryList(res.data);
      })
      .catch((err: any) => console.error("Error fetching countries:", err));
  }, []);

  const fetchCountryCodes = (): void => {
    getCountryCodes()
      .then((response: any) => {
        if (response?.data) {
          setCountryCode(response.data);
        } else {
          setCountryCode([]);
        }
      })
      .catch((error: any) => {
        console.log("Error fetching countries:", error);
        setCountryCode([]);
      });
  };

  const handleCountryChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedCountry = event.target.value;
    setSelectedCountryOption(selectedCountry);

    if (selectedCountry !== "") {
      setIsStateDisabled(false);

      handleGetStates(selectedCountry)
        .then((res: any) => {
          setStates(res.data.data);
          setIsCityDisabled(true);
          setSelectedStateOption("");
          setSelectedCityOption("");
        })
        .catch((err: any) => console.log("Error fetching states:", err));
    } else {
      setIsStateDisabled(true);
      setIsCityDisabled(true);
      setSelectedCountryOption("");
      setSelectedStateOption("");
      setSelectedCityOption("");
      setStates([]);
    }
  };

  const handleSubscriptionChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedSubscription = event.target.value;
    setSelectedSubscriptionOption(selectedSubscription);
  };

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const id = event.target.value;
    setSelectedStateOption(id);
    if (id !== "") {
      setIsCityDisabled(false);
      handleGetCities(id)
        .then((res: any) => {
          setCities(res.data.data);
        })
        .catch((err: any) => console.log("err", err));
    } else {
      setIsCityDisabled(true);
      setSelectedStateOption("");
      setSelectedCityOption("");
    }
  };

  const handleDeleteLocation = (locationId: string | number): void => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setLocations(locations.filter(loc => loc.id !== locationId));
    }
  };

  const handleEditLocation = (location: LocationItem): void => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const id = event.target.value;
    setSelectedCityOption(id);
  };

  const initialValues: FormValues = {
    countryCode: "+91",
    name: "",
    organization_name: "",
    email: "",
    mobile: "",
    logo: "",
    ptr_track: "",
    address: "",
    city: "",
    state: "",
    country: "",
    website: "",
    postal_code: "",
    about_vendor_company: "",
    nature_business: "",
    estd_year: "",
    gstin: "",
    import_export_code: "",
    cin: "",
    turn_over: "",
    total_employees: "",
    spocs: [],
    vendor_access_type: "public",
    buyer_company_ids: [],
    is_verified: false,
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Add Vendor</h5>
            </ol>
          </div>
          <div className="card col-12">
            <div className="card-body mt-3">
              <Formik
                initialValues={initialValues}
                validationSchema={yup.object().shape({
                  organization_name: yup
                    .string()
                    .required("Organization is required"),
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
                      /^[\+]?[0-9]{6,15}$/,
                      "Please enter a valid mobile number (6-15 digits)"
                    )
                    .required("mobile is required"),
                  vendor_access_type: yup
                    .string()
                    .oneOf(["public", "private"])
                    .required("Vendor visibility is required"),
                  buyer_company_ids: yup
                    .array()
                    .of(yup.number())
                    .optional(),
                })}
                onSubmit={(values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
                  values.country = selectedCountryOption;
                  values.state = selectedStateOption;
                  values.city = selectedCityOption;
                  (values as any).subscription_plan = selectedSubscriptionOption;
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue, setFieldTouched }) => {
                  return (
                    <Form>
                      <div className="row form-common-row mb-4">

                        <div className="col-6">
                          <label htmlFor="organization_Name">
                            Organization Name
                          </label>
                          <Field
                            type="text"
                            name="organization_name"
                            className="form-control"
                            placeholder="Organization Name"
                          />
                          <ErrorMessage
                            name="organization_name"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6 d-flex align-items-center mt-3">
                          <div className="form-check d-flex align-items-center">
                            <Field
                              type="checkbox"
                              name="is_verified"
                              id="is_verified"
                              className="form-check-input"
                              style={{
                                width: "22px",
                                height: "22px",
                                borderWidth: "2px",
                              }}
                            />
                            <label
                              className="form-check-label ms-3"
                              htmlFor="is_verified"
                              style={{
                                fontWeight: 700,
                                color: "#0066CC",
                                fontSize: "0.95rem",
                              }}
                            >
                              Mark as Verified
                            </label>
                          </div>
                        </div>
                        <div className="col-6">
                          <label htmlFor="email">Email</label>
                          <Field
                            type="email"
                            name="email"
                            className="form-control"
                            placeholder="Email"
                          />
                          <ErrorMessage
                            name="email"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="mb-3">
                          <label className="form-label">Mobile *</label>
                          <div
                            className="d-flex"
                            style={{ width: "30%", maxWidth: "800px" }}
                          >
                            {/* Country Code Dropdown */}
                            <Field
                              as="select"
                              name="countryCode"
                              className="form-select me-2"
                              style={{ width: "40%", maxWidth: "160px" }}
                            >
                              {" "}
                              <option value="+91">IN (+91)</option>{" "}
                              {/* Default selected */}
                              {countryCode.map((item) => (
                                <option key={item.id} value={item.phone_code}>
                                  {item.country_code} ({item.phone_code})
                                </option>
                              ))}
                            </Field>

                            {/* Mobile Number Input */}
                            <Field
                              type="text"
                              name="mobile"
                              className="form-control"
                              style={{ flex: "1" }}
                              placeholder="Mobile"
                            />
                          </div>
                          <ErrorMessage
                            name="mobile"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="vendor_access_type">
                            Vendor Visibility *
                          </label>
                          <Field
                            as="select"
                            name="vendor_access_type"
                            className="form-control"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </Field>
                          <ErrorMessage
                            name="vendor_access_type"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="buyer_company_ids">
                            Buyer Companies <small className="text-muted">(Select company admins)</small>
                          </label>
                          <Select
                            isMulti
                            name="buyer_company_ids"
                            options={buyerCompanyOptions}
                            value={buyerCompanyOptions.filter((option) =>
                              values.buyer_company_ids?.includes(option.value)
                            )}
                            onChange={(selectedOptions: MultiValue<BuyerCompanyOption>) => {
                              const ids = selectedOptions
                                ? selectedOptions.map((opt) => opt.value)
                                : [];
                              setFieldValue("buyer_company_ids", ids);
                            }}
                            onBlur={() =>
                              setFieldTouched("buyer_company_ids", true)
                            }
                            placeholder="Select Buyer Companies"
                            isClearable
                            isLoading={buyerCompanyOptions.length === 0}
                            noOptionsMessage={() => "No buyer companies found"}
                          />
                          {errors.buyer_company_ids &&
                            touched.buyer_company_ids && (
                              <div className="form-error">
                                {errors.buyer_company_ids as string}
                              </div>
                            )}
                        </div>

                        <div className="col-6">
                          <label htmlFor="logo" className="form-label">
                            Logo
                          </label>
                          <Field
                            name="logo"
                            type="file"
                            value={undefined}
                            className="form-control"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const file = event.target.files?.[0];
                              setFieldValue("logo", file);
                            }}
                          />
                          <ErrorMessage
                            name="logo"
                            render={(msg: string) => (
                              <div className="form-error text-danger mt-1">
                                {msg}
                              </div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="about-vendro">About Vendor</label>
                          <Field
                            name="about_vendor_company"
                            as="textarea"
                            className="form-control"
                          />
                          <ErrorMessage
                            name="about_vendor_company"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="website">Website</label>
                          <Field
                            type="text"
                            name="website"
                            className="form-control"
                            placeholder="Website"
                          />
                          <ErrorMessage
                            name="postal_code"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="nature_business">
                            Nature of Business
                          </label>
                          <Field name="nature_business">
                            {({ field, form }: FieldProps) => (
                              <Select
                                isMulti
                                name="nature_business"
                                options={businessOptions as any}
                                value={
                                  field.value
                                    ? (businessOptions as any).filter((option: BusinessOption) =>
                                      field.value
                                        .split(",")
                                        .includes(option.value)
                                    )
                                    : []
                                }
                                onChange={(selectedOptions: MultiValue<BusinessOption>) => {
                                  const vals = selectedOptions
                                    .map((opt) => opt.value)
                                    .join(",");
                                  form.setFieldValue("nature_business", vals);
                                }}
                                onBlur={() =>
                                  form.setFieldTouched("nature_business", true)
                                }
                                placeholder="Select Nature of Business"
                              />
                            )}
                          </Field>
                          <ErrorMessage
                            name="nature_business_variable"
                            component="div"
                            className="form-error"
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="about-vendro">Estd year</label>
                          <Field
                            type="number"
                            name="estd_year"
                            className="form-control"
                            placeholder="Estd year"
                          />
                          <ErrorMessage
                            name="estd_year"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="gstin">Gstin</label>
                          <Field
                            type="text"
                            name="gstin"
                            className="form-control"
                            placeholder="gstin"
                          />
                          <ErrorMessage
                            name="gstin"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="import_export_code">
                            Import Export Code
                          </label>
                          <Field
                            type="number"
                            name="import_export_code"
                            className="form-control"
                            placeholder="Import export code"
                          />
                          <ErrorMessage
                            name="import_export_code"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="about-vendro">CIN</label>
                          <Field
                            type="text"
                            name="cin"
                            className="form-control"
                            placeholder="cin"
                          />
                          <ErrorMessage
                            name="cin"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="turn_over">Turn Over</label>
                          <Field
                            type="text"
                            name="turn_over"
                            className="form-control"
                            placeholder="Ex. 50 cr"
                          />
                          <ErrorMessage
                            name="turn_over"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="total_employes">
                            Total Employees
                          </label>
                          <Field
                            type="number"
                            name="total_employees"
                            className="form-control"
                            placeholder="Total employes"
                          />
                          <ErrorMessage
                            name="total_employees"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="ptr">PTR</label>
                          <Field
                            name="ptr_track"
                            type="file"
                            value={undefined}
                            className="form-control"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const files = event.target.files?.[0];
                              setFieldValue("ptr_track", files);
                            }}
                          />
                          <ErrorMessage
                            name="ptr_track"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-6">
                          <label htmlFor="subscription">Select Subscription ( Empty for Free )</label>
                          <Field
                            onChange={handleSubscriptionChange}
                            value={selectedSubscriptionOption}
                            as="select"
                            className="form-control"
                            name="subscription"
                          >
                            <option defaultValue="-1">Select</option>
                            <option value="0">No Subscription</option>
                            {subscriptionList?.map((subscription) => (
                              <option key={subscription.value} value={subscription.value}>
                                {subscription.label}
                              </option>
                            ))}
                          </Field>
                        </div>
                        {/* SPOC Section */}
                        <div className="mt-4">
                          <h5>Vendor SPOCs</h5>
                          <FieldArray
                            name="spocs"
                            render={(arrayHelpers) => (
                              <>
                                {values.spocs.map((spoc, index) => (
                                  <div key={index} className="row mb-3">
                                    <div className="col-3">
                                      <label>Name</label>
                                      <Field
                                        type="text"
                                        name={`spocs[${index}].spoc_name`}
                                        className="form-control"
                                        placeholder="Name"
                                      />
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_name`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>
                                    <div className="col-3">
                                      <label>Email</label>
                                      <Field
                                        type="email"
                                        name={`spocs[${index}].spoc_email`}
                                        className="form-control"
                                        placeholder="Email"
                                      />
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_email`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>
                                    <div className="col-3">
                                      <label>Mobile</label>
                                      <div className="input-group">
                                        {/* Country Code Dropdown - Fixed with proper field name */}
                                        <Field
                                          as="select"
                                          name={`spocs[${index}].country_code`}
                                          className="form-select"
                                          style={{
                                            maxWidth: "120px",
                                            marginRight: "10px",
                                          }}
                                          defaultValue="+91"
                                        >
                                          <option value="" disabled>
                                            Select
                                          </option>
                                          {countryCode.map((item) => (
                                            <option
                                              key={item.id}
                                              value={item.phone_code}
                                            >
                                              {item.country_code} (
                                              {item.phone_code})
                                            </option>
                                          ))}
                                        </Field>

                                        <input
                                          type="text"
                                          className="form-control"
                                          placeholder="Mobile"
                                          value={
                                            values.spocs[
                                              index
                                            ].spoc_mobile?.replace(
                                              /^\+?\w*-/,
                                              ""
                                            ) || ""
                                          }
                                          onChange={(e: ChangeEvent<HTMLInputElement>) =>
                                            setFieldValue(
                                              `spocs[${index}].spoc_mobile`,
                                              e.target.value
                                            )
                                          }
                                        />
                                      </div>
                                      <ErrorMessage
                                        name={`spocs[${index}].spoc_mobile`}
                                        component="div"
                                        className="form-error"
                                      />
                                    </div>

                                    <div className="col-2">
                                      <label>Position</label>
                                      <Field
                                        type="text"
                                        name={`spocs[${index}].spoc_role`}
                                        className="form-control"
                                        placeholder="Position"
                                      />
                                    </div>
                                    <div className="col-1 d-flex align-items-end mb-2">
                                      <button
                                        type="button"
                                        className="btn btn-danger btn-sm"
                                        onClick={() =>
                                          arrayHelpers.remove(index)
                                        }
                                      >
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() =>
                                    arrayHelpers.push({
                                      spoc_name: "",
                                      spoc_role: "",
                                      spoc_email: "",
                                      spoc_mobile: "",
                                      country_code: "+91",
                                    })
                                  }
                                >
                                  Add SPOC
                                </button>
                              </>
                            )}
                          />
                        </div>
                      </div>

                      {/* Locations Section */}
                      <div className="mt-4">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h5>Vendor Locations</h5>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            onClick={() => {
                              setEditingLocation(null);
                              setIsLocationModalOpen(true);
                            }}
                          >
                            + Add Location
                          </button>
                        </div>

                        {locations.length > 0 ? (
                          <div className="table-responsive">
                            <table className="table table-bordered">
                              <thead>
                                <tr>
                                  <th>Country</th>
                                  <th>State</th>
                                  <th>City</th>
                                  <th>Address</th>
                                  <th>Postal Code</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {locations.map((location) => (
                                  <tr key={location.id}>
                                    <td>{location.country_name}</td>
                                    <td>{location.state_name}</td>
                                    <td>{location.city_name}</td>
                                    <td>{location.address || "-"}</td>
                                    <td>{location.postal_code || "-"}</td>
                                    <td>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-info me-2"
                                        onClick={() => handleEditLocation(location)}
                                      >
                                        Edit
                                      </button>
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDeleteLocation(location.id)}
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="alert alert-info">
                            No locations added yet. Click "Add Location" to add vendor locations.
                          </div>
                        )}
                      </div>

                      <div className="d-flex justify-content-end mt-4">
                        <button type="submit" className="btn btn-secondary">
                          Save
                        </button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
          </div>
        </div>
        <ToastContainer />

        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => {
            setIsLocationModalOpen(false);
            setEditingLocation(null);
          }}
          onSave={handleAddLocation}
          countryList={countryList}
          handleGetStates={handleGetStates}
          handleGetCities={handleGetCities}
          editingLocation={editingLocation}
        />
      </section>
    </>
  );
};

export default AddVendor;
