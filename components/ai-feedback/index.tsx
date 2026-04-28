import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  getFeedbackOverview,
  getTopCorrectedFields,
  getAccuracyOverview,
  getProcessedTenders,
} from "@/utils/services/ai-feedback";

ChartJS.register(BarElement, CategoryScale, LinearScale, ArcElement, Tooltip, Legend);

// ── Types ──────────────────────────────────────────────────────────

interface OverviewData {
  total_corrections: number;
  by_type: Record<string, number>;
  by_module: Record<string, number>;
  by_tenant: { tenant_id: string; count: number }[];
}

interface AccuracyData {
  total_runs: number;
  total_fields: number;
  extracted_count: number;
  not_found_count: number;
  corrected_count: number;
  avg_processing_time_ms: number | null;
  min_processing_time_ms: number | null;
  max_processing_time_ms: number | null;
  total_cost_usd: number | null;
  extraction_rate: number | null;
  by_tenant: {
    tenant_id: string;
    tenant_name: string;
    runs: number;
    total_fields: number;
    extracted: number;
    corrected: number;
    extraction_rate: number;
    total_cost_usd: number | null;
    avg_processing_time_ms: number | null;
  }[];
}

interface TenderItem {
  entity_id: string;
  entity_name: string;
  tenant_id: string;
  tenant_name: string;
  total_fields: number;
  extracted: number;
  not_found: number;
  corrected: number;
  processing_time_ms: number | null;
  cost_usd: number | null;
  model: string | null;
  extraction_rate: number | null;
  created_at: string | null;
}

interface PaginatedTenders {
  total: number;
  page: number;
  limit: number;
  pages: number;
  items: TenderItem[];
}

// ── Helpers ────────────────────────────────────────────────────────

const FEEDBACK_TYPE_LABELS: Record<string, string> = {
  wrong_value: "Wrong Value",
  not_found: "Not Found",
  wrong_source: "Wrong Source",
  formatting: "Formatting",
};

const PERIOD_OPTIONS = [
  { value: "", label: "All Time" },
  { value: "today", label: "Today" },
  { value: "week", label: "This Week" },
  { value: "15days", label: "Last 15 Days" },
  { value: "month", label: "Last Month" },
  { value: "3months", label: "Last 3 Months" },
];

const CHART_COLORS = ["#0B436A", "#1A5F8F", "#2C83C0", "#5BACE4", "#FCC21F", "#f59e0b", "#ef4444"];

const MODULE_LABELS: Record<string, { tableName: string; entityName: string }> = {
  tender_summary: { tableName: "Processing Runs", entityName: "Entity" },
  vendor_eval: { tableName: "Processing Runs", entityName: "Entity" },
  boq_rfq: { tableName: "Processing Runs", entityName: "Entity" },
  cost_estimation: { tableName: "Processing Runs", entityName: "Entity" },
};

