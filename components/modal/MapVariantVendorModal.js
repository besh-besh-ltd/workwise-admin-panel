import React, { useState, useEffect } from 'react';
import { mapVariantWithVendor } from '../../utils/services/product-management';
import { getAllVendors } from '../../utils/services/vendor-management';
import { toast } from 'react-toastify';

// Changes by Agnij May 02, 2025 [Removed vendor-approve-management dependency]
const MapVariantVendorModal = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    variant_id: '',
    vendor_id: ''
  });

  // Fetch vendors on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorsResponse = await getAllVendors();
        if (vendorsResponse?.data?.data) {
          setVendors(vendorsResponse.data.data);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendors');
      }
    };

    if (isVisible) {
      fetchData();
      resetForm();
    }
  }, [isVisible]);

  // Reset form
  const resetForm = () => {
    setFormData({
      variant_id: variant?.id || '',
      vendor_id: ''
    });
  };

  // Set initial form values when variant changes
  useEffect(() => {
    if (variant && isVisible) {
      setFormData(prev => ({
        ...prev,
        variant_id: variant.id
      }));
    }
  }, [variant, isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.vendor_id) {
      toast.error('Please select a vendor');
      return;
    }
    
    setLoading(true);

    try {
      console.log("Submitting mapping values:", formData);
      const response = await mapVariantWithVendor(formData);
      
      if (response?.data?.status === 1) {
        toast.success('Variant mapped with vendor successfully');
        onSuccess && onSuccess();
        onCancel();
      } else {
        toast.error(response?.data?.message || 'Failed to map variant with vendor');
      }
    } catch (apiError) {
      console.error('API Error mapping variant with vendor:', apiError);
      
      // Get a useful error message
      let errorMessage = 'Failed to map variant with vendor';
      if (apiError.message?.response?.data?.message) {
        errorMessage = apiError.message.response.data.message;
      } else if (apiError.response?.data?.message) {
        errorMessage = apiError.response.data.message;
      } else if (typeof apiError.message === 'string') {
        errorMessage = apiError.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // If not visible, don't render
  if (!isVisible) return null;

  // Changes by Agnij May 02, 2025 [Fixed modal structure to prevent navbar issues]
  return (
    <div className="modal-wrapper">
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
      <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, overflow: 'hidden', outline: 0 }}>
        <div className="modal-dialog" style={{ position: 'relative', margin: '1.75rem auto', maxWidth: '500px' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Map Variant with Vendor</h5>
              <button type="button" className="close" onClick={onCancel} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSubmit}>
                <input 
                  type="hidden" 
                  name="variant_id" 
                  value={formData.variant_id} 
                />

                {variant && (
                  <div className="mb-4">
                    <p className="mb-1 font-weight-bold">Variant Name:</p>
                    <p>{variant.variant_name || variant.name}</p>
                    <p className="mb-1 font-weight-bold mt-2">Product:</p>
                    <p>{variant.product_name}</p>
                    {variant.category_info && (
                      <>
                        <p className="mb-1 font-weight-bold mt-2">Category:</p>
                        <p>{variant.category_info}</p>
                      </>
                    )}
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="vendor_id">Vendor <span className="text-danger">*</span></label>
                  <select
                    id="vendor_id"
                    name="vendor_id"
                    className="form-control"
                    value={formData.vendor_id}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Map Variant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapVariantVendorModal; 