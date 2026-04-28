import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { toast } from "react-toastify";
import { getTenderDetail } from "@/utils/services/ai-feedback";

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

function SourceList({ sources }: { sources?: string[] }) {
  const [expanded, setExpanded] = useState(false);

  if (!sources || sources.length === 0) return <span className="text-muted">—</span>;

  const visible = expanded ? sources : sources.slice(0, 3);
  const remaining = sources.length - 3;

  return (
    <div className="d-flex flex-wrap gap-1">
      {visible.map((s, i) => (
        <span
          key={i}
          className="d-inline-block border rounded px-2 py-0 text-muted text-truncate"
          style={{ fontSize: "0.7rem", maxWidth: 180, cursor: "default" }}
          title={s}
        >
          {s}
        </span>
      ))}
      {!expanded && remaining > 0 && (
        <span
          className="d-inline-block border rounded px-2 py-0 text-primary"
          style={{ fontSize: "0.7rem", cursor: "pointer" }}
          onClick={() => setExpanded(true)}
        >
          +{remaining} more
        </span>
      )}
      {expanded && sources.length > 3 && (
        <span
          className="d-inline-block border rounded px-2 py-0 text-primary"
          style={{ fontSize: "0.7rem", cursor: "pointer" }}
          onClick={() => setExpanded(false)}
        >
          less
        </span>
      )}
    </div>
  );
}

function SummaryAccordion({ summaryFields }: { summaryFields: Record<string, any> }) {
  const sections: Record<string, { key: string; field: string; data: any }[]> = {};
  Object.entries(summaryFields).forEach(([key, payload]: [string, any]) => {
    if (!payload || typeof payload !== "object" || !("value" in payload)) return;
    const parts = key.split("::");
    const section = parts.length > 1 ? parts[0] : "General";
    const field = parts.length > 1 ? parts.slice(1).join("::") : key;
    if (!sections[section]) sections[section] = [];
    sections[section].push({ key, field, data: payload });
  });

  return (
    <div className="mb-3">
      <h6 className="fw-bold mb-2" style={{ color: "#000080" }}>
        <i className="fa fa-th-list me-2" />Summary Fields
        <span className="badge bg-light text-dark ms-2" style={{ fontSize: "0.7rem" }}>
          {Object.keys(summaryFields).length} fields
        </span>
      </h6>
      {Object.entries(sections).map(([section, fields]) => {
        const answered = fields.filter(f => f.data.value !== null && f.data.value !== "").length;
        return (
          <SummarySection key={section} section={section} fields={fields} answered={answered} />
        );
      })}
    </div>
  );
}

