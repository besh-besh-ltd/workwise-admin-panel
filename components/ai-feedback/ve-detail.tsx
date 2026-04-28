import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { getVendorEvalDetail } from "@/utils/services/ai-feedback";

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  wrong_value: "Wrong Value",
  not_found: "Not Found",
  wrong_source: "Wrong Source",
  formatting: "Formatting",
};

function formatMs(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatBytes(bytes: number | null): string {
  if (!bytes) return "—";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " + d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

// ── Vendor accordion card ─────────────────────────────────────────

function VendorCard({ vendor }: { vendor: any }) {
  const [open, setOpen] = useState(false);
  const passRate = vendor.summary_total
    ? ((vendor.summary_pass || 0) / vendor.summary_total * 100).toFixed(0)
    : null;
  const run = vendor.latest_run;

  return (
    <div className="card border-0 shadow-sm mb-2">
      <div
        className="card-header py-2"
        style={{ background: open ? "#000080" : "#f8f9fa", color: open ? "#fff" : "#333", cursor: "pointer", transition: "all 0.2s" }}
        onClick={() => setOpen(!open)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
              <i className="fa fa-building me-2" />{vendor.vendor_name}
            </span>
            <span className={`badge ${vendor.status === "completed" ? "bg-success" : vendor.status === "failed" ? "bg-danger" : "bg-warning text-dark"}`} style={{ fontSize: "0.6rem" }}>
              {vendor.status}
            </span>
            {passRate && (
              <span className={`badge ${Number(passRate) >= 70 ? "bg-success" : Number(passRate) >= 50 ? "bg-warning text-dark" : "bg-danger"}`} style={{ fontSize: "0.6rem" }}>
                {vendor.summary_pass}/{vendor.summary_total} pass
              </span>
            )}
            {run?.cost_usd && <span className="badge bg-light text-dark" style={{ fontSize: "0.6rem" }}>${run.cost_usd.toFixed(4)}</span>}
            {run?.model && <span className="badge bg-light text-muted" style={{ fontSize: "0.6rem" }}>{run.model}</span>}
          </div>
          <i className={`fa fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: 10 }} />
        </div>
      </div>
      {open && (
        <div className="card-body py-2 px-3">
          {/* Files — 3 per row */}
          {vendor.files?.length > 0 && (
            <div className="mb-3">
              <small className="text-muted fw-semibold d-block mb-1">Uploaded Files ({vendor.files.length})</small>
              <div className="row">
                {vendor.files.map((f: any, i: number) => {
                  const ext = (f.filename || "").split(".").pop()?.toUpperCase() || "FILE";
                  const iconColor = ext === "PDF" ? "#dc3545" : ext === "XLSX" || ext === "XLS" ? "#28a745" : "#6c757d";
                  return (
                    <div key={i} className="col-lg-4 col-md-6 col-12 mb-2">
                      <div className="card h-100 border" style={{ borderLeft: `4px solid ${iconColor}` }}>
                        <div className="card-body py-2 px-3">
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <i className="fa fa-file" style={{ color: iconColor, fontSize: 12 }} />
                            <span className="fw-semibold" style={{ fontSize: "0.78rem", wordBreak: "break-word" }}>{f.filename}</span>
                          </div>
                          <div className="d-flex align-items-center justify-content-between">
                            <div className="d-flex gap-2">
                              <small className="text-muted">{formatBytes(f.size_bytes)}</small>
                              <span className="badge bg-light text-dark" style={{ fontSize: "0.6rem" }}>{ext}</span>
                            </div>
                            {f.download_url && (
                              <a href={f.download_url} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-secondary py-0 px-1" title="Download">
                                <i className="fa fa-download" style={{ fontSize: 10 }} />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Extraction Results */}
          {vendor.results && Object.keys(vendor.results).length > 0 && (
            <div>
              <small className="text-muted fw-semibold d-block mb-1">Extraction Results ({Object.keys(vendor.results).length} fields)</small>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0" style={{ fontSize: "0.78rem" }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-2" style={{ width: "18%" }}>Field</th>
                      <th style={{ width: "28%" }}>Value</th>
                      <th style={{ width: "18%" }}>Remark</th>
                      <th className="text-center" style={{ width: "8%" }}>Status</th>
                      <th className="text-center" style={{ width: "8%" }}>Confidence</th>
                      <th className="pe-2" style={{ width: "20%" }}>References</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(vendor.results).map(([key, field]: [string, any]) => {
                      const status = (field.validation_status || field.status || "").toUpperCase();
                      const conf = field.confidence != null ? Math.round(field.confidence * 100) : null;
                      const refs: string[] = field.refs || [];
                      return (
                        <tr key={key}>
                          <td className="ps-2 fw-semibold" style={{ textTransform: "capitalize" }}>
                            {(field.original_label || field.field_name || key).replace(/_/g, " ")}
                          </td>
                          <td style={{ wordBreak: "break-word" }}>
                            {field.value || <span className="text-muted fst-italic">Not found</span>}
                          </td>
                          <td className="text-muted" style={{ fontSize: "0.75rem", wordBreak: "break-word" }}>{field.remark || "—"}</td>
                          <td className="text-center">
                            {status ? (
                              <span className={`badge ${status === "PASS" ? "bg-success" : status === "FAIL" ? "bg-danger" : status === "NOT_APPLICABLE" ? "bg-secondary" : "bg-warning text-dark"}`} style={{ fontSize: "0.6rem" }}>
                                {status === "NOT_APPLICABLE" ? "N/A" : status}
                              </span>
                            ) : "—"}
                          </td>
                          <td className="text-center">
                            {conf !== null ? (
                              <span className={`badge ${conf >= 80 ? "bg-success" : conf >= 50 ? "bg-warning text-dark" : "bg-danger"}`} style={{ fontSize: "0.6rem" }}>
                                {conf}%
                              </span>
                            ) : "—"}
                          </td>
                          <td className="pe-2">
                            {refs.length > 0 ? (
                              <div className="d-flex flex-wrap gap-1">
                                {refs.slice(0, 2).map((ref, ri) => (
                                  <span key={ri} className="border rounded px-1 text-muted text-truncate d-inline-block" style={{ fontSize: "0.68rem", maxWidth: 140 }} title={ref}>{ref}</span>
                                ))}
                                {refs.length > 2 && <span className="text-muted" style={{ fontSize: "0.68rem" }}>+{refs.length - 2}</span>}
                              </div>
                            ) : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {!vendor.results && vendor.status === "completed" && (
            <p className="text-muted small mb-0">Results not available</p>
          )}

          {/* Vendor Feedback */}
          {vendor.feedback?.length > 0 && (
            <div className="mt-2">
              <small className="text-muted fw-semibold d-block mb-1">Feedback ({vendor.feedback.length})</small>
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0" style={{ fontSize: "0.76rem" }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-2">Field</th>
                      <th>Type</th>
                      <th>Original</th>
                      <th>Corrected</th>
                      <th className="text-end pe-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendor.feedback.map((fb: any) => (
                      <tr key={fb.id}>
                        <td className="ps-2 fw-semibold" style={{ textTransform: "capitalize" }}>{fb.field_key.replace(/_/g, " ")}</td>
                        <td>
                          <span className={`badge ${
                            fb.feedback_type === "wrong_value" ? "bg-danger" :
                            fb.feedback_type === "not_found" ? "bg-warning text-dark" :
                            fb.feedback_type === "wrong_source" ? "bg-info" : "bg-secondary"
                          }`} style={{ fontSize: "0.6rem" }}>
                            {FEEDBACK_TYPE_LABELS[fb.feedback_type] || fb.feedback_type}
                          </span>
                        </td>
                        <td className="text-muted">{fb.original_value || "—"}</td>
                        <td><strong>{fb.corrected_value || "—"}</strong></td>
                        <td className="text-end pe-2 text-muted">{formatDate(fb.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────

export default function VendorEvalDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await getVendorEvalDetail(id as string);
      setData(res?.data);
    } catch {
      toast.error("Failed to load vendor eval details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="container-fluid py-4 text-center">
        <h5 className="text-muted">Evaluation not found</h5>
        <Link href="/ai-feedback" className="btn btn-sm btn-info text-white mt-2">
          <i className="fa fa-arrow-left me-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { evaluation, vendors, accuracy } = data;

  const totalCost = vendors.reduce((sum: number, v: any) =>
    sum + (v.latest_run?.cost_usd || 0), 0
  );
  const totalVendors = vendors.length;
  const completedVendors = vendors.filter((v: any) => v.status === "completed").length;
  const totalPass = vendors.reduce((s: number, v: any) => s + (v.summary_pass || 0), 0);
  const totalFail = vendors.reduce((s: number, v: any) => s + (v.summary_fail || 0), 0);
  const totalFields = vendors.reduce((s: number, v: any) => s + (v.summary_total || 0), 0);
  const overallRate = totalFields > 0 ? ((totalPass / totalFields) * 100).toFixed(0) : null;

  return (
    <div className="container-fluid py-3 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <Link href="/ai-feedback?module=vendor_eval" className="text-muted small text-decoration-none">
            <i className="fa fa-arrow-left me-1" /> Back to Dashboard
          </Link>
          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#000080" }}>{evaluation.name}</h4>
          {evaluation.description && (
            <p className="text-muted small mb-1 mt-1">{evaluation.description}</p>
          )}
          <div className="d-flex gap-2 mt-1 flex-wrap">
            <span className={`badge ${evaluation.status === "completed" ? "bg-success" : evaluation.status === "failed" ? "bg-danger" : "bg-warning text-dark"}`}>
              {evaluation.status}
            </span>
            {evaluation.template_filename && <span className="badge bg-light text-dark">{evaluation.template_filename}</span>}
          </div>
        </div>
        <small className="text-muted">Created: {formatDate(evaluation.created_at)}</small>
      </div>

      {/* Stat Cards */}
      <div className="row mb-3">
        <div className="col-lg-3 col-6">
          <div className="small-box bg-deep-blue">
            <div className="inner">
              <p>Vendors</p>
              <h3>{completedVendors} / {totalVendors}</h3>
            </div>
            <div className="icon"><i className="fa fa-building" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box bg-sky-blue">
            <div className="inner">
              <p>Pass Rate</p>
              <h3>{overallRate ? `${overallRate}%` : "—"}</h3>
            </div>
            <div className="icon"><i className="fa fa-bullseye" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box bg-yellow">
            <div className="inner">
              <p>Total Cost</p>
              <h3>{totalCost > 0 ? `$${totalCost.toFixed(4)}` : "—"}</h3>
            </div>
            <div className="icon"><i className="fa fa-dollar-sign" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box" style={{ background: "#dc3545" }}>
            <div className="inner">
              <p>Corrections</p>
              <h3>{vendors.reduce((s: number, v: any) => s + (v.feedback?.length || 0), 0)}</h3>
            </div>
            <div className="icon"><i className="fa fa-pencil" /></div>
          </div>
        </div>
      </div>

      {/* Vendors */}
      <h6 className="fw-bold mb-2" style={{ color: "#000080" }}>
        <i className="fa fa-users me-2" />Vendors
        <span className="badge bg-light text-dark ms-2" style={{ fontSize: "0.7rem" }}>{totalVendors}</span>
      </h6>
      {vendors.map((v: any) => (
        <VendorCard key={v.id} vendor={v} />
      ))}

    </div>
  );
}
