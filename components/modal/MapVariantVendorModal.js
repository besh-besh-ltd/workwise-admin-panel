import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { mapVariantWithVendor } from '../../utils/services/product-management';
import { toast } from 'react-toastify';
import { vendorList } from '@/utils/services/rfq';

// Simple modal component that doesn't use antd
const MapVariantVendorModal = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    variant_id: '',
    vendor_id: ''
  });
  const [modalElement, setModalElement] = useState(null);

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

  // Fetch vendors when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      fetchVendors();
      resetForm();
    }
  }, [isVisible]);

  const fetchVendors = async () => {
    try {
      console.log("Fetching vendors for mapping modal");
      setLoading(true);
      const vendorsResponse = await vendorList();
      console.log("VENDOR RESPONSE -------- ", vendorsResponse)
      if (vendorsResponse?.data) {
        console.log(`Fetched ${vendorsResponse.data.length} vendors`);
        setVendors(vendorsResponse.data);
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
      console.log("Setting form data with variant ID:", variant.id);
      setFormData(prev => ({
        ...prev,
        variant_id: variant.id
      }));
    }
  }, [variant, isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} to ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    if (!formData.vendor_id) {
      toast.error('Please select a vendor');
      return;
    }
    
    setLoading(true);

    try {
      console.log("Submitting mapping values:", formData);
      const response = await mapVariantWithVendor(formData);
      
      console.log("Mapping response:", response);
      
      if (response?.data?.status === 1 || response?.status === 1) {
        toast.success('Variant mapped with vendor successfully');
        resetForm();
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        toast.error(response?.data?.message || response?.message || 'Failed to map variant with vendor');
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
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
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

            {variant && (
              <div className="mb-4">
                <p className="mb-1 font-weight-bold">Variant Name:</p>
                <p>{variant.variant_name || variant.name}</p>
                {variant.product_name && (
                  <>
                    <p className="mb-1 font-weight-bold mt-2">Product:</p>
                    <p>{variant.product_name}</p>
                  </>
                )}
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
                    {vendor.organization_name ? vendor.organization_name : vendor.name}
                  </option>
                ))}
              </select>
            </div>
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
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Map Variant'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalElement
  );
};

export default MapVariantVendorModal; 