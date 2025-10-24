import React, { useEffect, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Select, { components } from 'react-select';
import { toast } from 'react-toastify';
import { vendorList } from '@/utils/services/rfq';
import { getAllProducts, mapPackageWithVendor } from '@/utils/services/product-management';

const MapPackageVendorModal = ({ isVisible, onCancel, onSuccess }) => {
  const [modalElement, setModalElement] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPackage, setSelectedPackage] = useState(null);

  const [vendorSearchTerm, setVendorSearchTerm] = useState('');
  const [vendorOptions, setVendorOptions] = useState([]);

  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({
    product_id: '',
    vendor: null,
  });

  useEffect(() => {
    if (!document.getElementById('package-vendor-modal-root')) {
      const el = document.createElement('div');
      el.id = 'package-vendor-modal-root';
      document.body.appendChild(el);
      setModalElement(el);
    } else {
      setModalElement(document.getElementById('package-vendor-modal-root'));
    }
    return () => {
      const el = document.getElementById('package-vendor-modal-root');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (isVisible) {
      setError(null);
      resetForm();
    }
  }, [isVisible]);

  const resetForm = () => {
    setFormData({ product_id: '', vendor: null });
    setMappings([]);
    setSelectedPackage(null);
    setSearchResults([]);
    setSearchTerm('');
  };

  const fetchVendors = useCallback(async (term) => {
    if (!term || term.length < 3) return;
    try {
      const response = await vendorList(term);
      const options = (response?.data || []).map(v => ({
        label: v.organization_name ?? '-',
        value: v.id,
        email: v.email || 'Email Not Available',
        phone: v.mobile || 'Phone Not Available'
      }));
      setVendorOptions(options);
    } catch (e) {
      // silent
    }
  }, []);

  useEffect(() => {
    if (!vendorSearchTerm || vendorSearchTerm.length < 3) return;
    const t = setTimeout(() => fetchVendors(vendorSearchTerm), 600);
    return () => clearTimeout(t);
  }, [vendorSearchTerm, fetchVendors]);

  const searchPackages = useCallback(async (term) => {
    // Reuse admin product list endpoint with server-side productType filter for reliability
    try {
      const res = await getAllProducts(10, 1, term, null, null, null, null, null, null, null, null, false, 'package');
      const list = res?.data?.data?.data || res?.data?.data || res?.data || [];
      const formatted = list.map(p => ({
        id: p.id,
        name: p.name,
        category_info: Array.isArray(p.product_categories)
          ? p.product_categories.map(c => c.category_name || c.title).join(', ')
          : (p.category_name || ''),
        created_at: p.created_at
      }));
      setSearchResults(formatted);
    } catch (e) {
      setSearchResults([]);
    }
  }, []);

  const debounceSearch = useCallback((value) => {
    setSearchTerm(value);
    clearTimeout(window._pkg_search_timer);
    window._pkg_search_timer = setTimeout(() => searchPackages(value), 500);
  }, [searchPackages]);

  const handleSelectPackage = (pkg) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({ ...prev, product_id: pkg.id }));
    setSearchResults([]);
  };

  const handleInputChange = (selected, { name }) => {
    setFormData(prev => ({ ...prev, [name]: selected }));
  };

  const handleAddMapping = () => {
    if (!selectedPackage) return toast.error('Select a package product');
    if (!formData.vendor) return toast.error('Select a vendor');
    setMappings(prev => ([...prev, {
      id: Date.now(),
      product: selectedPackage,
      vendor: formData.vendor
    }]));
    setFormData(prev => ({ ...prev, vendor: null }));
  };

  const handleRemove = (id) => setMappings(prev => prev.filter(m => m.id !== id));

  const handleSubmit = async () => {
    const queue = [...mappings];
    if (formData.vendor && selectedPackage) {
      queue.push({ id: Date.now(), product: selectedPackage, vendor: formData.vendor });
    }
    if (queue.length === 0) return toast.error('Add at least one vendor');
    setLoading(true); setError(null);
    let ok = true;
    for (const item of queue) {
      try {
        await mapPackageWithVendor(item.product.id, item.vendor.value);
      } catch (e) {
        ok = false;
      }
    }
    setLoading(false);
    if (ok) {
      toast.success('Package mapped with vendor(s)');
      onSuccess && onSuccess();
      onCancel();
      resetForm();
    } else {
      setError('Some mappings failed. Try again for failed ones.');
    }
  };

  const CustomVendorOption = (props) => (
    <components.Option {...props}>
      <div>
        <strong>{props?.data?.label}</strong>
        <br />
        <small>{props?.data?.email}</small> · <small>{props?.data?.phone}</small>
      </div>
    </components.Option>
  );

  if (!isVisible || !modalElement) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-dialog modal-lg" style={{ maxHeight: 650, width: 900, overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Map Package with Vendor</h5>
            <button type="button" className="close" onClick={onCancel}><span aria-hidden="true">&times;</span></button>
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger mb-3">{error}</div>}

            <h6 className="mb-2">Search and Select Package Product</h6>
            <div className="input-group mb-3">
              <span className="input-group-text"><i className="fa fa-search"></i></span>
              <input className="form-control" value={searchTerm} onChange={(e) => debounceSearch(e.target.value)} placeholder="Search products (min 2 letters)" />
            </div>

            {selectedPackage && (
              <div className="mb-3 p-3 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <h6 className="mb-0">Selected Package</h6>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setSelectedPackage(null)}>Clear</button>
                </div>
                <div className="mt-2"><strong>{selectedPackage.name}</strong>{selectedPackage.category_info ? <> · {selectedPackage.category_info}</> : null}</div>
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="border rounded p-2 mb-3" style={{ maxHeight: 280, overflowY: 'auto' }}>
                {searchResults.map(pkg => (
                  <div key={pkg.id} className="d-flex justify-content-between align-items-center border-bottom py-2">
                    <div>
                      <div className="font-weight-bold">{pkg.name}</div>
                      <small className="text-muted">ID: {pkg.id}{pkg.category_info ? ` · ${pkg.category_info}` : ''}</small>
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => handleSelectPackage(pkg)}>Select</button>
                  </div>
                ))}
              </div>
            )}

            <hr />
            <h6 className="mb-2">Select Vendor</h6>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Vendor <span className="text-danger">*</span></label>
                <Select
                  name="vendor"
                  options={vendorOptions}
                  value={formData.vendor}
                  inputValue={vendorSearchTerm}
                  onChange={(s) => handleInputChange(s, { name: 'vendor' })}
                  onInputChange={setVendorSearchTerm}
                  placeholder="Search vendor"
                  components={{ Option: CustomVendorOption }}
                  noOptionsMessage={() => "Type 3+ letters to search"}
                />
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <button className="btn btn-primary" disabled={!selectedPackage || !formData.vendor || loading} onClick={handleAddMapping}>Add Vendor to List</button>
            </div>

            {mappings.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="thead-light"><tr><th>Package</th><th>Vendor</th><th>Action</th></tr></thead>
                  <tbody>
                    {mappings.map(m => (
                      <tr key={m.id}>
                        <td><strong>{m.product.name}</strong><br /><small className="text-muted">ID: {m.product.id}</small></td>
                        <td><strong>{m.vendor.label}</strong><br /><small className="text-muted">{m.vendor.email}</small></td>
                        <td><button className="btn btn-sm btn-danger" onClick={() => handleRemove(m.id)}>Remove</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn btn-primary" disabled={loading || (!selectedPackage && mappings.length === 0)} onClick={handleSubmit}>
              {loading ? (<><span className="spinner-border spinner-border-sm mr-2"></span>Processing...</>) : 'Map Package'}
            </button>
          </div>
        </div>
      </div>
    </div>,
    modalElement
  );
};

export default MapPackageVendorModal;


