import React, { useEffect, useState, ChangeEvent } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray, FormikHelpers, FieldProps } from "formik";
import * as yup from "yup";
import Image from "next/image";
import {
  handleAddVendor,
  handleGetVendorDetails,
  handleUpdateVendor,
  handleGetStates,
  handleGetCities,
  handleGetVendorEditDetails,
  handleUpdateVendorSpoc,
  addNewSpoc,
  handleDeleteSpoc,
  handleGetBuyerCompanyDropdown,
  getVendorlocations,
  updateVendorlocation,
  saveVendorlocations,
  handleDeleteVendorLocation,
  handleSpocLocationMap
} from "@/utils/services/vendor-management";
import { ToastContainer, toast } from "react-toastify";
import { useRouter } from "next/router";
import SpocAddModal from "../modal/spoc-add-modal";
import VendorVariantMappingModal from "../modal/VendorVariantMappingModal";
import { getApprovedProductsByVendor, deleteVariantVendorMapping } from "@/utils/services/product-management";
import { getCountries, getCountryCodes } from "@/utils/services/location-management";
import Select, { MultiValue } from "react-select";
import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";
import LocationModal from "../modal/LocationModal";
import MapSpocModal from "../modal/MapSpocModal";

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

interface SpocDetail {
  id: number;
  name: string;
  email: string;
  mobile: string;
  role: string;
  spoc_id?: number;
  spoc_name?: string;
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
  company_id?: number;
  spocs?: Array<{ spoc_id: number; spoc_name: string }>;
}

interface VendorDetails {
  name: string;
  email: string;
  mobile: string;
  country?: string;
  state?: string;
  city?: string;
  subscription_plan_id?: string;
  address?: string;
  postal_code?: string;
}

interface CompanyDetails {
  id: number;
  company_name: string;
  logo?: string;
  website?: string;
  profile?: string;
  nature_of_business?: string;
  established_year?: string;
  gstin?: string;
  import_export_code?: string;
  cin?: string;
  turnover?: string;
  no_of_employess?: string;
  is_verified?: number | string;
}

interface MappedCompany {
  company_id: string;
}

interface EditDetails {
  vendorDetails?: VendorDetails;
  companyDetails?: CompanyDetails;
  spocDetails?: SpocDetail[];
  files?: Array<{ doc_type: string; file_path: string; file_name: string }>;
  logo?: string;
  ptr_track?: string;
  vendorAccessType?: string;
  mappedCompanies?: MappedCompany[];
}

interface VendorProduct {
  mapping_id?: number;
  id?: number;
  variant_name?: string;
  product_name?: string;
  vendor_approved_by_companies?: string;
  approved_by_names?: string[];
  make_list?: string | string[];
  is_approve?: boolean | number;
}

interface VendorOption {
  label: string;
  value: string | number;
  email?: string;
  phone?: string;
}

interface FormValues {
  name: string;
  email: string;
  mobile: string;
  organization_name: string;
  company_id: number | string;
  logo: string | File;
  ptr_track: string | File;
  website: string;
  about_vendor_company: string;
  nature_business: string;
  estd_year: string;
  gstin: string;
  import_export_code: string;
  cin: string;
  turn_over: string;
  total_employees: string;
  subscription: string;
  vendor_access_type: string;
  buyer_company_ids: number[];
  is_verified: boolean;
  countryCode?: string;
}

interface SpocFormValues {
  spoc_name: string;
  spoc_email: string;
  spoc_role: string;
  spoc_mobile: string;
}

interface SelectedSpocOption {
  spoc_name?: string;
  spoc_email?: string;
  spoc_mobile?: string;
  spoc_role?: string;
}

interface SubscriptionDurationMap {
  [key: string]: string;
}

