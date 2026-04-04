import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import {
  getRateSource,
  getRateSourceItems,
  embedRateSource,
  archiveRateSource,
} from "@/utils/services/rate-store";

interface RateSource {
  id: number;
  name: string;
  type: string;
  sub_type: string | null;
  version: string | null;
  status: string;
  item_count: number;
  effective_date: string | null;
  expiry_date: string | null;
  source_file_url: string | null;
  created_by_name: string | null;
  created_at: string;
}

interface RateSourceItem {
  id: number;
  item_code: string | null;
  description: string;
  unit: string | null;
  rate: number;
  category: string | null;
  sub_category: string | null;
}

const STATUS_BADGES: Record<string, string> = {
  active: "badge bg-success",
  processing: "badge bg-warning text-dark",
  archived: "badge bg-secondary",
  failed: "badge bg-danger",
};

export default function RateStoreDetail() {
  const router = useRouter();
  const { id } = router.query;

  const [source, setSource] = useState<RateSource | null>(null);
  const [items, setItems] = useState<RateSourceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 50;

  const fetchSource = useCallback(async () => {
    if (!id) return;
    try {
      const res: any = await getRateSource(Number(id));
      setSource(res?.data || null);
    } catch {
      toast.error("Failed to load rate source");
    }
  }, [id]);

  const fetchItems = useCallback(async () => {
    if (!id) return;
    setItemsLoading(true);
    try {
      const res: any = await getRateSourceItems(Number(id), page, limit);
      setItems(res?.data || []);
      const total = res?.pagination?.total || 0;
      setTotalItems(total);
      setTotalPages(Math.ceil(total / limit) || 1);
    } catch {
      toast.error("Failed to load items");
    } finally {
      setItemsLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await fetchSource();
      setLoading(false);
    };
    init();
  }, [fetchSource]);

  useEffect(() => {
    if (id) fetchItems();
  }, [fetchItems]);

  const handleEmbed = async () => {
    if (!id) return;
    try {
      toast.info("Generating embeddings...");
      const res: any = await embedRateSource(Number(id));
      toast.success(`Embeddings generated for ${res?.data?.embedded || 0} items`);
    } catch {
      toast.error("Embedding failed");
    }
  };

  const handleArchive = async () => {
    if (!id || !confirm("Archive this rate source?")) return;
    try {
      await archiveRateSource(Number(id));
      toast.success("Archived");
      fetchSource();
    } catch {
      toast.error("Archive failed");
    }
  };

  if (loading) {
    return <div className="container-fluid py-4 text-center">Loading...</div>;
  }

  if (!source) {
    return <div className="container-fluid py-4 text-center text-muted">Rate source not found</div>;
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="d-flex align-items-center gap-2 mb-3">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => router.push("/rate-store")}>
          &larr; Back
        </button>
        <h4 className="mb-0 flex-grow-1">{source.name}</h4>
        <span className={STATUS_BADGES[source.status] || "badge bg-light"}>{source.status}</span>
      </div>

      {/* Metadata */}
      <div className="row mb-4 g-3">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <table className="table table-sm table-borderless mb-0">
                <tbody>
                  <tr>
                    <td className="text-muted" style={{ width: 140 }}>Type</td>
                    <td>{source.type === "govt_chart" ? "Government Chart" : "Custom Upload"}</td>
                  </tr>
                  {source.sub_type && (
                    <tr>
                      <td className="text-muted">Sub Type</td>
                      <td>{source.sub_type.toUpperCase().replace("_", " ")}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-muted">Version</td>
                    <td>{source.version || "-"}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Items</td>
                    <td>{source.item_count || 0}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">Created</td>
                    <td>
                      {new Date(source.created_at).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                      {source.created_by_name && ` by ${source.created_by_name}`}
                    </td>
                  </tr>
                  {source.effective_date && (
                    <tr>
                      <td className="text-muted">Effective Date</td>
                      <td>{new Date(source.effective_date).toLocaleDateString()}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h6 className="mb-3">Actions</h6>
              <div className="d-flex gap-2 flex-wrap">
                {source.status === "active" && (
                  <>
                    <button className="btn btn-success btn-sm" onClick={handleEmbed}>
                      Generate Embeddings
                    </button>
                    <button className="btn btn-warning btn-sm" onClick={handleArchive}>
                      Archive
                    </button>
                  </>
                )}
                {source.source_file_url && (
                  <a href={source.source_file_url} target="_blank" rel="noreferrer"
                    className="btn btn-outline-primary btn-sm">
                    Download Source File
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <h5 className="mb-3">Parsed Items ({totalItems})</h5>
      <div className="table-responsive">
        <table className="table table-hover table-bordered table-sm align-middle">
          <thead className="table-light">
            <tr>
              <th style={{ width: 50 }}>#</th>
              <th style={{ width: 120 }}>Item Code</th>
              <th>Description</th>
              <th style={{ width: 80 }}>Unit</th>
              <th style={{ width: 120, textAlign: "right" }}>Rate</th>
              <th style={{ width: 150 }}>Category</th>
            </tr>
          </thead>
          <tbody>
            {itemsLoading ? (
              <tr><td colSpan={6} className="text-center py-3">Loading items...</td></tr>
            ) : items.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-3 text-muted">
                {source.status === "processing" ? "Items are being parsed..." : "No items found"}
              </td></tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.id}>
                  <td className="text-muted">{(page - 1) * limit + idx + 1}</td>
                  <td><code>{item.item_code || "-"}</code></td>
                  <td style={{ maxWidth: 400 }}>
                    <span className="text-truncate d-inline-block" style={{ maxWidth: "100%" }} title={item.description}>
                      {item.description}
                    </span>
                  </td>
                  <td>{item.unit || "-"}</td>
                  <td style={{ textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                    {item.rate != null
                      ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(item.rate)
                      : "-"}
                  </td>
                  <td>
                    {item.category || "-"}
                    {item.sub_category && <small className="d-block text-muted">{item.sub_category}</small>}
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
          onPageChange={(e) => setPage(e.selected + 1)}
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
    </div>
  );
}
