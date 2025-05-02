import React, { useState, useEffect } from 'react';
import { 
  getProductVariants, 
  deleteProductVariant
} from "@/utils/services/product-management";
import { toast } from 'react-toastify';
import AddProductVariantModal from './AddProductVariantModal';
import MapVariantVendorModal from '../modal/MapVariantVendorModal';

// Changes by Agnij May 4, 2025 [Enhanced ProductVariantsTab with pagination and better error handling]
// Changes by Agnij May 4, 2025 [Added detailed product and category information display]
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
        console.log("Setting product details from API response");
        setProductDetails(response.data.product_details);
      } else {
        // Fallback to the passed product prop
        console.log("Using product prop for details");
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
      setProductDetails(product); // Initialize with passed product details
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
                  <span className="font-weight-bold">{productDetails.name || 'N/A'}</span>
                </dd>
                
                <dt className="col-sm-4">ID:</dt>
                <dd className="col-sm-8">{productDetails.id || 'N/A'}</dd>
                
                <dt className="col-sm-4">SKU:</dt>
                <dd className="col-sm-8">{productDetails.sku || 'Not specified'}</dd>
                
                <dt className="col-sm-4">Status:</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-${productDetails.status === 1 ? 'success' : 'secondary'}`}>
                    {productDetails.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </dl>
            </div>
            <div className="col-md-6">
              <dl className="row mb-0">
                <dt className="col-sm-4">Created:</dt>
                <dd className="col-sm-8">{productDetails.created_at ? new Date(productDetails.created_at).toLocaleString() : 'N/A'}</dd>
                
                <dt className="col-sm-4">Manufacturer:</dt>
                <dd className="col-sm-8">{productDetails.manufacturer || 'Not specified'}</dd>
                
                <dt className="col-sm-4">Approval:</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-${productDetails.is_approve === 1 ? 'success' : 'danger'}`}>
                    {productDetails.is_approve === 1 ? 'Approved' : 'Not Approved'}
                  </span>
                </dd>
                
                <dt className="col-sm-4">Categories:</dt>
                <dd className="col-sm-8">
                  {productDetails.product_categories && productDetails.product_categories.length > 0 
                    ? productDetails.product_categories.map(c => c.category_name || c.name).join(', ')
                    : 'No categories'}
                </dd>
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
            <i className="fas fa-plus mr-1"></i> Add Variant
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
                <i className="fas fa-sync-alt mr-1"></i> Try Again
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
                <i className="fas fa-plus mr-1"></i> Add First Variant
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-bordered">
                <thead className="thead-dark">
                  <tr>
                    <th style={{width: '10%'}}>ID</th>
                    <th style={{width: '25%'}}>Variant Name</th>
                    <th style={{width: '25%'}}>Product Name</th>
                    <th style={{width: '15%'}}>Category</th>
                    <th style={{width: '15%'}}>Created At</th>
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
                        <td>{variant.category_info || '-'}</td>
                        <td>{variant.created_at ? new Date(variant.created_at).toLocaleString() : '-'}</td>
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
                              <i className="fas fa-link mr-1"></i> Map
                            </button>
                            
                            {showDeleteConfirm === variant.id ? (
                              <>
                                <button 
                                  type="button" 
                                  className="btn btn-danger btn-sm"
                                  onClick={() => handleDeleteVariant(variant.id)}
                                >
                                  <i className="fas fa-check mr-1"></i>
                                </button>
                                <button 
                                  type="button" 
                                  className="btn btn-secondary btn-sm"
                                  onClick={handleCancelDelete}
                                >
                                  <i className="fas fa-times mr-1"></i>
                                </button>
                              </>
                            ) : (
                              <button 
                                type="button" 
                                className="btn btn-danger btn-sm"
                                onClick={() => handleConfirmDelete(variant.id)}
                              >
                                <i className="fas fa-trash-alt mr-1"></i>
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
        productName={product?.name}
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