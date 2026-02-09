import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import { addProductVariant, getAllProducts } from '../../utils/services/product-management';

interface ProductOption {
  value: number;
  label: string;
  description?: string;
  categories?: string;
}

interface Specification {
  key: string;
  value: string;
}

interface FormData {
  product: ProductOption | null;
  variant_name: string;
}

interface AddVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: any) => void;
  isVisible?: boolean;
  onCancel?: () => void;
  productId?: number;
  productName?: string;
}

const variantSpecKeys = [
  "Length",
  "Width",
  "Height",
  "Diameter",
  "Thickness",
  "Size",
  "Material",
  "Grade",
  "Surface Finish",
  "Coating",
  "Color",
  "Shape",
  "Pattern",
  "Strength",
  "Hardness",
  "Tolerance",
  "Load Capacity",
  "Voltage Rating",
  "Current Rating",
  "Frequency",
  "Power Rating",
  "Connector Type",
  "Type",
  "Operation Type",
  "Compatibility",
  "Application Area",
  "Corrosion Resistance",
  "Temperature Range",
  "IP Rating",
  "Chemical Compatibility",
  "Packaging Type",
  "Unit of Measurement",
  "MOQ",
  "Lead Time",
  "IS Code / BIS Standard",
  "ISO Certification",
  "Warranty Period",
  "Country of Origin"
];

const AddVariantModal: React.FC<AddVariantModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isVisible,
  onCancel,
  productId,
  productName
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    product: null,
    variant_name: '',
  });
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [productsList, setProductsList] = useState<ProductOption[]>([]);
  const [specifications, setSpecifications] = useState<Specification[]>([{ key: '', value: '' }]);

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const getProductsList = useCallback((search_key: string) => {
    setProductSearchTerm(search_key);

    if (search_key.length < 3) {
      setProductsList([]);
      setProductLoading(false);
      return;
    }

    setProductLoading(true);
    setFormData((prevState) => ({
      ...prevState,
      product: null,
    }));

    setProductsList([]);

    getAllProducts(100, 1, search_key, '', '', '', '', '', '', '', '', '')
      .then((res : any) => {
        const products = res.data || [];
        const formattedProducts: ProductOption[] = products.map((item: any) => ({
          value: item.id,
          label: item.name,
          description: item.description,
        }));
        setProductsList(formattedProducts);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setProductLoading(false));
  }, []);

  const debounceGetProductsList = useCallback(
    (inputValue: string) => {
      const debounceTimeout = 300;
      clearTimeout((window as any).debounceTimer);
      (window as any).debounceTimer = setTimeout(() => {
        getProductsList(inputValue);
      }, debounceTimeout);
    },
    [getProductsList]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSpecificationChange = (index: number, field: 'key' | 'value', value: string) => {
    const updatedSpecs = [...specifications];
    updatedSpecs[index][field] = value;
    setSpecifications(updatedSpecs);
  };

  const addSpecification = () => {
    setSpecifications([...specifications, { key: '', value: '' }]);
  };

  const removeSpecification = (index: number) => {
    if (specifications.length > 1) {
      const updatedSpecs = specifications.filter((_, i) => i !== index);
      setSpecifications(updatedSpecs);
    }
  };

  const handleProductSelection = (product: ProductOption) => {
    setFormData((prev) => ({
      ...prev,
      product: formData?.product?.value === product.value ? null : product,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.product) {
      toast.error('Please select a product');
      return false;
    }
    if (!formData.variant_name.trim()) {
      toast.error('Please enter a variant name');
      return false;
    }
    for (let i = 0; i < specifications.length; i++) {
      const spec = specifications[i];
      if ((spec.key && !spec.value.trim()) || (!spec.key && spec.value.trim())) {
        toast.error(`Specification ${i + 1}: Both specification type and value must be provided`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const validSpecifications = specifications.filter(spec => spec.key && spec.value);

      const payload = {
        product_id: formData.product!.value,
        variant_name: formData.variant_name.trim(),
        specifications: validSpecifications.length > 0 ? validSpecifications : undefined
      };

      const response : any = await addProductVariant(payload);

      if (response.status >= 200 && response.status < 300) {
        toast.success(response.data?.message || 'Variant added successfully');
        onSuccess(response.data?.data || response.data);
        resetForm();
      } else {
        console.error('Error response from API:', response.data);
        toast.error(response.data?.message || 'Failed to add variant');
      }
    } catch (error: any) {
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
    setSpecifications([{ key: '', value: '' }]);
  };

  if (!isOpen) return null;

  return (
    <div className="modal show d-block" tabIndex={-1} role="dialog">
      <div className="modal-dialog modal-lg" role="document">
        <div className="modal-content" style={{ maxHeight: '90vh', overflow: 'auto' }}>
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

              <div className="mb-3">
                <label className="form-label">Variant Specifications</label>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="specifications-container">
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
                <small className="form-text text-muted">
                  Both specification type and value must be provided if you want to add a specification.
                </small>
              </div>
            </form>
          </div>
          <div className="modal-footer">
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
              onClick={handleSubmit}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Submitting...
                </>
              ) : (
                'Add Variant'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddVariantModal;
