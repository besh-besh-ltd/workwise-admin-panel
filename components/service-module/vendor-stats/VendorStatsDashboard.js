import React, { useEffect, useMemo, useState } from "react";
import { Doughnut, Line, Bar } from "react-chartjs-2";
import {
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Chart as ChartJS,
} from "chart.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFilter, 
  faSort, 
  faSortUp, 
  faSortDown,
  faTrophy,
  faBan,
  faClipboardCheck,
  faFileContract,
  faQuestionCircle,
  faTimes,
  faEye,
  faPlus,
  faChartPie,
  faChartBar,
  faChartLine
} from "@fortawesome/free-solid-svg-icons";
import { fetchVendorStatsOverview, fetchVendorStatsByVendor, fetchQuotationFinancialAnalysis } from "@/utils/services/vendor-stats";
import { handleGetVendorList } from "@/utils/services/vendor-management";
import { getParentCategories } from "@/utils/services/product-management";
import { searchAllVariants } from "@/utils/services/product-management";
import { handleGetBuyerList } from "@/utils/services/buyer-management";

if (typeof window !== "undefined") {
  ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);
}

const VendorStatsDashboard = () => {
  const [filters, setFilters] = useState({
    date_from: "",
    date_to: "",
    source: "",
    category_id: "",
    product_id: "",
    variant_id: "",
    created_by: "", // buyer filter
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [variants, setVariants] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [overview, setOverview] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);
  const [selectedVendors, setSelectedVendors] = useState([]); // Changed to array for multi-select
  const [vendorDetails, setVendorDetails] = useState({}); // Store details for multiple vendors
  const [vendors, setVendors] = useState([]);
  const [vendorSearchTerm, setVendorSearchTerm] = useState("");
  const [showVendorDropdown, setShowVendorDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [vendorLoading, setVendorLoading] = useState({}); // Track loading per vendor
  const [financialData, setFinancialData] = useState(null);
  const [financialLoading, setFinancialLoading] = useState(false);
  const [leaderboardFilters, setLeaderboardFilters] = useState({
    source: "",
    sortBy: "awards_desc",
    minAwards: "",
    maxRegrets: "",
  });
  const [columnFilter, setColumnFilter] = useState({ column: null, direction: null });
  const [chartViews, setChartViews] = useState({
    sourceDistribution: 0, // 0 = doughnut, 1 = bar
    responseTime: 0, // 0 = line, 1 = bar
    awardRegret: 0, // 0 = bar, 1 = line
  });

  // Check if vendor has actually submitted quotes (has response time data)
  const hasResponseData = (vendor) => {
    // If vendor has awards or regrets, they've submitted quotes
    const hasQuotes = (vendor?.awards || 0) > 0 || (vendor?.regrets || 0) > 0;
    // If they have response time data (not null and > 0), they've submitted quotes
    const hasResponseTime = vendor?.avg_response_minutes != null && vendor.avg_response_minutes > 0;
    return hasQuotes || hasResponseTime;
  };

  const formatResponseTime = (minutes, vendor = null) => {
    // If vendor is provided, check if they have actual quote data
    if (vendor && !hasResponseData(vendor)) {
      return "N/A";
    }
    // If minutes is null, undefined, or 0 and we don't have quote data, show N/A
    if (!minutes || minutes === 0) {
      // If vendor has awards/regrets, 0 might be valid (instant response)
      // Otherwise, it's likely no data
      if (vendor && ((vendor.awards || 0) > 0 || (vendor.regrets || 0) > 0)) {
        return "0 min";
      }
      return "N/A";
    }
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    if (hours < 24) return `${hours}h ${mins}m`;
    const days = Math.floor(hours / 24);
    const hrs = hours % 24;
    return `${days}d ${hrs}h`;
  };

  const formatDeliveryPeriod = (period) => {
    if (!period || period === 0) return "N/A";
    return `${period} days`;
  };

  const kpiCards = useMemo(() => {
    if (!overview) return [];
    return [
      { 
        label: "Total Vendors", 
        value: overview.total_vendors ?? 0,
        icon: "users",
        color: "primary"
      },
      { 
        label: "Active Vendors", 
        value: overview.active_vendors ?? 0,
        icon: "check-circle",
        color: "success"
      },
      { 
        label: "Deactivated Vendors", 
        value: overview.deactivated_vendors ?? 0,
        icon: "times-circle",
        color: "danger"
      },
      { 
        label: "Avg Response Time", 
        value: formatResponseTime(overview.avg_response_minutes, overview),
        icon: "clock",
        color: "info"
      },
      { 
        label: "Total Awards", 
        value: overview.total_awards ?? 0,
        icon: "trophy",
        color: "warning"
      },
      { 
        label: "Total Regrets", 
        value: overview.total_regrets ?? 0,
        icon: "ban",
        color: "danger"
      },
      { 
        label: "Avg Delivery Period", 
        value: formatDeliveryPeriod(overview.avg_delivery_period),
        icon: "truck",
        color: "secondary"
      },
      { 
        label: "Tech Eval Accepted", 
        value: overview.total_tech_eval_accepted ?? 0,
        icon: "check-double",
        color: "success"
      },
      { 
        label: "Tech Eval Rejected", 
        value: overview.total_tech_eval_rejected ?? 0,
        icon: "times",
        color: "danger"
      },
      { 
        label: "Clauses Agreed", 
        value: overview.total_clauses_agreed ?? 0,
        icon: "file-contract",
        color: "info"
      },
      { 
        label: "Queries Raised", 
        value: overview.total_queries_raised ?? 0,
        icon: "question-circle",
        color: "warning"
      },
    ];
  }, [overview]);

  const handleColumnFilter = (column) => {
    if (columnFilter.column === column) {
      // Toggle off: reset filter
      setColumnFilter({ column: null, direction: null });
      setLeaderboardFilters((prev) => ({ ...prev, sortBy: "awards_desc" }));
    } else {
      // Toggle on: set new filter with ascending sort
      setColumnFilter({ column, direction: "asc" });
      setLeaderboardFilters((prev) => ({ ...prev, sortBy: `${column}_asc` }));
    }
  };

  const toggleSortDirection = (e, column) => {
    e.stopPropagation(); // Prevent toggle off when clicking sort icon
    if (columnFilter.column === column) {
      const newDirection = columnFilter.direction === "asc" ? "desc" : "asc";
      setColumnFilter({ column, direction: newDirection });
      setLeaderboardFilters((prev) => ({ ...prev, sortBy: `${column}_${newDirection}` }));
    }
  };

  const getColumnSortIcon = (column) => {
    if (columnFilter.column !== column) return faSort;
    return columnFilter.direction === "asc" ? faSortUp : faSortDown;
  };

  const isColumnVisible = (columnName) => {
    // Always show essential columns
    if (["#", "Vendor Name", "Company", "Source", "Action"].includes(columnName)) {
      return true;
    }
    // If no filter is active, show all columns
    if (!columnFilter.column) {
      return true;
    }
    // If filter is active, only show the filtered column
    const columnMap = {
      "response": "Avg Response Time",
      "awards": "Awards",
      "regrets": "Regrets",
      "tech_eval": "Tech Eval",
      "clauses": "Clauses",
      "queries": "Queries",
    };
    return columnMap[columnFilter.column] === columnName;
  };

  const filteredLeaderboard = useMemo(() => {
    if (!overview || !overview.leaderboard) return [];
    let list = [...overview.leaderboard];

    // If more than 3 vendors are selected, show only selected vendors
    if (selectedVendors.length > 3) {
      list = list.filter((row) => 
        selectedVendors.includes(String(row.vendor_id || row.id || ""))
      );
    }

    // Filter out vendors without data for the active column filter
    if (columnFilter.column) {
      switch (columnFilter.column) {
        case "response":
          // Only show vendors who have actually submitted quotes
          list = list.filter((row) => hasResponseData(row));
          break;
        case "awards":
          // Only show vendors with awards data
          list = list.filter((row) => (row.awards || 0) > 0);
          break;
        case "regrets":
          // Only show vendors with regrets data
          list = list.filter((row) => (row.regrets || 0) > 0);
          break;
        case "tech_eval":
          // Only show vendors with tech eval data
          list = list.filter((row) => 
            ((row.tech_eval_accepted || 0) + (row.tech_eval_rejected || 0)) > 0
          );
          break;
        case "clauses":
          // Only show vendors with clauses data
          list = list.filter((row) => (row.clauses_agreed || 0) > 0);
          break;
        case "queries":
          // Only show vendors with queries data
          list = list.filter((row) => (row.queries_raised || 0) > 0);
          break;
        // "name" filter shows all vendors
        default:
          break;
      }
    }

    // Apply source filter (from main filters - backend already filtered, but we can do client-side refinement)
    const sourceFilter = leaderboardFilters.source || filters.source;
    if (sourceFilter) {
      list = list.filter((row) => {
        const rowSource = (row.source || "unknown").toLowerCase();
        return rowSource === sourceFilter.toLowerCase();
      });
    }

    if (leaderboardFilters.minAwards) {
      const minAwards = Number(leaderboardFilters.minAwards) || 0;
      list = list.filter((row) => (row.awards || 0) >= minAwards);
    }

    if (leaderboardFilters.maxRegrets) {
      const maxRegrets = Number(leaderboardFilters.maxRegrets);
      if (!Number.isNaN(maxRegrets)) {
        list = list.filter((row) => (row.regrets || 0) <= maxRegrets);
      }
    }

    list.sort((a, b) => {
      const aAwards = a.awards || 0;
      const bAwards = b.awards || 0;
      const aResp = a.avg_response_minutes ?? 1e9;
      const bResp = b.avg_response_minutes ?? 1e9;

      // Check column filter first
      if (columnFilter.column && columnFilter.direction) {
        const direction = columnFilter.direction === "asc" ? 1 : -1;
        switch (columnFilter.column) {
          case "name":
            return direction * (a.name || "").localeCompare(b.name || "");
          case "response":
            return direction * (aResp - bResp);
          case "awards":
            return direction * (aAwards - bAwards);
          case "regrets":
            return direction * ((a.regrets || 0) - (b.regrets || 0));
          case "tech_eval":
            const aTech = (a.tech_eval_accepted || 0) + (a.tech_eval_rejected || 0);
            const bTech = (b.tech_eval_accepted || 0) + (b.tech_eval_rejected || 0);
            return direction * (aTech - bTech);
          case "clauses":
            return direction * ((a.clauses_agreed || 0) - (b.clauses_agreed || 0));
          case "queries":
            return direction * ((a.queries_raised || 0) - (b.queries_raised || 0));
          default:
            break;
        }
      }

      // Fallback to sortBy filter
      switch (leaderboardFilters.sortBy) {
        case "response_asc":
          return aResp - bResp;
        case "response_desc":
          return bResp - aResp;
        case "regrets_asc":
          return (a.regrets || 0) - (b.regrets || 0);
        case "regrets_desc":
          return (b.regrets || 0) - (a.regrets || 0);
        case "awards_asc":
          return aAwards - bAwards;
        case "awards_desc":
        default:
          return bAwards - aAwards;
      }
    });

    return list;
  }, [overview, leaderboardFilters, filters, selectedVendors, columnFilter]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      // Include vendor_ids in filters for server-side filtering when vendors are selected
      const filtersWithVendors = {
        ...filters,
        ...(selectedVendors.length > 0 && {
          vendor_ids: selectedVendors.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        })
      };
      const res = await fetchVendorStatsOverview(filtersWithVendors);
      if (res?.status === 1) {
        setOverview(res.data);
      } else {
        setOverview(null);
      }
    } catch (error) {
      setOverview(null);
      console.error("Vendor stats overview error", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinancialAnalysis = async () => {
    try {
      setFinancialLoading(true);
      const filtersWithVendors = {
        ...filters,
        ...(selectedVendors.length > 0 && {
          vendor_ids: selectedVendors.map(id => parseInt(id, 10)).filter(id => !isNaN(id))
        })
      };
      const res = await fetchQuotationFinancialAnalysis(filtersWithVendors);
      if (res?.status === 1) {
        setFinancialData(res.data);
      } else {
        setFinancialData(null);
      }
    } catch (error) {
      setFinancialData(null);
      console.error("Financial analysis error", error);
    } finally {
      setFinancialLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const res = await handleGetVendorList(50, 1);
      if (res?.data) {
        setVendors(res.data);
      }
    } catch (error) {
      console.error("Vendor list load error", error);
      setVendors([]);
    }
  };

  const fetchVendorStats = async (vendorIds) => {
    if (!vendorIds || vendorIds.length === 0) {
      setVendorDetails({});
      setVendorDetail(null);
      return;
    }

    // If single vendor, set vendorDetail for backward compatibility
    if (vendorIds.length === 1) {
      const vendorId = vendorIds[0];
      try {
        setVendorLoading({ [vendorId]: true });
        const numericId = typeof vendorId === "string" ? parseInt(vendorId, 10) : vendorId;
        if (Number.isNaN(numericId)) {
          console.error("Invalid vendor ID:", vendorId);
          setVendorDetail(null);
          return;
        }
        const res = await fetchVendorStatsByVendor(numericId, filters);
        if (res?.status === 1) {
          setVendorDetail(res.data);
          setVendorDetails({ [vendorId]: res.data });
        } else {
          setVendorDetail(null);
        }
      } catch (error) {
        console.error("Vendor detail stats error", error);
        setVendorDetail(null);
      } finally {
        setVendorLoading({ [vendorId]: false });
      }
    } else {
      // Fetch multiple vendors
      const fetchPromises = vendorIds.map(async (vendorId) => {
        try {
          setVendorLoading((prev) => ({ ...prev, [vendorId]: true }));
          const numericId = typeof vendorId === "string" ? parseInt(vendorId, 10) : vendorId;
          if (Number.isNaN(numericId)) {
            return { vendorId, data: null };
          }
          const res = await fetchVendorStatsByVendor(numericId, filters);
          return {
            vendorId,
            data: res?.status === 1 ? res.data : null,
          };
        } catch (error) {
          console.error(`Vendor ${vendorId} stats error`, error);
          return { vendorId, data: null };
        } finally {
          setVendorLoading((prev) => ({ ...prev, [vendorId]: false }));
        }
      });

      const results = await Promise.all(fetchPromises);
      const detailsMap = {};
      results.forEach(({ vendorId, data }) => {
        if (data) {
          detailsMap[vendorId] = data;
        }
      });
      setVendorDetails(detailsMap);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    fetchOverview();
    if (activeTab === "financial") {
      fetchFinancialAnalysis();
    }
    if (selectedVendors.length > 0) {
      fetchVendorStats(selectedVendors);
    }
  };

  const handleResetFilters = () => {
    setFilters({ date_from: "", date_to: "", source: "", category_id: "", product_id: "", variant_id: "", created_by: "" });
    setSelectedVendors([]);
    setLeaderboardFilters({ source: "", sortBy: "awards_desc", minAwards: "", maxRegrets: "" });
    setVendorSearchTerm("");
    setTimeout(() => {
      fetchOverview();
    }, 100);
  };

  useEffect(() => {
    if (selectedVendors.length > 0) {
      fetchVendorStats(selectedVendors);
    } else {
      setVendorDetails({});
      setVendorDetail(null);
    }
  }, [selectedVendors]);

  // Sync top scrollbar width with table width
  useEffect(() => {
    const syncScrollbar = () => {
      const tableScroll = document.getElementById('bottom-table-scroll');
      const scrollContent = document.getElementById('top-scroll-content');
      if (tableScroll && scrollContent) {
        // Get the actual scrollable width of the table
        const table = tableScroll.querySelector('table');
        if (table) {
          scrollContent.style.width = `${table.offsetWidth}px`;
        } else {
          scrollContent.style.width = `${tableScroll.scrollWidth}px`;
        }
      }
    };
    
    // Sync on load and when filters change
    const timeoutId = setTimeout(syncScrollbar, 200);
    window.addEventListener('resize', syncScrollbar);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', syncScrollbar);
    };
  }, [filteredLeaderboard, columnFilter, loading]);

  const sourceChartData = useMemo(() => {
    const labels = overview?.source_distribution?.map((item) => {
      const source = item.source || "Unknown";
      if (source === "admin") return "Admin Added";
      if (source === "self") return "Self Registration";
      if (source === "buyer") return "Private Vendor";
      return source;
    }) || [];
    const data = overview?.source_distribution?.map((item) => Number(item.count) || 0) || [];
    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#4e79a7",
            "#f28e2c",
            "#e15759",
            "#76b7b2",
            "#59a14f",
            "#edc949",
            "#af7aa1",
            "#ff9d9a",
            "#9c755f",
            "#bab0ac",
          ],
          borderWidth: 3,
          borderColor: "#fff",
          hoverBorderWidth: 5,
          hoverOffset: 8,
        },
      ],
    };
  }, [overview]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          font: {
            size: 14,
            weight: "600",
          },
          usePointStyle: true,
          pointStyle: "circle",
        },
      },
      tooltip: {
        enabled: true,
        padding: 15,
        titleFont: {
          size: 15,
          weight: "700",
        },
        bodyFont: {
          size: 14,
          weight: "500",
        },
      },
    },
  };

  // Dedicated options for doughnut chart with percentage tooltip
  const doughnutChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      tooltip: {
        ...chartOptions.plugins.tooltip,
        callbacks: {
          label: function (context) {
            const label = context.label || "";
            const raw = context.parsed || 0;
            const value = typeof raw === "number" ? raw : 0;
            const total = context.dataset.data.reduce(
              (a, b) => a + (typeof b === "number" ? b : 0),
              0
            );
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  const lineChartOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      legend: {
        ...chartOptions.plugins.legend,
        position: "top",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 10,
          font: {
            size: 12,
          },
          padding: 10,
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
          },
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          display: false,
        },
      },
    },
    elements: {
      point: {
        radius: 2,
        hoverRadius: 4,
      },
      line: {
        borderWidth: 2,
        tension: 0.2,
      },
    },
  };

  const barChartOptions = {
    ...lineChartOptions,
    plugins: {
      ...lineChartOptions.plugins,
      legend: {
        ...lineChartOptions.plugins.legend,
        position: "top",
      },
    },
  };

  const timelineData = useMemo(() => {
    const labels = overview?.timeline?.map((item) => item.bucket_date) || [];
    return {
      labels,
      datasets: [
        {
          label: "Quotes",
          data: overview?.timeline?.map((item) => item.quotes_count || 0) || [],
          borderColor: "#4e79a7",
          backgroundColor: "rgba(78, 121, 167, 0.2)",
        },
        {
          label: "Awards",
          data: overview?.timeline?.map((item) => item.awards_count || 0) || [],
          borderColor: "#59a14f",
          backgroundColor: "rgba(89, 161, 79, 0.2)",
        },
        {
          label: "Regrets",
          data: overview?.timeline?.map((item) => item.regrets_count || 0) || [],
          borderColor: "#e15759",
          backgroundColor: "rgba(225, 87, 89, 0.2)",
        },
      ],
    };
  }, [overview]);

  const vendorTimelineData = useMemo(() => {
    const labels = vendorDetail?.timeline?.map((item) => item.bucket_date) || [];
    return {
      labels,
      datasets: [
        {
          label: "Quotes",
          data: vendorDetail?.timeline?.map((item) => item.quotes_count || 0) || [],
          backgroundColor: "rgba(78, 121, 167, 0.5)",
        },
        {
          label: "Awards",
          data: vendorDetail?.timeline?.map((item) => item.awards_count || 0) || [],
          backgroundColor: "rgba(89, 161, 79, 0.5)",
        },
        {
          label: "Regrets",
          data: vendorDetail?.timeline?.map((item) => item.regrets_count || 0) || [],
          backgroundColor: "rgba(225, 87, 89, 0.5)",
        },
      ],
    };
  }, [vendorDetail]);

  useEffect(() => {
    fetchOverview();
    fetchVendors();
    fetchCategories();
    if (activeTab === "financial") {
      fetchFinancialAnalysis();
    }
  }, []);

  useEffect(() => {
    if (activeTab === "financial") {
      fetchFinancialAnalysis();
    }
  }, [activeTab, filters, selectedVendors]);

  const fetchCategories = async () => {
    try {
      const res = await getParentCategories();
      if (res?.data?.status === 1) {
        setCategories(res.data.data || []);
      }
    } catch (error) {
      console.error("Category fetch error", error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    if (!categoryId) {
      setProducts([]);
      return;
    }
    try {
      const res = await searchAllVariants(null, "", "", "", null, categoryId, null, null, 1, 100);
      if (res?.data?.status === 1) {
        // Extract unique products from variants
        const productMap = new Map();
        res.data.data?.forEach((variant) => {
          if (variant.product_id && !productMap.has(variant.product_id)) {
            productMap.set(variant.product_id, {
              id: variant.product_id,
              name: variant.product_name || variant.name || `Product ${variant.product_id}`,
            });
          }
        });
        setProducts(Array.from(productMap.values()));
      }
    } catch (error) {
      console.error("Product fetch error", error);
      setProducts([]);
    }
  };

  useEffect(() => {
    fetchProductsByCategory(filters.category_id);
  }, [filters.category_id]);

  const fetchBuyers = async () => {
    try {
      const res = await handleGetBuyerList(100, 1, null, null, null, null);
      if (res?.data?.status === 1) {
        setBuyers(res.data.data || []);
      }
    } catch (error) {
      console.error("Buyer fetch error", error);
      setBuyers([]);
    }
  };

  const fetchVariantsByProduct = async (productId) => {
    if (!productId) {
      setVariants([]);
      return;
    }
    try {
      const res = await searchAllVariants(null, "", "", "", null, null, null, null, 1, 100);
      if (res?.data?.status === 1) {
        const productVariants = (res.data.data || []).filter(
          (variant) => variant.product_id === parseInt(productId)
        );
        setVariants(productVariants.map((v) => ({
          id: v.id,
          name: v.variant || v.name || `Variant ${v.id}`,
        })));
      }
    } catch (error) {
      console.error("Variant fetch error", error);
      setVariants([]);
    }
  };

  useEffect(() => {
    fetchVariantsByProduct(filters.product_id);
  }, [filters.product_id]);

  useEffect(() => {
    fetchBuyers();
  }, []);

  // Close vendor dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showVendorDropdown && !event.target.closest('.position-relative')) {
        setShowVendorDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showVendorDropdown]);

  const filteredVendors = useMemo(() => {
    if (!vendorSearchTerm) return vendors;
    const search = vendorSearchTerm.toLowerCase();
    return vendors.filter(
      (v) =>
        v.name?.toLowerCase().includes(search) ||
        v.organization_name?.toLowerCase().includes(search) ||
        v.email?.toLowerCase().includes(search)
    );
  }, [vendors, vendorSearchTerm]);

  // Vendor Comparison Table Component
  const VendorComparisonTable = ({ vendorIds }) => {
    const comparisonData = vendorIds.map((vendorId) => {
      const detail = vendorDetails[vendorId];
      const vendor = detail?.vendor;
      return {
        vendorId,
        name: vendor?.name || "N/A",
        company: vendor?.company_name || "N/A",
        responseTime: formatResponseTime(detail?.avg_response_minutes || 0, detail),
        awards: detail?.awards || 0,
        regrets: detail?.regrets || 0,
        techEvalAccepted: detail?.tech_eval_accepted || 0,
        techEvalRejected: detail?.tech_eval_rejected || 0,
        techEvalTotal: (detail?.tech_eval_accepted || 0) + (detail?.tech_eval_rejected || 0),
        techEvalSuccessRate: ((detail?.tech_eval_accepted || 0) + (detail?.tech_eval_rejected || 0)) > 0
          ? (((detail?.tech_eval_accepted || 0) / ((detail?.tech_eval_accepted || 0) + (detail?.tech_eval_rejected || 0))) * 100).toFixed(1)
          : 0,
        clausesAgreed: detail?.clauses_agreed || 0,
        clausesResponded: detail?.clauses_responded || 0,
        clausesAgreementRate: (detail?.clauses_responded || 0) > 0
          ? (((detail?.clauses_agreed || 0) / (detail?.clauses_responded || 0)) * 100).toFixed(1)
          : 0,
        queriesRaised: detail?.queries_raised || 0,
        queriesByVendor: detail?.queries_by_vendor || 0,
        avgDelivery: formatDeliveryPeriod(detail?.avg_delivery_period || 0),
      };
    });

    return (
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-light">
            <tr>
              <th>Metric</th>
              {comparisonData.map((data) => (
                <th key={data.vendorId} className="text-center">
                  <div className="fw-bold">{data.name}</div>
                  <small className="text-muted">{data.company}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="fw-semibold">Response Time</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-info">{data.responseTime}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Awards</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-success">{data.awards}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Regrets</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-danger">{data.regrets}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Tech Eval Accepted</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-success">{data.techEvalAccepted}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Tech Eval Rejected</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-danger">{data.techEvalRejected}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Tech Eval Success Rate</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-primary">{data.techEvalSuccessRate}%</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Clauses Agreed</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-info">{data.clausesAgreed}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Clause Agreement Rate</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-primary">{data.clausesAgreementRate}%</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Queries Raised</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-warning">{data.queriesRaised}</span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="fw-semibold">Avg Delivery Period</td>
              {comparisonData.map((data) => (
                <td key={data.vendorId} className="text-center">
                  <span className="badge bg-secondary">{data.avgDelivery}</span>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  };

  // Reusable Filter Bar Component
  const FilterBar = ({ showVariant = false, showBuyer = true, showVendor = false }) => (
    <div className="card bg-light mb-4 border-0 shadow-sm">
      <div className="card-body p-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-2">
            <label className="form-label small mb-1 fw-semibold">
              <i className="fas fa-calendar-alt me-1 text-primary"></i>From Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              name="date_from"
              value={filters.date_from}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small mb-1 fw-semibold">
              <i className="fas fa-calendar-check me-1 text-primary"></i>To Date
            </label>
            <input
              type="date"
              className="form-control form-control-sm"
              name="date_to"
              value={filters.date_to}
              onChange={handleFilterChange}
            />
          </div>
          <div className="col-md-2">
            <label className="form-label small mb-1 fw-semibold">
              <i className="fas fa-filter me-1 text-info"></i>Source
            </label>
            <select
              className="form-select form-select-sm"
              name="source"
              value={filters.source}
              onChange={handleFilterChange}
            >
              <option value="">All Sources</option>
              <option value="admin">Admin Added</option>
              <option value="self">Self Registration</option>
              <option value="buyer">Private Vendor</option>
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small mb-1 fw-semibold">
              <i className="fas fa-folder me-1 text-primary"></i>Category
            </label>
            <select
              className="form-select form-select-sm"
              name="category_id"
              value={filters.category_id}
              onChange={(e) => {
                handleFilterChange(e);
                setFilters((prev) => ({ ...prev, product_id: "", variant_id: "" }));
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <label className="form-label small mb-1 fw-semibold">
              <i className="fas fa-box me-1 text-success"></i>Product
            </label>
            <select
              className="form-select form-select-sm"
              name="product_id"
              value={filters.product_id}
              onChange={(e) => {
                handleFilterChange(e);
                setFilters((prev) => ({ ...prev, variant_id: "" }));
              }}
              disabled={!filters.category_id}
            >
              <option value="">All Products</option>
              {products.map((prod) => (
                <option key={prod.id} value={prod.id}>
                  {prod.name}
                </option>
              ))}
            </select>
          </div>
          {showVariant && (
            <div className="col-md-2">
              <label className="form-label small mb-1 fw-semibold">
                <i className="fas fa-tags me-1 text-warning"></i>Variant
              </label>
              <select
                className="form-select form-select-sm"
                name="variant_id"
                value={filters.variant_id}
                onChange={handleFilterChange}
                disabled={!filters.product_id}
              >
                <option value="">All Variants</option>
                {variants.map((variant) => (
                  <option key={variant.id} value={variant.id}>
                    {variant.name}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showBuyer && (
            <div className="col-md-2">
              <label className="form-label small mb-1 fw-semibold">
                <i className="fas fa-user-tie me-1 text-primary"></i>Buyer
              </label>
              <select
                className="form-select form-select-sm"
                name="created_by"
                value={filters.created_by}
                onChange={handleFilterChange}
              >
                <option value="">All Buyers</option>
                {buyers.map((buyer) => (
                  <option key={buyer.id} value={buyer.id}>
                    {buyer.name || buyer.organization_name || `Buyer ${buyer.id}`}
                  </option>
                ))}
              </select>
            </div>
          )}
          {showVendor && (
            <div className="col-md-3">
              <label className="form-label small mb-1 fw-semibold">
                <i className="fas fa-store me-1 text-success"></i>Vendor
              </label>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search vendor..."
                  value={vendorSearchTerm}
                  onChange={(e) => {
                    setVendorSearchTerm(e.target.value);
                    setShowVendorDropdown(true);
                  }}
                  onFocus={() => setShowVendorDropdown(true)}
                />
                {selectedVendors.length > 0 && (
                  <div className="mt-2 d-flex flex-wrap gap-1">
                    {selectedVendors.map((vendorId) => {
                      const vendor = vendors.find((v) => String(v.id) === String(vendorId));
                      return vendor ? (
                        <span key={vendorId} className="badge bg-primary">
                          {vendor.name || vendor.organization_name}
                          <button
                            type="button"
                            className="btn-close btn-close-white ms-1"
                            style={{ fontSize: "0.6em" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedVendors((prev) => prev.filter((id) => id !== vendorId));
                            }}
                          ></button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
                {showVendorDropdown && filteredVendors.length > 0 && (
                  <div
                    className="position-absolute w-100 bg-white border rounded shadow-lg"
                    style={{ zIndex: 1000, maxHeight: "300px", overflowY: "auto", top: "100%" }}
                  >
                    {filteredVendors.map((vendor) => {
                      const vendorId = String(vendor.id);
                      const isSelected = selectedVendors.includes(vendorId);
                      return (
                        <div
                          key={vendor.id}
                          className="p-2 d-flex align-items-center"
                          style={{
                            cursor: "pointer",
                            backgroundColor: isSelected ? "#e7f3ff" : "white",
                          }}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedVendors((prev) => prev.filter((id) => id !== vendorId));
                            } else {
                              setSelectedVendors((prev) => [...prev, vendorId]);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = "#f8f9fa";
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = isSelected ? "#e7f3ff" : "white";
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="me-2"
                            style={{ cursor: "pointer" }}
                          />
                          <div className="flex-grow-1">
                            <div className="fw-semibold">{vendor.name || "N/A"}</div>
                            <small className="text-muted">{vendor.organization_name || vendor.email || ""}</small>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="col-md-12 d-flex gap-2 justify-content-end mt-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={handleApplyFilters}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-filter me-2"></i>Apply Filters
                </>
              )}
            </button>
            <button
              className="btn btn-outline-secondary btn-sm"
              onClick={handleResetFilters}
              disabled={loading}
            >
              <i className="fas fa-redo me-2"></i>Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-12">
          <div className="page-title-box">
            <h4 className="page-title">Vendor Stats</h4>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      {loading ? (
        <div className="row">
          {[1, 2, 3, 4, 5, 6, 7].map((idx) => (
            <div className="col-md-3 mb-3" key={idx}>
              <div className="card">
                <div className="card-body">
                  <div className="placeholder-glow">
                    <span className="placeholder col-7"></span>
                    <span className="placeholder col-4"></span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="row">
          {kpiCards.map((card, idx) => (
            <div className="col-md-3 mb-3" key={idx}>
              <div className={`card border-${card.color} border-top`}>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <p className="text-muted text-uppercase fs-12 mb-1">{card.label}</p>
                      <h3 className="mb-0 fw-bold">{card.value}</h3>
                    </div>
                    <div className={`text-${card.color} fs-2`}>
                      <i className={`fas fa-${card.icon}`}></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts - Always Visible */}
      {!loading && (
        <div className="row mb-4">
          <div className="col-md-5 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0 fw-bold">
                    <i className="fas fa-chart-pie me-2 text-primary"></i>Source Distribution
                  </h4>
                  <div className="btn-group" role="group">
                    <button
                      className={`btn btn-sm ${chartViews.sourceDistribution === 0 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setChartViews(prev => ({ ...prev, sourceDistribution: 0 }))}
                      title="Doughnut Chart"
                    >
                      <FontAwesomeIcon icon={faChartPie} />
                    </button>
                    <button
                      className={`btn btn-sm ${chartViews.sourceDistribution === 1 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setChartViews(prev => ({ ...prev, sourceDistribution: 1 }))}
                      title="Bar Chart"
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                    </button>
                  </div>
                </div>
                {sourceChartData.labels.length > 0 ? (
                  <div style={{ height: "480px", position: "relative", minHeight: "480px" }}>
                    {chartViews.sourceDistribution === 0 ? (
                      <Doughnut data={sourceChartData} options={doughnutChartOptions} />
                    ) : (
                      <Bar data={sourceChartData} options={barChartOptions} />
                    )}
                  </div>
                ) : (
                  <div
                    className="text-center text-muted py-5"
                    style={{
                      minHeight: "480px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <i className="fas fa-chart-pie fa-3x mb-3"></i>
                    <p>No source data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-7 mb-4">
            <div className="card h-100 shadow-sm">
              <div className="card-body p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h4 className="card-title mb-0 fw-bold">
                    <i className="fas fa-chart-line me-2 text-success"></i>Activity Timeline
                  </h4>
                  <div className="btn-group" role="group">
                    <button
                      className={`btn btn-sm ${chartViews.responseTime === 0 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setChartViews(prev => ({ ...prev, responseTime: 0 }))}
                      title="Line Chart"
                    >
                      <FontAwesomeIcon icon={faChartLine} />
                    </button>
                    <button
                      className={`btn btn-sm ${chartViews.responseTime === 1 ? "btn-primary" : "btn-outline-primary"}`}
                      onClick={() => setChartViews(prev => ({ ...prev, responseTime: 1 }))}
                      title="Bar Chart"
                    >
                      <FontAwesomeIcon icon={faChartBar} />
                    </button>
                  </div>
                </div>
                {timelineData.labels.length > 0 ? (
                  <div style={{ height: "480px", position: "relative", minHeight: "480px" }}>
                    {chartViews.responseTime === 0 ? (
                      <Line data={timelineData} options={lineChartOptions} />
                    ) : (
                      <Bar data={timelineData} options={barChartOptions} />
                    )}
                  </div>
                ) : (
                  <div
                    className="text-center text-muted py-5"
                    style={{
                      minHeight: "480px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                    }}
                  >
                    <i className="fas fa-chart-line fa-3x mb-3"></i>
                    <p>No timeline data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      {!loading && (
        <div className="card mb-3 shadow-sm border-0">
          <div className="card-body p-0">
            <ul className="nav nav-tabs nav-tabs-custom" role="tablist">
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "overview" ? "active" : ""}`}
                  onClick={() => setActiveTab("overview")}
                >
                  <i className="fas fa-chart-bar me-2"></i>Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "behavior" ? "active" : ""}`}
                  onClick={() => setActiveTab("behavior")}
                >
                  <i className="fas fa-user-chart me-2"></i>Behavior Analysis
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "tech-eval" ? "active" : ""}`}
                  onClick={() => setActiveTab("tech-eval")}
                >
                  <i className="fas fa-clipboard-check me-2"></i>Tech Evaluation
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "clauses" ? "active" : ""}`}
                  onClick={() => setActiveTab("clauses")}
                >
                  <i className="fas fa-file-contract me-2"></i>Clauses
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "queries" ? "active" : ""}`}
                  onClick={() => setActiveTab("queries")}
                >
                  <i className="fas fa-question-circle me-2"></i>Queries & Deviations
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button
                  className={`nav-link ${activeTab === "financial" ? "active" : ""}`}
                  onClick={() => setActiveTab("financial")}
                >
                  <FontAwesomeIcon icon={faChartLine} className="me-2" />Financial Analysis
                </button>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Overview Tab Content */}
      {!loading && activeTab === "overview" && (
        <>
          {/* Leaderboard */}
          <div className="card mb-3 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="card-title mb-0 fw-bold">
                    <i className="fas fa-trophy me-2 text-warning"></i>Vendor Leaderboard
                  </h4>
                  {selectedVendors.length > 3 && (
                    <small className="text-muted d-block">
                      Showing {selectedVendors.length} selected vendors
                    </small>
                  )}
                  {columnFilter.column && (
                    <small className="text-primary d-block mt-1">
                      <strong>Filtered by:</strong> <strong>
                        {columnFilter.column === "response" ? "Avg Response Time" :
                         columnFilter.column === "awards" ? "Awards" :
                         columnFilter.column === "regrets" ? "Regrets" :
                         columnFilter.column === "tech_eval" ? "Tech Eval" :
                         columnFilter.column === "clauses" ? "Clauses" :
                         columnFilter.column === "queries" ? "Queries" :
                         columnFilter.column === "name" ? "Vendor Name" : columnFilter.column}
                      </strong> ({columnFilter.direction === "asc" ? "↑ Ascending" : "↓ Descending"})
                    </small>
                  )}
                </div>
                <div className="d-flex gap-2">
                  {columnFilter.column && (
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => {
                        setColumnFilter({ column: null, direction: null });
                        setLeaderboardFilters((prev) => ({ ...prev, sortBy: "awards_desc" }));
                      }}
                      title="Clear Column Filter"
                    >
                      <FontAwesomeIcon icon={faTimes} className="me-1" />
                      Clear Filter
                    </button>
                  )}
                  {selectedVendors.length > 3 && (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedVendors([])}
                    >
                      <i className="fas fa-times me-1"></i>Clear Selection
                    </button>
                  )}
                </div>
              </div>

            {/* Enhanced Filter Bar */}
            <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
            
            {/* Leaderboard Specific Filters */}
            <div className="card bg-light mb-4 border-0 shadow-sm">
              <div className="card-body p-3">
                <div className="row g-3 align-items-end">
                  <div className="col-md-3">
                    <label className="form-label small mb-1 fw-semibold">
                      <i className="fas fa-sort me-1 text-success"></i>Sort By
                    </label>
                    <select
                      className="form-select form-select-sm"
                      value={leaderboardFilters.sortBy}
                      onChange={(e) =>
                        setLeaderboardFilters((prev) => ({ ...prev, sortBy: e.target.value }))
                      }
                    >
                      <option value="awards_desc">Awards (High → Low)</option>
                      <option value="response_asc">Fastest Response</option>
                      <option value="response_desc">Slowest Response</option>
                      <option value="regrets_asc">Fewest Regrets</option>
                      <option value="regrets_desc">Most Regrets</option>
                      <option value="awards_asc">Awards (Low → High)</option>
                    </select>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1 fw-semibold">
                      <i className="fas fa-trophy me-1 text-warning"></i>Min Awards
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Any"
                      value={leaderboardFilters.minAwards}
                      onChange={(e) =>
                        setLeaderboardFilters((prev) => ({ ...prev, minAwards: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label small mb-1 fw-semibold">
                      <i className="fas fa-ban me-1 text-danger"></i>Max Regrets
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      placeholder="Any"
                      value={leaderboardFilters.maxRegrets}
                      onChange={(e) =>
                        setLeaderboardFilters((prev) => ({ ...prev, maxRegrets: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {/* Conditional Rendering Based on Selected Vendors */}
            {selectedVendors.length === 1 ? (
              // Single Vendor - Show Details Card
              vendorDetail ? (
                <div className="card border-primary shadow-sm">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="card-title mb-0 fw-bold">
                        <i className="fas fa-user-tie me-2 text-primary"></i>
                        Vendor Details - {vendorDetail?.vendor?.name || "N/A"}
                      </h5>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => setSelectedVendors([])}
                      >
                        <i className="fas fa-times me-1"></i>Close
                      </button>
                    </div>
                    <div className="row">
                      <div className="col-md-3 mb-3">
                        <div className="card border-info">
                          <div className="card-body text-center">
                            <h5 className="text-info">{formatResponseTime(vendorDetail?.avg_response_minutes || 0, vendorDetail)}</h5>
                            <small className="text-muted">Avg Response Time</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card border-success">
                          <div className="card-body text-center">
                            <h5 className="text-success">{vendorDetail?.awards || 0}</h5>
                            <small className="text-muted">Awards</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card border-danger">
                          <div className="card-body text-center">
                            <h5 className="text-danger">{vendorDetail?.regrets || 0}</h5>
                            <small className="text-muted">Regrets</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card border-warning">
                          <div className="card-body text-center">
                            <h5 className="text-warning">{vendorDetail?.tech_eval_accepted || 0}</h5>
                            <small className="text-muted">Tech Eval Accepted</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card border-info">
                          <div className="card-body text-center">
                            <h5 className="text-info">{vendorDetail?.clauses_agreed || 0}</h5>
                            <small className="text-muted">Clauses Agreed</small>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-3 mb-3">
                        <div className="card border-warning">
                          <div className="card-body text-center">
                            <h5 className="text-warning">{vendorDetail?.queries_raised || 0}</h5>
                            <small className="text-muted">Queries Raised</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="text-muted mt-2">Loading vendor details...</p>
                </div>
              )
            ) : selectedVendors.length >= 2 && selectedVendors.length <= 3 ? (
              // 2-3 Vendors - Show Comparison Table
              <div className="card border-primary shadow-sm">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="card-title mb-0 fw-bold">
                      <i className="fas fa-balance-scale me-2 text-primary"></i>
                      Vendor Comparison ({selectedVendors.length} vendors)
                    </h5>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => setSelectedVendors([])}
                    >
                      <i className="fas fa-times me-1"></i>Clear Selection
                    </button>
                  </div>
                  {Object.keys(vendorDetails).length === selectedVendors.length ? (
                    <VendorComparisonTable vendorIds={selectedVendors} />
                  ) : (
                    <div className="text-center py-5">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="text-muted mt-2">Loading vendor comparison data...</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // More than 3 or No Selection - Show Leaderboard Table
              <div className="position-relative">
                {/* Top Horizontal Scrollbar */}
                <div 
                  className="overflow-x-auto mb-2"
                  style={{ 
                    height: "17px",
                    direction: "rtl",
                    scrollbarWidth: "thin",
                    scrollbarColor: "#cbd5e0 #f7fafc"
                  }}
                  id="top-scrollbar"
                  onScroll={(e) => {
                    const bottomScroll = document.getElementById('bottom-table-scroll');
                    if (bottomScroll) {
                      bottomScroll.scrollLeft = e.currentTarget.scrollLeft;
                    }
                  }}
                >
                  <div 
                    id="top-scroll-content"
                    style={{ 
                      direction: "ltr", 
                      height: "1px",
                      width: "100%",
                      minWidth: "1000px"
                    }}
                  ></div>
                </div>
                <div 
                  id="bottom-table-scroll"
                  className="table-responsive" 
                  style={{ maxHeight: "600px", overflowY: "auto" }}
                  onScroll={(e) => {
                    const topScroll = document.getElementById('top-scrollbar');
                    if (topScroll) {
                      topScroll.scrollLeft = e.currentTarget.scrollLeft;
                    }
                    // Update top scrollbar width to match content
                    const scrollContent = document.getElementById('top-scroll-content');
                    if (scrollContent) {
                      scrollContent.style.width = `${e.currentTarget.scrollWidth}px`;
                    }
                  }}
                >
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      {isColumnVisible("#") && <th>#</th>}
                      {isColumnVisible("Vendor Name") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Vendor Name</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "name" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("name")}
                                title="Filter by Vendor Name"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "name" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "name")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("name")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Company") && <th>Company</th>}
                      {isColumnVisible("Source") && <th>Source</th>}
                      {isColumnVisible("Avg Response Time") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Avg Response Time</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "response" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("response")}
                                title="Filter by Response Time"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "response" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "response")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("response")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Awards") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Awards</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "awards" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("awards")}
                                title="Filter by Awards"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "awards" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "awards")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("awards")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Regrets") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Regrets</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "regrets" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("regrets")}
                                title="Filter by Regrets"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "regrets" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "regrets")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("regrets")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Tech Eval") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Tech Eval</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "tech_eval" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("tech_eval")}
                                title="Filter by Tech Eval"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "tech_eval" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "tech_eval")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("tech_eval")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Clauses") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Clauses</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "clauses" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("clauses")}
                                title="Filter by Clauses"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "clauses" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "clauses")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("clauses")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Queries") && (
                        <th>
                          <div className="d-flex align-items-center justify-content-between">
                            <span>Queries</span>
                            <div className="d-flex align-items-center gap-1">
                              <button
                                className={`btn btn-sm ${columnFilter.column === "queries" ? "btn-primary" : "btn-outline-primary"}`}
                                style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                onClick={() => handleColumnFilter("queries")}
                                title="Filter by Queries"
                              >
                                <FontAwesomeIcon icon={faFilter} className="me-1" />
                                Filter
                              </button>
                              {columnFilter.column === "queries" && (
                                <button
                                  className="btn btn-sm btn-primary"
                                  style={{ fontSize: "0.65rem", padding: "3px 6px", fontWeight: "600" }}
                                  onClick={(e) => toggleSortDirection(e, "queries")}
                                  title="Toggle Sort Direction"
                                >
                                  <FontAwesomeIcon icon={getColumnSortIcon("queries")} />
                                </button>
                              )}
                            </div>
                          </div>
                        </th>
                      )}
                      {isColumnVisible("Action") && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLeaderboard.length ? (
                      filteredLeaderboard.map((row, idx) => {
                        // Calculate visible columns count for colSpan
                        const visibleColumnsCount = [
                          isColumnVisible("#"),
                          isColumnVisible("Vendor Name"),
                          isColumnVisible("Company"),
                          isColumnVisible("Source"),
                          isColumnVisible("Avg Response Time"),
                          isColumnVisible("Awards"),
                          isColumnVisible("Regrets"),
                          isColumnVisible("Tech Eval"),
                          isColumnVisible("Clauses"),
                          isColumnVisible("Queries"),
                          isColumnVisible("Action"),
                        ].filter(Boolean).length;

                        return (
                          <tr key={row.vendor_id}>
                            {isColumnVisible("#") && <td className="text-muted">{idx + 1}</td>}
                            {isColumnVisible("Vendor Name") && (
                              <td className="fw-semibold">{row.name || "N/A"}</td>
                            )}
                            {isColumnVisible("Company") && <td>{row.company_name || "N/A"}</td>}
                            {isColumnVisible("Source") && (
                              <td>
                                <span
                                  className={`badge ${
                                    row.source === "admin"
                                      ? "bg-primary"
                                      : row.source === "self"
                                      ? "bg-success"
                                      : row.source === "buyer"
                                      ? "bg-info"
                                      : "bg-secondary"
                                  }`}
                                >
                                  {row.source === "admin"
                                    ? "Admin Added"
                                    : row.source === "self"
                                    ? "Self Registration"
                                    : row.source === "buyer"
                                    ? "Private Vendor"
                                    : row.source || "Unknown"}
                                </span>
                              </td>
                            )}
                            {isColumnVisible("Avg Response Time") && (
                              <td>
                                <span className={`badge ${hasResponseData(row) ? "bg-info" : "bg-secondary"}`}>
                                  {formatResponseTime(row.avg_response_minutes, row)}
                                </span>
                              </td>
                            )}
                            {isColumnVisible("Awards") && (
                              <td>
                                <span className="badge bg-success">{row.awards ?? 0}</span>
                              </td>
                            )}
                            {isColumnVisible("Regrets") && (
                              <td>
                                <span className="badge bg-danger">{row.regrets ?? 0}</span>
                              </td>
                            )}
                            {isColumnVisible("Tech Eval") && (
                              <td>
                                <span className="badge bg-success">
                                  {row.tech_eval_accepted ?? 0}/{row.tech_eval_rejected ?? 0}
                                </span>
                              </td>
                            )}
                            {isColumnVisible("Clauses") && (
                              <td>
                                <span className="badge bg-info">{row.clauses_agreed ?? 0}</span>
                              </td>
                            )}
                            {isColumnVisible("Queries") && (
                              <td>
                                <span className="badge bg-warning">{row.queries_raised ?? 0}</span>
                              </td>
                            )}
                            {isColumnVisible("Action") && (
                              <td>
                                <button
                                  className={`btn btn-sm ${selectedVendors.includes(String(row.vendor_id || row.id || "")) ? "btn-success" : "btn-primary"}`}
                                  onClick={() => {
                                    const vendorId = String(row.vendor_id || row.id || "");
                                    if (selectedVendors.includes(vendorId)) {
                                      // If already selected, remove from selection
                                      setSelectedVendors((prev) => prev.filter((id) => id !== vendorId));
                                      if (selectedVendors.length === 1) {
                                        setVendorDetail(null);
                                      }
                                    } else {
                                      // If not selected, add to selection and fetch details
                                      const newSelection = [...selectedVendors, vendorId];
                                      setSelectedVendors(newSelection);
                                      fetchVendorStats([vendorId]);
                                    }
                                  }}
                                  title={selectedVendors.includes(String(row.vendor_id || row.id || "")) ? "Remove from Selection" : "View Details & Add to Selection"}
                                >
                                  <FontAwesomeIcon icon={faEye} className="me-1" />
                                  {selectedVendors.includes(String(row.vendor_id || row.id || "")) ? "Selected" : "View Details"}
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td 
                          colSpan={[
                            isColumnVisible("#"),
                            isColumnVisible("Vendor Name"),
                            isColumnVisible("Company"),
                            isColumnVisible("Source"),
                            isColumnVisible("Avg Response Time"),
                            isColumnVisible("Awards"),
                            isColumnVisible("Regrets"),
                            isColumnVisible("Tech Eval"),
                            isColumnVisible("Clauses"),
                            isColumnVisible("Queries"),
                            isColumnVisible("Action"),
                          ].filter(Boolean).length} 
                          className="text-center text-muted py-4"
                        >
                          <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                          No vendor data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        </div>
        </>
      )}

      {/* Behavior Analysis Tab */}
      {!loading && activeTab === "behavior" && (
        <>
          <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4 fw-bold">
                <i className="fas fa-user-chart me-2 text-primary"></i>Vendor Behavior Analysis
              </h4>
            <div className="row">
              <div className="col-md-12">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Vendor</th>
                        <th>Response Rate</th>
                        <th>Award Rate</th>
                        <th>Regret Rate</th>
                        <th>Tech Eval Success</th>
                        <th>Clause Agreement</th>
                        <th>Query Frequency</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLeaderboard.length > 0 ? (
                        filteredLeaderboard.map((row) => {
                          const totalRFQs = (row.awards || 0) + (row.regrets || 0);
                          const awardRate = totalRFQs > 0 ? ((row.awards || 0) / totalRFQs * 100).toFixed(1) : 0;
                          const regretRate = totalRFQs > 0 ? ((row.regrets || 0) / totalRFQs * 100).toFixed(1) : 0;
                          const techEvalTotal = (row.tech_eval_accepted || 0) + (row.tech_eval_rejected || 0);
                          const techEvalSuccess = techEvalTotal > 0 ? ((row.tech_eval_accepted || 0) / techEvalTotal * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={row.vendor_id}>
                              <td className="fw-semibold">{row.name || "N/A"}</td>
                              <td>
                                <span className="badge bg-info">
                                  {formatResponseTime(row.avg_response_minutes, row)}
                                </span>
                              </td>
                              <td>
                                <span className="badge bg-success">{awardRate}%</span>
                              </td>
                              <td>
                                <span className="badge bg-danger">{regretRate}%</span>
                              </td>
                              <td>
                                <span className="badge bg-primary">{techEvalSuccess}%</span>
                              </td>
                              <td>
                                <span className="badge bg-info">{row.clauses_agreed || 0}</span>
                              </td>
                              <td>
                                <span className="badge bg-warning">{row.queries_raised || 0}</span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => {
                                    const vendorId = String(row.vendor_id || row.id || "");
                                    setSelectedVendors([vendorId]);
                                    fetchVendorStats([vendorId]);
                                  }}
                                  title="View Details"
                                >
                                  <FontAwesomeIcon icon={faEye} className="me-1" />View Details
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="8" className="text-center text-muted py-4">
                            No data available
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
        {selectedVendors.length === 1 && vendorDetail && (
          <div className="card border-primary mt-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-user-tie me-2 text-primary"></i>
                  Vendor Details - {vendorDetail?.vendor?.name || "N/A"}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedVendors([]);
                    setVendorDetail(null);
                  }}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
              <div className="row">
                <div className="col-md-3">
                  <div className="card border-info">
                    <div className="card-body text-center">
                      <h5 className="text-info">{vendorDetail?.tech_eval_accepted || 0}</h5>
                      <small className="text-muted">Tech Eval Accepted</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-danger">
                    <div className="card-body text-center">
                      <h5 className="text-danger">{vendorDetail?.tech_eval_rejected || 0}</h5>
                      <small className="text-muted">Tech Eval Rejected</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-success">
                    <div className="card-body text-center">
                      <h5 className="text-success">{vendorDetail?.clauses_agreed || 0}</h5>
                      <small className="text-muted">Clauses Agreed</small>
                    </div>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="card border-warning">
                    <div className="card-body text-center">
                      <h5 className="text-warning">{vendorDetail?.queries_raised || 0}</h5>
                      <small className="text-muted">Queries Raised</small>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* Tech Evaluation Tab */}
      {!loading && activeTab === "tech-eval" && (
        <>
          <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4 fw-bold">
                <i className="fas fa-clipboard-check me-2 text-primary"></i>Technical Evaluation Statistics
              </h4>
            <div className="row mb-4">
              <div className="col-md-4">
                <div className="card border-success">
                  <div className="card-body text-center">
                    <h3 className="text-success">{overview?.total_tech_eval_accepted || 0}</h3>
                    <p className="mb-0 text-muted">Accepted Evaluations</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-danger">
                  <div className="card-body text-center">
                    <h3 className="text-danger">{overview?.total_tech_eval_rejected || 0}</h3>
                    <p className="mb-0 text-muted">Rejected Evaluations</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-info">
                  <div className="card-body text-center">
                    <h3 className="text-info">
                      {((overview?.total_tech_eval_accepted || 0) + (overview?.total_tech_eval_rejected || 0))}
                    </h3>
                    <p className="mb-0 text-muted">Total Evaluations</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Vendor</th>
                    <th>Accepted</th>
                    <th>Rejected</th>
                    <th>Total</th>
                    <th>Success Rate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard
                      .filter((row) => (row.tech_eval_accepted || 0) + (row.tech_eval_rejected || 0) > 0)
                      .map((row) => {
                        const total = (row.tech_eval_accepted || 0) + (row.tech_eval_rejected || 0);
                        const successRate = total > 0 ? ((row.tech_eval_accepted || 0) / total * 100).toFixed(1) : 0;
                        return (
                          <tr key={row.vendor_id}>
                            <td className="fw-semibold">{row.name || "N/A"}</td>
                            <td><span className="badge bg-success">{row.tech_eval_accepted || 0}</span></td>
                            <td><span className="badge bg-danger">{row.tech_eval_rejected || 0}</span></td>
                            <td><span className="badge bg-info">{total}</span></td>
                            <td><span className="badge bg-primary">{successRate}%</span></td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  const vendorId = String(row.vendor_id || row.id || "");
                                  setSelectedVendors([vendorId]);
                                  fetchVendorStats([vendorId]);
                                }}
                                title="View Details"
                              >
                                <i className="fas fa-eye me-1"></i>View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center text-muted py-4">No tech evaluation data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {selectedVendors.length === 1 && vendorDetail && (
          <div className="card border-primary mt-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-user-tie me-2 text-primary"></i>
                  Vendor Details - {vendorDetail?.vendor?.name || "N/A"}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedVendors([]);
                    setVendorDetail(null);
                  }}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Tech Eval Accepted:</strong> {vendorDetail?.tech_eval_accepted || 0}</p>
                  <p><strong>Tech Eval Rejected:</strong> {vendorDetail?.tech_eval_rejected || 0}</p>
                  <p><strong>Total Tech Eval:</strong> {(vendorDetail?.tech_eval_accepted || 0) + (vendorDetail?.tech_eval_rejected || 0)}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Success Rate:</strong> {
                    ((vendorDetail?.tech_eval_accepted || 0) + (vendorDetail?.tech_eval_rejected || 0)) > 0
                      ? (((vendorDetail?.tech_eval_accepted || 0) / ((vendorDetail?.tech_eval_accepted || 0) + (vendorDetail?.tech_eval_rejected || 0))) * 100).toFixed(1)
                      : 0
                  }%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* Clauses Tab */}
      {!loading && activeTab === "clauses" && (
        <>
          <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4 fw-bold">
                <i className="fas fa-file-contract me-2 text-primary"></i>Clause Agreement Statistics
              </h4>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-info">
                  <div className="card-body text-center">
                    <h3 className="text-info">{overview?.total_clauses_agreed || 0}</h3>
                    <p className="mb-0 text-muted">Total Clauses Agreed by Vendors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Vendor</th>
                    <th>Clauses Agreed</th>
                    <th>Total Clauses Responded</th>
                    <th>Agreement Rate</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard
                      .filter((row) => (row.clauses_agreed || 0) > 0)
                      .map((row) => {
                        const responded = row.clauses_responded || row.clauses_agreed || 0;
                        const agreed = row.clauses_agreed || 0;
                        const agreementRate = responded > 0 ? ((agreed / responded) * 100).toFixed(1) : 0;
                        return (
                          <tr key={row.vendor_id}>
                            <td className="fw-semibold">{row.name || "N/A"}</td>
                            <td><span className="badge bg-success">{agreed}</span></td>
                            <td><span className="badge bg-info">{responded}</span></td>
                            <td><span className="badge bg-primary">{agreementRate}%</span></td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  const vendorId = String(row.vendor_id || row.id || "");
                                  setSelectedVendors([vendorId]);
                                  fetchVendorStats([vendorId]);
                                }}
                                title="View Details"
                              >
                                <i className="fas fa-eye me-1"></i>View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No clause data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {selectedVendors.length === 1 && vendorDetail && (
          <div className="card border-primary mt-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-user-tie me-2 text-primary"></i>
                  Vendor Details - {vendorDetail?.vendor?.name || "N/A"}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedVendors([]);
                    setVendorDetail(null);
                  }}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Clauses Agreed:</strong> {vendorDetail?.clauses_agreed || 0}</p>
                  <p><strong>Clauses Responded:</strong> {vendorDetail?.clauses_responded || 0}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Agreement Rate:</strong> {
                    (vendorDetail?.clauses_responded || 0) > 0
                      ? (((vendorDetail?.clauses_agreed || 0) / (vendorDetail?.clauses_responded || 0)) * 100).toFixed(1)
                      : 0
                  }%</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* Queries & Deviations Tab */}
      {!loading && activeTab === "queries" && (
        <>
          <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
          <div className="card shadow-sm">
            <div className="card-body">
              <h4 className="card-title mb-4 fw-bold">
                <i className="fas fa-question-circle me-2 text-primary"></i>Queries & Deviations Statistics
              </h4>
            <div className="row mb-4">
              <div className="col-md-12">
                <div className="card border-warning">
                  <div className="card-body text-center">
                    <h3 className="text-warning">{overview?.total_queries_raised || 0}</h3>
                    <p className="mb-0 text-muted">Total Queries Raised by Vendors</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Vendor</th>
                    <th>Queries Raised</th>
                    <th>Queries by Vendor</th>
                    <th>Total Queries</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeaderboard.length > 0 ? (
                    filteredLeaderboard
                      .filter((row) => (row.queries_raised || 0) > 0)
                      .map((row) => (
                        <tr key={row.vendor_id}>
                          <td className="fw-semibold">{row.name || "N/A"}</td>
                          <td><span className="badge bg-warning">{row.queries_raised || 0}</span></td>
                          <td><span className="badge bg-info">{row.queries_by_vendor || 0}</span></td>
                          <td><span className="badge bg-primary">{(row.queries_raised || 0) + (row.queries_by_vendor || 0)}</span></td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => {
                                const vendorId = String(row.vendor_id || row.id || "");
                                setSelectedVendors([vendorId]);
                                fetchVendorStats([vendorId]);
                              }}
                              title="View Details"
                            >
                              <i className="fas fa-eye me-1"></i>View Details
                            </button>
                          </td>
                        </tr>
                      ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted py-4">No query data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        {selectedVendors.length === 1 && vendorDetail && (
          <div className="card border-primary mt-4 shadow-sm">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="card-title mb-0 fw-bold">
                  <i className="fas fa-user-tie me-2 text-primary"></i>
                  Vendor Details - {vendorDetail?.vendor?.name || "N/A"}
                </h5>
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedVendors([]);
                    setVendorDetail(null);
                  }}
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
              </div>
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Queries Raised:</strong> {vendorDetail?.queries_raised || 0}</p>
                  <p><strong>Queries by Vendor:</strong> {vendorDetail?.queries_by_vendor || 0}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Total Queries:</strong> {(vendorDetail?.queries_raised || 0) + (vendorDetail?.queries_by_vendor || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </>
      )}

      {/* Financial Analysis Tab */}
      {!financialLoading && activeTab === "financial" && (
        <>
          <FilterBar showVariant={true} showBuyer={true} showVendor={true} />
          
          {/* KPI Cards */}
          {financialData?.overall_stats && (
            <div className="row mb-4">
              <div className="col-md-3 mb-3">
                <div className="card border-primary">
                  <div className="card-body text-center">
                    <h3 className="text-primary">{financialData.overall_stats.total_quotes_submitted || 0}</h3>
                    <p className="mb-0 text-muted">Total Quotes Submitted</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card border-info">
                  <div className="card-body text-center">
                    <h3 className="text-info">{Number(financialData.overall_stats.avg_revisions || 0).toFixed(1)}</h3>
                    <p className="mb-0 text-muted">Avg Revisions</p>
                  </div>
                </div>
              </div>
              {(filters.product_id || filters.category_id) && financialData.overall_stats.avg_unit_price && (
                <>
                  <div className="col-md-3 mb-3">
                    <div className="card border-success">
                      <div className="card-body text-center">
                        <h3 className="text-success">
                          ₹{Number(financialData.overall_stats.avg_unit_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                        </h3>
                        <p className="mb-0 text-muted">Avg Price Quoted</p>
                        <small className="text-muted">(Filtered)</small>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-warning">
                      <div className="card-body text-center">
                        <h3 className="text-warning">{financialData.overall_stats.total_finalizations || 0}</h3>
                        <p className="mb-0 text-muted">Total Awards/Finalizations</p>
                        <small className="text-muted">(Filtered)</small>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {(!filters.product_id && !filters.category_id) && (
                <div className="col-md-3 mb-3">
                  <div className="card border-warning">
                    <div className="card-body text-center">
                      <h3 className="text-warning">{financialData.overall_stats.total_finalizations || 0}</h3>
                      <p className="mb-0 text-muted">Total Awards/Finalizations</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Price Range - Only when product/category is selected */}
          {(filters.product_id || filters.category_id) && financialData?.overall_stats?.min_unit_price && financialData?.overall_stats?.max_unit_price && (
            <div className="row mb-4">
              <div className="col-md-6 mb-3">
                <div className="card border-secondary">
                  <div className="card-body text-center">
                    <h5 className="text-secondary">
                      ₹{Number(financialData.overall_stats.min_unit_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </h5>
                    <p className="mb-0 text-muted">Min Price</p>
                  </div>
                </div>
              </div>
              <div className="col-md-6 mb-3">
                <div className="card border-secondary">
                  <div className="card-body text-center">
                    <h5 className="text-secondary">
                      ₹{Number(financialData.overall_stats.max_unit_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                    </h5>
                    <p className="mb-0 text-muted">Max Price</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Buyers */}
          {financialData?.top_buyers && Array.isArray(financialData.top_buyers) && financialData.top_buyers.length > 0 && (
            <div className="card mb-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3 fw-bold">
                  <FontAwesomeIcon icon={faChartLine} className="me-2 text-primary" />
                  Top Buyers by Interactions
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Buyer Name</th>
                        <th>Organization</th>
                        <th>Quotes Sent</th>
                        <th>Awards Given</th>
                        <th>Total Interactions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.top_buyers.map((buyer, idx) => (
                        <tr key={buyer.buyer_id || idx}>
                          <td>{idx + 1}</td>
                          <td className="fw-semibold">{buyer.buyer_name || "N/A"}</td>
                          <td>{buyer.buyer_organization || "N/A"}</td>
                          <td><span className="badge bg-info">{buyer.quotes_sent || 0}</span></td>
                          <td><span className="badge bg-success">{buyer.awards_given || 0}</span></td>
                          <td><span className="badge bg-primary">{buyer.total_interactions || 0}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Vendor Financial Leaderboard */}
          {financialData?.vendor_leaderboard && Array.isArray(financialData.vendor_leaderboard) && financialData.vendor_leaderboard.length > 0 && (
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3 fw-bold">
                  <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                  Vendor Financial Leaderboard
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Vendor Name</th>
                        <th>Company</th>
                        <th>Quotes Submitted</th>
                        <th>Avg Revisions</th>
                        <th>Avg Price</th>
                        <th>Finalizations</th>
                        <th>Top Buyer</th>
                        <th>Top Product</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.vendor_leaderboard.map((vendor, idx) => {
                        const topBuyer = Array.isArray(vendor.top_buyers) && vendor.top_buyers.length > 0 
                          ? vendor.top_buyers[0] 
                          : null;
                        const topProduct = Array.isArray(vendor.top_products) && vendor.top_products.length > 0 
                          ? vendor.top_products[0] 
                          : null;
                        return (
                          <tr key={vendor.vendor_id || idx}>
                            <td>{idx + 1}</td>
                            <td className="fw-semibold">{vendor.vendor_name || "N/A"}</td>
                            <td>{vendor.company_name || "N/A"}</td>
                            <td><span className="badge bg-primary">{vendor.total_quotes_submitted || 0}</span></td>
                            <td>{Number(vendor.avg_revisions || 0).toFixed(1)}</td>
                            <td>
                              {vendor.avg_unit_price && Number(vendor.avg_unit_price) > 0
                                ? `₹${Number(vendor.avg_unit_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                                : "N/A"}
                            </td>
                            <td><span className="badge bg-success">{vendor.total_finalizations || 0}</span></td>
                            <td>
                              {topBuyer ? (
                                <div>
                                  <div className="fw-semibold small">{topBuyer.buyer_name || "N/A"}</div>
                                  <small className="text-muted">{topBuyer.total_interactions || 0} interactions</small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              {topProduct ? (
                                <div>
                                  <div className="fw-semibold small">{topProduct.product_name || "N/A"}</div>
                                  <small className="text-muted">{topProduct.finalizations_count || 0} awards</small>
                                </div>
                              ) : (
                                <span className="text-muted">-</span>
                              )}
                            </td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => {
                                  const vendorId = String(vendor.vendor_id || "");
                                  setSelectedVendors([vendorId]);
                                  fetchVendorStats([vendorId]);
                                }}
                                title="View Details"
                              >
                                <FontAwesomeIcon icon={faEye} className="me-1" />View Details
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Product Summary - Only when product/category is selected */}
          {(filters.product_id || filters.category_id) && financialData?.product_summary && Array.isArray(financialData.product_summary) && financialData.product_summary.length > 0 && (
            <div className="card mt-3 shadow-sm">
              <div className="card-body">
                <h5 className="card-title mb-3 fw-bold">
                  <FontAwesomeIcon icon={faChartBar} className="me-2 text-primary" />
                  Product Financial Summary
                </h5>
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Product</th>
                        <th>Variant</th>
                        <th>Quotes</th>
                        <th>Finalizations</th>
                        <th>Avg Price</th>
                        <th>Avg Total Price</th>
                      </tr>
                    </thead>
                    <tbody>
                      {financialData.product_summary.map((product, idx) => (
                        <tr key={product.product_variant_id || idx}>
                          <td>{idx + 1}</td>
                          <td className="fw-semibold">{product.product_name || "N/A"}</td>
                          <td>{product.variant_name || "N/A"}</td>
                          <td><span className="badge bg-info">{product.quote_count || 0}</span></td>
                          <td><span className="badge bg-success">{product.finalization_count || 0}</span></td>
                          <td>
                            {product.avg_price && Number(product.avg_price) > 0
                              ? `₹${Number(product.avg_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                              : "N/A"}
                          </td>
                          <td>
                            {product.avg_total_price && Number(product.avg_total_price) > 0
                              ? `₹${Number(product.avg_total_price).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                              : "N/A"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {(!financialData || 
            ((!financialData.top_buyers || (Array.isArray(financialData.top_buyers) && financialData.top_buyers.length === 0)) && 
            (!financialData.vendor_leaderboard || (Array.isArray(financialData.vendor_leaderboard) && financialData.vendor_leaderboard.length === 0)))) && (
            <div className="text-center text-muted py-5">
              <FontAwesomeIcon icon={faChartLine} className="fa-3x mb-3 d-block" />
              <p>No financial data available</p>
            </div>
          )}
        </>
      )}

      {financialLoading && activeTab === "financial" && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="text-muted mt-2">Loading financial analysis...</p>
        </div>
      )}

      {/* Per Vendor Detail - Global Section */}
      {selectedVendors.length === 1 && vendorDetail && (
        <div id="vendor-detail-section" className="card border-primary mt-4 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="card-title mb-0 fw-bold">
                <i className="fas fa-user-tie me-2 text-primary"></i>
                Vendor Details {vendorDetail?.vendor?.name ? `- ${vendorDetail.vendor.name}` : ""}
              </h4>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-sm btn-outline-secondary"
                  onClick={() => {
                    setSelectedVendors([]);
                    setVendorDetail(null);
                  }}
                  title="Close details"
                >
                  <i className="fas fa-times me-1"></i>Close
                </button>
                <a
                  className="btn btn-sm btn-primary"
                  href={`/vendor-management/vendor-details/${selectedVendors[0]}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <i className="fas fa-external-link-alt me-1"></i>Open Full Profile
                </a>
              </div>
            </div>
            {selectedVendors.length === 1 && vendorLoading[selectedVendors[0]] ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="text-muted mt-2">Loading vendor details...</p>
              </div>
            ) : vendorDetail ? (
              <>
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card border-info border-top">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="text-muted text-uppercase fs-12 mb-1">Avg Response Time</p>
                            <h4 className="mb-0 fw-bold">{formatResponseTime(vendorDetail.avg_response_minutes, vendorDetail)}</h4>
                          </div>
                          <div className="text-info fs-2">
                            <i className="fas fa-clock"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-success border-top">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="text-muted text-uppercase fs-12 mb-1">Awards</p>
                            <h4 className="mb-0 fw-bold">{vendorDetail.awards ?? 0}</h4>
                          </div>
                          <div className="text-success fs-2">
                            <i className="fas fa-trophy"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-danger border-top">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="text-muted text-uppercase fs-12 mb-1">Regrets</p>
                            <h4 className="mb-0 fw-bold">{vendorDetail.regrets ?? 0}</h4>
                          </div>
                          <div className="text-danger fs-2">
                            <i className="fas fa-ban"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-secondary border-top">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-start">
                          <div>
                            <p className="text-muted text-uppercase fs-12 mb-1">Avg Delivery Period</p>
                            <h4 className="mb-0 fw-bold">{formatDeliveryPeriod(vendorDetail.avg_delivery_period)}</h4>
                          </div>
                          <div className="text-secondary fs-2">
                            <i className="fas fa-truck"></i>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-7 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body p-4">
                        <h4 className="card-title mb-4 fw-bold">
                          <i className="fas fa-chart-bar me-2 text-info"></i>Activity Timeline
                        </h4>
                        {vendorTimelineData.labels.length > 0 ? (
                          <div style={{ height: "450px", position: "relative", minHeight: "450px" }}>
                            <Bar data={vendorTimelineData} options={barChartOptions} />
                          </div>
                        ) : (
                          <div className="text-center text-muted py-5" style={{ minHeight: "450px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                            <i className="fas fa-chart-bar fa-3x mb-3"></i>
                            <p>No timeline data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-5 mb-4">
                    <div className="card h-100 shadow-sm">
                      <div className="card-body p-4">
                        <h4 className="card-title mb-4 fw-bold">
                          <i className="fas fa-box me-2 text-warning"></i>Top Products
                        </h4>
                        <div className="table-responsive">
                          <table className="table table-sm table-hover align-middle mb-0">
                            <thead className="table-light">
                              <tr>
                                <th>#</th>
                                <th>Product Name</th>
                                <th className="text-end">
                                  <i className="fas fa-check-circle text-success me-1"></i>Finalizations
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {vendorDetail.top_products?.length ? (
                                vendorDetail.top_products.map((prod, idx) => (
                                  <tr key={prod.product_id}>
                                    <td className="text-muted">{idx + 1}</td>
                                    <td className="fw-semibold">{prod.product_name || "N/A"}</td>
                                    <td className="text-end">
                                      <span className="badge bg-success">{prod.finalized_count ?? 0}</span>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan="3" className="text-center text-muted py-4">
                                    <i className="fas fa-inbox fa-2x mb-2 d-block"></i>
                                    No product data available
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
              </>
            ) : (
              <div className="text-center text-muted py-5">
                <i className="fas fa-exclamation-circle fa-3x mb-3"></i>
                <p>No vendor details available</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorStatsDashboard;

