import React, { useState, useEffect } from 'react';
import { 
  getProductVariants, 
  deleteProductVariant
} from "@/utils/services/product-management";
import { toast } from 'react-toastify';
import AddProductVariantModal from './AddProductVariantModal';
import MapVariantVendorModal from '../modal/MapVariantVendorModal';

const ProductVariantsTab = ({ product }) => {
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [error, setError] = useState(null);
  const [productDetails, setProductDetails] = useState(null);

  const fetchVariants = async (page = 1) => {
    if (!product || !product.id) {
      console.error("Cannot fetch variants: No product ID available");
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Fetching variants for product: ${product.id}, page: ${page}, limit: ${pagination.limit}`);
      const response = await getProductVariants(product.id, page, pagination.limit);
      
      console.log("API Response for variants:", response);
      
      // Save product details if included in the response
      if (response?.data?.product_details) {
        console.log("Setting product details from API response:", response.data.product_details);
        setProductDetails(response.data.product_details);
      } else {
        // Fallback to the passed product prop
        console.log("Using product prop for details:", product);
        setProductDetails(product);
      }
      
      if (response && response.data) {
        // Check if data property exists and is an array
        if (response.data.data && Array.isArray(response.data.data)) {
          console.log(`Variants loaded: ${response.data.data.length}`);
          setVariants(response.data.data);
          
          // Update pagination if available
          if (response.data.pagination) {
            console.log("Setting pagination:", response.data.pagination);
            setPagination(response.data.pagination);
          }
        } else if (Array.isArray(response.data)) {
          // Handle case where data is directly in response.data
          console.log(`Variants loaded (direct array): ${response.data.length}`);
          setVariants(response.data);
          
          // Create pagination info
          setPagination({
            page: page,
            limit: pagination.limit,
            total: response.data.length,
            pages: Math.ceil(response.data.length / pagination.limit)
          });
        } else {
          console.warn("No variants array found in response:", response.data);
          setVariants([]);
          setPagination({
            page: page,
            limit: pagination.limit,
            total: 0,
            pages: 0
          });
        }
      } else {
        console.error("Invalid response format:", response);
        setVariants([]);
        setError("Failed to load product variants: Invalid response format");
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      setError(`Failed to load product variants: ${error.message || "Unknown error"}`);
      setVariants([]);
      toast.error('Failed to load product variants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product && product.id) {
      // Initialize with passed product details but will be updated from API
      setProductDetails(product);
      fetchVariants(1); // Reset to page 1 when product changes
    }
  }, [product]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > pagination.pages) return;
    fetchVariants(newPage);
  };

  const handleAddVariant = () => {
    setShowAddModal(true);
  };

  const handleMapVariant = (variant) => {
    console.log("Opening map modal for variant:", variant);
    setSelectedVariant(variant);
    setShowMapModal(true);
  };

  const handleCloseMapModal = () => {
    console.log("Closing map modal");
    setShowMapModal(false);
    setTimeout(() => {
      setSelectedVariant(null);
    }, 200);
  };

  const handleModalClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleConfirmDelete = (variantId) => {
    setShowDeleteConfirm(variantId);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const handleDeleteVariant = async (variantId) => {
    try {
      console.log("Deleting variant:", variantId);
      const response = await deleteProductVariant(variantId);
      if (response?.data?.status === 1) {
        toast.success('Product variant deleted successfully');
        fetchVariants(pagination.page); // Refresh current page
      } else {
        toast.error(response?.data?.message || 'Failed to delete product variant');
      }
    } catch (error) {
      console.error('Error deleting variant:', error);
      toast.error('Failed to delete product variant');
    } finally {
      setShowDeleteConfirm(null);
    }
  };

  const handleMappingSuccess = () => {
    console.log("Mapping success, refreshing variants");
    fetchVariants(pagination.page); // Refresh current page
  };

  // Display product details card
  const renderProductDetails = () => {
    if (!productDetails) return null;
    
    // Ensure we have properly formatted data
    const productName = productDetails.name || 'Product information unavailable';
    const status = productDetails.status === 1 ? 'Active' : 'Inactive';
    const statusClass = productDetails.status === 1 ? 'success' : 'secondary';
    
    // Format categories
    let categories = 'No categories';
    if (productDetails.product_categories && productDetails.product_categories.length > 0) {
      categories = productDetails.product_categories
        .map(c => c.category_name || c.name)
        .filter(Boolean)
        .join(', ');
    }
    
    // Format dates
    let createdDate = 'N/A';
    if (productDetails.created_at) {
      try {
        createdDate = new Date(productDetails.created_at).toLocaleString();
      } catch (e) {
        console.warn('Could not parse product creation date');
      }
    }
    
    return (
      <div className="card mb-4">
        <div className="card-header bg-primary text-white">
          <h3 className="card-title mb-0">
            <i className="fas fa-box-open mr-2"></i>
            Product Information
          </h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <dl className="row mb-0">
                <dt className="col-sm-4">Product Name:</dt>
                <dd className="col-sm-8">
                  <span className="font-weight-bold">{productName}</span>
                </dd>
                
                <dt className="col-sm-4">ID:</dt>
                <dd className="col-sm-8">{productDetails.id || 'N/A'}</dd>
                
                <dt className="col-sm-4">Status:</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-${statusClass}`}>
                    {status}
                  </span>
                </dd>
              </dl>
            </div>
            <div className="col-md-6">
              <dl className="row mb-0">
                <dt className="col-sm-4">Created:</dt>
                <dd className="col-sm-8">{createdDate}</dd>

                <dt className="col-sm-4">Updated:</dt>
                <dd className="col-sm-8">{new Date(product.updated_at).toLocaleString()}</dd>

                <dt className="col-sm-4">Approved:</dt>
                <dd className="col-sm-8">{new Date(product.approved_at).toLocaleString()}</dd>
                
                <dt className="col-sm-4">Categories:</dt>
                <dd className="col-sm-8">{categories}</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;
    
    return (
      <div className="d-flex justify-content-center my-3">
        <nav aria-label="Variant pagination">
          <ul className="pagination">
            <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </button>
            </li>
            
            {[...Array(pagination.pages).keys()].map(i => (
              <li 
                key={i + 1} 
                className={`page-item ${pagination.page === i + 1 ? 'active' : ''}`}
              >
                <button 
                  className="page-link" 
                  onClick={() => handlePageChange(i + 1)}
                >
                  {i + 1}
                </button>
              </li>
            ))}
            
            <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
              <button 
                className="page-link" 
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </button>
            </li>
          </ul>
        </nav>
      </div>
    );
  };

  return (
    <div className="product-variants-tab">
      {renderProductDetails()}
      
      <div className="card mb-4">
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h3 className="card-title mb-0">
            <i className="fas fa-tags mr-2"></i>
            Product Variants
          </h3>
          <button
            type="button"
            className="btn btn-light"
            onClick={handleAddVariant}
          >
            Add Variant
          </button>
        </div>
        <div className="card-body">
          {/* Error state */}
          {error && (
            <div className="alert alert-danger" role="alert">
              <i className="fas fa-exclamation-triangle mr-2"></i>
              {error}
              <button 
                className="btn btn-sm btn-outline-danger ml-3"
                onClick={() => fetchVariants(pagination.page)}
              >
                Try Again
              </button>
            </div>
          )}

          {/* Empty state */}
          {variants.length === 0 && !loading && !error ? (
            <div className="text-center py-5">
              <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
              <p>No variants found for this product</p>
              <button
                className="btn btn-primary mt-3"
                onClick={handleAddVariant}
              >
                Add First Variant
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    <th style={{width: '10%'}}>ID</th>
                    <th style={{width: '30%'}}>Variant Name</th>
                    <th style={{width: '30%'}}>Product Name</th>
                    <th style={{width: '25%'}}>Created At</th>
                    <th style={{width: '15%'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="sr-only">Loading...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    variants.map(variant => (
                      <tr key={variant.id}>
                        <td>{variant.id}</td>
                        <td>
                          <strong>{variant.variant_name || variant.name || 'Unnamed Variant'}</strong>
                        </td>
                        <td>{variant.product_name || productDetails?.name || 'Unknown Product'}</td>
                        <td>{variant.created_at_formatted || (variant.created_at ? new Date(variant.created_at).toLocaleString() : '-')}</td>
                        <td>
                          <div className="btn-group">
                            <button 
                              type="button" 
                              className="btn btn-info btn-sm" 
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleMapVariant(variant);
                              }}
                            >
                               Map
                            </button>
                            
                            {showDeleteConfirm === variant.id ? (
                              <>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteVariant(variant.id)}
                                >
                                  Confirm
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelDelete}
                                >
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleConfirmDelete(variant.id)}
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              
              {renderPagination()}
              
              {!loading && variants.length > 0 && (
                <div className="text-muted small text-center">
                  Showing {variants.length} of {pagination.total} variants
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <AddProductVariantModal
        isVisible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        productId={product?.id}
        productName={productDetails?.name || product?.name}
        onSuccess={fetchVariants}
      />

      <MapVariantVendorModal
        isVisible={showMapModal}
        onCancel={handleCloseMapModal}
        variant={selectedVariant}
        onSuccess={handleMappingSuccess}
      />
    </div>
  );
};

export default ProductVariantsTab; 