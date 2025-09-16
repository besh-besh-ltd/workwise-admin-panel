import React, { useEffect, useMemo, useState } from "react";
import { listPackages, createPackage, updatePackage, deletePackage, getPackageById } from "@/utils/services/package-management";
import Loader from "@/components/shared/Loader";
import Select from "react-select";
import { vendorList } from "@/utils/services/rfq";
import { getAdminProfile } from "@/utils/services/login";
import { getAdminUsersList } from "@/utils/services/product-management";
import { ToastContainer, toast } from "react-toastify";

const defaultForm = { name: "", items: [], vendors: [] };

const PackageManagementPage = () => {
  const [loading, setLoading] = useState(false);
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [q, setQ] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [currentAdminId, setCurrentAdminId] = useState(null);
  const [adminIdToName, setAdminIdToName] = useState({});

  // vendor search
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [vendorOptions, setVendorOptions] = useState([]);

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await listPackages({ q, page, limit });
      const { data, total: t } = res;
      const baseRows = Array.isArray(data) ? data : [];

      // Enrich rows with items and vendor names for display
      const enriched = await Promise.all(
        baseRows.map(async (row) => {
          try {
            const detail = await getPackageById(row.id);
            const items = Array.isArray(detail?.data?.items) ? detail.data.items : [];
            const vendors = Array.isArray(detail?.data?.vendors) ? detail.data.vendors : [];

            const vendorNames = vendors.map(v => v.vendor_name || `Vendor #${v.vendor_id}`);

            return {
              ...row,
              _items: items.map((i) => i.name).filter(Boolean),
              _vendorNames: vendorNames.filter(Boolean)
            };
          } catch {
            return { ...row, _items: [], _vendorNames: [] };
          }
        })
      );

      setList(enriched);
      setTotal(typeof t === "number" ? t : 0);
    } catch (e) {
      setList([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [q, page, limit]);

  // Load current admin and admin list for name mapping
  useEffect(() => {
    (async () => {
      try {
        const p = await getAdminProfile();
        const adminId = p?.data?.id ?? p?.data?.data?.id ?? null;
        if (adminId) setCurrentAdminId(adminId);
      } catch {}
      try {
        const res = await getAdminUsersList();
        const map = {};
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        if (Array.isArray(arr)) {
          arr.forEach(u => {
            if (u?.id) map[u.id] = u?.name || u?.username || `Admin #${u.id}`;
          });
        }
        setAdminIdToName(map);
      } catch {}
    })();
  }, []);

  // no vendor profile calls; we rely on vendor_name from packages API

  const resetForm = () => {
    setEditingId(null);
    setForm(defaultForm);
  };

  const onCreate = () => {
    resetForm();
    setShowForm(true);
  };

  const onEdit = async (id) => {
    setLoading(true);
    try {
      const res = await getPackageById(id);
      if (res && res.data) {
        const { name, items = [], vendors = [] } = res.data;
        setEditingId(id);
        // Preload vendor option labels directly from response
        const vendorEntries = vendors.map(v => ({
          vendor_id: v.vendor_id,
          option: { value: v.vendor_id, label: v.vendor_name || `Vendor #${v.vendor_id}` }
        }));
        setForm({
          name: name || "",
          items: items.map(i => ({ name: i.name || "" })),
          vendors: vendorEntries
        });
        setShowForm(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id) => {
    const ok = window.confirm("Delete this package?");
    if (!ok) return;
    setLoading(true);
    try {
      await deletePackage(id);
      toast.success("Package deleted");
      fetchList();
    } finally {
      // Error toasts are handled by interceptors globally; add a fallback here
      // If needed, catch and toast in catch block
      setLoading(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        items: form.items.filter(i => i.name && i.name.trim()).map(i => ({ name: i.name.trim() })),
        vendors: form.vendors
          .map(v => v?.vendor_id ?? v?.option?.value)
          .filter(vId => vId != null)
          .map(vId => ({ vendor_id: Number(vId) })),
        ...(currentAdminId ? { [editingId ? "updated_by" : "created_by"]: currentAdminId } : {})
      };
      if (editingId) {
        await updatePackage(editingId, payload);
        toast.success("Package updated");
      } else {
        await createPackage(payload);
        toast.success("Package created");
      }
      setShowForm(false);
      resetForm();
      fetchList();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const totalPages = useMemo(() => {
    return Math.max(1, Math.ceil(total / limit));
  }, [total, limit]);

  const updateItem = (idx, key, value) => {
    setForm(prev => {
      const next = { ...prev };
      const items = [...next.items];
      items[idx] = { ...items[idx], [key]: value };
      next.items = items;
      return next;
    });
  };

  const addItemRow = () => setForm(prev => ({ ...prev, items: [...prev.items, { name: "" }] }));
  const removeItemRow = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const updateVendor = (idx, option) => {
    setForm(prev => {
      const next = { ...prev };
      const vendors = [...next.vendors];
      vendors[idx] = { vendor_id: option?.value, option };
      next.vendors = vendors;
      return next;
    });
  };
  const addVendorRow = () => setForm(prev => ({ ...prev, vendors: [...prev.vendors, { vendor_id: "", option: null }] }));
  const removeVendorRow = (idx) => setForm(prev => ({ ...prev, vendors: prev.vendors.filter((_, i) => i !== idx) }));

  // Debounced vendor search
  useEffect(() => {
    if (!showForm) return;
    if (!vendorSearchTerm || vendorSearchTerm.length < 3) return;
    const h = setTimeout(async () => {
      try {
        const res = await vendorList(vendorSearchTerm);
        const arr = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.data) ? res.data.data : [];
        const options = arr.map(v => ({ value: v.id, label: v.organization_name ?? `Vendor #${v.id}` }));
        setVendorOptions(options);
      } catch {
        setVendorOptions([]);
      }
    }, 600);
    return () => clearTimeout(h);
  }, [vendorSearchTerm, showForm]);

  return (
    <div className="container-fluid p-3">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h4 className="m-0">Package Management</h4>
        <button className="btn btn-primary" onClick={onCreate}>Create Package</button>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-md-4">
              <label className="form-label">Search</label>
              <input value={q} onChange={(e) => { setPage(1); setQ(e.target.value); }} className="form-control" placeholder="Search by name" />
            </div>
            {/* Per Page control removed as requested */}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped mb-0">
              <thead>
                <tr>
                  <th style={{width: 80}}>ID</th>
                  <th>Name</th>
                  <th>Vendors</th>
                  <th>Items</th>
                  <th>Created By</th>
                  <th>Updated By</th>
                  <th style={{width: 140}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-4">No packages found</td>
                  </tr>
                )}
                {list.map((row) => (
                  <tr key={row.id}>
                    <td>{row.id}</td>
                    <td>{row.name}</td>
                    <td>
                      {Array.isArray(row._vendorNames) && row._vendorNames.length > 0 ? (
                        <span title={row._vendorNames.join(", ")}>{row._vendorNames.slice(0, 2).join(", ")}{row._vendorNames.length > 2 ? "…" : ""}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      {Array.isArray(row._items) && row._items.length > 0 ? (
                        <span title={row._items.join(", ")}>{row._items.slice(0, 3).join(", ")}{row._items.length > 3 ? "…" : ""}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>{adminIdToName[row.created_by] || row.created_by || "-"}</td>
                    <td>{adminIdToName[row.updated_by] || row.updated_by || "-"}</td>
                    <td>
                      <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(row.id)}>Edit</button>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(row.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-flex justify-content-between align-items-center p-3">
            <div>Showing {(list.length > 0) ? ((page - 1) * limit + 1) : 0} - {(page - 1) * limit + list.length} of {total}</div>
            <div className="d-flex gap-2 align-items-center">
              <button disabled={page === 1} className="btn btn-light" onClick={() => setPage(1)}>{"<<"}</button>
              <button disabled={page === 1} className="btn btn-light" onClick={() => setPage(p => Math.max(1, p - 1))}>{"<"}</button>
              <span className="px-2">Page {page} / {totalPages}</span>
              <button disabled={page === totalPages} className="btn btn-light" onClick={() => setPage(p => Math.min(totalPages, p + 1))}>{">"}</button>
              <button disabled={page === totalPages} className="btn btn-light" onClick={() => setPage(totalPages)}>{">>"}</button>
            </div>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="modal d-block" tabIndex="-1" style={{ background: "rgba(0,0,0,0.35)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingId ? "Edit Package" : "Create Package"}</h5>
                <button onClick={() => { setShowForm(false); resetForm(); }} type="button" className="btn-close" />
              </div>
              <form onSubmit={onSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={form.name} onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))} required />
                  </div>

                  <div className="mb-3">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="m-0">Items</h6>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addItemRow}>Add Item</button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th style={{width: "80%"}}>Name</th>
                            <th style={{width: 80}}>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.items.length === 0 && (
                            <tr><td colSpan={2} className="text-center">No items</td></tr>
                          )}
                          {form.items.map((it, idx) => (
                            <tr key={idx}>
                              <td>
                                <input className="form-control" value={it.name} onChange={(e) => updateItem(idx, "name", e.target.value)} placeholder="Item name" />
                              </td>
                              <td>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeItemRow(idx)}>Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div>
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="m-0">Vendors</h6>
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={addVendorRow}>Add Vendor</button>
                    </div>
                    <div className="table-responsive">
                      <table className="table table-sm align-middle">
                        <thead>
                          <tr>
                            <th style={{width: "80%"}}>Vendor</th>
                            <th style={{width: 80}}>Remove</th>
                          </tr>
                        </thead>
                        <tbody>
                          {form.vendors.length === 0 && (
                            <tr><td colSpan={2} className="text-center">No vendors</td></tr>
                          )}
                          {form.vendors.map((v, idx) => (
                            <tr key={idx}>
                              <td>
                                <Select
                                  value={v.option || null}
                                  onChange={(opt) => updateVendor(idx, opt)}
                                  onInputChange={(val) => setVendorSearchTerm(val)}
                                  options={vendorOptions}
                                  placeholder="Search vendor by name"
                                  isClearable
                                />
                              </td>
                              <td>
                                <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => removeVendorRow(idx)}>Remove</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => { setShowForm(false); resetForm(); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {loading && <Loader />}
      <ToastContainer />
    </div>
  );
};

export default PackageManagementPage;







