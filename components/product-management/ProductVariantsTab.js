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

  const fetchVariants = async () => {
    if (!product || !product.id) return;
    
    setLoading(true);
    try {
      console.log("Fetching variants for product:", product.id);
      const response = await getProductVariants(product.id);
      
      if (response && response.data) {
        const variantsData = response.data.data || [];
        console.log("Variants loaded:", variantsData.length);
        setVariants(variantsData);
      } else {
        console.log("No variants found or invalid response");
        setVariants([]);
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('Failed to load product variants');
      setVariants([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (product && product.id) {
      fetchVariants();
    }
  }, [product]);

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
        fetchVariants();
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
    fetchVariants();
  };

  // Display product details card
  const renderProductDetails = () => {
    if (!product) return null;
    
    return (
      <div className="card mb-4">
        <div className="card-header">
          <h3 className="card-title">Product Details</h3>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-6">
              <dl className="row">
                <dt className="col-sm-4">Product Name:</dt>
                <dd className="col-sm-8">{product.name || 'N/A'}</dd>
                
                <dt className="col-sm-4">ID:</dt>
                <dd className="col-sm-8">{product.id || 'N/A'}</dd>
                
                <dt className="col-sm-4">Status:</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-${product.status === 1 ? 'success' : 'secondary'}`}>
                    {product.status === 1 ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </dl>
            </div>
            <div className="col-md-6">
              <dl className="row">
                <dt className="col-sm-4">Created:</dt>
                <dd className="col-sm-8">{product.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}</dd>
                
                <dt className="col-sm-4">Approval:</dt>
                <dd className="col-sm-8">
                  <span className={`badge badge-${product.is_approve === 1 ? 'success' : 'danger'}`}>
                    {product.is_approve === 1 ? 'Approved' : 'Not Approved'}
                  </span>
                </dd>
                
                <dt className="col-sm-4">Categories:</dt>
                <dd className="col-sm-8">
                  {product.product_categories && product.product_categories.length > 0 
                    ? product.product_categories.map(c => c.category_name).join(', ')
                    : 'No categories'}
                </dd>
              </dl>
            </div>
          </div>
          
          {product.description && (
            <div className="row mt-3">
              <div className="col-12">
                <h5>Description:</h5>
                <p>{product.description}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="product-variants-tab">
      {renderProductDetails()}
      
      <div className="mb-4 d-flex justify-content-between align-items-center">
        <h3 className="text-lg font-weight-bold">Product Variants</h3>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleAddVariant}
        >
          <i className="fas fa-plus mr-1"></i> Add Variant
        </button>
      </div>

      {variants.length === 0 && !loading ? (
        <div className="text-center py-5">
          <i className="fas fa-box-open fa-3x text-muted mb-3"></i>
          <p>No variants found for this product</p>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped table-bordered">
            <thead>
              <tr>
                <th style={{width: '10%'}}>ID</th>
                <th>Variant Name</th>
                <th>Category</th>
                <th>Created At</th>
                <th style={{width: '20%'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="sr-only">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                variants.map(variant => (
                  <tr key={variant.id}>
                    <td>{variant.id}</td>
                    <td>{variant.variant_name || variant.name || 'Unnamed Variant'}</td>
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
                          <i className="fas fa-link mr-1"></i> Map to Vendor
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
                            <i className="fas fa-trash-alt mr-1"></i> Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

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