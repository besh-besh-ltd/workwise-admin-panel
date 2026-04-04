import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import {
  listRateSources,
  uploadRateChart,
  uploadFileToS3,
  archiveRateSource,
  deleteRateSource,
  getRateSource,
  embedRateSource,
} from "@/utils/services/rate-store";

interface RateSource {
  id: number;
  name: string;
  type: "govt_chart" | "custom_upload";
  sub_type: string | null;
  version: string | null;
  status: "active" | "archived" | "processing" | "failed";
  item_count: number;
  effective_date: string | null;
  created_by_name: string | null;
  created_at: string;
}

const TYPE_LABELS: Record<string, string> = {
  govt_chart: "Government Chart",
  custom_upload: "Custom Upload",
};

const SUB_TYPE_LABELS: Record<string, string> = {
  cpwd_dsr: "CPWD DSR",
  pwd_sor: "PWD SOR",
  mes: "MES",
};

const STATUS_BADGES: Record<string, string> = {
  active: "badge bg-success",
  processing: "badge bg-warning text-dark",
  archived: "badge bg-secondary",
  failed: "badge bg-danger",
};

export default function RateStoreList() {
  const router = useRouter();
  const [sources, setSources] = useState<RateSource[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 20;

  // Upload modal state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadType, setUploadType] = useState<"govt_chart" | "custom_upload">("govt_chart");
  const [uploadSubType, setUploadSubType] = useState("");
  const [uploadVersion, setUploadVersion] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchSources = useCallback(async () => {
    setLoading(true);
    try {
      const res: any = await listRateSources({ page, limit, type: typeFilter, status: statusFilter });
      setSources(res?.data || []);
      const total = res?.pagination?.total || 0;
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch {
      toast.error("Failed to load rate sources");
    } finally {
      setLoading(false);
    }
  }, [page, typeFilter, statusFilter]);

  useEffect(() => {
    fetchSources();
  }, [fetchSources]);

  const handlePageClick = (e: { selected: number }) => {
    setPage(e.selected + 1);
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadName) {
      toast.warn("Name and file are required");
      return;
    }
    setUploading(true);
    try {
      // Step 1: Upload file to S3
      const fileRes: any = await uploadFileToS3(uploadFile);
      const fileUrl = fileRes?.data?.[0]?.file_path || fileRes?.data?.file_url;
      if (!fileUrl) throw new Error("File upload failed");

      // Step 2: Create rate source (triggers AI parsing)
      await uploadRateChart({
        name: uploadName,
        type: uploadType,
        sub_type: uploadType === "govt_chart" ? uploadSubType : undefined,
        version: uploadVersion || undefined,
        source_file_url: fileUrl,
      });

      toast.success("Rate chart uploaded. Parsing in progress...");
      setShowUpload(false);
      setUploadName("");
      setUploadFile(null);
      setUploadVersion("");
      setUploadSubType("");
      fetchSources();
    } catch {
      toast.error("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleArchive = async (id: number) => {
    if (!confirm("Archive this rate source?")) return;
    try {
      await archiveRateSource(id);
      toast.success("Archived");
      fetchSources();
    } catch {
      toast.error("Archive failed");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Permanently delete this rate source and all its items?")) return;
    try {
      await deleteRateSource(id);
      toast.success("Deleted");
      fetchSources();
    } catch {
      toast.error("Delete failed");
    }
  };

  const handleEmbed = async (id: number) => {
    try {
      toast.info("Generating embeddings...");
      await embedRateSource(id);
      toast.success("Embeddings generated");
      fetchSources();
    } catch {
      toast.error("Embedding failed");
    }
  };

  const pollProcessing = async (id: number) => {
    try {
      const res: any = await getRateSource(id);
      if (res?.data?.status === "active") {
        toast.success(`"${res.data.name}" is now active`);
        fetchSources();
      } else if (res?.data?.status === "failed") {
        toast.error(`"${res.data.name}" parsing failed`);
        fetchSources();
      } else {
        toast.info("Still processing... check back shortly");
      }
    } catch {
      toast.error("Failed to check status");
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="mb-0">Rate Chart Management</h4>
        <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
          + Upload Rate Chart
        </button>
      </div>

      {/* Filters */}
      <div className="row mb-3 g-2">
        <div className="col-auto">
          <select className="form-select form-select-sm" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="govt_chart">Government Chart</option>
            <option value="custom_upload">Custom Upload</option>
          </select>
        </div>
        <div className="col-auto">
          <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="processing">Processing</option>
            <option value="archived">Archived</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Type</th>
              <th>Version</th>
              <th>Items</th>
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="text-center py-4">Loading...</td></tr>
            ) : sources.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-4 text-muted">No rate sources found</td></tr>
            ) : (
              sources.map((src, idx) => (
                <tr key={src.id}>
                  <td>{(page - 1) * limit + idx + 1}</td>
                  <td>
                    <a href="#" onClick={(e) => { e.preventDefault(); router.push(`/rate-store/detail/${src.id}`); }}
                      className="text-decoration-none fw-semibold">
                      {src.name}
                    </a>
                    {src.sub_type && (
                      <small className="d-block text-muted">{SUB_TYPE_LABELS[src.sub_type] || src.sub_type}</small>
                    )}
                  </td>
                  <td>{TYPE_LABELS[src.type] || src.type}</td>
                  <td>{src.version || "-"}</td>
                  <td>{src.item_count || 0}</td>
                  <td><span className={STATUS_BADGES[src.status] || "badge bg-light"}>{src.status}</span></td>
                  <td>
                    <small>{new Date(src.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}</small>
                    {src.created_by_name && <small className="d-block text-muted">{src.created_by_name}</small>}
                  </td>
                  <td>
                    <div className="btn-group btn-group-sm">
                      <button className="btn btn-outline-primary" title="View Items"
                        onClick={() => router.push(`/rate-store/detail/${src.id}`)}>
                        View
                      </button>
                      {src.status === "processing" && (
                        <button className="btn btn-outline-info" title="Check Status"
                          onClick={() => pollProcessing(src.id)}>
                          Refresh
                        </button>
                      )}
                      {src.status === "active" && (
                        <button className="btn btn-outline-success" title="Generate Embeddings"
                          onClick={() => handleEmbed(src.id)}>
                          Embed
                        </button>
                      )}
                      {src.status === "active" && (
                        <button className="btn btn-outline-warning" title="Archive"
                          onClick={() => handleArchive(src.id)}>
                          Archive
                        </button>
                      )}
                      {(src.status === "archived" || src.status === "failed") && (
                        <button className="btn btn-outline-danger" title="Delete"
                          onClick={() => handleDelete(src.id)}>
                          Delete
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

      {totalPages > 1 && (
        <ReactPaginate
          previousLabel="Prev"
          nextLabel="Next"
          breakLabel="..."
          pageCount={totalPages}
          forcePage={page - 1}
          onPageChange={handlePageClick}
          containerClassName="pagination justify-content-center mt-3"
          pageClassName="page-item"
          pageLinkClassName="page-link"
          previousClassName="page-item"
          previousLinkClassName="page-link"
          nextClassName="page-item"
          nextLinkClassName="page-link"
          breakClassName="page-item"
          breakLinkClassName="page-link"
          activeClassName="active"
        />
      )}

      {/* Upload Modal */}
      {showUpload && (
        <div className="modal d-block" tabIndex={-1} style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Upload Rate Chart</h5>
                <button type="button" className="btn-close" onClick={() => setShowUpload(false)} />
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Name *</label>
                  <input className="form-control" value={uploadName}
                    onChange={(e) => setUploadName(e.target.value)}
                    placeholder="e.g. CPWD DSR 2024" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type *</label>
                  <select className="form-select" value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as "govt_chart" | "custom_upload")}>
                    <option value="govt_chart">Government Chart</option>
                    <option value="custom_upload">Custom Upload</option>
                  </select>
                </div>
                {uploadType === "govt_chart" && (
                  <div className="mb-3">
                    <label className="form-label">Sub Type</label>
                    <select className="form-select" value={uploadSubType}
                      onChange={(e) => setUploadSubType(e.target.value)}>
                      <option value="">Select...</option>
                      <option value="cpwd_dsr">CPWD DSR</option>
                      <option value="pwd_sor">PWD SOR</option>
                      <option value="mes">MES</option>
                    </select>
                  </div>
                )}
                <div className="mb-3">
                  <label className="form-label">Version</label>
                  <input className="form-control" value={uploadVersion}
                    onChange={(e) => setUploadVersion(e.target.value)}
                    placeholder="e.g. 2024-25" />
                </div>
                <div className="mb-3">
                  <label className="form-label">Excel File *</label>
                  <input className="form-control" type="file" accept=".xlsx,.xls,.csv"
                    onChange={(e) => setUploadFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUpload(false)} disabled={uploading}>
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload & Parse"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
