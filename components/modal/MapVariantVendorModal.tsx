import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { mapVariantWithVendor, searchAllVariants } from '../../utils/services/product-management';
import { toast } from 'react-toastify';
import { vendorList } from '@/utils/services/rfq';
import { vendorApproveList } from '@/utils/services/rfq';
import Select, { components, OptionProps } from 'react-select';

interface VendorOption {
  label: string;
  value: number;
  email: string;
  phone: string;
}

interface ApprovedByOption {
  label: string;
  value: number;
}

interface Variant {
  id: number;
  name?: string;
  product_name?: string;
  category_info?: string;
  created_at?: string;
  created_at_formatted?: string;
}

interface FormData {
  variant_id: number | string;
  vendor: VendorOption | null;
  approved_by: ApprovedByOption[];
}

interface Mapping extends FormData {
  id: number;
  variant: Variant | null;
  make_list?: string[];
}

interface MapVariantVendorModalProps {
  isVisible: boolean;
  onCancel: () => void;
  variant?: Variant | null;
  onSuccess?: () => void;
}

const MapVariantVendorModal: React.FC<MapVariantVendorModalProps> = ({ isVisible, onCancel, variant, onSuccess }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [vendors, setVendors] = useState<any[]>([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState<string>("");
  const [vendorOptions, setVendorOptions] = useState<VendorOption[]>([]);
  const [approvedByOptions, setApprovedByOptions] = useState<ApprovedByOption[]>([]);
  const [modalElement, setModalElement] = useState<HTMLElement | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [formData, setFormData] = useState<FormData>({
    variant_id: '',
    vendor: null,
    approved_by: []
  });

  const [searchVariantTerm, setSearchVariantTerm] = useState<string>('');
  const [searchVariantResults, setSearchVariantResults] = useState<Variant[]>([]);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (vendorSearchTerm.length < 3) return;

    const handler = setTimeout(() => {
      fetchVendors();
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [vendorSearchTerm]);

  useEffect(() => {
    if (!document.getElementById('variant-vendor-modal-root')) {
      const el = document.createElement('div');
      el.id = 'variant-vendor-modal-root';
      document.body.appendChild(el);
      setModalElement(el);
    } else {
      setModalElement(document.getElementById('variant-vendor-modal-root'));
    }

    return () => {
      const el = document.getElementById('variant-vendor-modal-root');
      if (el && el.parentNode) {
        el.parentNode.removeChild(el);
      }
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      setError(null);
      fetchApprovedBy();
      resetForm();

      if (variant) {
        setSelectedVariant(variant);
        setFormData(prev => ({
          ...prev,
          variant_id: variant.id
        }));
      } else {
        setSelectedVariant(null);
      }
    }
  }, [isVisible, variant]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const vendorsResponse : any = await vendorList(vendorSearchTerm);

      if (vendorsResponse?.data) {
        setVendors(vendorsResponse.data);
        const options: VendorOption[] = vendorsResponse.data.map((vendor: any) => ({
          label: vendor.organization_name ?? '-',
          value: vendor.id,
          email: vendor.email || "Email Not Available",
          phone: vendor.mobile || "Phone Not Available"
        }));
        setVendorOptions(options);
      } else {
        setError("Failed to load vendors: Invalid response");
        toast.error('Failed to load vendors: Invalid response');
      }
    } catch (error: any) {
      setError(`Failed to load vendors: ${error.message || "Unknown error"}`);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  const fetchApprovedBy = async () => {
    try {
      const response : any = await vendorApproveList();

      if (response?.data) {
        const approvedOptions: ApprovedByOption[] = response.data.map((s: any) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setApprovedByOptions(approvedOptions);
      }
    } catch (error) {
      toast.error("Failed to load approval options");
    }
  };

  const resetForm = () => {
    setFormData({
      variant_id: variant?.id || '',
      vendor: null,
      approved_by: []
    });
    setMappings([]);
    setSearchVariantTerm('');
    setSearchVariantResults([]);
    setError(null);
  };

  const searchVariants = useCallback(async (searchTerm: string) => {
    if (!searchTerm || searchTerm.length < 3) {
      setSearchVariantResults([]);
      setLoadingVariants(false);
      return;
    }

    setLoadingVariants(true);
    try {
      const response : any = await searchAllVariants(
        null, searchTerm, null, null, null, null, null, null
      );

      if (response?.data && Array.isArray(response.data)) {
        const formattedVariants: Variant[] = response.data.map((v: any) => ({
          id: v.id,
          name: v.variant_name || v.name || `Variant #${v.id}`,
          product_name: v.product_name || 'Unknown Product',
          category_info: v.category_names ?
            (Array.isArray(v.category_names) ?
              v.category_names.join(', ') :
              v.category_names) : '',
          created_at: v.created_at
        }));

        setSearchVariantResults(formattedVariants);
      } else {
        setSearchVariantResults([]);
      }
    } catch (error) {
      toast.error("Failed to search variants");
      setSearchVariantResults([]);
    } finally {
      setLoadingVariants(false);
    }
  }, []);

  const debounceSearchVariants = useCallback((term: string) => {
    setSearchVariantTerm(term);
    const debounceTimeout = 500;
    clearTimeout((window as any).variantSearchDebounceTimer);
    (window as any).variantSearchDebounceTimer = setTimeout(() => {
      searchVariants(term);
    }, debounceTimeout);
  }, [searchVariants]);

  const handleSelectVariant = (v: Variant) => {
    setSelectedVariant(v);
    setFormData(prev => ({
      ...prev,
      variant_id: v.id
    }));
    setSearchVariantResults([]);
    setSearchVariantTerm('');
  };

  const handleInputChange = (selectedOption: any, { name }: { name: string }) => {
    setFormData(prev => ({
      ...prev,
      [name]: selectedOption
    }));
  };

  const handleAddMapping = () => {
    if (!formData.vendor) {
      toast.error('Please select a vendor');
      return;
    }

    if (!selectedVariant) {
      toast.error('Please select a variant');
      return;
    }

    setMappings(prev => [...prev, {
      ...formData,
      id: Date.now(),
      variant: selectedVariant
    }]);

    setFormData(prev => ({
      ...prev,
      vendor: null,
      approved_by: []
    }));

    toast.success('Vendor added to mapping list');
  };

  const handleRemoveMapping = (id: number) => {
    setMappings(prev => prev.filter(mapping => mapping.id !== id));
    toast.success('Vendor removed from mapping list');
  };

  const handleSubmit = async () => {
    if (mappings.length === 0 && !formData.vendor) {
      toast.error('Please add at least one vendor mapping');
      return;
    }

    if (!selectedVariant && !formData.variant_id) {
      toast.error('Please select a variant');
      return;
    }

    setLoading(true);
    setError(null);

    const allMappings: Mapping[] = [...mappings];
    if (formData.vendor && (selectedVariant || formData.variant_id)) {
      allMappings.push({
        ...formData,
        id: Date.now(),
        variant: selectedVariant
      });
    }

    let success = true;
    let failureCount = 0;
    const errorMessages: string[] = [];

    for (const mapping of allMappings) {
      try {
        const payload = {
          variant_id: mapping.variant_id,
          vendor_id: mapping.vendor!.value,
          approved_by: mapping.approved_by?.map(item => item.value) || null,
          make_list: mapping.make_list || []
        };

        const response : any = await mapVariantWithVendor(payload);

        if (!(response?.data?.status === 1 || response?.status === 1)) {
          success = false;
          failureCount++;
          const errorMsg = `Failed to map variant to ${mapping.vendor!.label}: ${response?.data?.message || 'Unknown error'}`;
          errorMessages.push(errorMsg);
          toast.error(errorMsg);
        }
      } catch (apiError: any) {
        success = false;
        failureCount++;

        let errorMessage = `Failed to map with ${mapping.vendor!.label}`;
        if (apiError.message?.response?.data?.message) {
          errorMessage = apiError.message.response.data.message;
        } else if (apiError.response?.data?.message) {
          errorMessage = apiError.response.data.message;
        } else if (typeof apiError.message === 'string') {
          errorMessage = apiError.message;
        }

        errorMessages.push(errorMessage);
        toast.error(errorMessage);
      }
    }

    setLoading(false);

    if (errorMessages.length > 0) {
      setError(errorMessages.join("; "));
    }

    if (success) {
      toast.success('All variant mappings completed successfully');
      resetForm();
      if (onSuccess) onSuccess();
      onCancel();
    } else if (failureCount < allMappings.length) {
      toast.warning(`${allMappings.length - failureCount} mappings successful, ${failureCount} failed`);
      if (onSuccess) onSuccess();
      onCancel();
    }
  };

  const CustomSelectOption = (props: OptionProps<VendorOption>) => (
    <components.Option {...props}>
      <div>
        <strong>{props?.data?.label}</strong>
        <br />
        <p className="row">
          <small>{props?.data?.email}</small>
          <small>{props?.data?.phone}</small>
        </p>
      </div>
    </components.Option>
  );

  const renderSelectedVariant = () => {
    if (!selectedVariant) return null;

    return (
      <div className="mb-4 p-3 border rounded bg-light">
        <div className="d-flex justify-content-between align-items-center">
          <h5 className="mb-2 font-weight-bold">Selected Variant</h5>
          <button
            type="button"
            className="btn btn-sm btn-outline-danger"
            onClick={() => setSelectedVariant(null)}
          >
            <i className="fas fa-times"></i> Clear Selection
          </button>
        </div>

        <div className="row">
          <div className="col-md-6">
            <dl className="mb-0">
              <dt className="font-weight-bold">Variant Name:</dt>
              <dd>{selectedVariant.name}</dd>

              <dt className="font-weight-bold mt-2">Variant ID:</dt>
              <dd>{selectedVariant.id}</dd>
            </dl>
          </div>
          <div className="col-md-6">
            <dl className="mb-0">
              {selectedVariant.product_name && (
                <>
                  <dt className="font-weight-bold">Product:</dt>
                  <dd>{selectedVariant.product_name}</dd>
                </>
              )}

              {selectedVariant.category_info && (
                <>
                  <dt className="font-weight-bold mt-2">Category:</dt>
                  <dd>{selectedVariant.category_info}</dd>
                </>
              )}

              {selectedVariant.created_at && (
                <>
                  <dt className="font-weight-bold mt-2">Created:</dt>
                  <dd>{selectedVariant.created_at_formatted || new Date(selectedVariant.created_at).toLocaleString()}</dd>
                </>
              )}
            </dl>
          </div>
        </div>
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!searchVariantTerm || searchVariantTerm.length === 0) return null;

    return (
      <div className="border rounded p-3 mb-3">
        <h6 className="mb-3">
          {loadingVariants ? (
            <span>
              <i className="fa fa-spinner fa-spin me-2"></i>
              Searching variants...
            </span>
          ) : (
            searchVariantTerm.length < 3 ?
              "Type at least 3 characters to search" :
              `Search Results (${searchVariantResults.length})`
          )}
        </h6>

        {!loadingVariants && searchVariantTerm.length >= 3 && (
          searchVariantResults.length > 0 ? (
            <div style={{ maxHeight: '300px', overflowY: 'auto' }} className="variant-search-results">
              {searchVariantResults.map((v) => (
                <div
                  key={v.id}
                  className="d-flex justify-content-between align-items-center border-bottom py-2"
                >
                  <div>
                    <p className="mb-0 font-weight-bold">{v.name}</p>
                    <p className="mb-0 text-muted small">
                      <strong>ID:</strong> {v.id}
                      {v.product_name && (
                        <>, <strong>Product:</strong> {v.product_name}</>
                      )}
                      {v.category_info && (
                        <>, <strong>Category:</strong> {v.category_info}</>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleSelectVariant(v)}
                  >
                    Select
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted">No variants found matching your search criteria</p>
          )
        )}
      </div>
    );
  };

  if (!isVisible || !modalElement) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      zIndex: 1050,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div className="modal-dialog modal-lg" style={{
        maxHeight: 650,
        width: 1000,
        overflow: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Map Variant with Vendor</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body">
            <input type="hidden" name="variant_id" value={formData.variant_id} />

            {error && (
              <div className="alert alert-danger mb-3">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                {error}
              </div>
            )}

            <div className="mb-4">
              <h6 className="mb-3 font-weight-bold">Search and Select Variant</h6>

              <div className="input-group mb-3">
                <span className="input-group-text">
                  <i className="fa fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search for variants (min 3 characters)"
                  value={searchVariantTerm}
                  onChange={(e) => debounceSearchVariants(e.target.value)}
                />
              </div>

              {renderSelectedVariant()}
              {renderSearchResults()}
            </div>

            <hr className="my-4" />

            <h6 className="mb-3 font-weight-bold">Select Vendor</h6>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label htmlFor="vendor" className="form-label font-weight-bold">Vendor <span className="text-danger">*</span></label>
                <Select
                  id="vendor"
                  name="vendor"
                  options={vendorOptions}
                  value={formData.vendor}
                  inputValue={vendorSearchTerm}
                  onChange={(selected) => handleInputChange(selected, { name: 'vendor' })}
                  placeholder="Select a vendor"
                  onInputChange={(newValue) => setVendorSearchTerm(newValue)}
                  components={{ Option: CustomSelectOption }}
                  className="basic-select"
                  classNamePrefix="select"
                  noOptionsMessage={() => "Please enter at least 3 letters to search"}
                />
              </div>

              <div className="col-md-6 mb-3">
                <label htmlFor="approved_by" className="form-label font-weight-bold">Approved By</label>
                <Select
                  id="approved_by"
                  name="approved_by"
                  options={approvedByOptions}
                  isMulti
                  value={formData.approved_by}
                  onChange={(selected) => handleInputChange(selected, { name: 'approved_by' })}
                  placeholder="Select approval(s)"
                  className="basic-select"
                  classNamePrefix="select"
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mb-4">
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleAddMapping}
                disabled={!formData.vendor || !selectedVariant || loading}
              >
                Add Vendor to List
              </button>
            </div>

            {mappings.length > 0 && (
              <div className="mb-4">
                <h6 className="mb-3 font-weight-bold text-primary">
                  <i className="fas fa-list mr-2"></i>
                  Vendors to Map
                </h6>
                <div className="table-responsive">
                  <table className="table table-bordered table-hover">
                    <thead className="thead-light">
                      <tr>
                        <th>Variant</th>
                        <th>Vendor</th>
                        <th>Approved By</th>
                        <th>Make List</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mappings.map(mapping => (
                        <tr key={mapping.id} className='mb-1'>
                          <td>
                            <strong>{mapping.variant?.name || 'Unknown Variant'}</strong>
                            <br />
                            <small className="text-muted">
                              {mapping.variant?.product_name || ''}
                              {mapping.variant?.category_info && (
                                <> - {mapping.variant.category_info}</>
                              )}
                            </small>
                          </td>
                          <td>
                            <strong>{mapping.vendor?.label}</strong>
                            <br />
                            <small className="text-muted">{mapping.vendor?.email}</small>
                          </td>
                          <td>
                            {mapping.approved_by && mapping.approved_by.length > 0
                              ? mapping.approved_by.map(item => item.label).join(', ')
                              : 'None'}
                          </td>
                          <td>
                            {mapping.make_list?.map((make, index) => (
                              <div key={index} className="d-flex align-items-center mb-1">
                                <input
                                  type="text"
                                  className="form-control form-control-sm"
                                  value={make}
                                  onChange={(e) => {
                                    const updatedMappings = mappings.map(m => {
                                      if (m.id === mapping.id) {
                                        const updatedMakeList = [...(m.make_list || [])];
                                        updatedMakeList[index] = e.target.value;
                                        return { ...m, make_list: updatedMakeList };
                                      }
                                      return m;
                                    });
                                    setMappings(updatedMappings);
                                  }}
                                />
                                <button
                                  type="button"
                                  className="btn btn-sm btn-danger ml-1"
                                  onClick={() => {
                                    const updatedMappings = mappings.map(m => {
                                      if (m.id === mapping.id) {
                                        const updatedMakeList = (m.make_list || []).filter((_, i) => i !== index);
                                        return { ...m, make_list: updatedMakeList };
                                      }
                                      return m;
                                    });
                                    setMappings(updatedMappings);
                                  }}
                                >
                                  X
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const updatedMappings = mappings.map(m => {
                                  if (m.id === mapping.id) {
                                    return { ...m, make_list: [...(m.make_list || []), ''] };
                                  }
                                  return m;
                                });
                                setMappings(updatedMappings);
                              }}
                            >
                              Add Make
                            </button>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-danger btn-sm"
                              onClick={() => handleRemoveMapping(mapping.id)}
                            >
                              <i className="fas fa-trash-alt mr-1"></i> Remove
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || (!selectedVariant && mappings.length === 0)}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm mr-2"></span>
                  Processing...
                </>
              ) : (
                'Map Variant'
              )}
            </button>
          </div>

          <div className="px-3 pb-3">
            <p className="border rounded p-2 mb-0 bg-light">
              <strong>Note:</strong> You can map a variant to multiple vendors by using the &quot;Add Vendor to List&quot; button.
            </p>
          </div>
        </div>
      </div>
    </div>,
    modalElement
  );
};

export default MapVariantVendorModal;
