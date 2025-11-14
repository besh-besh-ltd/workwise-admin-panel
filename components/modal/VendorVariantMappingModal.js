import React, { useEffect, useMemo, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import { bulkMapVariantWithVendor, searchAllVariants } from '@/utils/services/product-management';
import { vendorApproveList } from '@/utils/services/rfq';

const VendorVariantMappingModal = ({ isVisible, onCancel, vendor, onSuccess }) => {
  const [modalElement, setModalElement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [searching, setSearching] = useState(false);
  const [variants, setVariants] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [approvedOptions, setApprovedOptions] = useState([]);
  const [approvedBy, setApprovedBy] = useState([]);
  const [makeList, setMakeList] = useState([]);
  const [queue, setQueue] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const fixedVendor = useMemo(() => vendor ? {
    label: vendor.label,
    value: vendor.value,
    email: vendor.email || 'Email Not Available',
    phone: vendor.phone || 'Phone Not Available'
  } : null, [vendor]);

  useEffect(() => {
    if (!document.getElementById('vendor-variant-modal-root')) {
      const el = document.createElement('div');
      el.id = 'vendor-variant-modal-root';
      document.body.appendChild(el);
      setModalElement(el);
    } else {
      setModalElement(document.getElementById('vendor-variant-modal-root'));
    }
    return () => {
      const el = document.getElementById('vendor-variant-modal-root');
      if (el && el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    // reset per open
    setSearchTerm('');
    setVariants([]);
    setSelectedVariant(null);
    setApprovedBy([]);
    setMakeList([]);
    setQueue([]);
    vendorApproveList()
      .then(res => {
        const opts = (res?.data || []).map(s => ({ label: s.vendor_approve, value: s.id }));
        setApprovedOptions(opts);
      })
      .catch(() => setApprovedOptions([]));
  }, [isVisible]);

  const doSearch = useCallback(async (term) => {
    if (!term || term.trim().length < 3) {
      setVariants([]);
      return;
    }
    setSearching(true);
    try {
      const res = await searchAllVariants(null, term, null, null, null, null, null, null, 1, 10);
      const list = res?.data || [];
      const formatted = list.map(v => ({
        id: v.id,
        name: v.variant_name || v.name || `Variant #${v.id}`,
        product_name: v.product_name || '',
        category_info: v.category_info || ''
      }));
      setVariants(formatted);
    } catch (e) {
      toast.error('Failed to search variants');
      setVariants([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // debounce search
  useEffect(() => {
    const t = setTimeout(() => doSearch(searchTerm), 500);
    return () => clearTimeout(t);
  }, [searchTerm, doSearch]);

  const addToQueue = () => {
    if (!selectedVariant) return toast.error('Select a variant');
    if (!fixedVendor) return toast.error('Vendor missing');
    const item = {
      variant_id: selectedVariant.id,
      variant_name: selectedVariant.name,
      product_name: selectedVariant.product_name || '-',
      vendor_id: fixedVendor.value,
      approved_by: approvedBy?.map(a => a.value) || [],
      approved_by_names: approvedBy?.map(a => a.label) || [],
      make_list: makeList.filter(m => m && m.trim())
    };
    setQueue(prev => [...prev, item]);
    setApprovedBy([]);
    setMakeList([]);
    toast.success('Added to list');
  };

  const submitQueue = async () => {
    if (queue.length === 0) return toast.error('Nothing to map');
    setSubmitting(true);
    try {
      const resp = await bulkMapVariantWithVendor(queue);
      if (resp?.data?.status === 1 || resp?.status === 1) {
        toast.success('Mappings saved');
        if (onSuccess) onSuccess();
        onCancel();
      } else {
        toast.error(resp?.data?.message || 'Bulk mapping failed');
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Bulk mapping failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isVisible || !modalElement) return null;

  return ReactDOM.createPortal(
    <div className="modal-backdrop" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-dialog" style={{ maxWidth: 960, width: '100%' }} onClick={e => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header py-2">
            <h5 className="modal-title">Map Variant to {fixedVendor?.label || 'Vendor'}</h5>
            <button type="button" className="close" onClick={onCancel}>
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
          <div className="modal-body p-3" style={{ maxHeight: 600, overflow: 'auto' }}>
            {/* Search Row */}
            <div className="form-group mb-3">
              <label className="form-label font-weight-bold d-block mb-1">Search Variant</label>
              <div className="input-group">
                <div className="input-group-prepend">
                  <span className="input-group-text"><i className="fa fa-search"></i></span>
                </div>
                <input type="text" className="form-control" placeholder="Type at least 3 characters" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {searchTerm && (
              <div className="border rounded p-2 mb-3" style={{ maxHeight: 220, overflowY: 'auto' }}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <h6 className="mb-0">{searching ? 'Searching…' : `Results (${variants.length})`}</h6>
                </div>
                {!searching && variants.map(v => (
                  <div key={v.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div className="mr-2">
                      <div className="font-weight-bold">{v.name}</div>
                      <div className="text-muted small">
                        {v.product_name}
                        {v.category_info ? ` • ${v.category_info}` : ''}
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-primary" onClick={() => setSelectedVariant(v)}>Select</button>
                  </div>
                ))}
              </div>
            )}

            {selectedVariant && (
              <div className="mb-3 p-2 border rounded bg-light">
                <div className="d-flex justify-content-between align-items-center">
                  <div className="font-weight-bold">Selected Variant: {selectedVariant.name}</div>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => setSelectedVariant(null)}>Clear</button>
                </div>
              </div>
            )}

            {/* Controls Row */}
            <div className="form-row">
              <div className="form-group col-md-7">
                <label className="form-label font-weight-bold d-block mb-1">Approved By</label>
                <Select isMulti options={approvedOptions} value={approvedBy} onChange={setApprovedBy} classNamePrefix="select" placeholder="Select approvals" />
              </div>
              <div className="form-group col-md-5">
                <div className="d-flex align-items-center justify-content-between mb-1">
                  <label className="form-label font-weight-bold mb-0">Make List</label>
                  <button type="button" className="btn btn-sm btn-warning" onClick={() => setMakeList(prev => [...prev, ''])}>Add Make</button>
                </div>
                {makeList.length === 0 && (
                  <div className="text-muted small">No makes added</div>
                )}
                {makeList.map((m, idx) => (
                  <div key={idx} className="d-flex mb-2">
                    <input type="text" className="form-control form-control-sm" value={m} onChange={(e) => {
                      const v = e.target.value;
                      setMakeList(prev => prev.map((x, i) => i === idx ? v : x));
                    }} />
                    <button type="button" className="btn btn-sm btn-danger ml-1" onClick={() => setMakeList(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                  </div>
                ))}
              </div>
            </div>

            <div className="d-flex justify-content-end mb-3">
              <button type="button" className="btn btn-primary" disabled={!selectedVariant || !fixedVendor} onClick={addToQueue}>Add to List</button>
            </div>

            {queue.length > 0 && (
              <div className="table-responsive">
                <table className="table table-bordered">
                  <thead className="thead-light">
                    <tr>
                      <th style={{width: '30%'}}>Variant</th>
                      <th style={{width: '30%'}}>Product</th>
                      <th style={{width: '25%'}}>Approved By</th>
                      <th style={{width: '25%'}}>Makes</th>
                      <th style={{width: '10%'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queue.map((q, i) => (
                      <tr key={`${q.variant_id}-${i}`}>
                        <td>{q.variant_name || q.variant_id}</td>
                        <td>{q.product_name || '-'}</td>
                        <td>{(q.approved_by_names || []).length > 0 ? q.approved_by_names.join(', ') : '-'}</td>
                        <td>{(q.make_list || []).join(', ') || '-'}</td>
                        <td>
                          <button type="button" className="btn btn-sm btn-danger" onClick={() => setQueue(prev => prev.filter((_, idx) => idx !== i))}>Remove</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="modal-footer py-2">
            <button type="button" className="btn btn-warning" onClick={onCancel}>Cancel</button>
            <button type="button" className="btn btn-primary" disabled={submitting || queue.length === 0} onClick={submitQueue}>{submitting ? 'Processing…' : 'Map Variants'}</button>
          </div>
        </div>
      </div>
    </div>,
    modalElement
  );
};

export default VendorVariantMappingModal;


