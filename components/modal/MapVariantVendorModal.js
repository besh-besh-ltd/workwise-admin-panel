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
  const [vendorSearchTerm, setVendorSearchTerm] = useState("")
  const [vendorOptions, setVendorOptions] = useState([]);
  const [approvedByOptions, setApprovedByOptions] = useState([]);
  const [modalElement, setModalElement] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({
    variant_id: '',
    vendor: null,
    approved_by: []
  });
  
  // Changes by Agnij May 2, 2025 [Added variant search functionality]
  const [searchVariantTerm, setSearchVariantTerm] = useState('');
  const [searchVariantResults, setSearchVariantResults] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (vendorSearchTerm.length < 3) return;

    const handler = setTimeout(() => {
      fetchVendors(vendorSearchTerm);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [vendorSearchTerm]);
  
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
      setError(null);
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
      setLoading(true);
      const vendorsResponse = await vendorList(vendorSearchTerm);
      
      if (vendorsResponse?.data) {
        setVendors(vendorsResponse.data);
        // Format vendors for Select component
        const options = vendorsResponse.data.map((vendor) => ({
          label: vendor.organization_name ?? '-',
          value: vendor.id,
          email: vendor.email || "Email Not Available",
          phone: vendor.mobile || "Phone Not Available"
        }));
        console.log(options)
        setVendorOptions(options);
      } else {
        console.error("Invalid vendor response:", vendorsResponse);
        setError("Failed to load vendors: Invalid response");
        toast.error('Failed to load vendors: Invalid response');
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError(`Failed to load vendors: ${error.message || "Unknown error"}`);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedBy = async () => {
    try {
      const response = await vendorApproveList();
      
      if (response?.data) {
        const approvedOptions = response.data.map((s) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setApprovedByOptions(approvedOptions);
      } else {
        console.warn("Invalid approved-by response:", response);
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
    setError(null);
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
      
      if (response?.data && Array.isArray(response.data)) {
        const variantsData = response.data;
        
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
        
        setSearchVariantResults(formattedVariants);
      } else {
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


// setMappings(prev => [...prev, {
//   ...formData,
//   id: Date.now(), // Use timestamp as unique ID
//   variant: selectedVariant,
//   make_list: [] // Initialize make_list as an empty array
// }]);



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
    setError(null);
    
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
    let errorMessages = [];

    for (const mapping of allMappings) {
      try {
        
        const payload = {
          variant_id: mapping.variant_id,
          vendor_id: mapping.vendor.value,
          approved_by: mapping.approved_by?.map(item => item.value) || null,
          make_list: mapping.make_list || [] // Ensure make_list is included
        };
        
        const response = await mapVariantWithVendor(payload);
        
        
        if (!(response?.data?.status === 1 || response?.status === 1)) {
          success = false;
          failureCount++;
          const errorMsg = `Failed to map variant to ${mapping.vendor.label}: ${response?.data?.message || 'Unknown error'}`;
          errorMessages.push(errorMsg);
          toast.error(errorMsg);
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
        
        errorMessages.push(errorMessage);
        toast.error(errorMessage);
      }
    }
    
    setLoading(false);
    
    if (errorMessages.length > 0) {
      setError(errorMessages.join("; "));
    }
    
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
          <small>{props?.data?.phone}</small>
        </p>
      </div>
    </components.Option>
  );

  // Selected Variant Display
  const renderSelectedVariant = () => {
    if (!selectedVariant) return null;

    return (
      <div className="mb-4 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-2 font-weight-bold">Selected Variant</h5>
          <button 
            type="button" 
            className="btn btn-sm btn-outline-danger"
            onClick={() => setSelectedVariant(null)}
          >
            <i className="fas fa-times"></i> Clear Selection
          </button>
        </div>
        
        <div className="row">
          <div className="col-md-6">
            <dl className="mb-0">
              <dt className="font-weight-bold">Variant Name:</dt>
              <dd>{selectedVariant.name}</dd>
              
              <dt className="font-weight-bold mt-2">Variant ID:</dt>
              <dd>{selectedVariant.id}</dd>
            </dl>
          </div>
          <div className="col-md-6">
            <dl className="mb-0">
              {selectedVariant.product_name && (
                <>
                  <dt className="font-weight-bold">Product:</dt>
                  <dd>{selectedVariant.product_name}</dd>
                </>
              )}
              
              {selectedVariant.category_info && (
                <>
                  <dt className="font-weight-bold mt-2">Category:</dt>
                  <dd>{selectedVariant.category_info}</dd>
                </>
              )}
              
              {selectedVariant.created_at && (
                <>
                  <dt className="font-weight-bold mt-2">Created:</dt>
                  <dd>{selectedVariant.created_at_formatted || new Date(selectedVariant.created_at).toLocaleString()}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  };
  
  // Search Results Display
  const renderSearchResults = () => {
    if (!searchVariantTerm || searchVariantTerm.length === 0) return null;
    
    return (
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
                      <strong>ID:</strong> {variant.id}
                      {variant.product_name && (
                        <>, <strong>Product:</strong> {variant.product_name}</>
                      )}
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
    );
  };



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
      <div className="modal-dialog modal-lg" style={{
        maxHeight: 650,
        width: 1000,
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              Map Variant with Vendor
            </h5>
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

            {/* Error state */}
            {error && (
              <div className="alert alert-danger mb-3">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            {/* Variant Search Section */}
            <div className="mb-4">
              <h6 className="mb-3 font-weight-bold">
                Search and Select Variant
              </h6>
              
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
              {renderSelectedVariant()}
              
              {/* Search Results */}
              {renderSearchResults()}
            </div>

            <hr className="my-4" />

            <h6 className="mb-3 font-weight-bold">
              Select Vendor
            </h6>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="vendor" className="form-label font-weight-bold">Vendor <span className="text-danger">*</span></label>
                <Select
                  id="vendor"
                  name="vendor"
                  options={vendorOptions}
                  value={formData.vendor}
                  inputValue={vendorSearchTerm}
                  onChange={(selected) => handleInputChange(selected, { name: 'vendor' })}
                  placeholder="Select a vendor"
                  // isSearchable
                  onInputChange={(newValue) => setVendorSearchTerm(newValue)}
                  components={{ Option: CustomSelectOption }}
                  className="basic-select"
                  classNamePrefix="select"
                  noOptionsMessage={() => "Please enter atleast 3 letters to search"}
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
                Add Vendor to List
              </button>
            </div>
            
            {/* Display list of mappings */}
            {mappings.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3 font-weight-bold text-primary">
                  <i className="fas fa-list mr-2"></i>
                  Vendors to Map
                </h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="thead-light">
                      <tr>
                        <th>Variant</th>
                        <th>Vendor</th>
                        <th>Approved By</th>
                        <th>Make List</th> 
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map(mapping => (
                        <tr key={mapping.id}>
                          <td>
                            <strong>{mapping.variant?.name || 'Unknown Variant'}</strong>
                            <br />
                            <small className="text-muted">
                              {mapping.variant?.product_name || ''}
                              {mapping.variant?.category_info && (
                                <> - {mapping.variant.category_info}</>
                              )}
                            </small>
                          </td>
                          <td>
                            <strong>{mapping.vendor.label}</strong>
                            <br />
                            <small className="text-muted">{mapping.vendor.email}</small>
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

                          <td>
                           {mapping.make_list?.map((make, index) => (
                             <div key={index} className="d-flex align-items-center mb-1">
                               <input
                                 type="text"
                                 className="form-control form-control-sm"
                                 value={make}
                                 onChange={(e) => {
                                   const updatedMappings = mappings.map(m => {
                                     if (m.id === mapping.id) {
                                       const updatedMakeList = [...m.make_list];
                                       updatedMakeList[index] = e.target.value;
                                       return { ...m, make_list: updatedMakeList };
                                     }
                                     return m;
                                   });
                                   setMappings(updatedMappings);
                                 }}
                               />
                               <button
                                 type="button"
                                 className="btn btn-sm btn-danger ml-1"
                                 onClick={() => {
                                   const updatedMappings = mappings.map(m => {
                                     if (m.id === mapping.id) {
                                       const updatedMakeList = m.make_list.filter((_, i) => i !== index);
                                       return { ...m, make_list: updatedMakeList };
                                     }
                                     return m;
                                   });
                                   setMappings(updatedMappings);
                                 }}
                               >
                                 <i className="fas fa-times"></i>
                               </button>
                             </div>
                           ))}
                           <button
                             type="button"
                             className="btn btn-sm btn-secondary"
                             onClick={() => {
                               const updatedMappings = mappings.map(m => {
                                 if (m.id === mapping.id) {
                                   return { ...m, make_list: [...(m.make_list || []), ''] };
                                 }
                                 return m;
                               });
                               setMappings(updatedMappings);
                             }}
                           >
                             Add Make
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