import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { addProductVariant, searchProductsV2 } from '../../utils/services/product-management';

const AddVariantModal = ({ isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product: null,
    variant_name: '',
  });
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productLoading, setProductLoading] = useState(false);
  const [productsList, setProductsList] = useState([]);

  useEffect(() => {
    // Reset form when modal opens/closes
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  // Search Product Function
  const getProductsList = useCallback((search_key) => {
    setProductSearchTerm(search_key);
    
    if (search_key.length < 3) {
      setProductsList([]);
      setProductLoading(false);
      return;
    }
    
    setProductLoading(true);
    // Reset the product field when data is loading
    setFormData((prevState) => ({
      ...prevState,
      product: null,
    }));
  
    setProductsList([]); // Clear previous product list
    
    // Use searchProductsV2 which makes a call to rfq/search-product API
    searchProductsV2({
      search_key: search_key,
      cat_id: "",
      vendor_name: ""
    }, "products")
      .then((res) => {
        // Format the products to display in the UI
        const products = res.data || [];
        const formattedProducts = products.map(item => ({
          value: item.product_id,
          label: item.product_name,
          description: item.description,
          categories: item.category_name,
          similarity_score: item.similarity_score,
          rank: item.rank
        }));
        
        setProductsList(formattedProducts);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setProductLoading(false));
  }, []);

  // Debouncing the search product API call for 300ms
  const debounceGetProductsList = useCallback(
    (inputValue) => {
      const debounceTimeout = 300;
      clearTimeout(window.debounceTimer);
      window.debounceTimer = setTimeout(() => {
        getProductsList(inputValue);
      }, debounceTimeout);
    },
    [getProductsList]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProductSelection = (product) => {
    setFormData((prev) => ({
      ...prev,
      product: formData?.product?.value === product.value ? null : product,
    }));
  };

  const validateForm = () => {
    if (!formData.product) {
      toast.error('Please select a product');
      return false;
    }
    if (!formData.variant_name.trim()) {
      toast.error('Please enter a variant name');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Changes by Agnij April 30, 2025 [Fixed response handling for variant creation]
      const payload = {
        product_id: formData.product.value,
        variant_name: formData.variant_name.trim(),
      };
      
      console.log('Submitting variant with payload:', payload);
      
      const response = await addProductVariant(payload);
      
      // Check for response status code instead of response.data.status
      if (response.status >= 200 && response.status < 300) {
        toast.success(response.data?.message || 'Variant added successfully');
        onSuccess(response.data?.data || response.data);
        resetForm();
      } else {
        console.error('Error response from API:', response.data);
        toast.error(response.data?.message || 'Failed to add variant');
      }
    } catch (error) {
      console.error('Error adding variant:', error);
      toast.error(error.response?.data?.message || 'An error occurred while adding variant');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product: null,
      variant_name: '',
    });
    setProductSearchTerm('');
    setProductsList([]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Add Product Variant</h5>
            <button
              type="button"
              className="btn-close"
              aria-label="Close"
              onClick={() => {
                resetForm();
                onClose();
              }}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="product" className="form-label">Product *</label>
                <div className="input-group mb-3">
                  <span className="input-group-text">
                    <i className="fa fa-search"></i>
                  </span>
                  <input
                    type="text"
                    name="product_search"
                    className="form-control"
                    placeholder="Search Products"
                    onChange={(e) => debounceGetProductsList(e.target.value)}
                    id="productSearchInput"
                  />
                </div>
                
                <div className="border rounded p-3">
                  <h5 className="mt-2 mb-3"> 
                    {productLoading ? 
                      <span>
                        <i className="fa fa-spinner fa-spin me-2"></i>
                        Searching Products...
                      </span> 
                      : productSearchTerm.length < 3 ? 
                        "Type at least 3 characters to search" : 
                        `Search Results (${productsList.length})`
                    } 
                  </h5>
                  
                  {!productLoading && productsList?.length > 0 ? (
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }} className="product-search-results">
                      {productsList.map((item, index) => (
                        <div
                          className="d-flex justify-content-between align-items-center border-bottom py-2"
                          key={item.label + "_" + index}
                        >
                          <div>
                            <p className="mb-0 fw-bold">{item.label}</p>
                            <p className="text-muted">{item.categories}</p>
                          </div>
                          <button
                            type="button"
                            className={`btn ${formData?.product?.value === item.value ? "btn-danger" : "btn-primary"} btn-sm`}
                            onClick={() => handleProductSelection(item)}
                          >
                            {formData?.product?.value === item.value ? "Remove" : "Select"}
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted">
                      {productSearchTerm.length < 3 ? 
                        "Type to search for products" : 
                        productLoading ? 
                          "Searching..." : 
                          "No products found matching your search criteria"}
                    </p>
                  )}
                </div>
                
                {formData.product && (
                  <div className="mt-2 mb-3 p-2 border rounded bg-light">
                    <p className="mb-0"><strong>Selected Product:</strong> {formData.product.label}</p>
                    {formData.product.categories && (
                      <p className="mb-0 small text-muted">Category: {formData.product.categories}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mb-3">
                <label htmlFor="variant_name" className="form-label">Variant Name *</label>
                <input
                  type="text"
                  className="form-control"
                  id="variant_name"
                  name="variant_name"
                  value={formData.variant_name}
                  onChange={handleChange}
                  placeholder="Enter variant name"
                />
              </div>
              <div className="text-center mt-4">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={() => {
                    resetForm();
                    onClose();
                  }}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      Submitting...
                    </>
                  ) : (
                    'Submit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariantModal; 