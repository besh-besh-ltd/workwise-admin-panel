import React, { useEffect, useState } from 'react';
import { getAdminProfile } from "@/utils/services/login";
import { searchAllVariants, getVariantMappings, mapVariantWithVendor } from '@/utils/services/product-management';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import FullLoading from '@/components/loading/FullLoading';
import { vendorList } from '@/utils/services/rfq';
import Select, { components } from 'react-select';

// Changes by Agnij May 31, 2025 [Created mapping view/edit page]
const MappingDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [mapping, setMapping] = useState(null);
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [userType, setUserType] = useState(null);
  const [allMappings, setAllMappings] = useState([]);

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
    if (id && vendorData.length > 0) {
      fetchMappingDetails();
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

  const fetchMappingDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      console.log("Fetching mapping details for ID:", id);
      
      // Changes by Agnij Jun 26 2024 [Fixed mapping ID detection to properly find mappings]
      // Convert ID to different formats for flexible matching
      const numericId = parseInt(id);
      const stringId = id.toString();
      
      // Fetch all mappings without any filter to get a larger pool to search through
      const mappingsResponse = await getVariantMappings(null, "", null, null, null, null, null, null, 1, 100);
      console.log("Mappings response received");
      
      let mappingsData = [];
      
      // Handle different potential response formats
      if (mappingsResponse?.data?.data && Array.isArray(mappingsResponse.data.data)) {
        mappingsData = mappingsResponse.data.data;
      } else if (Array.isArray(mappingsResponse?.data)) {
        mappingsData = mappingsResponse.data;
      } else if (mappingsResponse?.data) {
        // Handle nested data
        if (mappingsResponse.data.data && Array.isArray(mappingsResponse.data.data)) {
          mappingsData = mappingsResponse.data.data;
        } else {
          mappingsData = [mappingsResponse.data];
        }
      }
      
      // Save all mappings for reference (but we'll remove this debug info later)
      setAllMappings(mappingsData);
      
      // Try multiple fields and formats for matching to find the exact mapping
      let foundMapping = null;
      
      console.log(`Searching for mapping with ID ${id} in ${mappingsData.length} mappings`);
      
      // First try to find exact match by any ID field
      foundMapping = mappingsData.find(m => 
        (m.mapping_id !== undefined && (m.mapping_id === numericId || m.mapping_id === stringId)) || 
        (m.id !== undefined && (m.id === numericId || m.id === stringId)) ||
        (m.variant_mapping_id !== undefined && (m.variant_mapping_id === numericId || m.variant_mapping_id === stringId))
      );
      
      if (foundMapping) {
        console.log("Found mapping by direct ID match");
      } else {
        // If not found by direct ID, look harder
        for (const m of mappingsData) {
          // Check all possible ID fields and string representations
          if (
            String(m.mapping_id) === stringId || 
            String(m.id) === stringId ||
            String(m.variant_mapping_id) === stringId ||
            (m.variant_id && String(m.variant_id) === stringId) ||
            (m.vendor_id && String(m.vendor_id) === stringId) 
          ) {
            foundMapping = m;
            console.log("Found mapping by string comparison");
            break;
          }
        }
      }
      
      if (foundMapping) {
        console.log("Found mapping:", foundMapping.id);
        setMapping(foundMapping);
        
        // Find the current vendor in our vendor data
        if (foundMapping.vendor_id && vendorData.length > 0) {
          const currentVendor = vendorData.find(v => v.value === parseInt(foundMapping.vendor_id) || v.value === foundMapping.vendor_id);
          console.log("Setting selected vendor:", currentVendor?.label || "Not found");
          setSelectedVendor(currentVendor || null);
        }
        
        // Also get variant details
        if (foundMapping.variant_id) {
          // Get variant details
          console.log("Fetching variant details for variant ID:", foundMapping.variant_id);
          const variantResponse = await searchAllVariants(foundMapping.variant_id);
          
          if (variantResponse?.data?.data && Array.isArray(variantResponse.data.data)) {
            const variantData = variantResponse.data.data.find(v => 
              v.id === parseInt(foundMapping.variant_id) || v.id === foundMapping.variant_id
            );
            
            if (variantData) {
              console.log("Found variant:", variantData.id);
              setVariant(variantData);
            }
          }
        }
        
        setLoading(false);
        return;
      }
      
      // If we get here, no mapping was found
      console.log("No mapping found with ID:", id);
      setLoading(false);
      
    } catch (error) {
      console.error("Error fetching mapping details:", error);
      toast.error("Failed to load mapping details");
      setLoading(false);
    }
  };

  const handleUpdateMapping = async () => {
    if (!selectedVendor) {
      toast.error("Please select a vendor");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product_variant_id: mapping.variant_id,
        vendor_id: selectedVendor.value
      };

      console.log("Updating mapping with payload:", payload);
      const response = await mapVariantWithVendor(payload);
      console.log("Update response:", response);
      
      toast.success(response.message || "Mapping updated successfully");
      router.push("/product-management?tab=mappings");
    } catch (error) {
      console.error("Error updating mapping:", error);
      toast.error(error.message || "Failed to update mapping");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="content">
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Variant-Vendor Mapping Details</h1>
            </div>
            <div className="col-sm-6">
              <div className="float-sm-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.push("/product-management?tab=mappings")}
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back to Mappings
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
          ) : mapping ? (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Mapping Information</h3>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Mapping ID:</strong>
                      </div>
                      <div className="col-md-8">
                        {mapping.mapping_id || mapping.id}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Variant:</strong>
                      </div>
                      <div className="col-md-8">
                        <a href={`/product-management/variant/${mapping.variant_id}`} className="text-primary">
                          {mapping.variant_name || "Variant ID: " + mapping.variant_id}
                        </a>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Product:</strong>
                      </div>
                      <div className="col-md-8">
                        {mapping.product_name || "Unknown Product"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Current Vendor:</strong>
                      </div>
                      <div className="col-md-8">
                        <strong>{mapping.vendor_name || mapping.vendor_display_name || "Unknown"}</strong>
                        <br />
                        <small>{mapping.vendor_email || "No email available"}</small>
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Vendor Approved By:</strong>
                      </div>
                      <div className="col-md-8">
                        {mapping.approved_by ? (
                          Array.isArray(mapping.approved_by) ? (
                            mapping.approved_by.map((approver, index) => (
                              <div key={index}>
                                {approver}
                                {index !== mapping.approved_by.length - 1 && <span>,&nbsp;</span>}
                              </div>
                            ))
                          ) : (
                            mapping.approved_by
                          )
                        ) : variant && variant.vendor_approved_by ? (
                          Array.isArray(variant.vendor_approved_by) ? (
                            variant.vendor_approved_by.map((approver, index) => (
                              <div key={index}>
                                {approver.name || approver}
                                {index !== variant.vendor_approved_by.length - 1 && <span>,&nbsp;</span>}
                              </div>
                            ))
                          ) : (
                            variant.vendor_approved_by
                          )
                        ) : (
                          <span className="text-muted">No approval information</span>
                        )}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Mapped At:</strong>
                      </div>
                      <div className="col-md-8">
                        {mapping.mapped_at ? new Date(mapping.mapped_at).toLocaleString() : "Unknown"}
                      </div>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-4">
                        <strong>Status:</strong>
                      </div>
                      <div className="col-md-8">
                        {mapping.status ? (
                          <span className="badge badge-success">Active</span>
                        ) : (
                          <span className="badge badge-danger">Inactive</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Update Mapping</h3>
                  </div>
                  <div className="card-body">
                    <div className="form-group">
                      <label>Select New Vendor</label>
                      <Select
                        options={vendorData}
                        placeholder="Select Vendor"
                        styles={customStyles}
                        components={{ Option: CustomSelectOption }}
                        value={selectedVendor}
                        onChange={setSelectedVendor}
                      />
                      <small className="form-text text-muted">
                        Current vendor: {mapping.vendor_name || mapping.vendor_display_name || "Unknown"}
                      </small>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-block mt-4"
                      onClick={handleUpdateMapping}
                      disabled={saving}
                    >
                      {saving ? (
                        <>
                          <span className="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
                          Updating...
                        </>
                      ) : (
                        'Update Mapping'
                      )}
                    </button>
                  </div>
                </div>
                
                {variant && (
                  <div className="card mt-4">
                    <div className="card-header">
                      <h3 className="card-title">Variant Information</h3>
                    </div>
                    <div className="card-body">
                      <div className="row mb-2">
                        <div className="col-md-5">
                          <strong>Variant ID:</strong>
                        </div>
                        <div className="col-md-7">
                          {variant.id}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-5">
                          <strong>Name:</strong>
                        </div>
                        <div className="col-md-7">
                          {variant.name || variant.variant_name}
                        </div>
                      </div>
                      <div className="row mb-2">
                        <div className="col-md-5">
                          <strong>Categories:</strong>
                        </div>
                        <div className="col-md-7">
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
                      <div className="mt-3">
                        <a href={`/product-management/variant/${variant.id}`} className="btn btn-sm btn-info btn-block">
                          <i className="fas fa-eye mr-1"></i> View Variant Details
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h5><i className="icon fas fa-ban"></i> Mapping Not Found</h5>
              <p>
                We couldn't find the mapping with ID: {id}.<br/>
                This could be because:
              </p>
              <ul>
                <li>The mapping ID doesn't exist in the system</li>
                <li>The mapping was recently deleted</li>
                <li>There might be an issue with the server connection</li>
              </ul>
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() => router.push("/product-management?tab=mappings")}
              >
                <i className="fas fa-arrow-left mr-1"></i> Back to Mappings
              </button>
            </div>
          )}
        </div>
      </section>
    </section>
  );
};

export default MappingDetail; 