function formatMs(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${(ms / 60000).toFixed(1)}m`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return (
    d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) +
    " " +
    d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
  );
}

// ── Main Component ─────────────────────────────────────────────────

export default function AIFeedbackDashboard() {
  const router = useRouter();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [fields, setFields] = useState<{ field_key: string; count: number }[]>([]);
  const [accuracy, setAccuracy] = useState<AccuracyData | null>(null);
  const [tenders, setTenders] = useState<PaginatedTenders | null>(null);
  const [loading, setLoading] = useState(true);

  const [module, setModule] = useState((router.query.module as string) || "tender_summary");
  const [period, setPeriod] = useState("");
  const [tenderPage, setTenderPage] = useState(1);

  // Sync module from URL on navigation
  useEffect(() => {
    if (router.query.module && router.query.module !== module) {
      setModule(router.query.module as string);
    }
  }, [router.query.module]);

  // Update URL when module changes from dropdown
  const handleModuleChange = (newModule: string) => {
    setModule(newModule);
    router.replace({ pathname: router.pathname, query: { module: newModule } }, undefined, { shallow: true });
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ovRes, fieldRes, accRes, tenderRes]: any[] = await Promise.allSettled([
        getFeedbackOverview(module),
        getTopCorrectedFields(module),
        getAccuracyOverview(module, period || undefined),
        getProcessedTenders(module, period || undefined, 1, 10),
      ]);

      if (ovRes.status === "fulfilled") setOverview(ovRes.value?.data);
      if (fieldRes.status === "fulfilled") setFields(fieldRes.value?.data || []);
      if (accRes.status === "fulfilled") setAccuracy(accRes.value?.data);
      if (tenderRes.status === "fulfilled") setTenders(tenderRes.value?.data);
      setTenderPage(1);

      const failed = [ovRes, fieldRes, accRes, tenderRes].filter((r) => r.status === "rejected");
      if (failed.length === 4) toast.error("Failed to connect to AI server.");
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [module, period]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTenderPageChange = useCallback(
    async ({ selected }: { selected: number }) => {
      const page = selected + 1;
      setTenderPage(page);
      try {
        const res: any = await getProcessedTenders(module, period || undefined, page, 10);
        setTenders(res?.data);
      } catch {
        toast.error("Failed to load page");
      }
    },
    [module, period]
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 400 }}>
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // ── Chart data ────────────────────────────────────────────────────

  const feedbackTypeData = {
    labels: Object.keys(overview?.by_type || {}).map((k) => FEEDBACK_TYPE_LABELS[k] || k),
    datasets: [
      {
        data: Object.values(overview?.by_type || {}),
        backgroundColor: CHART_COLORS,
        borderWidth: 0,
      },
    ],
  };

  const topFieldsData = {
    labels: fields.slice(0, 5).map((f) =>
      f.field_key
        .split("::")
        .pop()
        ?.replace(/_/g, " ")
        .slice(0, 20) || f.field_key
    ),
    datasets: [
      {
        label: "Corrections",
        data: fields.slice(0, 5).map((f) => f.count),
        backgroundColor: "#1A5F8F",
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="container-fluid py-3">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h4 className="fw-bold mb-0" style={{ color: "#000080" }}>
          <i className="fa fa-chart-line me-2" />
          AI Feedback & Accuracy
        </h4>
        <div className="d-flex gap-2 align-items-center">
          <select
            className="form-select form-select-sm"
            style={{ width: 180 }}
            value={module}
            onChange={(e) => handleModuleChange(e.target.value)}
          >
            <option value="tender_summary">Tender Summary</option>
            <option value="vendor_eval">Vendor Evaluation</option>
            <option value="boq_rfq">BOQ / RFQ</option>
            <option value="cost_estimation">Cost Estimation</option>
          </select>
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            {PERIOD_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button className="btn btn-sm btn-info text-white" onClick={loadData}>
            <i className="fa fa-refresh me-1" /> Refresh
          </button>
        </div>
      </div>

      {/* ── Stat Cards (small-box style) ────────────────────────── */}
      <div className="row">
        <div className="col-lg-3 col-6">
          <div className="small-box bg-deep-blue">
            <div className="inner">
              <p>Total Runs</p>
              <h3>{accuracy?.total_runs || 0}</h3>
            </div>
            <div className="icon"><i className="fa fa-play-circle" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box bg-sky-blue">
            <div className="inner">
              <p>Extraction Rate</p>
              <h3>{accuracy?.extraction_rate ? `${(accuracy.extraction_rate * 100).toFixed(1)}%` : "N/A"}</h3>
            </div>
            <div className="icon"><i className="fa fa-bullseye" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box bg-yellow">
            <div className="inner">
              <p>Total Cost</p>
              <h3>{accuracy?.total_cost_usd ? `$${accuracy.total_cost_usd.toFixed(2)}` : "$0"}</h3>
            </div>
            <div className="icon"><i className="fa fa-dollar-sign" /></div>
          </div>
        </div>
        <div className="col-lg-3 col-6">
          <div className="small-box" style={{ background: "#dc3545" }}>
            <div className="inner">
              <p>Total Corrections</p>
              <h3>{overview?.total_corrections || 0}</h3>
            </div>
            <div className="icon"><i className="fa fa-exclamation-triangle" /></div>
          </div>
        </div>
      </div>

      {/* ── Processing Time Cards ───────────────────────────────── */}
      <div className="row mb-3">
        {[
          { label: "Avg Processing Time", value: formatMs(accuracy?.avg_processing_time_ms ?? null), icon: "fa-clock", color: "#1A5F8F" },
          { label: "Min Processing Time", value: formatMs(accuracy?.min_processing_time_ms ?? null), icon: "fa-arrow-down", color: "#28a745" },
          { label: "Max Processing Time", value: formatMs(accuracy?.max_processing_time_ms ?? null), icon: "fa-arrow-up", color: "#dc3545" },
          { label: "Fields Extracted", value: `${accuracy?.extracted_count || 0} / ${accuracy?.total_fields || 0}`, icon: "fa-check-circle", color: "#000080" },
        ].map((item, i) => (
          <div key={i} className="col-lg-3 col-md-6 mb-2">
            <div className="card shadow-sm border-0 h-100">
              <div className="card-body d-flex align-items-center gap-3 py-3">
                <div
                  className="d-flex align-items-center justify-content-center rounded-circle"
                  style={{ width: 42, height: 42, background: item.color + "15" }}
                >
                  <i className={`fa ${item.icon}`} style={{ color: item.color, fontSize: 16 }} />
                </div>
                <div>
                  <small className="text-muted d-block">{item.label}</small>
                  <strong style={{ fontSize: "1.1rem", color: item.color }}>{item.value}</strong>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Charts Row ──────────────────────────────────────────── */}
      <div className="row mb-3">
        {/* Corrections by Type — Doughnut */}
        <div className="col-lg-4 mb-3">
          <div className="chart-box shadow-sm" style={{ minHeight: 320, borderRadius: 8 }}>
            <div className="chart-heading">
              <h3><i className="fa fa-pie-chart me-2" />Corrections by Type</h3>
            </div>
            {Object.keys(overview?.by_type || {}).length > 0 ? (
              <div className="d-flex justify-content-center py-3">
                <div style={{ width: 220, height: 220 }}>
                  <Doughnut
                    data={feedbackTypeData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "bottom", labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } },
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ height: 200 }}>
                <span className="text-muted">No corrections yet</span>
              </div>
            )}
          </div>
        </div>

        {/* Top Corrected Fields — Bar Chart */}
        <div className="col-lg-8 mb-3">
          <div className="chart-box shadow-sm" style={{ minHeight: 320, borderRadius: 8 }}>
            <div className="chart-heading">
              <h3><i className="fa fa-bar-chart me-2" />Top Corrected Fields</h3>
            </div>
            {fields.length > 0 ? (
              <div style={{ height: 250, padding: "10px 0" }}>
                <Bar
                  data={topFieldsData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: "y",
                    plugins: { legend: { display: false } },
                    scales: {
                      x: { grid: { display: false }, ticks: { font: { size: 11 } } },
                      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
                    },
                  }}
                />
              </div>
            ) : (
              <div className="d-flex justify-content-center align-items-center" style={{ height: 250 }}>
                <span className="text-muted">No field corrections yet</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Accuracy by Tenant ──────────────────────────────────── */}
      <div className="row mb-3">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header" style={{ background: "#000080", color: "#fff" }}>
              <h6 className="mb-0"><i className="fa fa-building me-2" />Accuracy by Client</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th className="ps-3">Client</th>
                      <th className="text-center">Runs</th>
                      <th className="text-center">Total Fields</th>
                      <th className="text-center">Extracted</th>
                      <th className="text-center">Extraction Rate</th>
                      {module === "tender_summary" && <th className="text-center">Cost</th>}
                      <th className="text-center">Avg Time</th>
                      <th className="text-end pe-3">Corrected</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(accuracy?.by_tenant || []).map((t) => (
                      <tr key={t.tenant_id}>
                        <td className="ps-3 fw-semibold" title={t.tenant_id}>{t.tenant_name || t.tenant_id}</td>
                        <td className="text-center">{t.runs}</td>
                        <td className="text-center">{t.total_fields}</td>
                        <td className="text-center">{t.extracted}</td>
                        <td className="text-center">
                          <span
                            className={`badge ${
                              t.extraction_rate >= 0.7
                                ? "bg-success"
                                : t.extraction_rate >= 0.5
                                ? "bg-warning text-dark"
                                : "bg-danger"
                            }`}
                          >
                            {(t.extraction_rate * 100).toFixed(0)}%
                          </span>
                        </td>
                        {module === "tender_summary" && <td className="text-center">{t.total_cost_usd ? `$${t.total_cost_usd.toFixed(2)}` : "—"}</td>}
                        <td className="text-center">{formatMs(t.avg_processing_time_ms)}</td>
                        <td className="text-end pe-3">{t.corrected}</td>
                      </tr>
                    ))}
                    {!(accuracy?.by_tenant || []).length && (
                      <tr>
                        <td colSpan={module === "tender_summary" ? 8 : 7} className="text-center text-muted py-4">
                          No accuracy data yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Processing Runs (paginated) ─────────────────────────── */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm border-0">
            <div className="card-header" style={{ background: "#000080", color: "#fff" }}>
              <h6 className="mb-0"><i className="fa fa-list me-2" />{MODULE_LABELS[module]?.tableName || "Processing Runs"}</h6>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0" style={{ fontSize: "0.82rem" }}>
                  <thead>
                    <tr style={{ background: "#f8f9fa" }}>
                      <th className="ps-3">{MODULE_LABELS[module]?.entityName || "Entity"}</th>
                      <th>Client</th>
                      <th className="text-center">Fields</th>
                      <th className="text-center">Extracted</th>
                      <th className="text-center">Rate</th>
                      <th className="text-center">Corrected</th>
                      <th className="text-center">Cost</th>
                      <th className="text-center">Time</th>
                      <th className="text-center">Model</th>
                      <th className="text-end pe-3">Processed</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tenders?.items || []).map((t, i) => (
                      <tr key={`${t.entity_id}-${i}`}>
                        <td className="ps-3" title={t.entity_id}>
                          <span className="fw-semibold">{t.entity_name}</span>
                          {(t as any).vendor_count > 1 && (
                            <span className="badge bg-light text-muted ms-1" style={{ fontSize: "0.6rem" }}>{(t as any).vendor_count} vendors</span>
                          )}
                        </td>
                        <td title={t.tenant_id}>{t.tenant_name || t.tenant_id}</td>
                        <td className="text-center">{t.total_fields}</td>
                        <td className="text-center">{t.extracted}</td>
                        <td className="text-center">
                          {t.extraction_rate !== null ? (
                            <span
                              className={`badge ${
                                t.extraction_rate >= 0.7
                                  ? "bg-success"
                                  : t.extraction_rate >= 0.5
                                  ? "bg-warning text-dark"
                                  : "bg-danger"
                              }`}
                            >
                              {(t.extraction_rate * 100).toFixed(0)}%
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="text-center">{t.corrected}</td>
                        <td className="text-center">{t.cost_usd ? `$${t.cost_usd.toFixed(2)}` : "—"}</td>
                        <td className="text-center">{formatMs(t.processing_time_ms)}</td>
                        <td className="text-center">
                          <span className="text-muted" style={{ whiteSpace: "nowrap" }}>{t.model || "—"}</span>
                        </td>
                        <td className="text-end pe-3">
                          {t.created_at ? (
                            <>
                              <div>{new Date(t.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</div>
                              <div className="text-muted">{new Date(t.created_at).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</div>
                            </>
                          ) : "—"}
                        </td>
                        <td className="text-center">
                          <Link href={`/ai-feedback/detail/${t.entity_id}?module=${module}`} className="btn btn-sm btn-outline-info" title="View Details">
                            <i className="fa fa-eye" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                    {!(tenders?.items || []).length && (
                      <tr>
                        <td colSpan={11} className="text-center text-muted py-4">
                          No processing runs found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {tenders && tenders.pages > 1 && (
                <div className="d-flex justify-content-center py-3">
                  <ReactPaginate
                    pageCount={tenders.pages}
                    forcePage={tenderPage - 1}
                    onPageChange={handleTenderPageChange}
                    containerClassName="pagination pagination-sm mb-0"
                    pageClassName="page-item"
                    pageLinkClassName="page-link"
                    activeClassName="active"
                    previousClassName="page-item"
                    previousLinkClassName="page-link"
                    nextClassName="page-item"
                    nextLinkClassName="page-link"
                    previousLabel="‹"
                    nextLabel="›"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
