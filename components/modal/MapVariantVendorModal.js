import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { mapVariantWithVendor, searchAllVariants } from '../../utils/services/product-management';
import { toast } from 'react-toastify';
import { vendorList } from '@/utils/services/rfq';
import { vendorApproveList } from '@/utils/services/rfq';
import Select, { components } from 'react-select';

// Changes by Agnij May 3, 2025 [Updated modal to match product mapping]
const MapVariantVendorModal = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorOptions, setVendorOptions] = useState([]);
  const [approvedByOptions, setApprovedByOptions] = useState([]);
  const [modalElement, setModalElement] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({
    variant_id: '',
    vendor: null,
    approved_by: []
  });
  
  // Changes by Agnij May 3, 2025 [Added variant search functionality]
  const [searchVariantTerm, setSearchVariantTerm] = useState('');
  const [searchVariantResults, setSearchVariantResults] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  
  // Create portal element for modal
  useEffect(() => {
    // Only create the element if it doesn't already exist
    if (!document.getElementById('variant-vendor-modal-root')) {
      const el = document.createElement('div');
      el.id = 'variant-vendor-modal-root';
      document.body.appendChild(el);
      setModalElement(el);
    } else {
      setModalElement(document.getElementById('variant-vendor-modal-root'));
    }

    // Cleanup function to remove the element when component unmounts
    return () => {
      const el = document.getElementById('variant-vendor-modal-root');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);

  // Fetch vendors and approved_by options when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchVendors();
      fetchApprovedBy();
      resetForm();
      
      // If a variant was passed to the modal, set it as selected
      if (variant) {
        setSelectedVariant(variant);
        setFormData(prev => ({
          ...prev,
          variant_id: variant.id
        }));
      } else {
        setSelectedVariant(null);
      }
    }
  }, [isVisible, variant]);

  const fetchVendors = async () => {
    try {
      console.log("Fetching vendors for mapping modal");
      setLoading(true);
      const vendorsResponse = await vendorList();
      console.log("VENDOR RESPONSE -------- ", vendorsResponse);
      if (vendorsResponse?.data) {
        console.log(`Fetched ${vendorsResponse.data.length} vendors`);
        setVendors(vendorsResponse.data);
        
        // Format vendors for Select component
        const options = vendorsResponse.data.map((vendor) => ({
          label: vendor.organization_name ? vendor.organization_name : vendor.name,
          value: vendor.id,
          email: vendor.email || "Email Not Available",
          phone: vendor.mobile || "Phone Not Available"
        }));
        setVendorOptions(options);
      } else {
        console.error("Invalid vendor response:", vendorsResponse);
        toast.error('Failed to load vendors: Invalid response');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedBy = async () => {
    try {
      console.log("Fetching approved-by options");
      const response = await vendorApproveList();
      if (response?.data) {
        const approvedOptions = response.data.map((s) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setApprovedByOptions(approvedOptions);
      }
    } catch (error) {
      console.error("Error fetching approved-by options:", error);
      toast.error("Failed to load approval options");
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      variant_id: variant?.id || '',
      vendor: null,
      approved_by: []
    });
    setMappings([]);
    setSearchVariantTerm('');
    setSearchVariantResults([]);
  };

  // Function to search variants
  const searchVariants = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchVariantResults([]);
      setLoadingVariants(false);
      return;
    }
    
    setLoadingVariants(true);
    try {
      console.log("Searching variants with term:", searchTerm);
      
      // Call the variants search API
      const response = await searchAllVariants(
        null,       // id
        searchTerm, // search term
        null,       // start date
        null,       // end date
        null,       // vendor id
        null,       // category id
        null,       // added by
        null        // approval status
      );
      
      if (response?.data?.data) {
        const variantsData = Array.isArray(response.data.data) 
          ? response.data.data 
          : [];
        
        // Format the variants for display
        const formattedVariants = variantsData.map(variant => ({
          id: variant.id,
          name: variant.variant_name || variant.name || `Variant #${variant.id}`,
          product_name: variant.product_name || 'Unknown Product',
          category_info: variant.category_names ? 
            (Array.isArray(variant.category_names) ? 
              variant.category_names.join(', ') : 
              variant.category_names) : 
            '',
          created_at: variant.created_at
        }));
        
        console.log(`Found ${formattedVariants.length} variants matching "${searchTerm}"`);
        setSearchVariantResults(formattedVariants);
      } else {
        console.log("No variants found or invalid response format");
        setSearchVariantResults([]);
      }
    } catch (error) {
      console.error("Error searching variants:", error);
      toast.error("Failed to search variants");
      setSearchVariantResults([]);
    } finally {
      setLoadingVariants(false);
    }
  }, []);

  // Debounce search to avoid too many API calls
  const debounceSearchVariants = useCallback((term) => {
    setSearchVariantTerm(term);
    const debounceTimeout = 500; // 500ms debounce
    clearTimeout(window.variantSearchDebounceTimer);
    window.variantSearchDebounceTimer = setTimeout(() => {
      searchVariants(term);
    }, debounceTimeout);
  }, [searchVariants]);

  const handleSelectVariant = (variant) => {
    console.log("Selected variant:", variant);
    setSelectedVariant(variant);
    setFormData(prev => ({
      ...prev,
      variant_id: variant.id
    }));
    
    // Clear search results after selection
    setSearchVariantResults([]);
    setSearchVariantTerm('');
  };

  const handleInputChange = (selectedOption, { name }) => {
    console.log(`Updating ${name} to`, selectedOption);
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption
    }));
  };

  const handleAddMapping = () => {
    if (!formData.vendor) {
      toast.error('Please select a vendor');
      return;
    }
    
    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }
    
    // Add the current mapping to the list
    setMappings(prev => [...prev, {
      ...formData,
      id: Date.now(), // Use timestamp as unique ID
      variant: selectedVariant
    }]);
    
    // Reset vendor and approved_by fields for next mapping
    setFormData(prev => ({
      ...prev,
      vendor: null,
      approved_by: []
    }));
    
    toast.success('Vendor added to mapping list');
  };

  const handleRemoveMapping = (id) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
    toast.success('Vendor removed from mapping list');
  };

  const handleSubmit = async () => {
    if (mappings.length === 0 && !formData.vendor) {
      toast.error('Please add at least one vendor mapping');
      return;
    }
    
    if (!selectedVariant && !formData.variant_id) {
      toast.error('Please select a variant');
      return;
    }
    
    setLoading(true);
    
    // Process current form data if vendor is selected
    const allMappings = [...mappings];
    if (formData.vendor && (selectedVariant || formData.variant_id)) {
      allMappings.push({
        ...formData, 
        id: Date.now(),
        variant: selectedVariant
      });
    }
    
    let success = true;
    let failureCount = 0;

    for (const mapping of allMappings) {
      try {
        console.log("Submitting mapping values:", mapping);
        
        const payload = {
          variant_id: mapping.variant_id,
          vendor_id: mapping.vendor.value,
          approved_by: mapping.approved_by?.map(item => item.value) || null
        };
        
        const response = await mapVariantWithVendor(payload);
        
        console.log("Mapping response:", response);
        
        if (!(response?.data?.status === 1 || response?.status === 1)) {
          success = false;
          failureCount++;
          toast.error(`Failed to map with ${mapping.vendor.label}: ${response?.data?.message || response?.message || 'Unknown error'}`);
        }
      } catch (apiError) {
        console.error('API Error mapping variant with vendor:', apiError);
        success = false;
        failureCount++;
        
        // Get a useful error message
        let errorMessage = `Failed to map with ${mapping.vendor.label}`;
        if (apiError.message?.response?.data?.message) {
          errorMessage = apiError.message.response.data.message;
        } else if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (typeof apiError.message === 'string') {
          errorMessage = apiError.message;
        }
        
        toast.error(errorMessage);
      }
    }
    
    setLoading(false);
    
    if (success) {
      toast.success('All variant mappings completed successfully');
      resetForm();
      if (onSuccess) onSuccess();
      onCancel();
    } else if (failureCount < allMappings.length) {
      toast.warning(`${allMappings.length - failureCount} mappings successful, ${failureCount} failed`);
      if (onSuccess) onSuccess();
      onCancel();
    }
  };

  // Custom select option component
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

  // If modal isn't visible or the portal element isn't ready, don't render anything
  if (!isVisible || !modalElement) return null;

  // Use portal to render the modal outside the normal component hierarchy
  return ReactDOM.createPortal(
    <div className="modal-backdrop" style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.5)', 
      zIndex: 1050, 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <div className="modal-dialog modal-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Map Variant with Vendor</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <input
              type="hidden"
              name="variant_id"
              value={formData.variant_id}
            />

            {/* Variant Search Section */}
            <div className="mb-4">
              <h6 className="mb-3 font-weight-bold">Search and Select Variant</h6>
              
              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for variants (min 3 characters)"
                  value={searchVariantTerm}
                  onChange={(e) => debounceSearchVariants(e.target.value)}
                />
              </div>
              
              {/* Selected Variant Display */}
              {selectedVariant && (
                <div className="mb-4 p-3 border rounded bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <h6 className="mb-2 font-weight-bold">Selected Variant</h6>
                    <button 
                      type="button" 
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => setSelectedVariant(null)}
                    >
                      <i className="fas fa-times"></i> Clear Selection
                    </button>
                  </div>
                  <p className="mb-1 font-weight-bold">Variant Name:</p>
                  <p>{selectedVariant.name}</p>
                  {selectedVariant.product_name && (
                    <>
                      <p className="mb-1 font-weight-bold mt-2">Product:</p>
                      <p>{selectedVariant.product_name}</p>
                    </>
                  )}
                  {selectedVariant.category_info && (
                    <>
                      <p className="mb-1 font-weight-bold mt-2">Category:</p>
                      <p>{selectedVariant.category_info}</p>
                    </>
                  )}
                </div>
              )}
              
              {/* Search Results */}
              {searchVariantTerm.length > 0 && (
                <div className="border rounded p-3 mb-3">
                  <h6 className="mb-3">
                    {loadingVariants ? (
                      <span>
                        <i className="fa fa-spinner fa-spin me-2"></i>
                        Searching variants...
                      </span>
                    ) : (
                      searchVariantTerm.length < 3 ? 
                        "Type at least 3 characters to search" : 
                        `Search Results (${searchVariantResults.length})`
                    )}
                  </h6>
                  
                  {!loadingVariants && searchVariantTerm.length >= 3 && (
                    searchVariantResults.length > 0 ? (
                      <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="variant-search-results">
                        {searchVariantResults.map((variant) => (
                          <div
                            key={variant.id}
                            className="d-flex justify-content-between align-items-center border-bottom py-2"
                          >
                            <div>
                              <p className="mb-0 font-weight-bold">{variant.name}</p>
                              <p className="mb-0 text-muted small">
                                <strong>Product:</strong> {variant.product_name}
                                {variant.category_info && (
                                  <>, <strong>Category:</strong> {variant.category_info}</>
                                )}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSelectVariant(variant)}
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted">No variants found matching your search criteria</p>
                    )
                  )}
                </div>
              )}
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="vendor" className="form-label font-weight-bold">Vendor <span className="text-danger">*</span></label>
                <Select
                  id="vendor"
                  name="vendor"
                  options={vendorOptions}
                  value={formData.vendor}
                  onChange={(selected) => handleInputChange(selected, { name: 'vendor' })}
                  placeholder="Select a vendor"
                  isSearchable
                  components={{ Option: CustomSelectOption }}
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
              
              <div className="col-md-6 mb-3">
                <label htmlFor="approved_by" className="form-label font-weight-bold">Approved By</label>
                <Select
                  id="approved_by"
                  name="approved_by"
                  options={approvedByOptions}
                  isMulti
                  value={formData.approved_by}
                  onChange={(selected) => handleInputChange(selected, { name: 'approved_by' })}
                  placeholder="Select approval(s)"
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
            </div>
            
            <div className="d-flex justify-content-end mb-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddMapping}
                disabled={!formData.vendor || !selectedVariant || loading}
              >
                <i className="fas fa-plus mr-1"></i> Add Vendor to List
              </button>
            </div>
            
            {/* Display list of mappings */}
            {mappings.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3 font-weight-bold">Vendors to Map</h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead>
                      <tr>
                        <th>Variant</th>
                        <th>Vendor</th>
                        <th>Approved By</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map(mapping => (
                        <tr key={mapping.id}>
                          <td>
                            <strong>{mapping.variant?.name || 'Unknown Variant'}</strong>
                            <br />
                            <small>{mapping.variant?.product_name || ''}</small>
                          </td>
                          <td>
                            <strong>{mapping.vendor.label}</strong>
                            <br />
                            <small>{mapping.vendor.email}</small>
                          </td>
                          <td>
                            {mapping.approved_by && mapping.approved_by.length > 0 
                              ? mapping.approved_by.map(item => item.label).join(', ')
                              : 'None'}
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveMapping(mapping.id)}
                            >
                              <i className="fas fa-trash-alt mr-1"></i> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || (!selectedVariant && mappings.length === 0)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                  Processing...
                </>
              ) : (
                'Map Variant'
              )}
            </button>
          </div>
          
          <div className="px-3 pb-3">
            <p className="border rounded p-2 mb-0 bg-light">
              <strong>Note:</strong> You can map a variant to multiple vendors by using the "Add Vendor to List" button.
            </p>
          </div>
        </div>
      </div>
    </div>,
    modalElement
  );
};

export default MapVariantVendorModal; 