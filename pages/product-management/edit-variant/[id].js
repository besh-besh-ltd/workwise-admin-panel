import React, { useEffect, useState } from 'react';
import Layout from "../../../components/layout";
import { getAdminProfile } from "@/utils/services/login";
import { searchAllVariants, updateProductVariant } from '@/utils/services/product-management';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import FullLoading from '@/components/loading/FullLoading';

// Changes by Agnij May 31, 2025 [Created variant edit page]
const EditVariant = () => {
  const router = useRouter();
  const { id } = router.query;
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userType, setUserType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    sku: ''
  });

  useEffect(() => {
    getUserProfile();
  }, []);

  useEffect(() => {
    if (id) {
      fetchVariantDetails();
    }
  }, [id]);

  const getUserProfile = async () => {
    try {
      const res = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchVariantDetails = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      // Direct approach - search for variant by ID
      console.log("Fetching variant details for ID:", id);
      const searchResponse = await searchAllVariants(id);
      
      console.log("Search response:", searchResponse?.data);
      
      if (searchResponse?.data?.data && Array.isArray(searchResponse.data.data)) {
        // First try exact match
        let variantData = searchResponse.data.data.find(v => 
          v.id === parseInt(id) || v.id === id
        );
        
        // If no exact match, try to find any variant (there should be at least one if API returned data)
        if (!variantData && searchResponse.data.data.length > 0) {
          variantData = searchResponse.data.data[0];
          console.log("Using first available variant:", variantData);
        }
        
        if (variantData) {
          console.log("Found variant:", variantData);
          setVariant(variantData);
          
          // Initialize form data with variant details
          setFormData({
            name: variantData.name || variantData.variant_name || '',
            description: variantData.description || '',
            price: variantData.price || '',
            stock: variantData.stock || '',
            sku: variantData.sku || ''
          });
          
          setLoading(false);
          return;
        }
      }
      
      // If direct search fails, try alternative approach
      console.log("Direct search failed, no variant found");
      setLoading(false);
      toast.error("Could not find variant with ID: " + id);
      
    } catch (error) {
      console.error("Error fetching variant details:", error);
      toast.error("Failed to load variant details");
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error("Variant name is required");
      return;
    }
    
    setSaving(true);
    try {
      const payload = {
        variant_name: formData.name,
        description: formData.description,
        price: formData.price,
        stock: formData.stock,
        sku: formData.sku
      };
      
      console.log("Submitting update with payload:", payload);
      const response = await updateProductVariant(id, payload);
      console.log("Update response:", response);
      
      if (response && (response.status === 1 || response.status === "1" || response.status === 200)) {
        toast.success("Variant updated successfully");
        router.push(`/product-management/variant/${id}`);
      } else {
        toast.error(response?.message || "Failed to update variant");
      }
    } catch (error) {
      console.error("Error updating variant:", error);
      toast.error(error?.message || "An error occurred while updating the variant");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="content-header">
        <div className="container-fluid">
          <div className="row mb-2">
            <div className="col-sm-6">
              <h1 className="m-0">Edit Variant</h1>
            </div>
            <div className="col-sm-6">
              <div className="float-sm-right">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => router.back()}
                >
                  <i className="fas fa-arrow-left mr-1"></i> Back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {loading ? (
            <FullLoading />
          ) : variant ? (
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Variant Information</h3>
                    <div className="card-tools">
                      <span className="badge badge-info">
                        Product: {variant.product_name || "Unknown Product"}
                      </span>
                    </div>
                  </div>
                  <div className="card-body">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="name">Variant Name <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <textarea
                          className="form-control"
                          id="description"
                          name="description"
                          rows="3"
                          value={formData.description}
                          onChange={handleInputChange}
                        ></textarea>
                      </div>
                      
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="price">Price</label>
                            <input
                              type="number"
                              className="form-control"
                              id="price"
                              name="price"
                              value={formData.price}
                              onChange={handleInputChange}
                              min="0"
                              step="0.01"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="stock">Stock</label>
                            <input
                              type="number"
                              className="form-control"
                              id="stock"
                              name="stock"
                              value={formData.stock}
                              onChange={handleInputChange}
                              min="0"
                            />
                          </div>
                        </div>
                        
                        <div className="col-md-4">
                          <div className="form-group">
                            <label htmlFor="sku">SKU</label>
                            <input
                              type="text"
                              className="form-control"
                              id="sku"
                              name="sku"
                              value={formData.sku}
                              onChange={handleInputChange}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary mr-2"
                          onClick={() => router.back()}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? (
                            <>
                              <span className="spinner-border spinner-border-sm mr-1" role="status" aria-hidden="true"></span>
                              Saving...
                            </>
                          ) : (
                            'Save Changes'
                          )}
                        </button>
                      </div>
                    </form>
                    
                    {/* Debug info - show raw variant data */}
                    {process.env.NODE_ENV === 'development' && (
                      <div className="row mt-4">
                        <div className="col-12">
                          <details>
                            <summary>Debug - Variant Data</summary>
                            <pre className="bg-light p-3 mt-2" style={{maxHeight: '300px', overflow: 'auto'}}>
                              {JSON.stringify(variant, null, 2)}
                            </pre>
                          </details>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Variant Details</h3>
                  </div>
                  <div className="card-body">
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <strong>Variant ID:</strong>
                      </div>
                      <div className="col-md-7">
                        {variant.id}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <strong>Categories:</strong>
                      </div>
                      <div className="col-md-7">
                        {variant.category_names && variant.category_names.length > 0 ? (
                          variant.category_names.map((category, index) => (
                            <span key={index} className="badge badge-warning mr-1">
                              {category}
                            </span>
                          ))
                        ) : (
                          "No categories"
                        )}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <strong>Status:</strong>
                      </div>
                      <div className="col-md-7">
                        {variant.is_approve === 1 ? (
                          <span className="badge badge-success">Approved</span>
                        ) : (
                          <span className="badge badge-danger">Not Approved</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <strong>Created:</strong>
                      </div>
                      <div className="col-md-7">
                        {variant.created_at ? new Date(variant.created_at).toLocaleString() : "N/A"}
                      </div>
                    </div>
                    
                    <div className="row mb-3">
                      <div className="col-md-5">
                        <strong>Last Updated:</strong>
                      </div>
                      <div className="col-md-7">
                        {variant.updated_at ? new Date(variant.updated_at).toLocaleString() : "N/A"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h5><i className="icon fas fa-exclamation-triangle"></i> Variant not found</h5>
              <p>The variant with ID {id} could not be found. It may have been deleted or you don't have permission to edit it.</p>
              <button
                type="button"
                className="btn btn-primary mt-3"
                onClick={() => router.push("/product-management?tab=variants")}
              >
                <i className="fas fa-arrow-left mr-1"></i> Back to Variants
              </button>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default EditVariant; 