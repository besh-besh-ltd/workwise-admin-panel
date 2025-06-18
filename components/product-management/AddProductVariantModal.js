import React, { useState, useEffect } from 'react';
import { addProductVariant } from '../../utils/services/product-management';
import { toast } from 'react-toastify';

// Variant specification keys
const variantSpecKeys = [
  // Dimensions & Size
  "Length",
  "Width", 
  "Height",
  "Diameter",
  "Thickness",
  "Size",

  // Material & Build
  "Material",
  "Grade",
  "Surface Finish",
  "Coating",

  // Appearance
  "Color",
  "Shape",
  "Pattern",

  // Mechanical Properties
  "Strength",
  "Hardness",
  "Tolerance",
  "Load Capacity",

  // Electrical Properties
  "Voltage Rating",
  "Current Rating",
  "Frequency",
  "Power Rating",
  "Connector Type",

  // Functional Details
  "Type",
  "Operation Type",
  "Compatibility",
  "Application Area",

  // Chemical/Environmental
  "Corrosion Resistance",
  "Temperature Range",
  "IP Rating",
  "Chemical Compatibility",

  // Packaging & Delivery
  "Packaging Type",
  "Unit of Measurement",
  "MOQ",
  "Lead Time",

  // Certification & Compliance
  "IS Code / BIS Standard",
  "ISO Certification",
  "Warranty Period",
  "Country of Origin"
];

// Changes by Agnij May 02, 2025 [Fixed modal structure to prevent navbar issues]
const AddProductVariantModal = ({ isVisible, onCancel, productId, productName, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [variantName, setVariantName] = useState('');
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

  // Reset form when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      setVariantName('');
      setSpecifications([{ key: '', value: '' }]);
    }
  }, [isVisible]);

  const handleInputChange = (e) => {
    setVariantName(e.target.value);
  };

  const handleSpecificationChange = (index, field, value) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index) => {
    if (specifications.length > 1) {
      const updatedSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(updatedSpecs);
    }
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
      const validSpecifications = specifications.filter(spec => spec.key && spec.value);
      
      const payload = {
        product_id: productId,
        variant_name: variantName.trim(), // This is what the form collects, ensure it's trimmed
        specifications: validSpecifications.length > 0 ? validSpecifications : undefined
      };
      

      const response = await addProductVariant(payload);
      
      if (response?.data?.status === 1) {
        toast.success('Product variant added successfully');
        setVariantName('');
        setSpecifications([{ key: '', value: '' }]);
        // Make sure we have the data needed for onSuccess
        const successData = {
          ...response.data.data,
          product_id: productId,
          variant_name: payload.variant_name // Include variant_name in success data
        };
        onSuccess && onSuccess(successData);
        onCancel();
      } else {
        toast.error(response?.data?.message || 'Failed to add product variant');
      }
    } catch (error) {
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
        <div className="modal-dialog" style={{ position: 'relative', margin: '1.75rem auto', maxWidth: '700px' }}>
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

                {/* Start Variant Specifications */}
                <div className="form-group">
                  <label>Variant Specifications</label>
                  {specifications.map((spec, index) => (
                    <div key={index} className="row mb-2">
                      <div className="col-4">
                        <select
                          className="form-control form-control-sm"
                          value={spec.key}
                          onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                        >
                          <option value="">Select Specification</option>
                          {variantSpecKeys.map((key) => (
                            <option key={key} value={key}>
                              {key}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-6">
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Enter value"
                          value={spec.value}
                          onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                        />
                      </div>
                      <div className="col-2">
                        {specifications.length > 1 && (
                          <button
                            type="button"
                            className="btn btn-danger btn-sm"
                            onClick={() => removeSpecification(index)}
                            style={{ fontSize: '12px', padding: '2px 6px' }}
                          >
                            -
                          </button>
                        )}
                        {index === specifications.length - 1 && (
                          <button
                            type="button"
                            className="btn btn-success btn-sm ml-1"
                            onClick={addSpecification}
                            style={{ fontSize: '12px', padding: '2px 6px' }}
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {/* End Variant Specifications */}

                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={onCancel}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Variant'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProductVariantModal; 