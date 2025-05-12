import React, { useEffect, useState } from 'react';
import Layout from "../../../components/layout";
import { getAdminProfile } from "@/utils/services/login";
import { searchAllVariants, getProductVariants, mapVariantWithVendor } from '@/utils/services/product-management';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import FullLoading from '@/components/loading/FullLoading';
import { vendorList } from '@/utils/services/rfq';
import Select, { components } from 'react-select';

// Changes by Agnij May 31, 2025 [Created variant view page]
const VariantView = () => {
  const router = useRouter();
  const { id } = router.query;
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [currentVendors, setCurrentVendors] = useState([]);
  const [userType, setUserType] = useState(null);

  // Modified Select Component to show email along with vendor Name
  const CustomSelectOption = (props) => (
    <components.Option {...props}>
      <div>
        <strong>{props?.data?.label}</strong>
        <br />
        <p className="row">
          <small>{props?.data?.email}</small>
          <small className="ms-3">{props?.data?.phone}</small>
        </p>
      </div>
    </components.Option>
  );

  // Custom styles for Select Component
  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      marginBottom: '1px solid #000',
      color: state.isSelected ? '#0d6efd' : '#212529',
      backgroundColor: state.isSelected ? '#f0f0f0' : provided.backgroundColor,
    }),
  };

  useEffect(() => {
    getUserProfile();
    getVendors();
  }, []);

  useEffect(() => {
    if (id) {
      fetchVariantDetails();
    }
  }, [id, vendorData]);

  const getUserProfile = async () => {
    try {
      const res = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.log(error);
    }
  };

  const getVendors = () => {
    vendorList()
      .then((rsp) => {
        let lists = rsp.data.map((s) => ({
          label: s.organization_name ? s.organization_name : s.name,
          value: s.id,
          email: s.email || "Email Not Available",
          phone: s.mobile || "Phone Not Available",
        }));
        setVendorData(lists);
      })
      .catch((error) => {
        console.error("Error fetching vendors:", error);
      });
  };

  const fetchVariantDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Directly search for variants with the ID as a direct search term 
      // rather than trying to use a complex format
      console.log("Fetching variant details for ID:", id);
      const searchResponse = await searchAllVariants(id);
      
      console.log("Search response:", searchResponse?.data);
      
      if (searchResponse?.data && Array.isArray(searchResponse.data)) {
        // First try exact match
        let variantData = searchResponse.data.find(v => 
          v.id === parseInt(id) || v.id === id
        );
        
        // If no exact match, try to find any variant (there should be at least one if API returned data)
        if (!variantData && searchResponse.data.length > 0) {
          variantData = searchResponse.data[0];
          console.log("Using first available variant:", variantData);
        }
        
        if (variantData) {
          console.log("Found variant:", variantData);
          setVariant(variantData);
          
          // Find vendor mappings if available
          try {
            // TODO: Add API call to get vendor mappings if available
            // For now, simulate with empty array
            setCurrentVendors([]);
          } catch (mappingError) {
            console.error("Error fetching mappings:", mappingError);
          }
          
          setLoading(false);
          return;
        }
      }
      
      console.log("Direct search failed, trying product variant approach");
      
      // If direct search fails, try alternative approach - find the variant through product variants
      try {
        // We don't know which product this variant belongs to, so we can't easily use getProductVariants
        // A better approach would be to modify the API to allow direct variant lookup by ID
        
        // For now, let's just set loading to false and show "not found"
        setLoading(false);
        toast.error("Could not find variant with ID: " + id);
      } catch (error) {
        console.error("Error in fallback approach:", error);
        setLoading(false);
        toast.error("Could not fetch variant details");
      }
    } catch (error) {
      console.error("Error fetching variant details:", error);
      toast.error("Failed to load variant details");
      setLoading(false);
    }
  };

  const handleMapVendor = async () => {
    if (!selectedVendor) {
      toast.error("Please select a vendor to map");
      return;
    }

    try {
      setLoading(true);
      const payload = {
        product_variant_id: variant.id,
        vendor_id: selectedVendor.value,
      };

      const response = await mapVariantWithVendor(payload);
      toast.success(response.message || "Vendor mapped successfully");
      fetchVariantDetails(); // Refresh the data
    } catch (error) {
      console.error("Error mapping vendor:", error);
      toast.error(error.message || "Failed to map vendor");
      setLoading(false);
    }
  };

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Variant Details</h1>
            </div>
            <div className="col-sm-6">
              <div className="float-sm-right">
                <button
                  type="button"
                  className="btn btn-secondary mr-2"
                  onClick={() => router.back()}
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => router.push(`/product-management/edit-variant/${id}`)}
                >
                  <i className="fas fa-edit mr-1"></i> Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {loading ? (
            <FullLoading />
          ) : variant ? (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Basic Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Variant Name:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.name || variant.variant_name}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Product:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.product_name || "Unknown Product"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Categories:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.category_names && variant.category_names.length > 0 ? (
                          variant.category_names.map((category, index) => (
                            <span key={index} className="badge badge-warning mr-1">
                              {category}
                            </span>
                          ))
                        ) : (
                          "No categories"
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Status:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.is_approve === 1 ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-danger">Not Approved</span>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Created At:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.created_at ? new Date(variant.created_at).toLocaleString() : "N/A"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Updated At:</strong>
                      </div>
                      <div className="col-md-8">
                        {variant.updated_at ? new Date(variant.updated_at).toLocaleString() : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Map New Vendor</h3>
                  </div>
                  <div className="card-body">

                    {/* Map New Vendor Section */}
                    <div>
                      <h5>Select a Vendor</h5>
                      <div className="form-group">
                        <Select
                          options={vendorData}
                          placeholder="Select Vendor"
                          styles={customStyles}
                          components={{ Option: CustomSelectOption }}
                          value={selectedVendor}
                          onChange={setSelectedVendor}
                        />
                      </div>
                      <button
                        type="button"
                        className="btn btn-primary btn-block"
                        onClick={handleMapVendor}
                        disabled={!selectedVendor}
                      >
                        Map Vendor
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h5><i className="icon fas fa-exclamation-triangle"></i> Variant not found</h5>
              <p>The variant with ID {id} could not be found. It may have been deleted or you don't have permission to view it.</p>
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() => router.push("/product-management?tab=variants")}
              >
                <i className="fas fa-arrow-left mr-1"></i> Back to Variants
              </button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default VariantView; 