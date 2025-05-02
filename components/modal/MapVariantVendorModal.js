import React, { useState, useEffect } from 'react';
import { mapVariantWithVendor } from '../../utils/services/product-management';
import { getAllVendors } from '../../utils/services/vendor-management';
import { toast } from 'react-toastify';
import { Modal, Button } from 'react-bootstrap';

// Changes by Agnij May 02, 2025 [Enhanced modal to prevent disappearing on click with additional event prevention]
const MapVariantVendorModal = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [formData, setFormData] = useState({
    variant_id: '',
    vendor_id: ''
  });

  // Fetch vendors when modal becomes visible
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching vendors for mapping modal");
        setLoading(true);
        const vendorsResponse = await getAllVendors();
        if (vendorsResponse?.data?.data) {
          console.log(`Fetched ${vendorsResponse.data.data.length} vendors`);
          setVendors(vendorsResponse.data.data);
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
      console.log("Setting form data with variant ID:", variant.id);
      setFormData(prev => ({
        ...prev,
        variant_id: variant.id
      }));
    }
  }, [variant, isVisible]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    // Stop event propagation to prevent modal closure
    e.stopPropagation();
    console.log(`Updating ${name} to ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
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
        onSuccess && onSuccess();
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

  // Prevent modal from closing on clicks and mousedown
  const preventClose = (e) => {
    e.stopPropagation();
    e.preventDefault();
  };

  // Use React Bootstrap Modal to fix disappearing on click issue
  return (
    <Modal 
      show={isVisible} 
      onHide={onCancel}
      backdrop="static" 
      keyboard={false}
      centered
      style={{ zIndex: 1050 }}
      onClick={preventClose}
      onMouseDown={preventClose}
      dialogAs={(props) => (
        <div 
          {...props} 
          onClick={preventClose} 
          onMouseDown={preventClose}
          className={`${props.className || ''} modal-dialog`}
        />
      )}
    >
      <Modal.Header closeButton onClick={(e) => e.stopPropagation()}>
        <Modal.Title>Map Variant with Vendor</Modal.Title>
      </Modal.Header>
      <Modal.Body onClick={preventClose} onMouseDown={preventClose}>
        <form onSubmit={handleSubmit} onClick={preventClose} onMouseDown={preventClose}>
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

          <div className="form-group" onClick={preventClose} onMouseDown={preventClose}>
            <label htmlFor="vendor_id">Vendor <span className="text-danger">*</span></label>
            <select
              id="vendor_id"
              name="vendor_id"
              className="form-control"
              value={formData.vendor_id}
              onChange={handleInputChange}
              onClick={preventClose}
              onMouseDown={preventClose}
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
        </form>
      </Modal.Body>
      <Modal.Footer onClick={preventClose} onMouseDown={preventClose}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Map Variant'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MapVariantVendorModal; 