import React, { useEffect, useState } from 'react';
import Layout from "../../../components/layout";
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
      
      // Convert ID to different formats for flexible matching
      const numericId = parseInt(id);
      const stringId = id.toString();
      
      // Fetch all mappings
      const mappingsResponse = await getVariantMappings("", null, null);
      console.log("Mappings response:", mappingsResponse?.data);
      
      if (mappingsResponse?.data?.data && Array.isArray(mappingsResponse.data.data)) {
        const mappingsData = mappingsResponse.data.data;
        
        // Save all mappings for debugging
        setAllMappings(mappingsData);
        
        // Try multiple fields and formats for matching to find the exact mapping
        let foundMapping = null;
        
        // First try to find exact match by mapping_id or id
        foundMapping = mappingsData.find(m => 
          m.mapping_id === numericId || 
          m.mapping_id === stringId || 
          m.id === numericId || 
          m.id === stringId
        );
        
        // If not found, try by searching for it in the list of normalized IDs
        if (!foundMapping) {
          // Check in the first 100 displayed mappings, which are visible to user
          const topMappings = mappingsData.slice(0, 100);
          const normalizedSearchId = id.toLowerCase().trim();
          
          for (const m of topMappings) {
            // Try to match any field that could potentially be displayed in the UI
            if (
              (m.id && m.id.toString() === normalizedSearchId) ||
              (m.mapping_id && m.mapping_id.toString() === normalizedSearchId) ||
              (m.variant_id && m.variant_id.toString() === normalizedSearchId) ||
              (m.variant_name && m.variant_name.toLowerCase().includes(normalizedSearchId)) ||
              (m.product_name && m.product_name.toLowerCase().includes(normalizedSearchId))
            ) {
              foundMapping = m;
              break;
            }
          }
        }
        
        // Log the found mapping for debugging
        console.log("Found mapping:", foundMapping);
        
        if (foundMapping) {
          setMapping(foundMapping);
          
          // Find the current vendor in our vendor data
          if (foundMapping.vendor_id && vendorData.length > 0) {
            const currentVendor = vendorData.find(v => v.value === foundMapping.vendor_id);
            console.log("Setting selected vendor:", currentVendor);
            setSelectedVendor(currentVendor || null);
          }
          
          // Also get variant details
          if (foundMapping.variant_id) {
            // Get variant details
            console.log("Fetching variant details for variant ID:", foundMapping.variant_id);
            const variantResponse = await searchAllVariants(foundMapping.variant_id);
            console.log("Variant response:", variantResponse?.data);
            
            if (variantResponse?.data?.data && Array.isArray(variantResponse.data.data)) {
              const variantData = variantResponse.data.data.find(v => 
                v.id === parseInt(foundMapping.variant_id) || v.id === foundMapping.variant_id
              );
              
              if (variantData) {
                console.log("Found variant:", variantData);
                setVariant(variantData);
              }
            }
          }
          
          setLoading(false);
          return;
        }
      }
      
      // If we get here, mapping not found
      console.log("No mapping found with ID:", id);
      setLoading(false);
      toast.error("Mapping not found with ID: " + id);
      
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
    <Layout>
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
                    
                    {/* Debug info - show raw mapping data */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="row mt-4">
                        <div className="col-12">
                          <details>
                            <summary>Debug - Mapping Data</summary>
                            <pre className="bg-light p-3 mt-2" style={{maxHeight: '300px', overflow: 'auto'}}>
                              {JSON.stringify(mapping, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
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
                
                {/* Debug info for all mappings */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="card mt-4">
                    <div className="card-header">
                      <h3 className="card-title">Debug - All Mappings</h3>
                    </div>
                    <div className="card-body">
                      <details>
                        <summary>Show All Mappings Data ({allMappings.length})</summary>
                        <div style={{maxHeight: '300px', overflow: 'auto'}}>
                          <table className="table table-sm table-bordered">
                            <thead>
                              <tr>
                                <th>ID</th>
                                <th>Variant ID</th>
                                <th>Vendor ID</th>
                                <th>Variant Name</th>
                              </tr>
                            </thead>
                            <tbody>
                              {allMappings.map((m, index) => (
                                <tr key={index} className={(m.mapping_id === parseInt(id) || m.id === parseInt(id)) ? 'bg-warning' : ''}>
                                  <td>{m.mapping_id || m.id}</td>
                                  <td>{m.variant_id}</td>
                                  <td>{m.vendor_id}</td>
                                  <td>{m.variant_name}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </details>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h5><i className="icon fas fa-ban"></i> Error!</h5>
              <p>Mapping not found with ID: {id}. It may have been deleted or you don't have permission to view it.</p>
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
    </Layout>
  );
};

export default MappingDetail; 