const UpdateVendor: React.FC = () => {
  const [dtaCount, setdtaCount] = useState<number>(0);
  const [editDetails, seteditDetails] = useState<EditDetails | string>('');
  const [states, setStates] = useState<StateItem[]>([]);
  const [cities, setCities] = useState<CityItem[]>([]);
  const [selectedCountryOption, setSelectedCountryOption] = useState<string>('');
  const [selectedStateOption, setSelectedStateOption] = useState<string>('');
  const [selectedCityOption, setSelectedCityOption] = useState<string>('');
  const [isStateDisabled, setIsStateDisabled] = useState<boolean>(true);
  const [isCityDisabled, setIsCityDisabled] = useState<boolean>(true);
  const [selectedSpocOption, setSelectedSpocOption] = useState<SelectedSpocOption>({
    spoc_name: '',
    spoc_email: '',
    spoc_mobile: '',
    spoc_role: '',
  });
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState<string>("");
  const [spocId, setSpocId] = useState<number | null>(null);
  const [openAddSpoc, setOpenAddSpoc] = useState<boolean>(false);
  const [countryList, setCountryList] = useState<CountryItem[]>([]);
  const [countryCode, setCountryCode] = useState<CountryCodeItem[]>([]);
  const [subscriptionList, setSubscriptionList] = useState<SubscriptionOption[]>([]);
  const [openVariantMap, setOpenVariantMap] = useState<boolean>(false);
  const [selectedVendorOption, setSelectedVendorOption] = useState<VendorOption | null>(null);
  const [vendorProducts, setVendorProducts] = useState<VendorProduct[]>([]);

  const [spocCountryCode, setSpocCountryCode] = useState<string>("+91");
  const [buyerCompanyOptions, setBuyerCompanyOptions] = useState<BuyerCompanyOption[]>([]);
  const [company_id, setCompanyId] = useState<number | null>(null);

  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);
  const [editingLocation, setEditingLocation] = useState<LocationItem | null>(null);
  const [spocDetails, setSpocDetails] = useState<SpocDetail[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);

  const [defaultSelectedSpocs, setDefaultSelectedSpocs] = useState<number[]>([]);
  const [refreshToggle, setRefreshToggle] = useState<boolean>(false);

  const openSpocModal = (locationId: number): void => {
    setSelectedLocationId(locationId);

    const location = (locations ?? []).find((l) => l.id === locationId);
    const mappedSpocs = location?.spocs?.map((s) => s.spoc_id) || [];
    setDefaultSelectedSpocs(mappedSpocs);
    setShowModal(true);
  };

  const closeSpocModal = (): void => {
    setShowModal(false);
    setSelectedLocationId(null);
  };

  const onSaveSpocMapping = async (selectedSpocIds: number[]): Promise<void> => {
    await handleSpocLocationMap({
      location_id: selectedLocationId,
      spoc_id: selectedSpocIds,
    });

    closeSpocModal();
    setRefreshToggle((prev) => !prev);
  };

  useEffect(() => {
    if (editDetails && typeof editDetails !== 'string' && editDetails.spocDetails) {
      setSpocDetails(editDetails.spocDetails);
    }
  }, [editDetails]);

  const fetchLocations = async (): Promise<void> => {
    getVendorlocations(company_id!)
      .then((res: any) => setLocations(Array.isArray(res?.data) ? res.data : []))
      .catch((error: any) => {
        console.error('Error fetching locations:', error);
        setLocations([]);
      });
  };

  useEffect(() => {
  if (typeof editDetails === 'string' || !editDetails?.companyDetails?.id) return;
  
  const id = editDetails.companyDetails.id;
  setCompanyId(id); // still set it if needed elsewhere

  // Use the id directly — don't rely on state update
  getVendorlocations(id)
    .then((res: any) => {
      const data = Array.isArray(res?.data) ? res.data : [];
      setLocations(data.map((loc: LocationItem) => ({
        ...loc,
        spocs: Array.isArray(loc.spocs) ? loc.spocs : []
      })));
    })
    .catch((error: any) => {
      console.error('Error fetching locations:', error);
      setLocations([]);
    });

}, [(editDetails as EditDetails)?.companyDetails?.id, refreshToggle]);

  const router = useRouter();
  const id = router.query.id as string | undefined;

  const handleDeleteSpocdata = (): void => {
    handleDeleteSpoc(id!, spocId!)
      .then((res: any) => {
        toast(res.message);
        getVendorDetailsData(id!);
        setOpenAddSpoc(false);
      })
      .catch((error: any) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };

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

  const handleSpocSubmit = (object: SpocFormValues, resetForm: () => void): void => {
    const mobile = `${spocCountryCode}-${object.spoc_mobile.toString().trim().replace(/^0+/, "")}`;

    const { ...updatedData } = {
      ...object,
      spoc_mobile: mobile,
    };

    handleUpdateVendorSpoc(updatedData, id!, spocId!)
      .then((res: any) => {
        resetForm();
        toast(res.message);
        getVendorDetailsData(id!);
        setSelectedSpocOption(object);
      })
      .catch((error: any) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };

  const submitHandler = (values: FormValues, resetForm: () => void): void => {
    let fullMobile: string;
    const details = editDetails as EditDetails;
    if (values.countryCode) {
      fullMobile = `${values.countryCode}-${values.mobile
        .trim()
        .replace(/^0+/, "")}`;
    } else {
      fullMobile = `${selectedCountry?.phone_code || '+91'}-${values.mobile
        .trim()
        .replace(/^0+/, "")}`;
    }

    const { countryCode: cc, ...updatedValues } = {
      ...values,
      mobile: fullMobile,
      locations: [...(locations ?? [])],
    } as any;

    updatedValues.vendor_access_type = values.vendor_access_type;
    updatedValues.buyer_company_ids = JSON.stringify(
      values.buyer_company_ids || []
    );

    handleUpdateVendor(updatedValues, id!)
      .then((res: any) => {
        resetForm();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((error: any) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };

  const getSubscriptionDuration: SubscriptionDurationMap = {
    "-1": "Lifetime",
    "1": "Monthly",
    "3": "Quarterly",
    "12": "Yearly",
  };

  const getSubscriptionListData = (): void => {
    handleGetSubscriptionList("3")
      .then((res: any) => {
        const formattedData = Array.isArray(res?.data)
          ? res.data.map((obj: any) => ({
              label: `${obj.plan_name} (${getSubscriptionDuration[parseInt(obj.duration).toString()] ||
                obj.duration + " Months"
                })`,
              value: obj.id.toString(),
            }))
          : [];
        setSubscriptionList(formattedData);
      })
      .catch((error: any) => {
        toast.error("Internal server error");
      });
  };

  useEffect(() => {
    if (selectedCountryOption) {
      handleGetStates(selectedCountryOption)
        .then((res: any) => {
          setStates(Array.isArray(res?.data?.data) ? res.data.data : []);
        })
        .catch((err: any) => console.log("Error fetching states:", err));
    } else {
      setStates([]);
    }
  }, [selectedCountryOption]);

  useEffect(() => {
    fetchCountryCodes();
    getCountries()
      .then((res: any) => {
        setCountryList(Array.isArray(res?.data) ? res.data : []);
      })
      .catch((err: any) => console.error("Error fetching countries:", err));
  }, []);

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

  const fetchCountryCodes = (): void => {
    getCountryCodes()
      .then((response: any) => {
        if (Array.isArray(response?.data)) {
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
          setStates(Array.isArray(res?.data?.data) ? res.data.data : []);
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

  const handleStateChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const stateId = event.target.value;
    setSelectedStateOption(stateId);
    if (stateId !== '') {
      setIsCityDisabled(false);
      handleGetCities(stateId)
        .then((res: any) => {
          setCities(Array.isArray(res?.data?.data) ? res.data.data : []);
        })
        .catch((err: any) => console.log("err", err));
    } else {
      setIsCityDisabled(true);
      setSelectedStateOption('');
      setSelectedCityOption('');
    }
  };

  const handleCityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const cityId = event.target.value;
    setSelectedCityOption(cityId);
  };

  const handleSubscriptionChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const selectedSubscription = event.target.value;
    setSelectedSubscriptionOption(selectedSubscription);
  };

  const details = editDetails as EditDetails;

  const initialValues: FormValues = {
    name: details?.vendorDetails?.name || "",
    email: details?.vendorDetails?.email || "",
    mobile: details?.vendorDetails?.mobile ? details?.vendorDetails?.mobile.replace(/^\+?\d+-/, "") : "",
    organization_name: details?.companyDetails?.company_name || "",
    company_id: details?.companyDetails?.id || "",
    logo: details?.logo || "",
    ptr_track: details?.ptr_track || "",
    website: details?.companyDetails?.website || "",
    about_vendor_company: details?.companyDetails?.profile || "",
    nature_business: details?.companyDetails?.nature_of_business || "",
    estd_year: details?.companyDetails?.established_year || "",
    gstin: details?.companyDetails?.gstin || "",
    import_export_code: details?.companyDetails?.import_export_code || "",
    cin: details?.companyDetails?.cin || "",
    turn_over: details?.companyDetails?.turnover || "",
    total_employees: details?.companyDetails?.no_of_employess || "",
    subscription: details?.vendorDetails?.subscription_plan_id || "",
    vendor_access_type: details?.vendorAccessType || "public",
    buyer_company_ids: Array.isArray(details?.mappedCompanies)
      ? details.mappedCompanies
        .map((company) => parseInt(company.company_id, 10))
        .filter((item) => !Number.isNaN(item))
      : [],
    is_verified:
      details?.companyDetails?.is_verified === 1 ||
      details?.companyDetails?.is_verified === '1',
  };

  function getVendorDetailsData(vendorId: string): void {
    handleGetVendorEditDetails(vendorId)
      .then((res: any) => {
        seteditDetails(res.data);
        const data = res.data as EditDetails;
        if (data?.vendorDetails?.city) {
          setIsCityDisabled(false);
        } else {
          setIsCityDisabled(true);
        }
        setSelectedSubscriptionOption(data?.vendorDetails?.subscription_plan_id || '');
        setIsStateDisabled(false);
        setSelectedCountryOption(data?.vendorDetails?.country || '');
        setSelectedStateOption(data?.vendorDetails?.state || '');
        setSelectedCityOption(data?.vendorDetails?.city || '');
        setSpocDetails(data?.spocDetails || []);
      })
      .catch((err: any) => console.log("err", err));
  }

  useEffect(() => {
    if (!router?.query?.id) return;
    getApprovedProductsByVendor(router.query.id as string, 1, 50)
      .then((res: any) => {
        const list = res?.data?.data || res?.data || [];
        setVendorProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setVendorProducts([]));
  }, [router?.query?.id, openVariantMap]);

  useEffect(() => {
    if (id) {
      getVendorDetailsData(id);
    }
    const detailsData = editDetails as EditDetails;
    if (detailsData?.vendorDetails?.state && detailsData?.vendorDetails?.state != null && detailsData?.vendorDetails?.state != 'null') {
      handleGetCities(detailsData?.vendorDetails?.state)
        .then((res: any) => {
          setCities(Array.isArray(res?.data?.data) ? res.data.data : []);
        })
        .catch((err: any) => console.log("err", err));
    }
  }, [id, (editDetails as EditDetails)?.vendorDetails?.country, (editDetails as EditDetails)?.vendorDetails?.state, (editDetails as EditDetails)?.vendorDetails?.city, (editDetails as EditDetails)?.vendorDetails?.subscription_plan_id]);

  const extractedCountryCode = (editDetails as EditDetails)?.vendorDetails?.mobile?.match(/^\+?\d+/)?.[0] || "+91";

  const selectedCountry = (countryCode ?? []).find(
    (item) => item.phone_code === extractedCountryCode
  );

  const handleAddSpoc = (spocDetailsData: any): void => {
    addNewSpoc(spocDetailsData, id!)
      .then((res: any) => {
        toast(res.message, { position: "top-right" });
      })
      .catch((error: any) => {
        toast(error.message?.response?.data?.message, { position: "top-right" });
        console.log(error);
      })
      .finally(() => {
        getVendorDetailsData(id!);
        const detailsData = editDetails as EditDetails;
        handleGetCities(detailsData?.vendorDetails?.state || '')
          .then((res: any) => {
            setCities(Array.isArray(res?.data?.data) ? res.data.data : []);
          })
          .catch((err: any) => console.log("err", err));
        setOpenAddSpoc(false);
      });
  };

  const handleAddLocation = (newLocation: LocationItem): void => {
    newLocation.company_id = company_id!;

    if (editingLocation) {
      updateVendorlocation(newLocation, editingLocation.id as number)
        .then((res: any) => {
          toast(res.message, { position: "top-right" });
          fetchLocations();
        })
        .catch((error: any) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
        })
        .finally(() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        });
    } else {
      const newLoc = { ...newLocation };

      saveVendorlocations(newLoc)
        .then((res: any) => {
          toast(res.message, { position: "top-right" });
          fetchLocations();
        })
        .catch((error: any) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
        })
        .finally(() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        });
    }
  };

  const handleEditLocation = (location: LocationItem): void => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleDeleteLocation = (locationId: number | string): void => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setLocations((locations ?? []).filter(loc => loc.id !== locationId));
      handleDeleteVendorLocation(locationId as number)
        .then((res: any) => {
          toast(res.message, { position: "top-right" });
        })
        .catch((error: any) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
        })
        .finally(() => {
          getVendorDetailsData(id!);
        });
    }
  };

  return (
    <>
      <section className="content">
        <div className="container-fluid">
          <div className="col-12 mb-3">
            <ol className="breadcrumb float-sm-left">
              <h5 className="heading-container">Update Vendor</h5>
            </ol>
          </div>
          <div className="card col-12">
            <div className="card-body mt-3">
              <Formik
                enableReinitialize={true}
                initialValues={initialValues}
                validationSchema={yup.object().shape({
                  name: yup.string().required("Name is required"),
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
                  const detailsData = editDetails as EditDetails;
                  (values as any).country =
                    selectedCountryOption ||
                    detailsData?.vendorDetails?.country;
                  (values as any).state =
                    selectedStateOption || detailsData?.vendorDetails?.state;
                  (values as any).city =
                    selectedCityOption || detailsData?.vendorDetails?.city;
                  values.subscription =
                    selectedSubscriptionOption || detailsData?.vendorDetails?.subscription_plan_id || '';
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue, setFieldTouched }) => (
                  <Form>
                    {editDetails && typeof editDetails !== 'string' && (
                      <div className="row form-common-row mb-4">
                        <div className="col-6">
                          <label htmlFor="Organization-Address">Name</label>
                          <Field
                            type="text"
                            name="name"
                            className="form-control"
                            placeholder="Name"
                          />
                          <ErrorMessage
                            name="name"
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
                          <label htmlFor="Organization-Address">Email</label>
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
                              style={{ width: "120px" }}
                            >
                              <option value="countryCode">
                                {selectedCountry?.country_code} (
                                {selectedCountry?.phone_code})
                              </option>{" "}
                              {/* Default selected */}
                              {(countryCode ?? []).map((item) => (
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
                            value={(buyerCompanyOptions ?? []).filter((option) =>
                              (values.buyer_company_ids ?? []).includes(option.value)
                            )}
                            onChange={(selectedOptions: MultiValue<BuyerCompanyOption>) => {
                              const ids = (selectedOptions ?? []).map((opt) => opt.value);
                              setFieldValue("buyer_company_ids", ids);
                            }}
                            onBlur={() =>
                              setFieldTouched("buyer_company_ids", true)
                            }
                            placeholder="Select Buyer Companies"
                            isClearable
                            isLoading={(buyerCompanyOptions ?? []).length === 0}
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
                          <label htmlFor="organization-name">
                            Organization
                          </label>
                          <Field
                            type="text"
                            name="organization_name"
                            className="form-control"
                            placeholder="Organization"
                          />
                          <ErrorMessage
                            name="organization_name"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="logo">Logo</label>
                          <Field
                            name="logo"
                            type="file"
                            value={undefined}
                            className="form-control"
                            onChange={(event: ChangeEvent<HTMLInputElement>) => {
                              const files = event.target.files?.[0];
                              setFieldValue("logo", files);
                            }}
                          />
                          {(editDetails as EditDetails)?.companyDetails?.logo != null && (
                            <div className="mt-3" style={{ display: "flex" }}>
                              <label htmlFor="year">
                                Prefilled Image -&nbsp;{" "}
                              </label>
                              <p>
                                <Image
                                  width={30}
                                  height={30}
                                  src={
                                    (editDetails as EditDetails)?.companyDetails?.logo == null
                                      ? "/assets/images/products.png"
                                      : (editDetails as EditDetails)?.companyDetails?.logo!
                                  }
                                  unoptimized
                                  className="rounded prof-img"
                                  alt="..."
                                />
                              </p>
                            </div>
                          )}
                          <ErrorMessage
                            name="logo"
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
                                  const vals = (selectedOptions ?? [])
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
                        <div className="row">
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
                            {((editDetails as EditDetails)?.files ?? []).map(
                                (data, idx) =>
                                  data.doc_type == "ptr" && (
                                    <span key={idx}>
                                      <a href={data.file_path} target="_blank">
                                        <i className="fa fa-file"></i>{" "}
                                        {data.file_name}
                                      </a>
                                    </span>
                                  )
                              )}
                          </div>
                          <div className="col-6">
                            <label htmlFor="subscription">Select Subscription ( Empty for Free )</label>
                            <Field
                              as="select"
                              className="form-control"
                              name="subscription"
                              value={selectedSubscriptionOption}
                              onChange={handleSubscriptionChange}
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
                        </div>
                      </div>
                    )}
                    <div className="d-flex justify-content-end">
                      <button type="submit" className="btn btn-secondary">
                        Save
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* adding div for spoc details */}
          <div className="card col-12">
            <div className="d-flex justify-content-end">
              <button
                type="submit"
                className="btn btn-secondary"
                onClick={() => setOpenAddSpoc(true)}
              >
                Create New Spoc
              </button>
            </div>
            <div className="card-body mt-3">
              <Formik
                initialValues={{
                  spoc_name: selectedSpocOption.spoc_name || "",
                  spoc_email: selectedSpocOption.spoc_email || "",
                  spoc_role: selectedSpocOption.spoc_role || "",
                  spoc_mobile: selectedSpocOption.spoc_mobile || "",
                }}
                enableReinitialize={true}
                onSubmit={(values: SpocFormValues, { resetForm }: FormikHelpers<SpocFormValues>) => {
                  handleSpocSubmit(values, resetForm);
                }}
              >
                {({ values, handleChange, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    {Array.isArray((editDetails as EditDetails)?.spocDetails) &&
                      (editDetails as EditDetails).spocDetails!.length > 0 ? (
                      <div className="row form-common-row mb-4">
                        <div className="form-group">
                          <label htmlFor="select-input" className="form-label">
                            Select Spoc
                          </label>
                          <select
                            id="select-input"
                            className="form-control"
                            value={selectedSpocOption.spoc_name}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                              const selectedValue = e.target.value;
                              if (!selectedValue) {
                                setSelectedSpocOption({});
                                setSpocId(null);
                                return;
                              }

                              const selectedOption = JSON.parse(selectedValue);
                              setSpocCountryCode(
                                selectedOption.mobile.match(/^\+?\d+/)?.[0] ||
                                "+91"
                              );
                              setSelectedSpocOption({
                                spoc_name: selectedOption.name,
                                spoc_email: selectedOption.email,
                                spoc_mobile: selectedOption.mobile
                                  .toString()
                                  .trim()
                                  .replace(/^\+?\d{1,4}-?/, ""),
                                spoc_role: selectedOption.role,
                              });
                              setSpocId(selectedOption.id);
                            }}
                          >
                            <option value="">Select an option</option>
                            {Array.isArray((editDetails as EditDetails)?.spocDetails) && (editDetails as EditDetails).spocDetails!.length > 0
                              ? ((editDetails as EditDetails).spocDetails ?? []).map((option) => (
                                <option
                                  key={option.id}
                                  value={JSON.stringify(option)}
                                >
                                  {`${option.name} ${option.role ? " ," + option.role : ""
                                    }`}
                                </option>
                              ))
                              : "No Spoc Found"}
                          </select>
                        </div>

                        <div className="col-6">
                          <label htmlFor="spoc-name">Name</label>
                          <Field
                            type="text"
                            name="spoc_name"
                            className="form-control"
                            placeholder="Name"
                            value={values.spoc_name}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="name"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="spoc-email">Email</label>
                          <Field
                            type="text"
                            name="spoc_email"
                            className="form-control"
                            placeholder="Email"
                            value={values.spoc_email}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="email"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="spoc-role">Role</label>
                          <Field
                            type="text"
                            name="spoc_role"
                            className="form-control"
                            placeholder="Role"
                            value={values.spoc_role}
                            onChange={handleChange}
                          />
                          <ErrorMessage
                            name="role"
                            render={(msg: string) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>

                        <div className="col-6">
                          <label htmlFor="spoc-mobile">Mobile</label>
                          <div
                            className="d-flex align-items-center gap-2"
                            style={{ maxWidth: "500px" }}
                          >
                            {/* Country Code Dropdown */}
                            <Field
                              as="select"
                              name="countryCode"
                              className="form-select"
                              value={spocCountryCode?.toString()}
                              style={{ flex: "0 0 120px" }}
                              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                                const newCountryCode = e.target.value;
                                setSpocCountryCode(newCountryCode);
                              }}
                            >
                              {(countryCode ?? []).map((item) => (
                                <option key={item.id} value={item.phone_code}>
                                  {item.country_code} ({item.phone_code})
                                </option>
                              ))}
                            </Field>

                            {/* Mobile Number Input */}
                            <Field
                              type="text"
                              name="spoc_mobile"
                              className="form-control"
                              placeholder="Mobile"
                              value={values.spoc_mobile}
                              onChange={handleChange}
                              style={{ flex: "1" }}
                            />
                            <ErrorMessage
                              name="spoc_mobile"
                              component="div"
                              className="form-error"
                            />
                          </div>
                        </div>

                        <div className="d-flex justify-content-end">
                          {/* Delete button (Visible only if a SPOC is selected) */}
                          {selectedSpocOption.spoc_name && (
                            <button
                              type="button"
                              className="btn btn-danger"
                              style={{ marginRight: "10px" }}
                              onClick={() => handleDeleteSpocdata()}
                            >
                              Delete
                            </button>
                          )}

                          <button type="submit" className="btn btn-secondary">
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      "No Spoc Found"
                    )}
                  </Form>
                )}
              </Formik>
            </div>
          </div>

          {/* Products - Variants mapped section */}
          <div className="card col-12 mt-3">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3">
              <h6 className="mb-0">Products - Variants</h6>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedVendorOption({
                    label: (editDetails as EditDetails)?.companyDetails?.company_name || (editDetails as EditDetails)?.vendorDetails?.name || 'Vendor',
                    value: router.query.id as string,
                    email: (editDetails as EditDetails)?.vendorDetails?.email,
                    phone: (editDetails as EditDetails)?.vendorDetails?.mobile
                  });
                  setOpenVariantMap(true);
                }}
              >
                Map Variants
              </button>
            </div>
            <div className="card-body">
              {Array.isArray(vendorProducts) && vendorProducts.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Product</th>
                        <th>Approved By</th>
                        <th>Make</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendorProducts.map((mapping) => {
                        return (
                          <tr key={mapping.mapping_id || mapping.id}>
                            <td>{mapping.variant_name || '-'}</td>
                            <td>{mapping.product_name || '-'}</td>
                            <td>{mapping.vendor_approved_by_companies || mapping.approved_by_names?.join(', ') || '-'}</td>
                            <td>{Array.isArray(mapping.make_list) ? mapping.make_list.join(', ') : (mapping.make_list || '-')}</td>
                            <td>{mapping.is_approve === true || mapping.is_approve === 1 ? 'Approved' : 'Pending'}</td>
                            <td>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-primary mr-2"
                                onClick={() => {
                                  if (mapping.mapping_id) {
                                    window.location.href = `/product-management/mapping/${mapping.mapping_id}`;
                                  }
                                }}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-danger"
                                onClick={() => {
                                  if (!mapping.mapping_id) {
                                    toast.error("Mapping ID is required");
                                    return;
                                  }
                                  if (window.confirm("Are you sure you want to unmap this variant from the vendor? This action cannot be undone.")) {
                                    deleteVariantVendorMapping(mapping.mapping_id)
                                      .then((res: any) => {
                                        toast.success(res.message || "Mapping deleted successfully");
                                        getVendorDetailsData(id!);
                                        getApprovedProductsByVendor(router.query.id as string, 1, 50)
                                          .then((res: any) => {
                                            const list = res?.data?.data || res?.data || [];
                                            setVendorProducts(Array.isArray(list) ? list : []);
                                          })
                                          .catch(() => setVendorProducts([]));
                                      })
                                      .catch((error: any) => {
                                        console.error("Error unmapping:", error);
                                        let txt = "Failed to unmap variant from vendor";
                                        if (error.error?.response?.data?.message) {
                                          txt = error.error.response.data.message;
                                        } else if (error.message) {
                                          txt = error.message;
                                        }
                                        toast.error(txt);
                                      });
                                  }
                                }}
                                title="Unmap variant from vendor"
                              >
                                <i className="fas fa-unlink"></i> Unmap
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-muted">No Specs Found</div>
              )}
            </div>
          </div>
        </div>

        <ToastContainer />
      </section>
      {openVariantMap && (
        <VendorVariantMappingModal
          isVisible={openVariantMap}
          onCancel={() => setOpenVariantMap(false)}
          onSuccess={() => getVendorDetailsData(id!)}
          vendor={selectedVendorOption}
        />
      )}
      {openAddSpoc && (
        <SpocAddModal
          openModal={openAddSpoc}
          closeModal={() => setOpenAddSpoc(false)}
          vendorId={id}
          getVendorDetails={getVendorDetailsData}
          handleAddSpoc={handleAddSpoc}
          countryCode={countryCode}
        />
      )}
      <div className="card col-12 mt-3">
        <div className="d-flex justify-content-between align-items-center px-3 pt-3">
          <h6 className="mb-0">Vendor Locations</h6>
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
        <div className="card-body">
          {Array.isArray(locations) && locations.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Country</th>
                    <th>State</th>
                    <th>City</th>
                    <th>Address</th>
                    <th>Postal Code</th>
                    <th>Assigned Spocs</th>
                    <th>Actions</th>
                    <th>Map Loc</th>
                  </tr>
                </thead>
                <tbody>
                  {locations?.map((location) => (
                    <tr key={location.id}>
                      <td>{location.country_name}</td>
                      <td>{location.state_name}</td>
                      <td>{location.city_name}</td>
                      <td>{location.address || "-"}</td>
                      <td>{location.postal_code || "-"}</td>
                      <td>{(location?.spocs ?? []).map((spoc) => spoc.spoc_name).join(", ") || "-"}</td>

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
                      <td>
                        <button
                          type="button"
                          className="btn btn-sm btn-primary"
                          onClick={() => openSpocModal(location.id as number)}
                        >
                          Map SPOC
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="alert alert-info">
              No locations found for this vendor.
            </div>
          )}
        </div>
      </div>
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

      {/* Modal Component */}
      <MapSpocModal
        show={showModal}
        onClose={closeSpocModal}
        spocDetails={spocDetails}
        onSave={onSaveSpocMapping}
        defaultSelected={defaultSelectedSpocs}
      />
    </>
  );
};

export default UpdateVendor;
