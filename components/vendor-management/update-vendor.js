import React, { useEffect, useState } from "react";
import { Form, Formik, Field, ErrorMessage, FieldArray } from "formik";
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
import img1 from "../../public/assets/images/products.png";
import SpocAddModal from "../modal/spoc-add-modal";
import VendorVariantMappingModal from "../modal/VendorVariantMappingModal";
import { getApprovedProductsByVendor, deleteVariantVendorMapping } from "@/utils/services/product-management";
import { getCountries ,getCountryCodes } from "@/utils/services/location-management";
import Select from "react-select";
import { handleGetSubscriptionList } from "@/utils/services/price-subscription-management";
import LocationModal from "../modal/LocationModal";
import MapSpocModal from "../modal/MapSpocModal";

const UpdateVendor = () => {
  const [dtaCount, setdtaCount] = useState(0);
  const [editDetails, seteditDetails] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [selectedCountryOption, setSelectedCountryOption] = useState('');
  const [selectedStateOption, setSelectedStateOption] = useState('');
  const [selectedCityOption, setSelectedCityOption] = useState('');
  const [isStateDisabled, setIsStateDisabled] = useState(true);
  const [isCityDisabled, setIsCityDisabled] = useState(true);
  const [selectedSpocOption, setSelectedSpocOption] = useState({
    spoc_name: '',
    spoc_email: '',
    spoc_mobile: '',
    spoc_role: '',
    
  });
  const [selectedSubscriptionOption, setSelectedSubscriptionOption] = useState("");
  const [spocId, setSpocId] = useState(null);
  const [openAddSpoc,setOpenAddSpoc] = useState(false);
  const [countryList,setCountryList] = useState([]);
  const [countryCode , setCountryCode] = useState([]);
  const [subscriptionList, setSubscriptionList] = useState([]);
  const [openVariantMap, setOpenVariantMap] = useState(false);
  const [selectedVendorOption, setSelectedVendorOption] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
 
  const [spocCountryCode, setSpocCountryCode] = useState("+91");
  const [buyerCompanyOptions, setBuyerCompanyOptions] = useState([]);
  const [company_id,setCompanyId] = useState(null);


  const [locations, setLocations] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [spocDetails, setSpocDetails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState(null);

  const [defaultSelectedSpocs, setDefaultSelectedSpocs] = useState([]);
  const [refreshToggle, setRefreshToggle] = useState(false);


const openSpocModal = (locationId) => {
  setSelectedLocationId(locationId);

  // extract mapped SPOC IDs from location data
  const location = locations.find((l) => l.id === locationId);
  const mappedSpocs = location?.spocs?.map((s) => s.spoc_id) || [];
  setDefaultSelectedSpocs(mappedSpocs);
  setShowModal(true);
};


  const closeSpocModal = () => {
    setShowModal(false);
    setSelectedLocationId(null);
  };

const onSaveSpocMapping = async (selectedSpocIds) => {
  await handleSpocLocationMap({
    location_id: selectedLocationId,
    spoc_ids: selectedSpocIds,  // array
  });

  closeSpocModal();

  // trigger locations reload
  setRefreshToggle((prev) => !prev);
};


  useEffect(() => {
    if(editDetails && editDetails.spocDetails){
      setSpocDetails(editDetails.spocDetails)
    }
  },[editDetails])

  useEffect(() => {
  if (!editDetails?.companyDetails?.id) return;

  setCompanyId(editDetails.companyDetails.id);
}, [editDetails?.companyDetails?.id]);


  const fetchLocations = async () =>{
     getVendorlocations(company_id)
     .then((res)=>setLocations(res?.data))
     .catch((error) => {
       console.error('Error fetching locations:', error);
       setLocations([]);
     })
  }
 useEffect(() => {
  if (company_id) {
    fetchLocations();

  }
}, [company_id, refreshToggle]);




  const router = useRouter();
  let id = router.query.id;

  const handleDeleteSpocdata =  () => {
    handleDeleteSpoc(id,spocId)
      .then((res) => {
        toast(res.message);
        getVendorDetails(id);
        setOpenAddSpoc(false);
      })
      .catch((error) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
    } 
    
    const businessOptions = [
      {value : "Authorised Distributor", label : "Authorised Distributor"},
      {value : "Authorised Dealer", label : "Authorised Dealer"},
      {value : "Branch", label : "Branch"},
      {value : "Channel Partner", label : "Channel Partner"},
      {value : "Distributor", label : "Distributor"},
      {value : "Constructor", label : "Constructor"},
      {value : "Contractor", label : "Contractor"},
      {value : "Dealer", label: "Dealer" },
      {value : "Designer", label : "Designer"},
      {value : "Exporter", label : "Exporter"},
      {value : "Importer", label : "Importer"},
      {value : 'Manufacturer', label: 'Manufacturer' },
      {value : "OEM (Original EquipmentManufacturer)", label : "OEM (Original EquipmentManufacturer)"},
      {value : "Official Distributor", label : "Official Distributor"},
      {Value : "Partner", label : "Partner"},
      {value : "Retailer", label : "Retailer"},
      {value : "Service Provider", label : "Service Provider"},
      {value : "Supplier", label : "Supplier"},
      {value : "Subsidiary" , label : 'Subsidiary'},
      {value : "Stockist", label : "Stockist"},
      {value : "Trader", label : "Trader"},
      { value: 'Wholesaler', label: 'Wholesaler' } 
      
];

    
    const handleSpocSubmit = (object,resetForm) => {
   

    const mobile = `${spocCountryCode}-${object.spoc_mobile.toString().trim().replace(/^0+/, "")}`;
    
    const { countryCode, ...updatedData } = {
      ...object,
      spoc_mobile: mobile, // Updating spoc_mobile field
    };
    
    
    handleUpdateVendorSpoc(updatedData,id,spocId)
      .then((res) => {
        resetForm();
        toast(res.message);
        getVendorDetails(id);
        setSelectedSpocOption(object);
      })
      .catch((error) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  }
  const submitHandler = (values, resetForm) => {
    let fullMobile;
    if (values.countryCode) {
      fullMobile = `${values.countryCode}-${values.mobile
        .trim()
        .replace(/^0+/, "")}`;
    } else {
      fullMobile = `${selectedCountry.phone_code}-${values.mobile
        .trim()
        .replace(/^0+/, "")}`;
    }
    
    const { countryCode, ...updatedValues } = { 
      ...values, 
      mobile: fullMobile,
      locations: [...locations], // Add locations to updatedValues
       };

    updatedValues.vendor_access_type = values.vendor_access_type;
    updatedValues.buyer_company_ids = JSON.stringify(
      values.buyer_company_ids || []
    );

      //  console.log("checking update",updatedValues)
    handleUpdateVendor(updatedValues, id)
      .then((res) => {
        resetForm();
        toast(res.message);
        router.push("/vendor-management");
      })
      .catch((error) => {
        console.log("err", error);
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error?.error?.response?.data?.errors[x];
        }
        toast(txt);
      });
  };

  let getSubscriptionDuration = {
    "-1": "Lifetime",
    1: "Monthly",
    3: "Quarterly",
    12: "Yearly",
  };

  const getSubscriptionList = () => {
    handleGetSubscriptionList("3")
      .then((res) => {
        const formattedData = res.data.map((obj) => ({
          label: `${obj.plan_name} (${
            getSubscriptionDuration[parseInt(obj.duration)] ||
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

 useEffect(() => {
    if (selectedCountryOption) {
      handleGetStates(selectedCountryOption)
        .then((res) => {
          setStates(res.data.data); // Populate the states list
        })
        .catch((err) => console.log("Error fetching states:", err));
    } else {
      setStates([]); // Clear states if no country is selected
    }
  }, [selectedCountryOption]);
  

useEffect(() => {
  fetchCountryCodes()
  getCountries()
  .then((res) => {
       setCountryList(res.data) // Set country list state
    })
    .catch((err) => console.error("Error fetching countries:", err));
}, []);

useEffect(() => {
    getSubscriptionList();
  }, [])

useEffect(() => {
  handleGetBuyerCompanyDropdown("", 500)
    .then((res) => {
      const formatted = Array.isArray(res?.data)
        ? res.data.map((item) => ({
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

 const fetchCountryCodes = () => {
    getCountryCodes()
      .then((response) => {
        if (response?.data) {
          setCountryCode(response.data);
        } else {
          setCountryCode([]);
        }
      })
      .catch((error) => {
        console.log("Error fetching countries:", error);
        setCountryCode([]);
      });
  };

 const handleCountryChange = (event) => {
   const selectedCountry = event.target.value;
   setSelectedCountryOption(selectedCountry);
 
   if (selectedCountry !== "") {
     setIsStateDisabled(false); // Enable the state dropdown
 
     // Fetch states for the selected country
     handleGetStates(selectedCountry)
       .then((res) => {
         setStates(res.data.data); // Populate the states list
         setIsCityDisabled(true);  // Disable city dropdown until a state is selected
         setSelectedStateOption(""); // Clear any previously selected state
         setSelectedCityOption(""); // Clear any previously selected city
       })
       .catch((err) => console.log("Error fetching states:", err));
   } else {
     // Reset all selections if no country is selected
     setIsStateDisabled(true);
     setIsCityDisabled(true);
     setSelectedCountryOption("");
     setSelectedStateOption("");
     setSelectedCityOption("");
     setStates([]); // Clear the state list
   }
 };
  const handleStateChange = (event) => {
    let id = event.target.value;
    setSelectedStateOption(id)
    if (id !== '') {
      setIsCityDisabled(false)
      handleGetCities(id)
        .then(res => {
          setCities(res.data.data)
        })
        .catch((err) => console.log("err", err));
    } else {
      setIsCityDisabled(true)
      setSelectedStateOption('')
      setSelectedCityOption('')
    }
  };
  const handleCityChange = (event) => {
    let id = event.target.value;
    setSelectedCityOption(id)
  };

  // Handle Subscription Change
  const handleSubscriptionChange = (event) => {
    const selectedSubscription = event.target.value;
    setSelectedSubscriptionOption(selectedSubscription);
  }

  const initialValues = {
    name: editDetails?.vendorDetails?.name || "",
    email: editDetails?.vendorDetails?.email || "",
    mobile: editDetails?.vendorDetails?.mobile ? editDetails?.vendorDetails?.mobile.replace(/^\+?\d+-/, "") : "",
    organization_name: editDetails?.companyDetails?.company_name || "",
    company_id : editDetails?.companyDetails?.id || "",
    logo: editDetails?.logo,
    ptr_track: editDetails?.ptr_track,
    // address: editDetails?.vendorDetails?.address || "",
    website: editDetails?.companyDetails?.website || "",
    // postal_code: editDetails?.vendorDetails?.postal_code || "",
    about_vendor_company: editDetails?.companyDetails?.profile || "",
    nature_business: editDetails?.companyDetails?.nature_of_business || "",
    estd_year: editDetails?.companyDetails?.established_year || "",
    gstin: editDetails?.companyDetails?.gstin || "",
    import_export_code: editDetails?.companyDetails?.import_export_code || "",
    cin: editDetails?.companyDetails?.cin || "",
    turn_over: editDetails?.companyDetails?.turnover || "",
    total_employees: editDetails?.companyDetails?.no_of_employess || "",
    subscription: editDetails?.vendorDetails?.subscription_plan_id || "-1",
    subscription_plan: editDetails?.companyDetails?.subscription_plan || "",
    vendor_access_type: editDetails?.vendorAccessType || "public",
    buyer_company_ids: Array.isArray(editDetails?.mappedCompanies)
      ? editDetails.mappedCompanies
          .map((company) => parseInt(company.company_id, 10))
          .filter((item) => !Number.isNaN(item))
      : [],
  };
  
 

  function getVendorDetails(id){
    handleGetVendorEditDetails(id)
      .then(res => {
        seteditDetails(res.data)
        if (editDetails?.vendorDetails?.city) {
          setIsCityDisabled(false)
        } else {
          setIsCityDisabled(true)
        }
        // Pre-select subscription plan
        setSelectedSubscriptionOption(editDetails?.vendorDetails?.subscription_plan_id);
        setIsStateDisabled(false)
        setSelectedCountryOption(editDetails?.vendorDetails?.country)
        setSelectedStateOption(editDetails?.vendorDetails?.state)
        setSelectedCityOption(editDetails?.vendorDetails?.city)
        setSpocDetails(editDetails?.spocDetails || [])
      })
      .catch((err) => console.log("err", err));
  }

  useEffect(() => {
    if (!router?.query?.id) return;
    // Load vendor products/variants list for display
    getApprovedProductsByVendor(router.query.id, 1, 50)
      .then((res) => {
        const list = res?.data?.data || res?.data || [];
        setVendorProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => setVendorProducts([]));
  }, [router?.query?.id, openVariantMap]);



  useEffect(() => {
    if (id) {
      getVendorDetails(id);      
    }
    if (editDetails?.vendorDetails?.state && editDetails?.vendorDetails?.state != null && editDetails?.vendorDetails?.state != 'null') {
      handleGetCities(editDetails?.vendorDetails?.state)
        .then(res => {
          setCities(res.data.data)
        })
        .catch((err) => console.log("err", err));
    }
    // Set city when state, country change also run when subscription plan changes.
  }, [id, editDetails?.vendorDetails?.country, editDetails?.vendorDetails?.state, editDetails?.vendorDetails?.city,  editDetails?.companyDetails?.subscription_plan])


  const extractedCountryCode = editDetails?.vendorDetails?.mobile.match(/^\+?\d+/)?.[0] || "+91";
  
  
  const selectedCountry = countryCode.find(
    (item) => item.phone_code === extractedCountryCode
  );


  const handleAddSpoc = (spocDetails) => {
    addNewSpoc(spocDetails, id)
      .then((res) => {
        toast(res.message, { position: "top-right", });
      })
      .catch((error) => {
        toast(error.message?.response?.data?.message, { position: "top-right", });
        console.log(error)
      })
      .finally(() => {
        getVendorDetails(id)
        handleGetCities(editDetails?.vendorDetails?.state)
          .then(res => {
            setCities(res.data.data)
          })
          .catch((err) => console.log("err", err));
        setOpenAddSpoc(false);
      }) // Call the submission handler
  }

  const handleAddLocation = (newLocation) => {
    newLocation.company_id = company_id;

    if (editingLocation) {
      // Update existing
      updateVendorlocation(newLocation, editingLocation.id)
        .then((res) => {
          toast(res.message, { position: "top-right" });
          fetchLocations(); // Fetch latest locations from database
        })
        .catch((error) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
        })
        .finally(() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        });

    } else {
      // Add new
      const newLoc = { ...newLocation };

      saveVendorlocations(newLoc)
        .then((res) => {
          toast(res.message, { position: "top-right" });
          fetchLocations(); // Fetch latest locations from database
        })
        .catch((error) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
        })
        .finally(() => {
          setIsLocationModalOpen(false);
          setEditingLocation(null);
        });
    }
  };


  const handleEditLocation = (location) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleDeleteLocation = (locationId) => {
    if (window.confirm("Are you sure you want to delete this location?")) {
      setLocations(locations.filter(loc => loc.id !== locationId));
      handleDeleteVendorLocation(locationId)
        .then((res) => {
          toast(res.message, { position: "top-right" });
        })
        .catch((error) => {
          toast(error?.response?.data?.message, { position: "top-right" });
          console.log(error);
      })
      .finally(() => {
          getVendorDetails(id);   
      })
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
                onSubmit={(values, { resetForm }) => {
                  values.country =
                    selectedCountryOption ||
                    editDetails?.vendorDetails?.country;
                  values.state =
                    selectedStateOption || editDetails?.vendorDetails?.state;
                  values.city =
                    selectedCityOption || editDetails?.vendorDetails?.city;
                  values.subscription_plan = 
                    selectedSubscriptionOption || editDetails?.companyDetails?.subscription_plan;
                  submitHandler(values, resetForm);
                }}
              >
                {({ errors, touched, values, handleChange, setFieldValue, setFieldTouched }) => (
                  <Form>
                    {editDetails && (
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
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
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
                            render={(msg) => (
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
                            />
                          </div>
                          <ErrorMessage
                            name="mobile"
                            component="div"
                            className="text-danger"
                          />
                        </div>
                        <div class="col-6">
                          <label htmlFor="vendor_access_type">
                            Vendor Visibility *
                          </label>
                          <Field
                            as="select"
                            name="vendor_access_type"
                            class="form-control"
                          >
                            <option value="public">Public</option>
                            <option value="private">Private</option>
                          </Field>
                          <ErrorMessage
                            name="vendor_access_type"
                            render={(msg) => (
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
                            onChange={(selectedOptions) => {
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
                                {errors.buyer_company_ids}
                              </div>
                            )}
                        </div>
                        <div class="col-6">
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
                            render={(msg) => (
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
                            onChange={(event) => {
                              let files = event.target.files[0];
                              setFieldValue("logo", files);
                            }}
                          />
                          {editDetails?.companyDetails?.logo != null && (
                            <div className="mt-3" style={{ display: "flex" }}>
                              <label htmlFor="year">
                                Prefilled Image -&nbsp;{" "}
                              </label>
                              <p htmlFor="year">
                                <Image
                                  width={30}
                                  height={30}
                                  src={
                                    editDetails?.companyDetails?.logo == null
                                      ? img1
                                      : editDetails?.companyDetails?.logo
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
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        {/* <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="address" className="form-label">
                              Address
                            </label>
                            <Field
                              type="text"
                              name="address"
                              id="address"
                              className="form-control"
                              placeholder="Address"
                            />
                            <ErrorMessage
                              name="address"
                              render={(msg) => (
                                <div className="form-error text-danger">
                                  {msg}
                                </div>
                              )}
                            />
                          </div>

                          <div className="col-md-6 mb-3">
                            <label
                              htmlFor="about_vendor_company"
                              className="form-label"
                            >
                              About Vendor
                            </label>
                            <Field
                              name="about_vendor_company"
                              as="textarea"
                              id="about_vendor_company"
                              className="form-control"
                              placeholder="Write about the vendor..."
                              rows={3}
                            />
                            <ErrorMessage
                              name="about_vendor_company"
                              render={(msg) => (
                                <div className="form-error text-danger">
                                  {msg}
                                </div>
                              )}
                            />
                          </div>
                        </div> */}

                        {/* <div class="col-6">
                          <label htmlFor="about-vendro">Postal Code</label>
                          <Field
                            type="string"
                            name="postal_code"
                            className="form-control"
                            placeholder="Postal code"
                          />
                          <ErrorMessage
                            name="postal_code"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className="col-4">
                          <label htmlFor="city">Country</label>
                          <Field
                            onChange={handleCountryChange}
                            value={selectedCountryOption}
                            as="select"
                            className="form-control"
                            name="country"
                          >
                            <option value="">Select</option>
                            {countryList?.map((country) => (
                              <option key={country.id} value={country.id}>
                                {country.country_name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="col-4">
                          <label htmlFor="state">State</label>
                          <Field
                            value={selectedStateOption}
                            onChange={handleStateChange}
                            disabled={isStateDisabled}
                            as="select"
                            className="form-control"
                            name="state"
                          >
                            <option value="">Select</option>
                            {states.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.state_name}
                              </option>
                            ))}
                          </Field>
                        </div>
                        <div className="col-4">
                          <label htmlFor="city">City</label>
                          <Field
                            value={selectedCityOption}
                            onChange={handleCityChange}
                            disabled={isCityDisabled}
                            as="select"
                            className="form-control"
                            name="city"
                          >
                            <option value="">Select</option>
                            {cities?.map((option) => (
                              <option key={option.id} value={option.id}>
                                {option.city_name}
                              </option>
                            ))}
                          </Field>
                        </div> */}
                        <div class="col-6">
                          <label htmlFor="website">Website</label>
                          <Field
                            type="text"
                            name="website"
                            className="form-control"
                            placeholder="Website"
                          />
                          <ErrorMessage
                            name="postal_code"
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                       <div className="col-6">
                          <label htmlFor="nature_business">
                            Nature of Business
                          </label>
                          <Field name="nature_business">
                            {({ field, form }) => (
                              <Select
                                isMulti
                                name="nature_business"
                                options={businessOptions}
                                value={
                                  field.value
                                    ? businessOptions.filter((option) =>
                                        field.value
                                          .split(",")
                                          .includes(option.value)
                                      )
                                    : []
                                }
                                onChange={(selectedOptions) => {
                                  const values = selectedOptions
                                    .map((opt) => opt.value)
                                    .join(",");
                                  form.setFieldValue("nature_business", values);
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
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                          {/* this is the spoc details column where we have to change */}
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
                            render={(msg) => (
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
                            render={(msg) => (
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
                            render={(msg) => (
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
                            render={(msg) => (
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
                            render={(msg) => (
                              <div className="form-error">{msg}</div>
                            )}
                          />
                        </div>
                        <div className= "row">
                        <div className="col-6">
                          <label htmlFor="ptr">PTR</label>
                          <Field
                            name="ptr_track"
                            type="file"
                            value={undefined}
                            className="form-control"
                            onChange={(event) => {
                              let files = event.target.files[0];
                              setFieldValue("ptr_track", files);
                            }}
                          />
                          {editDetails?.files &&
                            editDetails?.files.length != 0 &&
                            editDetails?.files.map(
                              (data) =>
                                data.doc_type == "ptr" && (
                                  <span>
                                    <a href={data.file_path} target="_blank">
                                      <i className="fa fa-file"></i>{" "}
                                      {data.file_name}
                                    </a>
                                  </span>
                                )
                            )}
                        </div>
                        <div className="col-6">
                          <label htmlFor="subscription_plan">Select Subscription ( Empty for Free )</label>
                          <Field
                            as="select"
                            className="form-control"
                            name="subscription_plan"
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
                enableReinitialize={true} // This allows the form to update if selectedSpocOption changes
                onSubmit={(values, { resetForm }) => {
                  handleSpocSubmit(values, resetForm); // Call your custom submission logic
                  // setSubmitting(false); // Stop submission after it's handled
                }}
              >
                {({ values, handleChange, handleSubmit }) => (
                  <Form onSubmit={handleSubmit}>
                    {editDetails.spocDetails &&
                    editDetails.spocDetails?.length > 0 ? (
                      <div className="row form-common-row mb-4">
                        <div className="form-group">
                          <label htmlFor="select-input" className="form-label">
                            Select Spoc
                          </label>
                          <select
                            id="select-input"
                            className="form-control"
                            value={selectedSpocOption.name}
                            onChange={(e) => {
                              const selectedValue = e.target.value;
                              if (!selectedValue) {
                                // If no value is selected, reset the selected SPOC details
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
                              }); // Set selected SPOC when chosen
                              setSpocId(selectedOption.id);
                            }}
                          >
                            <option value="">Select an option</option>
                            {editDetails.spocDetails.length > 0
                              ? editDetails.spocDetails.map((option) => (
                                  <option
                                    key={option.id}
                                    value={JSON.stringify(option)}
                                  >
                                    {`${option.name} ${
                                      option.role ? " ," + option.role : ""
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
                            render={(msg) => (
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
                            render={(msg) => (
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
                            render={(msg) => (
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
                              style={{ flex: "0 0 120px" }} // Fixed width for country code
                              onChange={(e) => {
                                const newCountryCode = e.target.value;
                                setSpocCountryCode(newCountryCode); // Update local state
                              }}
                            >
                              {countryCode.map((item) => (
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
                              style={{ flex: "1" }} // Takes remaining space
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
          <div class="card col-12 mt-3">
            <div className="d-flex justify-content-between align-items-center px-3 pt-3">
              <h6 className="mb-0">Products - Variants</h6>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedVendorOption({
                    label: editDetails?.companyDetails?.company_name || editDetails?.vendorDetails?.name || 'Vendor',
                    value: router.query.id,
                    email: editDetails?.vendorDetails?.email,
                    phone: editDetails?.vendorDetails?.mobile
                  });
                  setOpenVariantMap(true);
                }}
              >
                Map Variants
              </button>
            </div>
            <div class="card-body">
              {vendorProducts && vendorProducts.length > 0 ? (
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
                                      .then((res) => {
                                        toast.success(res.message || "Mapping deleted successfully");
                                        getVendorDetails(id);
                                        // Refresh vendor products list
                                        getApprovedProductsByVendor(router.query.id, 1, 50)
                                          .then((res) => {
                                            const list = res?.data?.data || res?.data || [];
                                            setVendorProducts(Array.isArray(list) ? list : []);
                                          })
                                          .catch(() => setVendorProducts([]));
                                      })
                                      .catch((error) => {
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
          onSuccess={() => getVendorDetails(id)}
          vendor={selectedVendorOption}
        />
      )}
      {openAddSpoc && (
        <SpocAddModal
          openModal={openAddSpoc}
          closeModal={() => setOpenAddSpoc(false)}
          vendorId={id}
          getVendorDetails={getVendorDetails}
          handleAddSpoc={handleAddSpoc}
          countryCode={countryCode}
        />
      )}
          <div class="card col-12 mt-3">
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
            <div class="card-body">
              {locations && locations.length > 0 ? (
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
                      {locations.map((location) => (
                        <tr key={location.id}>
                          <td>{location.country_name}</td>
                          <td>{location.state_name}</td>
                          <td>{location.city_name}</td>
                          <td>{location.address || "-"}</td>
                          <td>{location.postal_code || "-"}</td>
                          <td>{location.spocs.map((spoc) => spoc.spoc_name).join(", ") || "-"}</td>
                          
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
                              onClick={() => openSpocModal(location.id)}
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
