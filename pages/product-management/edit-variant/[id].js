import React, { useEffect, useState, useCallback } from 'react';
import { getAdminProfile } from "@/utils/services/login";
import { searchAllVariants, updateProductVariant, getAllProducts, getVariantSpecifications, updateVariantSpecifications } from '@/utils/services/product-management';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import FullLoading from '@/components/loading/FullLoading';
import Select from 'react-select';

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

// Changes by Agnij May 20, 2025 [Created variant edit page]
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
  const [initialProductsLoaded, setInitialProductsLoaded] = useState(false);
  const [specifications, setSpecifications] = useState([{ key: '', value: '' }]);

  useEffect(() => {
    getUserProfile();
    fetchProducts();
  }, []);
  const searchProducts = useCallback((searchTerm) => {

    setLoadingProducts(true);
    // Use getAllProducts with search parameter
    getAllProducts(
     50, // Limit to 50 results for better performance
      1,  // First page
      searchTerm
    )
      .then((response) => {
        if (response?.data) {
          const productsData = response.data.map(product => ({
            value: product.id,
            label: product.name,
            data: product
          }));
          setProducts(productsData);
        }
      })
      .catch((error) => {
        console.error("Error searching products:", error);
      })
      .finally(() => {
        setLoadingProducts(false);
      });
  }, []);
  // Debounce function for product search
  const debounceSearchProducts = useCallback((inputValue) => {
    const debounceTimeout = 300; // 300ms debounce
    clearTimeout(window.productSearchDebounceTimer);
    window.productSearchDebounceTimer = setTimeout(() => {
      searchProducts(inputValue);
    }, debounceTimeout);
  }, [searchProducts]);

  useEffect(() => {
    if (id) {
      fetchVariantDetails();
    }
  }, [id]);

  // Changes by Agnij May 20, 2025 [Added effect to handle missing products]
  useEffect(() => {
    // This effect runs when both products and formData.product_id are available
    if (initialProductsLoaded && formData.product_id &&
        !products.some(p => p.value === formData.product_id)) {
      // If product_id exists but doesn't match any product in the list,
      // try to fetch product details again or fetch the specific product
      console.log(`Product ID ${formData.product_id} not found in products list, trying to fetch product details...`);

      // Simulate fetching the specific product for now
      getAllProducts(1, 1, formData.product_id)
        .then(response => {
          if (response?.data && response.data.length > 0) {
            const product = response.data[0];
            if (product) {
              // Add the product to the list if not already there
              const newProduct = {
                value: product.id,
                label: product.name,
                data: product
              };

              console.log("Adding missing product to options:", newProduct);
              setProducts(prev => [...prev, newProduct]);
            }
          }
        })
        .catch(error => {
          console.error("Error fetching specific product:", error);
        });
    }
  }, [initialProductsLoaded, products, formData.product_id]);

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
      // Fetch products for the dropdown
      const response = await getAllProducts(1000, 1);
      if (response?.data) {
        const productsData = response.data.map(product => ({
          value: product.id,
          label: product.name,
          data: product
        }));
        setProducts(productsData);
        setInitialProductsLoaded(true);
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

          // Fetch variant specifications
          try {
            const specsResponse = await getVariantSpecifications(variantData.id);
            
            if (specsResponse?.status === 1 && specsResponse.data?.length > 0) {
              setSpecifications(specsResponse.data);
            } else {
              setSpecifications([{ key: '', value: '' }]);
            }
          } catch (specsError) {
            setSpecifications([{ key: '', value: '' }]);
          }

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

  const handleProductChange = (selectedOption) => {
    if (selectedOption) {
      setFormData(prev => ({
        ...prev,
        product_id: selectedOption.value
      }));
    }
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

    if (!formData.name.trim()) {
      toast.error("Variant name is required");
      return;
    }

    for (let i = 0; i < specifications.length; i++) {
      const spec = specifications[i];
      if (!spec.key || !spec.value) {
        toast.error(`Specification ${i + 1}: Both specification type and value must be provided`);
        return;
      }
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
        // Update specifications if there are any valid ones
        const validSpecifications = specifications.filter(spec => spec.key && spec.value);
        if (validSpecifications.length > 0) {
          try {
            await updateVariantSpecifications(id, validSpecifications);
          } catch (specsError) {
            toast.warning("Variant updated but specifications update failed");
          }
        }
        
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
                        <Select
                          id="product_id"
                          name="product_id"
                          options={products}
                          isLoading={loadingProducts}
                          placeholder="Select parent product"
                          value={products.find(p => p.value === formData.product_id)}
                          onChange={handleProductChange}
                          className="basic-select"
                          classNamePrefix="select"
                          onInputChange={(inputValue) => debounceSearchProducts(inputValue)}
                          filterOption={() => true} // Disable client-side filtering
                          noOptionsMessage={({ inputValue }) =>
                            inputValue.length < 3
                              ? "Type at least 3 characters to search"
                              : "No products found"
                          }
                        />
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

                      {/* Start Variant Specifications */}
                      <div className="form-group">
                        <label>Variant Specifications</label>
                        <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="specifications-container">
                          {specifications.map((spec, index) => (
                            <div key={index} className="row mb-2">
                              <div className="col-md-4">
                                <select
                                  className="form-control"
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
                              <div className="col-md-6">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Enter value"
                                  value={spec.value}
                                  onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                                />
                              </div>
                              <div className="col-md-2">
                                {specifications.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-danger btn-sm"
                                    onClick={() => removeSpecification(index)}
                                  >
                                    -
                                  </button>
                                )}
                                {index === specifications.length - 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-success btn-sm ml-1"
                                    onClick={addSpecification}
                                  >
                                    +
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                        <small className="form-text text-muted">
                          Both specification type and value must be provided if you want to add a specification.
                        </small>
                      </div>
                      {/* End Variant Specifications */}

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