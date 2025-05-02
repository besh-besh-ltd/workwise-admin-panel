import React, { useState, useEffect } from 'react';
import { addProductVariant } from '../../utils/services/product-management';
import { toast } from 'react-toastify';

// Changes by Agnij May 02, 2025 [Fixed modal structure to prevent navbar issues]
const AddProductVariantModal = ({ isVisible, onCancel, productId, productName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [variantName, setVariantName] = useState('');

  // Reset form when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setVariantName('');
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    setVariantName(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!variantName.trim()) {
      toast.error('Please enter variant name');
      return;
    }
    
    setLoading(true);

    try {
      // Changes by Agnij April 30, 2025 [Fixed variant payload to match backend requirements]
      // Format the request payload with the correct field names
      const payload = {
        product_id: productId,
        variant_name: variantName.trim() // This is what the form collects, ensure it's trimmed
      };
      
      console.log('Submitting variant:', payload);

      const response = await addProductVariant(payload);
      console.log('Variant response:', response);
      
      if (response?.data?.status === 1) {
        toast.success('Product variant added successfully');
        setVariantName('');
        // Make sure we have the data needed for onSuccess
        const successData = {
          ...response.data.data,
          product_id: productId,
          variant_name: payload.variant_name // Include variant_name in success data
        };
        console.log('Calling onSuccess with:', successData);
        onSuccess && onSuccess(successData);
        onCancel();
      } else {
        console.error('Failed response:', response);
        toast.error(response?.data?.message || 'Failed to add product variant');
      }
    } catch (error) {
      console.error('Error adding product variant:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to add product variant');
      }
    } finally {
      setLoading(false);
    }
  };

  // If not visible, don't render
  if (!isVisible) return null;

  return (
    <div className="modal-wrapper">
      <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}></div>
      <div className="modal" style={{ display: 'block', position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1050, overflow: 'hidden', outline: 0 }}>
        <div className="modal-dialog" style={{ position: 'relative', margin: '1.75rem auto', maxWidth: '500px' }}>
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">Add Product Variant</h5>
              <button type="button" className="close" onClick={onCancel} aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="mb-4">
                <p className="mb-1 font-weight-bold">Product:</p>
                <p>{productName || 'N/A'}</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="variant_name">Variant Name <span className="text-danger">*</span></label>
                  <input
                    type="text"
                    className="form-control"
                    id="variant_name"
                    name="variant_name"
                    value={variantName}
                    onChange={handleInputChange}
                    placeholder="Enter variant name"
                    maxLength={100}
                    required
                  />
                  <small className="form-text text-muted">Maximum 100 characters</small>
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
                {loading ? 'Adding...' : 'Add Variant'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductVariantModal; 