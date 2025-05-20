import React, { useEffect, useState, useCallback } from 'react';
import { getAdminProfile } from "@/utils/services/login";
import { searchAllVariants, updateProductVariant, getAllProducts } from '@/utils/services/product-management';
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
    product_id: ''
  });
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [vendorApprovedBy, setVendorApprovedBy] = useState(null);

  // New state variables for product search
  const [productSearchTerm, setProductSearchTerm] = useState('');
  const [productsList, setProductsList] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    getUserProfile();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (id) {
      fetchVariantDetails();
    }
  }, [id]);

  // Changes by Agnij August 15, 2024 [Added effect to set the parent product when products and variant are loaded]
  useEffect(() => {
    // This effect runs when both products and formData.product_id are available
    if (formData.product_id) {
      // If we already have the product in our list, set it as selected
      const existingProduct = products.find(p => p.value === formData.product_id);

      if (existingProduct) {
        setSelectedProduct(existingProduct);
      } else {
        // If product_id exists but doesn't match any product in the list,
        // fetch the specific product
        console.log(`Product ID ${formData.product_id} not found in products list, fetching product details...`);

        getAllProducts(1, 1, formData.product_id)
          .then(response => {
            if (response?.data && response.data.length > 0) {
              const product = response.data[0];
              if (product) {
                const newProduct = {
                  value: product.id,
                  label: product.name,
                  description: product.description,
                  categories: product.category_names ? product.category_names.join(', ') : ''
                };

                console.log("Setting selected product:", newProduct);
                setSelectedProduct(newProduct);
              }
            }
          })
          .catch(error => {
            console.error("Error fetching specific product:", error);
          });
      }
    }
  }, [formData.product_id, products]);

  const getUserProfile = async () => {
    try {
      const res = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await getAllProducts(20, 1);
      if (response?.data) {
        const productsData = response.data.map(product => ({
          value: product.id,
          label: product.name,
          description: product.description,
          categories: product.category_names ? product.category_names.join(', ') : ''
        }));
        setProducts(productsData);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoadingProducts(false);
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

      if (searchResponse?.data && Array.isArray(searchResponse.data)) {
        // First try exact match
        let variantData = searchResponse.data.find(v =>
          v.id === parseInt(id) || v.id === id
        );

        // If no exact match, try to find any variant (there should be at least one if API returned data)
        if (!variantData && searchResponse.data.length > 0) {
          variantData = searchResponse.data[0];
          console.log("Using first available variant:", variantData);
        }

        if (variantData) {
          console.log("Found variant:", variantData);

          // Changes by Agnij August 15, 2024 [Ensuring product_id is correctly extracted from various possible response formats]
          // Different backend endpoints may return product_id in different formats
          const productId = variantData.product_id ||
                           (variantData.product && variantData.product.id) ||
                           '';

          console.log("Extracted product ID:", productId);

          setVariant(variantData);

          // Initialize form data with variant details
          setFormData({
            name: variantData.name || variantData.variant_name || '',
            description: variantData.description || '',
            product_id: productId
          });

          // Set vendor approved by
          setVendorApprovedBy(variantData.vendor_approved_by || null);

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

  // Search Product Function
  const getProductsList = useCallback((search_key) => {
    setProductSearchTerm(search_key);

    if (search_key.length < 3) {
      setProductsList([]);
      setLoadingProducts(false);
      return;
    }

    setLoadingProducts(true);

    // Call the getAllProducts API with the search term
    getAllProducts(
      100,
      1,
      search_key
    )
      .then((res) => {
        // Format the products to display in the UI
        const products = res.data || [];
        const formattedProducts = products.map(item => ({
          value: item.id,
          label: item.name,
          description: item.description,
          categories: item.category_names ? item.category_names.join(', ') : ''
        }));
        setProductsList(formattedProducts);
      })
      .catch((error) => {
        console.error("Error searching products:", error);
      })
      .finally(() => setLoadingProducts(false));
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

  const handleProductSelection = (product) => {
    // If the same product is selected again, deselect it
    if (selectedProduct?.value === product.value) {
      setSelectedProduct(null);
      setFormData(prev => ({
        ...prev,
        product_id: ''
      }));
    } else {
      // Otherwise, select the new product
      setSelectedProduct(product);
      setFormData(prev => ({
        ...prev,
        product_id: product.value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Variant name is required");
      return;
    }

    if (!formData.product_id) {
      toast.error("Please select a parent product");
      return;
    }

    setSaving(true);
    try {
      // Changes by Agnij July 25, 2025 [Updated to set is_approve to 0 when edited]
      const payload = {
        variant_name: formData.name,
        description: formData.description,
        product_id: formData.product_id,
        is_approve: 0 // Auto-disapprove when edited
      };

      console.log("Submitting update with payload:", payload);
      const response = await updateProductVariant(id, payload);
      console.log("Update response:", response);

      if (response && (response.status === 1 || response.status === "1" || response.status === 200)) {
        toast.success("Variant updated successfully and set to 'Disapproved' status");
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

      <section className="content">
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

                      <div className="form-group">
                        <label htmlFor="product_id">Parent Product</label>
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
                            {loadingProducts ?
                              <span>
                                <i className="fa fa-spinner fa-spin me-2"></i>
                                Searching Products...
                              </span>
                              : productSearchTerm.length < 3 ?
                                "Type at least 3 characters to search" :
                                `Search Results (${productsList.length})`
                            }
                          </h5>

                          {!loadingProducts && productsList?.length > 0 ? (
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
                                    className={`btn ${selectedProduct?.value === item.value ? "btn-danger" : "btn-primary"} btn-sm`}
                                    onClick={() => handleProductSelection(item)}
                                  >
                                    {selectedProduct?.value === item.value ? "Remove" : "Select"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted">
                              {productSearchTerm.length < 3 ?
                                "Type to search for products" :
                                loadingProducts ?
                                  "Searching..." :
                                  "No products found matching your search criteria"}
                            </p>
                          )}
                        </div>

                        {selectedProduct && (
                          <div className="mt-2 mb-3 p-2 border rounded bg-light">
                            <p className="mb-0"><strong>Selected Product:</strong> {selectedProduct.label}</p>
                            {selectedProduct.categories && (
                              <p className="mb-0 small text-muted">Category: {selectedProduct.categories}</p>
                            )}
                          </div>
                        )}

                        <small className="form-text text-muted">
                          Changing the parent product will affect variant relationships
                        </small>
                      </div>

                      {vendorApprovedBy && (
                        <div className="form-group">
                          <label>Approved By:</label>
                          <p className="form-control-static">{vendorApprovedBy}</p>
                        </div>
                      )}

                      <div className="alert alert-warning">
                        <i className="fas fa-exclamation-triangle mr-2"></i>
                        Editing this variant will automatically set its status to "Disapproved"
                      </div>

                      <div className="form-group">
                        <button
                          type="submit"
                          className="btn btn-primary"
                          disabled={saving}
                        >
                          {saving ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary ml-2"
                          onClick={() => router.back()}
                          disabled={saving}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h3 className="card-title">Variant Details</h3>
                  </div>
                  <div className="card-body">
                    <dl className="row">
                      <dt className="col-sm-4">Variant ID:</dt>
                      <dd className="col-sm-8">{variant.id}</dd>

                      <dt className="col-sm-4">Categories:</dt>
                      <dd className="col-sm-8">
                        {variant.category_names && variant.category_names.length > 0
                          ? variant.category_names.join(", ")
                          : "No categories"}
                      </dd>

                      <dt className="col-sm-4">Status:</dt>
                      <dd className="col-sm-8">
                        <span className={`badge ${variant.is_approve === 1 ? 'badge-success' : 'badge-danger'}`}>
                          {variant.is_approve === 1 ? "Approved" : "Disapproved"}
                        </span>
                      </dd>

                      <dt className="col-sm-4">Created:</dt>
                      <dd className="col-sm-8">
                        {variant.created_at ? new Date(variant.created_at).toLocaleString() : "N/A"}
                      </dd>

                      <dt className="col-sm-4">Last Updated:</dt>
                      <dd className="col-sm-8">
                        {variant.updated_at ? new Date(variant.updated_at).toLocaleString() : "N/A"}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="alert alert-danger">
              <h4><i className="icon fas fa-exclamation-triangle"></i> Error!</h4>
              Variant not found or could not be loaded.
            </div>
          )}
        </div>
      </section>
  );
};

export default EditVariant;