function SummarySection({ section, fields, answered }: { section: string; fields: { key: string; field: string; data: any }[]; answered: number }) {
  const [open, setOpen] = useState(false);
  const sectionTitle = section.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

  return (
    <div className="card border-0 shadow-sm mb-2">
      <div
        className="card-header py-2"
        style={{ background: open ? "#000080" : "#f8f9fa", color: open ? "#fff" : "#333", cursor: "pointer", transition: "all 0.2s" }}
        onClick={() => setOpen(!open)}
      >
        <div className="d-flex justify-content-between align-items-center">
          <span className="fw-semibold" style={{ fontSize: "0.85rem" }}>
            {sectionTitle}
            <span className="badge ms-2" style={{ background: open ? "rgba(255,255,255,0.2)" : "#e9ecef", color: open ? "#fff" : "#666", fontSize: "0.68rem" }}>
              {answered}/{fields.length} extracted
            </span>
          </span>
          <i className={`fa fa-chevron-${open ? "up" : "down"}`} style={{ fontSize: 10 }} />
        </div>
      </div>
      {open && (
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: "22%" }}>Field</th>
                  <th style={{ width: "40%" }}>Value</th>
                  <th style={{ width: "22%" }}>Remarks</th>
                  <th className="text-end pe-3" style={{ width: "16%" }}>Source</th>
                </tr>
              </thead>
              <tbody>
                {fields.map(({ key, field, data: payload }) => {
                  const hasValue = payload.value !== null && payload.value !== "";
                  return (
                    <tr key={key}>
                      <td className="ps-3 fw-semibold" style={{ textTransform: "capitalize", fontSize: "0.82rem" }}>
                        {field.replace(/_/g, " ")}
                      </td>
                      <td style={{ fontSize: "0.82rem", wordBreak: "break-word" }}>
                        {hasValue ? String(payload.value) : <span className="text-muted fst-italic">Not found</span>}
                      </td>
                      <td style={{ fontSize: "0.78rem", color: "#6b7280", wordBreak: "break-word" }}>
                        {payload.remarks || payload.remark || "—"}
                      </td>
                      <td className="pe-3">
                        <SourceList sources={payload.sources} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TenderDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadedOpen, setUploadedOpen] = useState(false);
  const [derivedOpen, setDerivedOpen] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res: any = await getTenderDetail(id as string);
      setData(res?.data);
    } catch {
      toast.error("Failed to load tender details");
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
        <h5 className="text-muted">Tender not found</h5>
        <Link href="/ai-feedback?module=tender_summary" className="btn btn-sm btn-info text-white mt-2">
          <i className="fa fa-arrow-left me-1" /> Back to Dashboard
        </Link>
      </div>
    );
  }

  const { tender, uploaded_files, derived_files, summary, summary_fields, feedback, accuracy } = data;

  return (
    <div className="container-fluid py-3 px-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <Link href="/ai-feedback?module=tender_summary" className="text-muted small text-decoration-none">
            <i className="fa fa-arrow-left me-1" /> Back to Dashboard
          </Link>
          <h4 className="fw-bold mt-1 mb-0" style={{ color: "#000080" }}>{tender.name}</h4>
          <div className="d-flex gap-2 mt-1 flex-wrap">
            <span className="badge bg-light text-dark">{tender.tenant_id}</span>
            <span className={`badge ${tender.status === "ready" ? "bg-success" : tender.status === "error" ? "bg-danger" : "bg-warning text-dark"}`}>
              {tender.status}
            </span>
            {tender.client && <span className="badge bg-light text-dark">{tender.client}</span>}
            {tender.location && <span className="badge bg-light text-dark">{tender.location}</span>}
          </div>
        </div>
        <div className="text-end">
          <small className="text-muted d-block">Created: {formatDate(tender.created_at)}</small>
          {tender.tender_ref && <small className="text-muted d-block">Ref: {tender.tender_ref}</small>}
        </div>
      </div>

      {/* Accuracy Stats */}
      {accuracy && (
        <div className="row mb-3">
          <div className="col-lg-4 col-6">
            <div className="small-box bg-deep-blue">
              <div className="inner">
                <p>Fields Extracted</p>
                <h3>{accuracy.extracted_count} / {accuracy.total_fields}</h3>
              </div>
              <div className="icon"><i className="fa fa-check-circle" /></div>
            </div>
          </div>
          <div className="col-lg-4 col-6">
            <div className="small-box bg-sky-blue">
              <div className="inner">
                <p>Extraction Rate</p>
                <h3>{accuracy.total_fields ? `${((accuracy.extracted_count / accuracy.total_fields) * 100).toFixed(0)}%` : "—"}</h3>
              </div>
              <div className="icon"><i className="fa fa-bullseye" /></div>
            </div>
          </div>
          <div className="col-lg-4 col-6">
            <div className="small-box" style={{ background: "#dc3545" }}>
              <div className="inner">
                <p>Corrections</p>
                <h3>{accuracy.corrected_count}</h3>
              </div>
              <div className="icon"><i className="fa fa-pencil" /></div>
            </div>
          </div>
          <div className="col-lg-4 col-6">
            <div className="small-box bg-yellow">
              <div className="inner">
                <p>Cost</p>
                <h3>{accuracy.total_cost_usd ? `$${accuracy.total_cost_usd.toFixed(2)}` : "—"}</h3>
              </div>
              <div className="icon"><i className="fa fa-dollar-sign" /></div>
            </div>
          </div>
          <div className="col-lg-4 col-6">
            <div className="small-box bg-light-blue">
              <div className="inner">
                <p>Processing Time</p>
                <h3>{formatMs(accuracy.processing_time_ms)}</h3>
              </div>
              <div className="icon"><i className="fa fa-clock" /></div>
            </div>
          </div>
          <div className="col-lg-4 col-6">
            <div className="small-box" style={{ background: "#6f42c1" }}>
              <div className="inner">
                <p>Model</p>
                <h3 style={{ fontSize: accuracy.model && accuracy.model.length > 10 ? "1.2rem" : undefined }}>{accuracy.model || "—"}</h3>
              </div>
              <div className="icon"><i className="fa fa-microchip" /></div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Fields — grouped by section, accordion */}
      {summary_fields && Object.keys(summary_fields).length > 0 && (
        <SummaryAccordion summaryFields={summary_fields} />
      )}

      {/* Uploaded Files */}
      <div className="card border-0 shadow-sm mb-3">
        <div
          className="card-header py-2"
          style={{ background: "#000080", color: "#fff", cursor: "pointer" }}
          onClick={() => setUploadedOpen(!uploadedOpen)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}><i className="fa fa-upload me-2" />Uploaded Files <span className="badge bg-light text-dark ms-1">{uploaded_files.length}</span></span>
            <i className={`fa fa-chevron-${uploadedOpen ? "up" : "down"}`} style={{ fontSize: 10 }} />
          </div>
        </div>
        {uploadedOpen && <div className="card-body">
          {uploaded_files.length > 0 ? (
            <div className="row">
              {uploaded_files.map((f: any, i: number) => {
                const ext = (f.original_name || "").split(".").pop()?.toUpperCase() || "FILE";
                const iconColor = ext === "PDF" ? "#dc3545" : ext === "XLSX" || ext === "XLS" ? "#28a745" : ext === "DOCX" ? "#0d6efd" : "#6c757d";
                return (
                  <div key={i} className="col-lg-4 col-md-6 col-12 mb-2">
                    <div className="card h-100 border" style={{ borderLeft: `4px solid ${iconColor}` }}>
                      <div className="card-body py-2 px-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className="fa fa-file" style={{ color: iconColor, fontSize: 14 }} />
                          <span className="fw-semibold" style={{ fontSize: "0.82rem", wordBreak: "break-word" }}>{f.original_name}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex gap-2 flex-wrap">
                            <small className="text-muted">{formatBytes(f.size_bytes)}</small>
                            <span className="badge bg-light text-dark" style={{ fontSize: "0.65rem" }}>{ext}</span>
                            {f.category && <span className="badge bg-light text-muted" style={{ fontSize: "0.65rem" }}>{f.category}</span>}
                          </div>
                          {f.download_url && (
                          <a
                            href={f.download_url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary py-0 px-1"
                            title="Download"
                          >
                            <i className="fa fa-download" style={{ fontSize: 11 }} />
                          </a>
                        )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted py-3 mb-0">No files uploaded</p>
          )}
        </div>}
      </div>

      {/* Derived / Extracted Files */}
      <div className="card border-0 shadow-sm mb-3">
        <div
          className="card-header py-2"
          style={{ background: "#000080", color: "#fff", cursor: "pointer" }}
          onClick={() => setDerivedOpen(!derivedOpen)}
        >
          <div className="d-flex justify-content-between align-items-center">
            <span className="fw-semibold" style={{ fontSize: "0.9rem" }}><i className="fa fa-file-text me-2" />Extracted Files <span className="badge bg-light text-dark ms-1">{derived_files.length}</span></span>
            <i className={`fa fa-chevron-${derivedOpen ? "up" : "down"}`} style={{ fontSize: 10 }} />
          </div>
        </div>
        {derivedOpen && <div className="card-body">
          {derived_files.length > 0 ? (
            <div className="row">
              {derived_files.map((f: any, i: number) => {
                const isMerged = !f.source_file_hash;
                const ext = (f.mime_type || "").includes("pdf") ? "PDF" : (f.mime_type || "").includes("excel") || (f.mime_type || "").includes("spreadsheet") ? "XLSX" : "FILE";
                const iconColor = ext === "PDF" ? "#dc3545" : ext === "XLSX" ? "#28a745" : "#6c757d";
                return (
                  <div key={i} className="col-lg-4 col-md-6 col-12 mb-2">
                    <div className="card h-100 border" style={{ borderLeft: `4px solid ${iconColor}` }}>
                      <div className="card-body py-2 px-3">
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <i className={`fa ${isMerged ? "fa-object-group" : "fa-file"}`} style={{ color: iconColor, fontSize: 14 }} />
                          <span className="fw-semibold" style={{ fontSize: "0.82rem", wordBreak: "break-word" }}>{f.ai_assigned_name}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                          <div className="d-flex gap-2 flex-wrap">
                            <span className="badge bg-light text-dark" style={{ fontSize: "0.65rem" }}>{f.category}</span>
                            <small className="text-muted">{formatBytes(f.size_bytes)}</small>
                            {f.page_range && <small className="text-muted">Pages {f.page_range}</small>}
                            {isMerged && <span className="badge bg-info text-white" style={{ fontSize: "0.6rem" }}>Merged</span>}
                          </div>
                          <a
                            href={`${process.env.NEXT_PUBLIC_TENDER_SERVER_URL}/api/v1/tenders/${tender.id}/derived/${f.id}/download`}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-sm btn-outline-secondary py-0 px-1"
                            title="Download"
                          >
                            <i className="fa fa-download" style={{ fontSize: 11 }} />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center text-muted py-3 mb-0">No files extracted</p>
          )}
        </div>}
      </div>

      {/* Feedback */}
      <div className="row">
        <div className="col-12 mb-3">
          <div className="card border-0 shadow-sm">
            <div className="card-header py-2" style={{ background: "#000080", color: "#fff" }}>
              <h6 className="mb-0"><i className="fa fa-comments me-2" />User Feedback <span className="badge bg-light text-dark ms-1">{feedback.length}</span></h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0" style={{ fontSize: "0.78rem" }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">Field</th>
                      <th>Type</th>
                      <th>Original Value</th>
                      <th>Corrected Value</th>
                      <th>Notes</th>
                      <th className="text-end pe-3">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {feedback.map((fb: any) => (
                      <tr key={fb.id}>
                        <td className="ps-3 fw-semibold" style={{ textTransform: "capitalize", fontSize: "0.76rem" }}>
                          {fb.field_key.replace(/::/g, " → ").replace(/_/g, " ")}
                        </td>
                        <td>
                          <span className={`badge ${
                            fb.feedback_type === "wrong_value" ? "bg-danger" :
                            fb.feedback_type === "not_found" ? "bg-warning text-dark" :
                            fb.feedback_type === "wrong_source" ? "bg-info" : "bg-secondary"
                          }`} style={{ fontSize: "0.65rem" }}>
                            {FEEDBACK_TYPE_LABELS[fb.feedback_type] || fb.feedback_type}
                          </span>
                        </td>
                        <td><span className="text-muted" style={{ fontSize: "0.75rem" }}>{fb.original_value || "—"}</span></td>
                        <td><strong style={{ fontSize: "0.76rem" }}>{fb.corrected_value || "—"}</strong></td>
                        <td style={{ fontSize: "0.75rem", color: "#6b7280" }}>{fb.notes || "—"}</td>
                        <td className="text-end pe-3" style={{ fontSize: "0.72rem", color: "#9ca3af" }}>{formatDate(fb.created_at)}</td>
                      </tr>
                    ))}
                    {!feedback.length && (
                      <tr><td colSpan={6} className="text-center text-muted py-4">No feedback submitted for this tender</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
