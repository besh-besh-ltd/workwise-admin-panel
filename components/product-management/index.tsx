import React, { useCallback, useEffect, useState, ChangeEvent, MouseEvent } from "react";
import { useRouter, NextRouter } from "next/router";
import { getAllProducts, deleteProduct, rejectListProduct, acceptProduct, mapVendorWithProduct, mapVariantWithVendor, getCategories, getAdminUsersList, searchProductsV2, searchAllVariants, getVariantMappings, acceptVariant, getParentCategories, deleteVariantVendorMapping } from "@/utils/services/product-management";
import axiosFormData from "@/utils/axios/form-data";
import FullLoading from "../loading/FullLoading";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { productExport } from "@/utils/services/product-management";
import DisapproveModal from "../modal/disapprove-modal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Select, { components, SingleValue, MultiValue } from "react-select";
import { vendorApproveList } from "@/utils/services/rfq";
import { vendorList } from "@/utils/services/rfq";
import { getAdminProfile } from "@/utils/services/login";
import AddVariantModal from '../modal/AddVariantModal';
import { getProductVariants } from '../../utils/services/product-management';
import MapVariantVendorModal from "../modal/MapVariantVendorModal";

// Type definitions
interface SelectOption {
  label: string;
  value: string | number;
  email?: string;
  phone?: string;
  slug?: string;
  role?: string;
  categories?: string;
  description?: string;
  similarity_score?: number;
  rank?: number;
  data?: any;
}

interface ProductCategory {
  id: number;
  category_name: string;
}

interface ProductImage {
  id: number;
  product_image_url: string;
  is_featured: number;
}

interface Product {
  id: number;
  name: string;
  description?: string;
  manufacturer?: string;
  availability?: number;
  status: number;
  is_approve: number;
  is_featured?: number;
  is_deleted?: number;
  vendor?: number;
  vendor_name?: string;
  vendor_approved_by?: any;
  approved_by?: string;
  approved_at?: string;
  added_by?: number;
  created_at: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  product_categories: ProductCategory[];
  product_images?: ProductImage[];
  product_variants?: any[];
  isChecked?: boolean;
  reject_reason?: string;
  company_id?: number | null;
  owner_company?: string | null;
}

interface Variant {
  id: number;
  name?: string;
  variant_name?: string;
  product_name?: string;
  product_id?: number;
  category_names?: string[];
  category_info?: string;
  is_approve?: number;
  created_at?: string;
  created_at_formatted?: string;
  created_by?: string | number;
  updated_at?: string;
  updated_by?: string | number;
  approved_at?: string;
  approved_by?: string | number;
  reject_reason?: string;
  isChecked?: boolean;
}

interface Mapping {
  id: number;
  mapping_id?: number;
  name?: string;
  variant_name?: string;
  variant_id?: number;
  product_name?: string;
  category_info?: string;
  category_names?: string[];
  vendor_id?: number;
  vendor_name?: string;
  vendor_display_name?: string;
  vendor_email?: string;
  mapped_at?: string;
  mapped_at_formatted?: string;
  mapped_at_approved?: string;
  is_mapped?: boolean;
  is_approve?: number;
  reject_reason?: string;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
  approved_at?: string;
  approved_by?: string;
}

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface TotalCount {
  page: number;
  total: number;
  total_count: number;
  filtered_count?: number;
  is_filtered?: boolean;
}

interface FilterValues {
  searchString: string;
  approveVendor: string;
  vendor: string;
  featured: string;
  category: string;
  addedBy: string;
  dateFrom: string;
  dateTo: string;
  approvalStatus: string;
  startDate: string;
  endDate: string;
  variant: string;
  productSource: string;
}

interface ProductMapObj {
  product: SelectOption | null;
  vendor: SelectOption | null;
  approved_by: SelectOption | null;
}

interface ProductError {
  Row: number;
  productName?: string;
  vendorName?: string;
  vendorEmail?: string;
  errors?: string | string[];
  error?: string | string[];
}

interface ReasonItem {
  id: number;
  reject_reason: string;
}

// Modified Select Component to show email along with vendor Name
const CustomSelectOption: React.FC<any> = (props) => (
  <components.Option {...props}>
    <div>
   <strong> {props?.data?.label } </strong>
      <br />
      <p className="row">
        <small>{props?.data?.email}</small>
        <small className="ms-3">{props?.data?.phone}</small>
      </p>
    </div>
  </components.Option>
);


const ProductManagement: React.FC = () => {
  const router: NextRouter = useRouter();
  const id = Date.now().toString();

  const limit = 10;

  const [enableBulkUpload, setEnableBulkUpload] = useState<boolean>(false);
  const [enableBulkProdUpload, setEnableBulkProdUpload] = useState<boolean>(false);
  const [loading, setloading] = useState<boolean>(false);
  const [products, setproducts] = useState<Product[]>([]);
  const [vendorOptions, setVendorOptions] = useState<SelectOption[]>([]);
  const [productData, setProductData] = useState<Product[]>([]);
  const [updateProduct, setUpdateProduct] = useState<string>("");
  const [page, setPage] = useState<number>(parseInt(router.query.page as string) || 1);
  const [totalPages, settotalPages] = useState<number | null>(null);
  const [selectedProductId, setselectedProductsId] = useState<string | number>('');
  const [reasonList, setReasonList] = useState<ReasonItem[]>([]);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>((router.query.tab as string) || 'products');
  const [variantsPage, setVariantsPage] = useState<number>(parseInt(router.query.variantsPage as string) || 1);
  const [variantsLimit, setVariantsLimit] = useState<number>(10);
  const [variantsTotalPages, setVariantsTotalPages] = useState<number | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [variantsPaginationMeta, setVariantsPaginationMeta] = useState<PaginationMeta | null>(null);
  const [loadingVariants, setLoadingVariants] = useState<boolean>(false);
  const [mappingsPage, setMappingsPage] = useState<number>(parseInt(router.query.mappingsPage as string) || 1);
  const [mappingsLimit, setMappingsLimit] = useState<number>(10);
  const [mappingsTotalPages, setMappingsTotalPages] = useState<number | null>(null);
  const [mappings, setMappings] = useState<Mapping[]>([]);
  const [mappingsPaginationMeta, setMappingsPaginationMeta] = useState<PaginationMeta | null>(null);
  const [loadingMappings, setLoadingMappings] = useState<boolean>(false);

  const [vendorSearchTerm, setVendorSearchTerm] = useState<string>("")
  const [searchString, setSearchString] = useState<string>((router.query.search as string) || '');
  const [selectedApproveVendor, setSelectedApproveVendor] = useState<string>((router.query.approveVendor as string) || "");
  const [selectedVendor, setSelectedVendor] = useState<string>((router.query.vendor as string) || "");
  const [selectedFeatured, setSelectedFeatured] = useState<string>((router.query.featured as string) || "");
  const [userType, setUserType] = useState<number | null>(null);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>((router.query.category as string) || "");
  const [selectedAddedBy, setSelectedAddedBy] = useState<string>((router.query.addedBy as string) || "");
  const [addedByOptions, setAddedByOptions] = useState<SelectOption[]>([]);
  const [dateFrom, setDateFrom] = useState<string>((router.query.dateFrom as string) || "");
  const [dateTo, setDateTo] = useState<string>((router.query.dateTo as string) || "");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState<string>((router.query.approvalStatus as string) || "");
  const [variantsFilterData, setVariantsFilterData] = useState<SelectOption[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>((router.query.variant as string) || "");

  const [filterValues, setFilterValues] = useState<FilterValues>({
    searchString: (router.query.search as string) || '',
    approveVendor: (router.query.approveVendor as string) || "",
    vendor: (router.query.vendor as string) || "",
    featured: (router.query.featured as string) || "",
    category: (router.query.category as string) || "",
    addedBy: (router.query.addedBy as string) || "",
    dateFrom: (router.query.dateFrom as string) || "",
    dateTo: (router.query.dateTo as string) || "",
    approvalStatus: (router.query.approvalStatus as string) || "",
    startDate: (router.query.startDate as string) || "",
    endDate: (router.query.endDate as string) || "",
    variant: (router.query.variant as string) || "",
    productSource: (router.query.productSource as string) || ""
  });

  const [productSearchTerm, setProductSearchTerm] = useState<string>('');

  const handleFilterChange = (type: string, selectedOption: SingleValue<SelectOption> | string | null): void => {
    const value = selectedOption && typeof selectedOption === 'object' ? selectedOption.value : selectedOption;

    setFilterValues(prev => ({
      ...prev,
      [type]: value || ""
    }));
  };

  const handleSearch = (e: ChangeEvent<HTMLInputElement>): void => {
    setFilterValues(prev => ({
      ...prev,
      searchString: e.target.value
    }));
  };

  const handleSearchClick = (): void => {
    setPage(1);

    updateUrlParams({
      page: 1,
      search: filterValues.searchString,
      approveVendor: filterValues.approveVendor,
      vendor: filterValues.vendor,
      featured: filterValues.featured,
      category: filterValues.category,
      addedBy: filterValues.addedBy,
      dateFrom: filterValues.dateFrom,
      dateTo: filterValues.dateTo,
      approvalStatus: filterValues.approvalStatus,
      variant: filterValues.variant
    });

    if (activeTab === 'variants') {
      getAllVariants();
    } else if (activeTab === 'mappings') {
      getAllMappings();
    } else {
      getProducts();
    }
  };

  const resetFilters = (): void => {
    setFilterValues({
      searchString: "",
      approveVendor: "",
      vendor: "",
      featured: "",
      category: "",
      addedBy: "",
      dateFrom: "",
      dateTo: "",
      approvalStatus: "",
      startDate: "",
      endDate: "",
      variant: "",
      productSource: ""
    });

    setPage(1);
    setVariantsPage(1);
    setMappingsPage(1);
  };

  const [inputValue, setInputValue] = useState<string>("");
  const [selectVal, setSelectValue] = useState<string>("");
  const [productWithVendorErrors, setProductWithVendorErrors] = useState<ProductError[] | null>(null);
  const [productErrors, setProductErrors] = useState<ProductError[] | null>(null);

  const [mapMultipleProductsWithVendor, setMapMultipleProductsWithVendor] = useState<any[]>([])

  const [productLoading, setProductLoading] = useState<boolean>(false);
  const [vendorApprovedList, setVendorApprovedList] = useState<SelectOption[]>([]);
  const [vendorProductsList, setVendorProductsList] = useState<SelectOption[]>([]);
  const [openProductMap, setOpenProductMap] = useState<boolean>(false);
  const [productMapObj, setproductMapObj] = useState<ProductMapObj>({
    product: null,
    vendor: null,
    approved_by: null
  });
  const [totalCount, setTotalCount] = useState<TotalCount>({ page: 0, total: 0, total_count: 0 });
  const [pageSearchInput, setPageSearchInput] = useState<string>("");

  const approvalStatusOptions: SelectOption[] = [
    { label: 'Approved', value: '1' },
    { label: 'Disapproved', value: '0' }
  ];

  const customSelectStyles = {
    control: (base: any) => ({
      ...base,
      height: "30px",
      borderRadius: "6px",
      paddingLeft: "10px",
    }),
  };

  const isFeaturesArray: SelectOption[] = [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '0' },
  ]

  const handleInputDisapprove = (e: ChangeEvent<HTMLInputElement>): void => {
    setInputValue(e.target.value);
  }
  const handleSelect = (e: ChangeEvent<HTMLSelectElement>): void => {
    setSelectValue(e.target.value);
  }


  const openRejectModal = (id: string | number): void => {
    const processedId = typeof id === 'string' && id.startsWith('mapping_')
      ? id
      : (typeof id === 'number' && activeTab === 'mappings' ? `mapping_${id}` : id);

    setShowRejectModal(true);
    setselectedProductsId(processedId);
  }

  const handleUnmapMapping = (mappingId: number | undefined): void => {
    if (!mappingId) {
      toast.error("Mapping ID is required");
      return;
    }

    if (!window.confirm("Are you sure you want to unmap this variant from the vendor? This action cannot be undone.")) {
      return;
    }

    deleteVariantVendorMapping(mappingId)
      .then((res: any) => {
        toast.success(res.message || "Mapping deleted successfully");
        getAllMappings();
      })
      .catch((error: any) => {
        console.error("Error unmapping:", error);
        let txt = "Failed to unmap variant from vendor";
        if (error.error?.response?.data?.message) {
          txt = error.error.response.data.message;
        } else if (error.message) {
          txt = error.message;
        }
        toast.error(txt);
      });
  }

  const handlePageClick = (e: any): void => {
    if (e.selected === undefined) {
      const isNext = e.nextSelectedPage !== undefined;
      handleEllipsisClick(isNext);
    } else {
      const newPage = e.selected + 1;
      setPage(newPage);
      updateUrlParams({
        page: newPage,
        search: searchString,
        approveVendor: selectedApproveVendor,
        vendor: selectedVendor,
        featured: selectedFeatured,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo
      });
    }
  };

  const handlePageSearchInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setPageSearchInput(value);
    }
  };

  const handlePageSearchSubmit = (): void => {
    const pageNum = parseInt(pageSearchInput);
    const maxPage = Math.ceil(totalCount.total_count / limit);

    if (pageNum && pageNum >= 1 && pageNum <= maxPage) {
      setPage(pageNum);
      updateUrlParams({
        page: pageNum,
        search: searchString,
        approveVendor: selectedApproveVendor,
        vendor: selectedVendor,
        featured: selectedFeatured,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo
      });
    } else {
      toast.error(`Please enter a valid page number between 1 and ${maxPage}`);
    }
  };

  const handleEllipsisClick = (isNext: boolean): void => {
    const totalPageCount = Math.ceil(totalCount.total_count / limit);
    const currentPage = page;


    if (isNext) {
      const middlePage = Math.floor((currentPage + totalPageCount) / 2);
      setPage(middlePage);
      updateUrlParams({
        page: middlePage,
        search: searchString,
        approveVendor: selectedApproveVendor,
        vendor: selectedVendor,
        featured: selectedFeatured,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo
      });
    } else {
      const middlePage = Math.floor((1 + currentPage) / 2);
      setPage(middlePage);
      updateUrlParams({
        page: middlePage,
        search: searchString,
        approveVendor: selectedApproveVendor,
        vendor: selectedVendor,
        featured: selectedFeatured,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo
      });
    }
  };

  const getUserProfile = async (): Promise<void> => {
    try {
      const res : any = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.error(error);
    }
  }

  const fetchVendors = async (): Promise<void> => {
      try {
        const vendorsResponse : any = await vendorList(vendorSearchTerm);

        if (vendorsResponse?.data) {
          const options: SelectOption[] = vendorsResponse.data.map((vendor: any) => ({
            label: vendor.organization_name ?? '-',
            value: vendor.id,
            email: vendor.email || "Email Not Available",
            phone: vendor.mobile || "Phone Not Available"
          }));
          setVendorOptions(options);
        } else {
          console.error("Invalid vendor response:", vendorsResponse);
          toast.error('Failed to load vendors: Invalid response');
        }
      } catch (error: any) {
        console.error('Error fetching vendors:', error);
        toast.error('Failed to load vendors');
      }
    };

  const getReasonList = (): void => {
    rejectListProduct()
      .then((res: any) => {
        setReasonList(res?.data)
      })
      .catch((error: any) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      })
  }

  const handleAcceptRejectProduct = (id: string | number, status: string | { status: string; reject_reason_id?: number; reject_reason?: string }, reject_reason_id: number | null = null): void => {
    const processedId = typeof id === 'string' && id.startsWith('mapping_')
      ? id
      : (typeof id === 'number' && activeTab === 'mappings' ? `mapping_${id}` : id);

    let statusValue: string = typeof status === 'string' ? status : status.status;
    let rejectReasonId: number | null = reject_reason_id;
    let rejectReason: string | null = null;

    if (typeof status === 'object' && status !== null) {
      statusValue = status.status;
      rejectReasonId = status.reject_reason_id || null;
      rejectReason = status.reject_reason || null;
    }

    acceptProduct(processedId, statusValue, rejectReasonId, rejectReason)
      .then((res: any) => {
        setShowRejectModal(false);
        setselectedProductsId("")
        setInputValue("")
        setSelectValue("")
        toast.success(res.message || `Product ${statusValue === '1' || statusValue === '1' ? 'approved' : 'rejected'} successfully`);
        if (typeof processedId === 'string' && processedId.startsWith('mapping_')) {
          getAllMappings();
        } else if (activeTab === 'variants') {
          getAllVariants();
        } else {
          getProducts();
        }
        getReasonList();
      })
      .catch((error: any) => {
        console.error("Error in handleAcceptRejectProduct:", error);
        let txt = "";
        if (error.error?.response?.data?.errors) {
          for (let x in error.error.response.data.errors) {
            txt = error.error.response.data.errors[x];
          }
        } else if (error.error?.response?.data?.message) {
          txt = error.error.response.data.message;
        } else if (error.error?.message) {
          txt = error.error.message;
        } else {
          txt = "An error occurred during approval/rejection";
        }
        toast.error(txt);
      })
  }

  const handleAcceptRejectVariant = (id: string | number, status: string | { status: string; reject_reason_id?: number }, reject_reason_id: number | null = null): void => {
    const processedId = typeof id === 'string' && id.startsWith('mapping_')
      ? id
      : (typeof id === 'number' && activeTab === 'mappings' ? `mapping_${id}` : id);

    let statusValue: string = typeof status === 'string' ? status : status.status;
    let rejectReasonId: number | null = reject_reason_id;

    if (typeof status === 'object' && status !== null) {
      statusValue = status.status;
      rejectReasonId = status.reject_reason_id || null;
    }


    acceptVariant(processedId, statusValue, rejectReasonId)
      .then((res: any) => {
        setShowRejectModal(false);
        setselectedProductsId("")
        setInputValue("")
        setSelectValue("")
        toast.success(res.message || `Variant ${statusValue === '1' || statusValue === '1' ? 'approved' : 'rejected'} successfully`);
        if (typeof processedId === 'string' && processedId.startsWith('mapping_')) {
          getAllMappings();
        } else if (activeTab === 'variants') {
          getAllVariants();
        } else {
          getProducts();
        }
        getReasonList();
      })
      .catch((error: any) => {
        console.error("Error in handleAcceptRejectProduct:", error);
        let txt = "";
        if (error.error?.response?.data?.errors) {
          for (let x in error.error.response.data.errors) {
            txt = error.error.response.data.errors[x];
          }
        } else if (error.error?.response?.data?.message) {
          txt = error.error.response.data.message;
        } else if (error.error?.message) {
          txt = error.error.message;
        } else {
          txt = "An error occurred during approval/rejection";
        }
        toast.error(txt);
      })
  }


  const getProducts = (): void => {
    setloading(true);

    const params = {
      searchString: filterValues.searchString,
      selectedApproveVendor: filterValues.approveVendor,
      selectedVendor: filterValues.vendor,
      selectedFeatured: filterValues.featured,
      selectedAddedBy: filterValues.addedBy,
      selectedCategory: filterValues.category,
      dateFrom: filterValues.dateFrom,
      dateTo: filterValues.dateTo,
      selectedApprovalStatus: filterValues.approvalStatus,
      onlyAddedByAdmin: filterValues.addedBy,
      productSource: filterValues.productSource
    }

    getAllProducts(
      limit,
      page,
      params.searchString,
      params.selectedApproveVendor,
      params.selectedVendor,
      params.selectedFeatured,
      params.selectedAddedBy,
      params.selectedCategory,
      params.dateFrom,
      params.dateTo,
      params.selectedApprovalStatus,
      params.onlyAddedByAdmin,
      params.productSource
    )
      .then((res: any) => {
        setloading(false);
        const productsData = res.data || [];

        const calculatedTotalPages = Math.max(res.page, (Math.ceil(res.filtered_count / limit)));

        if (page > calculatedTotalPages) {
          setPage(1);
          updateUrlParams({
            page: 1,
            search: searchString,
            approveVendor: selectedApproveVendor,
            vendor: selectedVendor,
            featured: selectedFeatured,
            category: selectedCategory,
            addedBy: selectedAddedBy,
            dateFrom: dateFrom,
            dateTo: dateTo,
            approvalStatus: selectedApprovalStatus
          });
          return;
        }

        settotalPages(calculatedTotalPages);

        setTotalCount({
          page: res.page || 0,
          total: res.pages || 0,
          total_count: res.filtered_count || 0,
          filtered_count: res.filtered_count || 0,
          is_filtered: Boolean(searchString || selectedApproveVendor || selectedVendor ||
            selectedFeatured || selectedCategory || selectedAddedBy || dateFrom ||
            dateTo || selectedApprovalStatus)
        });

        console.log("PRODUCT DATA ------- ", productsData)

        setproducts(productsData);
        setProductData(productsData);
      })
      .catch((err: any) => {
        console.error("Error fetching products:", err);
        setloading(false);
        setproducts([]);
        setTotalCount({
          page: 0,
          total: 0,
          total_count: 0,
          filtered_count: 0,
          is_filtered: false
        });
        settotalPages(0);
      });
  };

  const getSubCats = (item: Product): React.ReactElement | string => {
    let cats: React.ReactElement | string = "";
    if (item.product_categories.length > 1) {
      item.product_categories.map((cat, index) => {
        if (index > 0) {
          cats = (
            <>
              {cats}
              <span className="badge badge-primary">{cat.category_name}</span>
            </>
          );
        }
      });
    }
    return cats;
  };

  const selectProduct = (e: ChangeEvent<HTMLInputElement>, citem: Product): void => {
    let pp: Product[] = [];
    pp = products.map((item) => {
      if (item.id === citem.id) {
        item.isChecked = e.target.checked;
      }
      return item;
    });
    setproducts(pp);
  };
  const selectAllProduct = (e: ChangeEvent<HTMLInputElement>, item?: Product): void => {
    let pp: Product[] = [];
    if (e.target.checked) {
      pp = products.map((item) => {
        item.isChecked = true;
        return item;
      });
    } else {
      pp = products.map((item) => {
        item.isChecked = false;
        return item;
      });
    }
    setproducts(pp);
  };

  const handleExport = (): void => {
    let pp: number[] = [];
    products.map((item) => {
      if (item.isChecked) {
        pp.push(item.id);
      }
    });

    if (pp.length > 0) {
      let post_data = { product_id: pp };
      productExport(post_data).then((response: any) => {
        window.open(response.download_url);
      });
    } else {
      toast.error("No items are selected!");
    }
  };

  const handleUpdateProduct = (item: Product): void => {
    router.push(`/product-management/edit-product/${item.id}`);
    setUpdateProduct(item.id.toString());
  };


  const getVendorApproveList = (): void => {
    vendorApproveList()
      .then((res: any) => {
        let approved_options: SelectOption[] = res.data.map((s: any) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setVendorApprovedList(approved_options);
      })
      .catch((error: any) => {
        console.error(error)
      });
  };

  const formatGroupedData = (groupedData: any): SelectOption[] => {
    return Object.values(groupedData).flatMap((items: any) =>
      items.map((item: any) => ({
        value: item.id,
        label: item.name,
        categories: item.product_categories.map((cat: ProductCategory) => cat.category_name).join(" | ")
      }))
    );
  }


  const getVendorProductList = useCallback((search_key: string): void => {
    setProductSearchTerm(search_key);

    if (search_key.length < 3) {
      setVendorProductsList([]);
      setProductLoading(false);
      return;
    }

    setProductLoading(true);
    setproductMapObj((prevState) => ({
      ...prevState,
      product: null,
    }));

    setVendorProductsList([]);

    searchProductsV2({
      search_key: search_key,
      cat_id: "",
      vendor_name: ""
    }, "products")
      .then((res: any) => {
        const products = res.data || [];
        const formattedProducts: SelectOption[] = products.map((item: any) => ({
          value: item.product_id,
          label: item.product_name,
          description: item.description,
          categories: item.category_name,
          similarity_score: item.similarity_score,
          rank: item.rank
        }));

        setVendorProductsList(formattedProducts);
      })
      .catch((error: any) => {
        console.error(error);
      })
      .finally(() => setProductLoading(false));
  }, []);


  const handleOpenProductMap = (): void => {

    setOpenProductMap(true);
    setIsVariantMapping(true);

    setproductMapObj({
      product: null,
      vendor: null,
      approved_by: null
    });

    setMapMultipleProductsWithVendor([]);

    setLoadingVariants(true);


    searchAllVariants(id, null, null, null, null, null, null, null, 1, 100)
      .then((response: any) => {
        if (response?.data?.data) {
          const variants = response.data.data || [];

          const formattedVariants: SelectOption[] = variants.map((variant: any) => ({
            value: variant.id,
            label: `${variant.variant_name || variant.name} (${variant.product_name || 'Unknown Product'})`,
            data: variant
          }));

          setVariantsList(formattedVariants);
        } else {
          setVariantsList([]);
        }
      })
      .catch((error: any) => {
        console.error("Error loading variants:", error);
        toast.error("Failed to load variants");
        setVariantsList([]);
      })
      .finally(() => {
        setLoadingVariants(false);
      });
  };


  const updateUrlParams = (newParams: Record<string, any>): void => {
    const url = new URL(window.location.href);
    const updatedSearchParams = new URLSearchParams(url.search);

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        updatedSearchParams.delete(key);
      } else {
        updatedSearchParams.set(key, value);
      }
    });


    router.push(
      { pathname: router.pathname, query: Object.fromEntries(updatedSearchParams) },
      undefined,
      { shallow: true }
    );
  };

  const handleTabChange = (tabName: string): void => {
    setActiveTab(tabName);

    if (tabName === 'products') {
      setPage(1);
    } else if (tabName === 'variants') {
      setVariantsPage(1);
    } else if (tabName === 'mappings') {
      setMappingsPage(1);
    }
    resetFilters();
  };

  const getAllVariants = (): void => {
    setLoadingVariants(true);

    const params = {
      page: variantsPage,
      limit: variantsLimit,
      search: filterValues.searchString,
      category_id: filterValues.category,
      added_by: filterValues.addedBy,
      date_from: filterValues.dateFrom,
      date_to: filterValues.dateTo,
      is_approve: filterValues.approvalStatus
    };

    try {
      searchAllVariants(
        null,
        params.search,
        params.date_from,
        params.date_to,
        null,
        params.category_id,
        params.added_by,
        params.is_approve,
        params.page,
        params.limit
      )
        .then((response: any) => {
          if (response && response.data && response.pagination) {
            const variantsData = response.data;
            const paginationData = response.pagination;

            if (variantsData && Array.isArray(variantsData)) {
              const formattedVariants: Variant[] = variantsData.map((variant: any) => ({
                ...variant,
                variant_name: variant.name || `Variant #${variant.id}`,
                product_name: variant.product_name || 'Unknown Product',
                category_info: Array.isArray(variant.category_names) ? variant.category_names.join(', ') : 'No Category',
                created_at_formatted: variant.created_at ? new Date(variant.created_at).toLocaleString() : 'N/A'
              }));

              setVariants(formattedVariants);
              setVariantsPaginationMeta(paginationData)

              setVariantsTotalPages(paginationData.pages || 1);

            } else {
              console.warn('Variant data received is not an array:', variantsData);
              setVariants([]);
              setVariantsTotalPages(1);
            }
          } else {
            console.error('Invalid response structure from searchAllVariants:', response);
            setVariants([]);
            setVariantsTotalPages(1);
            toast.error('Failed to load variants due to invalid response format.');
          }
        })
        .catch((error: any) => {
          console.error("Error fetching variants:", error);
          toast.error('Failed to load variants.');
          setVariants([]);
          setVariantsTotalPages(1);
        })
        .finally(() => {
          setLoadingVariants(false);
        });
    } catch (error) {
      console.error("Error calling searchAllVariants:", error);
      toast.error('An unexpected error occurred while fetching variants.');
      setVariants([]);
      setVariantsTotalPages(1);
      setLoadingVariants(false);
    }
  };

  const getVariantsForFilter = (): void => {
    if (variantsFilterData.length > 0) {
      return;
    }

    setLoadingVariants(true);
    searchAllVariants(
      null,
      "",
      null,
      null,
      null,
      null,
      null,
      null,
      1,
      10000
    )
      .then((response: any) => {

        if (response && response.data) {
          const variantsData = response.data;
          formatVariantsForDropdown(variantsData);
        } else {
          console.warn('No data received from searchAllVariants for dropdown.');
          setVariantsFilterData([]);
        }
      })
      .catch((error: any) => {
        console.error("Error fetching variants for dropdown:", error);
        setVariantsFilterData([]);
      })
      .finally(() => {
        setLoadingVariants(false);
      });
  };

  const formatVariantsForDropdown = (variantsData: any[]): void => {
    if (variantsData && Array.isArray(variantsData)) {
      const formattedVariants: SelectOption[] = variantsData.map((variant: any) => ({
        value: variant.id,
        label: variant.name || variant.variant_name || `Variant #${variant.id}`
      }));
      setVariantsFilterData(formattedVariants);
    }
  };

  const getAllMappings = (): void => {
    setLoadingMappings(true);

    const params = {
      page: mappingsPage,
      limit: mappingsLimit,
      search: filterValues.searchString,
      vendor_id: filterValues.vendor,
      category_id: filterValues.category,
      added_by: filterValues.addedBy,
      date_from: filterValues.dateFrom,
      date_to: filterValues.dateTo,
      approval_status: filterValues.approvalStatus,
      variant_id: filterValues.variant
    };

    try {
      getVariantMappings(
        null,
        params.search || "",
        params.date_from,
        params.date_to,
        params.vendor_id,
        params.category_id,
        params.added_by,
        params.approval_status,
        params.page,
        params.limit,
        params.variant_id
      )
        .then((response: any) => {

          let mappingsData: any[] = [];
          let paginationData: any = {};

          if (Array.isArray(response)) {
            mappingsData = response;
            paginationData = {
              total: mappingsData.length * 10,
              page: params.page,
              limit: params.limit,
              pages: Math.ceil(mappingsData.length * 10 / params.limit)
            };
          } else if (response?.data) {
            if (Array.isArray(response.data)) {
              mappingsData = response.data;
              paginationData = response.pagination || {};
            } else if (response.data.data && Array.isArray(response.data.data)) {
              mappingsData = response.data.data;
              paginationData = response.data.pagination || {};
            }
          }


          if (mappingsData && mappingsData.length > 0) {
            let formattedMappings: Mapping[] = mappingsData.map((mapping: any) => {
              const vendorName = mapping.vendor_display_name || mapping.vendor_name || 'Unknown Vendor';

              return {
                id: mapping.variant_id || mapping.id,
                mapping_id: mapping.mapping_id || mapping.id,
                name: mapping.variant_name || mapping.name || `Variant ID: ${mapping.variant_id || mapping.id}`,
                product_name: mapping.product_name || 'Unknown Product',
                category_info: mapping.category_names ? mapping.category_names.join(', ') : '',
                vendor_id: mapping.vendor_id,
                vendor_name: vendorName,
                vendor_email: mapping.vendor_email || 'N/A',
                mapped_at: mapping.mapped_at || mapping.created_at,
                updated_at: mapping.updated_at,
                approved_by: mapping.approved_by || 'N/A',
                approved_at: mapping.updated_at,
                mapped_at_approved: mapping.approved_at ? new Date(mapping.approved_at).toLocaleString() : '-',
                is_mapped: true,
                is_approve: mapping.is_approve || 0,
                reject_reason: mapping.reject_reason,
                created_by: mapping.created_by,
                updated_by: mapping.updated_by
              };
            });

            setMappings(formattedMappings);
            setMappingsPaginationMeta(paginationData);

            let totalPages = 1;

            if (paginationData.pages && paginationData.pages > 0) {
              totalPages = paginationData.pages;
            } else if (paginationData.total) {
              totalPages = Math.ceil(paginationData.total / params.limit);
            } else if (formattedMappings.length > 0) {
              totalPages = Math.max(1, Math.ceil(formattedMappings.length / params.limit) * 10);
            }

            setMappingsTotalPages(totalPages);
          } else {
            setMappings([]);
            setMappingsTotalPages(1);
          }
        })
        .catch((error: any) => {
          toast.error("Failed to fetch mappings");
          setMappings([]);
          setMappingsTotalPages(1);
        })
        .finally(() => {
          setLoadingMappings(false);
        });
    } catch (error) {
      setLoadingMappings(false);
      setMappings([]);
      setMappingsTotalPages(1);
    }
  };

  const handleVariantsPageClick = (event: any): void => {
    const selectedPage = event.selected + 1;
    setVariantsPage(selectedPage);

    updateUrlParams({
      variantsPage: selectedPage,
      tab: 'variants',
      search: searchString,
      startDate: filterValues.startDate,
      endDate: filterValues.endDate
    });

  };

  const handleMappingsPageClick = (event: any): void => {
    try {
      if (event.selected === undefined) {
        const isNext = event.nextSelectedPage !== undefined;
        handleMappingsEllipsisClick(isNext);
      } else {
        const selectedPage = event.selected + 1;
        setMappingsPage(selectedPage);

        updateUrlParams({
          mappingsPage: selectedPage,
          tab: 'mappings',
          search: searchString,
          vendor: selectedVendor,
          category: selectedCategory,
          addedBy: selectedAddedBy,
          dateFrom: dateFrom,
          dateTo: dateTo,
          approvalStatus: selectedApprovalStatus
        });

        setLoadingMappings(true);

        const params = {
          page: selectedPage,
          limit: mappingsLimit,
          search: searchString || "",
          start_date: filterValues.startDate ? new Date(filterValues.startDate).toISOString() : null,
          end_date: filterValues.endDate ? new Date(filterValues.endDate).toISOString() : null,
          vendor_id: selectedVendor,
          category_id: selectedCategory,
          added_by: selectedAddedBy,
          approval_status: selectedApprovalStatus,
          variant_id: filterValues.variant
        };

        getVariantMappings(
          null,
          params.search || "",
          params.start_date,
          params.end_date,
          params.vendor_id,
          params.category_id,
          params.added_by,
          params.approval_status,
          params.page,
          params.limit,
          params.variant_id
        )
          .then((response: any) => {
            let mappingsData: any[] = [];
            let paginationData: any = {};

            if (Array.isArray(response)) {
              mappingsData = response;
              paginationData = {
                total: mappingsData.length * 10,
                page: params.page,
                limit: params.limit,
                pages: Math.ceil(mappingsData.length * 10 / params.limit)
              };
            } else if (response?.data) {
              if (Array.isArray(response.data)) {
                mappingsData = response.data;
                paginationData = response.pagination || {};
              } else if (response.data.data && Array.isArray(response.data.data)) {
                mappingsData = response.data.data;
                paginationData = response.data.pagination || {};
              }
            }

            if (mappingsData && mappingsData.length > 0) {
              let formattedMappings: Mapping[] = mappingsData.map((mapping: any) => {
                const vendorName = mapping.vendor_display_name || mapping.vendor_name || 'Unknown Vendor';

                return {
                  id: mapping.variant_id || mapping.id,
                  mapping_id: mapping.mapping_id || mapping.id,
                  name: mapping.variant_name || mapping.name || `Variant ID: ${mapping.variant_id || mapping.id}`,
                  product_name: mapping.product_name || 'Unknown Product',
                  category_info: mapping.category_names ? mapping.category_names.join(', ') : '',
                  vendor_id: mapping.vendor_id,
                  vendor_name: vendorName,
                  vendor_email: mapping.vendor_email || 'N/A',
                  mapped_at: mapping.mapped_at || mapping.created_at,
                  mapped_at_formatted: mapping.mapped_at ? new Date(mapping.mapped_at).toLocaleString() :
                                     mapping.created_at ? new Date(mapping.created_at).toLocaleString() : 'Unknown',
                  is_mapped: true,
                  is_approve: mapping.is_approve || 0,
                  reject_reason: mapping.reject_reason,
                  created_by: mapping.created_by,
                  updated_by: mapping.updated_by
                };
              });

              setMappings(formattedMappings);

              let totalPages = 1;

              if (paginationData.pages && paginationData.pages > 0) {
                totalPages = paginationData.pages;
              } else if (paginationData.total) {
                totalPages = Math.ceil(paginationData.total / params.limit);
              } else if (formattedMappings.length > 0) {
                totalPages = Math.max(1, Math.ceil(formattedMappings.length / params.limit) * 10);
              }

              setMappingsTotalPages(totalPages);
            } else {

              setMappings([]);
              setMappingsTotalPages(1);
            }
          })
          .catch((error: any) => {
            toast.error("Failed to change page. Trying to refresh mappings...");
            getAllMappings();
          })
          .finally(() => {
            setLoadingMappings(false);
          });
      }
    } catch (error) {
      console.error("Exception in handleMappingsPageClick:", error);
      toast.error("Error changing page");
      setLoadingMappings(false);
    }
  };

  const handleMappingsEllipsisClick = (isNext: boolean): void => {
    const totalPageCount = mappingsTotalPages || 1;
    const currentPage = mappingsPage;

    if (isNext) {
      const middlePage = Math.floor((currentPage + totalPageCount) / 2);
      setMappingsPage(middlePage);
      updateUrlParams({
        mappingsPage: middlePage,
        tab: 'mappings',
        search: searchString,
        vendor: selectedVendor,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo,
        approvalStatus: selectedApprovalStatus
      });
    } else {
      const middlePage = Math.floor((1 + currentPage) / 2);
      setMappingsPage(middlePage);
      updateUrlParams({
        mappingsPage: middlePage,
        tab: 'mappings',
        search: searchString,
        vendor: selectedVendor,
        category: selectedCategory,
        addedBy: selectedAddedBy,
        dateFrom: dateFrom,
        dateTo: dateTo,
        approvalStatus: selectedApprovalStatus
      });
    }

    getAllMappings();
  };

  const [variantsPageSearchInput, setVariantsPageSearchInput] = useState<string>("");

  const handleVariantsPageSearchInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setVariantsPageSearchInput(value);
    }
  };

  const handleVariantsPageSearchSubmit = (): void => {
    const pageNum = parseInt(variantsPageSearchInput);

    if (pageNum && pageNum >= 1 && pageNum <= (variantsTotalPages || 1)) {
      setVariantsPage(pageNum);

      updateUrlParams({
        variantsPage: pageNum,
        tab: 'variants',
        search: searchString,
        startDate: filterValues.startDate,
        endDate: filterValues.endDate
      });

      getAllVariants();
    } else {
      toast.error(`Please enter a valid page number between 1 and ${variantsTotalPages}`);
    }
  };

  const [mappingsPageSearchInput, setMappingsPageSearchInput] = useState<string>("");

  const handleMappingsPageSearchInput = (e: ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setMappingsPageSearchInput(value);
    }
  };

  const handleMappingsPageSearchSubmit = (): void => {
    const pageNum = parseInt(mappingsPageSearchInput);

    if (pageNum && pageNum >= 1 && pageNum <= (mappingsTotalPages || 1)) {
      setMappingsPage(pageNum);

      updateUrlParams({
        mappingsPage: pageNum,
        tab: 'mappings',
        search: searchString,
        vendor: selectedVendor,
        startDate: filterValues.startDate,
        endDate: filterValues.endDate
      });

      getAllMappings();
    } else {
      toast.error(`Please enter a valid page number between 1 and ${mappingsTotalPages}`);
    }
  };

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
    if(activeTab == 'products')
      getProducts()
    else if(activeTab == 'variants')
      getAllVariants();
    else {
      getAllMappings();
      getVariantsForFilter();
    }
  }, [activeTab, page, variantsPage, mappingsPage])

  useEffect(() => {
    const {
      page,
      search,
      approveVendor,
      vendor,
      featured,
      category,
      addedBy,
      dateFrom: urlDateFrom,
      dateTo: urlDateTo,
      approvalStatus
    } = router.query;

    if (page) setPage(parseInt(page as string));
    if (search !== undefined) setSearchString(search as string);
    if (approveVendor !== undefined) setSelectedApproveVendor(approveVendor as string);
    if (vendor !== undefined) setSelectedVendor(vendor as string);
    if (featured !== undefined) setSelectedFeatured(featured as string);
    if (category !== undefined) setSelectedCategory(category as string);
    if (addedBy !== undefined) setSelectedAddedBy(addedBy as string);
    if (urlDateFrom !== undefined) setDateFrom(urlDateFrom as string);
    if (urlDateTo !== undefined) setDateTo(urlDateTo as string);
    if (approvalStatus !== undefined) setSelectedApprovalStatus(approvalStatus as string);

    setFilterValues(prev => ({
      ...prev,
      searchString: (search as string) || '',
      approveVendor: (approveVendor as string) || '',
      vendor: (vendor as string) || '',
      featured: (featured as string) || '',
      category: (category as string) || '',
      addedBy: (addedBy as string) || '',
      dateFrom: (urlDateFrom as string) || '',
      dateTo: (urlDateTo as string) || '',
      approvalStatus: (approvalStatus as string) || ''
    }));
  }, [router.query]);

  useEffect(() => {
    fetchCategories();
    fetchAddedByOptions();
    getUserProfile();
    getVendorApproveList();
    getReasonList();

    if (router.query.tab) {
      setActiveTab(router.query.tab as string);
    }
  }, []);

  const fetchCategories = async (): Promise<void> => {
    try {
      const response : any = await getParentCategories();

      const categoryOptions: SelectOption[] = response.data.map((cat: any) => ({
        label: cat.title || cat.name || cat.category_name,
        value: cat.id,
        slug: cat.slug
      }));

      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAddedByOptions = async (): Promise<void> => {
    try {
      const response : any = await getAdminUsersList();

      const adminOptions: SelectOption[] = response.data.map((user: any) => ({
        label: user.name || user.username || user.email || `Admin ${user.id}`,
        value: user.id,
        email: user.email,
        role: user.role
      }));

      setAddedByOptions(adminOptions);
    } catch (error) {
      console.error("Error fetching added by options:", error);
    }
  };


  const getApprovalInfo = (item: Product): React.ReactElement => {
    const addedById = item.added_by;
    const approvedById = item.vendor_approved_by;

    let addedByName = "N/A";
    if (addedById && !isNaN(addedById)) {
      const admin = addedByOptions.find(admin => admin.value === addedById);
      if (admin) {
        addedByName = `${admin.label}`;
      }
    }

    let approvedByName = "N/A";
    if (approvedById && !isNaN(parseInt(approvedById))) {
      const admin = addedByOptions.find(admin => admin.value === parseInt(approvedById));
      if (admin) {
        approvedByName = `${admin.label}`;
      }
    }

    return (
      <>
        <p className="text-sm text-capitalize text-nowrap mb-1">
          <b>Added By: </b>{addedByName}
        </p>
        <p className="text-sm text-capitalize text-nowrap mb-1">
          <b>Approved By: </b>{approvedByName}
        </p>
      </>
    );
  };

  const handleCloseRejectModal = (): void => {
    setShowRejectModal(false);
    setselectedProductsId("");
    setInputValue("");
    setSelectValue("");
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .tab-pane {
        opacity: 0;
        transition: opacity 0.15s ease-in-out;
      }

      .tab-pane.active.show {
        opacity: 1;
      }

      .nav-tabs .nav-link {
        transition: all 0.2s ease-in-out;
      }

      .nav-tabs .nav-link.active {
        border-color: transparent;
        border-bottom: 2px solid #0046ad;
        color: #0046ad;
        font-weight: 500;
      }

      .nav-tabs .nav-link:not(.active):hover {
        border-color: transparent;
        border-bottom: 2px solid rgba(0, 70, 173, 0.3);
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const [showAddVariantModal, setShowAddVariantModal] = useState<boolean>(false);
  const [variantsList, setVariantsList] = useState<SelectOption[]>([]);
  const [isVariantMapping, setIsVariantMapping] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProductVariants = useCallback(async (productId: number): Promise<void> => {
    if (!productId) {
      return;
    }

    setLoadingVariants(true);

    try {
      const response : any = await getProductVariants(productId);

      if (response?.data?.status === 1) {
        const variants = response.data.data || [];

        const formattedVariants: SelectOption[] = variants.map((variant: any) => ({
          value: variant.id,
          label: `${variant.variant_name || variant.name} (${variant.product_name || 'Unknown Product'})`,
          data: variant
        }));

        setVariantsList(formattedVariants);

        (window as any)._originalVariantsList = [...formattedVariants];
      } else {
        console.error(`Error response from API: ${response?.data?.message || 'Unknown error'}`);
        toast.error('Failed to fetch variants');
      }
    } catch (error) {
      console.error('Error fetching variants:', error);
      toast.error('An error occurred while fetching variants');
    } finally {
      setLoadingVariants(false);
    }
  }, []);

  const handleAddVariantSuccess = (data: any): void => {
    if ((window as any)._originalVariantsList) {
      (window as any)._originalVariantsList = null;
    }

    let refreshProductId: number | null = null;

    if (data && data.product_id) {
      refreshProductId = data.product_id;
    } else {
      refreshProductId = selectedProduct?.id || null;
    }

    if (refreshProductId) {
      fetchProductVariants(refreshProductId);
    } else {
      toast.warning('Added variant, but could not refresh variant list');
    }

    setShowAddVariantModal(false);
  };

  useEffect(() => {
    if (activeTab) {
      const currentQuery = { ...router.query };
      const newParams = { ...currentQuery, tab: activeTab };
      updateUrlParams(newParams);
    }
  }, [activeTab]);

  useEffect(() => {
    getReasonList();
    getVendorApproveList();
  }, []);

  return (
    <>
      <ToastContainer />

      <section className="content">
        <div className="container-fluid">
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist" id="productTabs">
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      handleTabChange('products');
                      resetFilters();
                    }}
                    role="tab"
                    aria-selected={activeTab === 'products'}
                    href="#products-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#products-tab"
                  >
                    Products
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'variants' ? 'active' : ''}`}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      handleTabChange('variants');
                      resetFilters();
                    }}
                    role="tab"
                    aria-selected={activeTab === 'variants'}
                    href="#variants-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#variants-tab"
                  >
                    Variants
                  </a>
                </li>
                <li className="nav-item">
                  <a
                    className={`nav-link ${activeTab === 'mappings' ? 'active' : ''}`}
                    onClick={(e: MouseEvent<HTMLAnchorElement>) => {
                      e.preventDefault();
                      handleTabChange('mappings');
                      resetFilters();
                    }}
                    role="tab"
                    aria-selected={activeTab === 'mappings'}
                    href="#mappings-tab"
                    data-bs-toggle="tab"
                    data-bs-target="#mappings-tab"
                  >
                    Mappings
                  </a>
                </li>
              </ul>
            </div>

            <div className="card-body">
              <div className="tab-content" id="productTabsContent">
                {/* Products Tab */}
                <div className={`tab-pane fade ${activeTab === 'products' ? 'active show' : ''}`} id="products-tab" role="tabpanel" aria-labelledby="products-tab">
                  {/* Filter controls for products */}
                    <MapVariantVendorModal isVisible={openProductMap} onCancel={() => setOpenProductMap(false)} onSuccess={() => {
                      toast.success("Variant has been mapped with vendor!")
                      setOpenProductMap(false)
                    }} />
            {!enableBulkUpload && !enableBulkProdUpload && (
                    <div className="card card-body">
              <div className="row g-3">
                {/* Search and Primary Filters */}
                <div className="col-sm-3 mb-1">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Products"
                    value={filterValues.searchString}
                    onChange={handleSearch}
                  />
                </div>
                <div className="col-sm-3 mb-1">
                  <Select
                    id={id}
                    options={vendorApprovedList}
                    placeholder="Approved Vendor"
                    isClearable={true}
                    instanceId="approved-vendor-select"
                    value={filterValues.approveVendor ? vendorApprovedList.find(opt => opt.value === filterValues.approveVendor) : null}
                    onChange={(selectedOption) => handleFilterChange('approveVendor', selectedOption)}
                  />
                </div>
                <div className="col-sm-3 mb-1">
                  <Select
                    id={id}
                    options={approvalStatusOptions}
                    placeholder="Filter by Approval Status"
                    isClearable={true}
                    instanceId="approval-status-select"
                    value={filterValues.approvalStatus ? approvalStatusOptions.find(opt => opt.value === filterValues.approvalStatus) : null}
                    onChange={(selectedOption) => handleFilterChange('approvalStatus', selectedOption)}
                  />
                </div>

                {/* Secondary Filters */}
                <div className="col-sm-3 mb-1">
                  <select
                    className="form-control"
                    value={filterValues.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">Filter by Category</option>
                    {categories.map(category => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-sm-3 mb-1">
                  <select
                    className="form-control"
                    value={filterValues.addedBy}
                    onChange={(e) => handleFilterChange('addedBy', e.target.value)}
                  >
                    <option value="">Filter by Added By</option>
                    {addedByOptions.map(user => (
                      <option key={user.value} value={user.value}>
                        {user.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Source filter: global (admin) catalog vs buyer-company private products */}
                <div className="col-sm-3 mb-1">
                  <select
                    className="form-control"
                    value={filterValues.productSource}
                    onChange={(e) => handleFilterChange('productSource', e.target.value)}
                  >
                    <option value="">Filter by Source (All)</option>
                    <option value="global">Global (Admin)</option>
                    <option value="buyer">Buyer Company Products</option>
                  </select>
                </div>

                {/* Date Filters */}
                <div className="col-sm-3 mb-1">
                  <div className="date-input-container">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Start Date"
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.type = 'text'
                        }
                      }}
                      value={filterValues.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-sm-3 mb-1">
                  <div className="date-input-container">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="End Date"
                      onFocus={(e) => (e.target.type = 'date')}
                      onBlur={(e) => {
                        if (!e.target.value) {
                          e.target.type = 'text'
                        }
                      }}
                      value={filterValues.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="col-12">
                  <div className="d-flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={handleSearchClick}
                      className="btn btn-primary"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/product-management/add-product")}
                      className="btn btn-secondary"
                    >
                      Add Product
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={() => setShowAddVariantModal(true)}
                    >
                      Add Variant
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => handleOpenProductMap()}
                      style={{ backgroundColor: '#0046ad', borderColor: '#0046ad' }}
                    >
                      Map Variant with Vendor
                    </button>
                    {/* REMOVED EXPORT FEATURE AS OF NOW */}
                    {false &&
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleExport}
                      >
                        Export
                      </button>}
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={resetFilters}
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
              </div>
            )}

                  {/* Products Table - Move this from outside to inside the products tab */}
          <div className="card card-body table-responsive">
            {loading && <FullLoading /> }
            {!loading && (
              <table className="table table-striped table-hover mb-3">
                <thead>
                  <tr className="text-nowrap">
                    <th scope="col">
                      <input
                        type="checkbox"
                        name="select_all_products"
                        onClick={(e) => selectAllProduct(e as any)}
                      />
                    </th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Category</th>
                    <th scope="col">Sub Category</th>
                    <th scope="col">Approval Status</th>
                    <th scope="col">Created At / By</th>
                    <th scope="col">Updated At / By</th>
                    <th scope="col">Approved At / By</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(products && products.length > 0) ?
                    products.map((item) => {
                      return (
                        <tr key={item.id} className={item.is_deleted == 1 ? 'deleted-row' : ''} >
                          <td>
                            {!item.company_id && (
                              <input
                                type="checkbox"
                                name="select_product"
                                checked={item.isChecked}
                                readOnly
                                onClick={(e) => selectProduct(e as any, item)}
                              />
                            )}
                          </td>
                          <td>{item.name}</td>
                          <td>
                            {item.company_id ? (
                              <span className="badge badge-info">{item.owner_company || 'Buyer'}</span>
                            ) : (
                              <span className="badge badge-secondary">Global</span>
                            )}
                          </td>
                          <td className="subcatstd">
                            <span className="badge badge-warning">
                              {item.product_categories.length > 0
                                ? item.product_categories[0].category_name
                                : "-"}
                            </span>
                          </td>
                          <td className="subcatstd">{getSubCats(item)}</td>
                          <td>
                            {item.company_id ? (
                              <span className="badge badge-light text-muted">Buyer-managed</span>
                            ) : (userType && userType != 6) && (
                              item?.is_approve === 1 ? (
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tooltip1">
                                      Click to Disapprove
                                    </Tooltip>
                                  }
                                >
                                  <button
                                    className="btn btn-secondary bg-danger mb-2"
                                    onClick={() => openRejectModal(item.id)}
                                  >
                                    Disapprove
                                  </button>
                                </OverlayTrigger>
                              ) : (
                                <div className="d-flex flex-row align-items-center">
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tooltip1">Click to approve</Tooltip>
                                    }
                                  >
                                    <button
                                      className="btn btn-secondary bg-success mb-2"
                                      onClick={() => handleAcceptRejectProduct(item.id, '1')}
                                    >
                                      Approve
                                    </button>
                                  </OverlayTrigger>

                                  {item?.is_approve === 0 && item?.reject_reason &&
                                    <OverlayTrigger
                                      placement="top"
                                      overlay={
                                        <Tooltip id="tooltip1">
                                          {item?.reject_reason}
                                        </Tooltip>
                                      }
                                    >
                                      <span className="fa fa-info-circle ml-2"></span>
                                    </OverlayTrigger>}
                                </div>
                              ))}
                          </td>
                          <td style={{ width: "100px" }}>
                            <span style={{textWrap: 'nowrap'} as any}>{new Date(item.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}</span>
                            <p style={{fontSize: 15, fontWeight: 600}}>{item.created_by}</p>
                          </td>
                          <td style={{ width: "100px" }}>
                            <span style={{textWrap: 'nowrap'} as any}>{item.updated_at ? new Date(item.updated_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }) : "-"}</span>
                            <p style={{fontSize: 15, fontWeight: 600}}>{item.updated_by}</p>
                          </td>
                          <td style={{ width: "100px" }}>
                            <span style={{textWrap: 'nowrap'} as any}>{item.approved_at ? new Date(item.approved_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }) : "-"}</span>
                            <p style={{fontSize: 15, fontWeight: 600}}>{item.approved_by}</p>
                          </td>
                          <td>
                            <div className="d-flex">
                              <span
                                className="fa fa-eye mr-2"
                                onClick={() =>
                                  router.push(
                                    `/product-management/product-details/${item.id}`
                                  )
                                }
                              ></span>
                              {userType != 6 && !item.company_id &&
                                <span
                                  className="fa fa-edit"
                                  onClick={() => handleUpdateProduct(item)}
                                ></span>}
                            </div>
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={11} className="text-center">
                          No products found
                        </td>
                      </tr>
                    )}
                </tbody>
              </table>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <p><b>Total Products: </b>{totalCount.total_count}</p>
                <p><b>Page: </b>{totalCount.page} of {totalCount.total}</p>
              </div>
              <div className="d-flex flex-column align-items-center gap-2">
                {/* Pagination Section */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  {totalCount.filtered_count && totalCount.filtered_count > 0 && (
                    <>
                      <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={totalPages || 1}
                        marginPagesDisplayed={2}
                        pageRangeDisplayed={5}
                        onPageChange={handlePageClick}
                        containerClassName={"pagination mb-0"}
                        pageClassName={"page-item"}
                        pageLinkClassName={"page-link"}
                        previousClassName={"page-item"}
                        previousLinkClassName={"page-link"}
                        nextClassName={"page-item"}
                        nextLinkClassName={"page-link"}
                        breakClassName={"page-item"}
                        breakLinkClassName={"page-link"}
                        activeClassName={"active"}
                        forcePage={page - 1}
                      />

                      <div className="d-flex align-items-center">
                        <input
                          type="text"
                          className="form-control me-2"
                          style={{ width: "80px" }}
                          value={pageSearchInput}
                          onChange={handlePageSearchInput}
                          placeholder="Page #"
                        />
                        <button
                          className="btn btn-primary"
                          onClick={handlePageSearchSubmit}
                          disabled={!pageSearchInput || parseInt(pageSearchInput) < 1 || parseInt(pageSearchInput) > (totalPages || 1)}
                        >
                          Go
                        </button>
                      </div>
                    </>
                  )}
                        </div>
                </div>
              </div>
            </div>
          </div>

                {/* Variants Tab */}
                <div className={`tab-pane fade ${activeTab === 'variants' ? 'active show' : ''}`} id="variants-tab" role="tabpanel" aria-labelledby="variants-tab">
                  <div className="card card-body">
                    <div className="row g-3">
                      {/* Search and filters for variants */}
                      <div className="col-sm-3 mb-1">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Variants"
                          value={filterValues.searchString}
                          onChange={handleSearch}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <Select
                          id={id}
                          options={categories}
                          placeholder="Category"
                          isClearable={true}
                          instanceId="category-select-variants"
                          value={filterValues.category ? categories.find(opt => opt.value === filterValues.category) : null}
                          onChange={(selectedOption) => handleFilterChange('category', selectedOption)}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <Select
                          id={id}
                          options={approvalStatusOptions}
                          placeholder="Filter by Approval Status"
                          isClearable={true}
                          instanceId="approval-status-select-variants"
                          value={filterValues.approvalStatus ? approvalStatusOptions.find(opt => opt.value === filterValues.approvalStatus) : null}
                          onChange={(selectedOption) => {
                            handleFilterChange('approvalStatus', selectedOption);
                            const newApprovalStatus = selectedOption ? String(selectedOption.value) : "";
                            setFilterValues(prev => ({
                              ...prev,
                              approvalStatus: newApprovalStatus
                            }));
                          }}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <select
                          className="form-control"
                          value={filterValues.addedBy}
                          onChange={(e) => handleFilterChange('addedBy', e.target.value)}
                        >
                          <option value="">Filter by Added By</option>
                          {addedByOptions.map(user => (
                            <option key={user.value} value={user.value}>
                              {user.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      {/* Date Filters */}
                      <div className="col-sm-3 mb-1">
                        <div className="date-input-container">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Start Date"
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.type = 'text'
                              }
                            }}
                            value={filterValues.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-3 mb-1">
                        <div className="date-input-container">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="End Date"
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.type = 'text'
                              }
                            }}
                            value={filterValues.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="mb-4">
                        <button
                          className="btn btn-primary me-2"
                          onClick={handleSearchClick}
                        >
                          Search
                        </button>
                        <button
                          className="btn btn-secondary me-2"
                          onClick={resetFilters}
                        >
                          Reset
                        </button>
                        <button
                        type="button"
                        className="btn btn-primary me-2"
                        onClick={() => setShowAddVariantModal(true)}
                        >
                          Add Variant
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={() => handleOpenProductMap()}
                          style={{ backgroundColor: '#0046ad', borderColor: '#0046ad' }}
                        >
                          Map Variant with Vendor
                        </button>
                      </div>
                    </div>


                    {/* Variants table */}
                    <div className="table-responsive mb-3">
                      {loadingVariants ? (
                        <FullLoading />
                      ) : (
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th>
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    const checked = e.target.checked;
                                    const updatedVariants = variants.map(variant => ({
                                      ...variant,
                                      isChecked: checked
                                    }));
                                    setVariants(updatedVariants);
                                  }}
                                />
                              </th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Name</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Product</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Category</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Status</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Created At / By</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Updated At / By</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Approved At / By</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {variants.length > 0 ? (
                              variants.map((variant) => (
                                <tr key={variant.id}>
                                  <td>
                                    <input
                                      type="checkbox"
                                      checked={variant.isChecked}
                                      onChange={(e) => {
                                        const checked = e.target.checked;
                                        const updatedVariants = variants.map(v =>
                                          v.id === variant.id ? { ...v, isChecked: checked } : v
                                        );
                                        setVariants(updatedVariants);
                                      }}
                                    />
                                  </td>
                                  <td>{variant.name || variant.variant_name}</td>
                                  <td>{variant.product_name}</td>
                                  <td>
                                    <span className="badge badge-warning">
                                      {variant.category_names && variant.category_names.length > 0
                                        ? variant.category_names[0]
                                        : "-"}
                                    </span>
                                  </td>
                                  <td>
                                    {(userType && userType != 6) && (
                                      variant?.is_approve === 1 ? (
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={
                                            <Tooltip id="tooltip1">
                                              Click to Disapprove
                                            </Tooltip>
                                          }
                                        >
                                          <button
                                            className="btn btn-secondary bg-danger btn-sm mb-2"
                                            onClick={() => handleAcceptRejectVariant(variant.id, '0')}
                                          >
                                            Disapprove
                                          </button>
                                        </OverlayTrigger>
                                      ) : (
                                        <div className="d-flex flex-row align-items-center">
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip id="tooltip1">Click to approve</Tooltip>
                                            }
                                          >
                                            <button
                                              className="btn btn-secondary bg-success btn-sm mb-2"
                                              onClick={() => handleAcceptRejectVariant(variant.id, '1')}
                                            >
                                              Approve
                                            </button>
                                          </OverlayTrigger>

                                          {variant?.is_approve === 0 && variant?.reject_reason &&
                                            <OverlayTrigger
                                              placement="top"
                                              overlay={
                                                <Tooltip id="tooltip1">
                                                  {variant?.reject_reason}
                                                </Tooltip>
                                              }
                                            >
                                              <span className="fa fa-info-circle ml-2"></span>
                                            </OverlayTrigger>}
                                        </div>
                                      ))}
                                  </td>
                                  <td>
                                    <span>
                                      {variant.created_at ?
                                        new Date(variant.created_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '15px', fontWeight: 600 }}>
                                      {variant.created_by ?
                                        addedByOptions.find(user => user.value === parseInt(String(variant.created_by)))?.label || variant.created_by
                                        : "-"}
                                    </p>
                                  </td>
                                  <td>
                                    <span>
                                      {variant.updated_at ?
                                        new Date(variant.updated_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '15px', fontWeight: 600 }}>
                                      {variant.updated_by ?
                                        addedByOptions.find(user => user.value === parseInt(String(variant.updated_by)))?.label || variant.updated_by
                                        : "-"}
                                    </p>
                                  </td>
                                  <td>
                                    <span>
                                      {variant.approved_at ?
                                        new Date(variant.approved_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '15px', fontWeight: 600 }}>
                                      {variant.approved_by ?
                                        addedByOptions.find(user => user.value === parseInt(String(variant.approved_by)))?.label || variant.updated_by
                                        : "-"}
                                    </p>
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-primary mb-2"
                                      onClick={() => {
                                        router.push(`/product-management/variant/${variant.id}`);
                                      }}
                                    >
                                      View
                                    </button>
                                    <button
                                      className="btn btn-sm btn-info"
                                      onClick={() => {
                                        router.push(`/product-management/edit-variant/${variant.id}`);
                                      }}
                                    >
                                      Edit
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={10} className="text-center">
                                  No variants found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Variants pagination */}
                    {variants.length > 0 && variantsTotalPages && variantsTotalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p><b>Total Variants: </b>{variantsPaginationMeta?.total ?? 0}</p>
                          <p><b>Page: </b>{variantsPage} of {variantsTotalPages}</p>
                        </div>
                        <div className="d-flex flex-column align-items-center gap-2">
                          {/* Pagination Section */}
                          <div className="d-flex justify-content-between align-items-center">
                            <ReactPaginate
                              previousLabel={"Previous"}
                              nextLabel={"Next"}
                              breakLabel={"..."}
                              pageCount={variantsTotalPages}
                              marginPagesDisplayed={2}
                              pageRangeDisplayed={3}
                              onPageChange={handleVariantsPageClick}
                              containerClassName={"pagination mb-0"}
                              pageClassName={"page-item"}
                              pageLinkClassName={"page-link"}
                              previousClassName={"page-item"}
                              previousLinkClassName={"page-link"}
                              nextClassName={"page-item"}
                              nextLinkClassName={"page-link"}
                              breakClassName={"page-item"}
                              breakLinkClassName={"page-link"}
                              activeClassName={"active"}
                              forcePage={variantsPage - 1}
                            />

                            <div className="d-flex align-items-center ms-3">
                              <input
                                type="text"
                                className="form-control me-2"
                                style={{ width: "80px" }}
                                value={variantsPageSearchInput}
                                onChange={handleVariantsPageSearchInput}
                                placeholder="Page #"
                              />
                              <button
                                className="btn btn-primary"
                                onClick={handleVariantsPageSearchSubmit}
                                disabled={!variantsPageSearchInput || parseInt(variantsPageSearchInput) < 1 || parseInt(variantsPageSearchInput) > variantsTotalPages}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/*START: Mappings Tab */}
                <div className={`tab-pane fade ${activeTab === 'mappings' ? 'active show' : ''}`} id="mappings-tab" role="tabpanel" aria-labelledby="mappings-tab">
                  <div className="card card-body">
                    <div className="row g-3">
                      <div className="col-sm-3 mb-1">
                        <Select
                          options={variantsFilterData}
                          placeholder="Filter by Variant"
                          isClearable={true}
                          instanceId="variant-select-mappings"
                          value={filterValues.variant ? variantsFilterData.find(opt => opt.value === filterValues.variant) : null}
                          onChange={(selectedOption) => {
                            handleFilterChange('variant', selectedOption);
                            setSelectedVariant(selectedOption ? String(selectedOption.value) : "");
                          }}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <Select
                          id="vendor"
                          instanceId="vendor-select-mappings"
                          name="vendor"
                          options={vendorOptions}
                          value={filterValues.vendor ? vendorOptions.find(opt => opt.value === filterValues.vendor) : null}
                          inputValue={vendorSearchTerm}
                          onChange={(selected) => {
                            handleFilterChange('vendor', selected)
                            setSelectedVendor(selected ? String(selected.value) : "");
                          }}
                          placeholder="Select a vendor"
                          onInputChange={(newValue) => setVendorSearchTerm(newValue)}
                          components={{ Option: CustomSelectOption }}
                          className="basic-select"
                          classNamePrefix="select"
                          noOptionsMessage={() => "Please enter atleast 3 letters to search"}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <Select
                          id={id}
                          options={approvalStatusOptions}
                          placeholder="Filter by Approval Status"
                          isClearable={true}
                          instanceId="approval-status-select-mappings"
                          value={filterValues.approvalStatus ? approvalStatusOptions.find(opt => opt.value === filterValues.approvalStatus) : null}
                          onChange={(selectedOption) => handleFilterChange('approvalStatus', selectedOption)}
                        />
                      </div>

                      <div className="col-sm-3 mb-1">
                        <select
                          className="form-control"
                          value={filterValues.category}
                          onChange={(e) => handleFilterChange('category', e.target.value)}
                        >
                          <option value="">Filter by Category</option>
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="col-sm-3 mb-1">
                        <select
                          className="form-control"
                          value={filterValues.addedBy}
                          onChange={(e) => handleFilterChange('addedBy', e.target.value)}
                        >
                          <option value="">Filter by Added By</option>
                          {addedByOptions.map(user => (
                            <option key={user.value} value={user.value}>
                              {user.label}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date Filters */}
                      <div className="col-sm-3 mb-1">
                        <div className="date-input-container">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="Start Date"
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.type = 'text'
                              }
                            }}
                            value={filterValues.dateFrom}
                            onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="col-sm-3 mb-1">
                        <div className="date-input-container">
                          <input
                            type="text"
                            className="form-control"
                            placeholder="End Date"
                            onFocus={(e) => (e.target.type = 'date')}
                            onBlur={(e) => {
                              if (!e.target.value) {
                                e.target.type = 'text'
                              }
                            }}
                            value={filterValues.dateTo}
                            onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                          />
                        </div>
                      </div>

                      <div className="mb-4">
                        <button
                          className="btn btn-primary me-2"
                          onClick={handleSearchClick}
                        >
                          Search
                        </button>
                        <button
                          className="btn btn-secondary me-2"
                          onClick={resetFilters}
                        >
                          Reset
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary me-2"
                          onClick={() => handleOpenProductMap()}
                          style={{ backgroundColor: '#0046ad', borderColor: '#0046ad' }}
                        >
                          Map Variant with Vendor
                        </button>
                      </div>
                    </div>

                    {/* Mappings table */}
                    <div className="table-responsive mb-3">
                      {loadingMappings ? (
                        <FullLoading />
                      ) : (
                        <table className="table table-striped table-hover">
                          <thead>
                            <tr>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Variant</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Product</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Vendor</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Vendor Email</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Approval Status</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Created By / At</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Updated By / At</th>
                              <th scope="col" style={{textWrap: 'nowrap'} as any}>Approved By / At</th>
                              <th>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {mappings.length > 0 ? (
                              mappings.map((mapping) => (
                                <tr key={`mapping-${mapping.id}`}>
                                  <td>{mapping.name || mapping.variant_name}</td>
                                  <td>{mapping.product_name}</td>
                                  <td>
                                    <span className="badge badge-info">
                                      {mapping.vendor_name || "-"}
                                    </span>
                                  </td>
                                  <td>{mapping.vendor_email || "-"}</td>
                                  <td>
                                    {(userType && userType != 6) && (
                                      mapping?.is_approve ? (
                                        <OverlayTrigger
                                          placement="top"
                                          overlay={
                                            <Tooltip id="tooltip1">
                                              Click to Disapprove
                                            </Tooltip>
                                          }
                                        >
                                          <button
                                            className="btn btn-secondary bg-danger btn-sm mb-2"
                                            onClick={() => openRejectModal(`mapping_${mapping.mapping_id}`)}
                                          >
                                            Disapprove
                                          </button>
                                        </OverlayTrigger>
                                      ) : (
                                        <div className="d-flex flex-row align-items-center">
                                          <OverlayTrigger
                                            placement="top"
                                            overlay={
                                              <Tooltip id="tooltip1">Click to approve</Tooltip>
                                            }
                                          >
                                            <button
                                              className="btn btn-secondary bg-success btn-sm mb-2"
                                              onClick={() => handleAcceptRejectProduct(`mapping_${mapping.mapping_id}`, '1')}
                                            >
                                              Approve
                                            </button>
                                          </OverlayTrigger>

                                          {mapping?.is_approve === 0 && mapping?.reject_reason &&
                                            <OverlayTrigger
                                              placement="top"
                                              overlay={
                                                <Tooltip id="tooltip1">
                                                  {mapping?.reject_reason}
                                                </Tooltip>
                                              }
                                            >
                                              <span className="fa fa-info-circle ml-2"></span>
                                            </OverlayTrigger>}
                                        </div>
                                      ))}
                                  </td>
                                  <td>
                                    <span>
                                      {mapping.mapped_at ? new Date(mapping.mapped_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>
                                      {mapping.created_by ??  "-"}
                                    </p>
                                  </td>

                                  <td>
                                    <span>
                                      {mapping.updated_at ? new Date(mapping.updated_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>
                                      {mapping.updated_by ?? "-"}
                                    </p>
                                  </td>

                                  <td>
                                    <span>
                                      {mapping.approved_at ? new Date(mapping.approved_at).toLocaleDateString("en-GB", {
                                          day: "numeric",
                                          month: "short",
                                          year: "numeric",
                                        }) : "-"}
                                    </span>
                                    <p style={{ fontSize: '14px', fontWeight: 600 }}>
                                      {mapping.approved_by ?? "-"}
                                    </p>
                                  </td>

                                  <td>
                                    <button
                                      className="btn btn-sm btn-info mr-2"
                                      onClick={() => {
                                        router.push(`/product-management/mapping/${mapping.mapping_id}`);
                                      }}
                                    >
                                      <i className="fas fa-edit"></i> View
                                    </button>
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleUnmapMapping(mapping.mapping_id)}
                                      title="Unmap variant from vendor"
                                    >
                                      <i className="fas fa-unlink"></i> Unmap
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={9} className="text-center">
                                  No mappings found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>

                    {/* Mappings pagination */}
                    {mappings.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p><b>Total Mappings: </b>{mappingsPaginationMeta?.total ?? 0}</p>
                          <p><b>Page: </b>{mappingsPage} of {mappingsTotalPages}</p>
                        </div>
                        <div className="d-flex flex-column align-items-center gap-2">
                          {/* Pagination Section */}
                          <div className="d-flex justify-content-between align-items-center">
                            <ReactPaginate
                              previousLabel={"Previous"}
                              nextLabel={"Next"}
                              breakLabel={"..."}
                              pageCount={mappingsTotalPages || 1}
                              marginPagesDisplayed={2}
                              pageRangeDisplayed={5}
                              onPageChange={handleMappingsPageClick}
                              containerClassName={"pagination mb-0"}
                              pageClassName={"page-item"}
                              pageLinkClassName={"page-link"}
                              previousClassName={"page-item"}
                              previousLinkClassName={"page-link"}
                              nextClassName={"page-item"}
                              nextLinkClassName={"page-link"}
                              breakClassName={"page-item"}
                              breakLinkClassName={"page-link"}
                              activeClassName={"active"}
                              forcePage={mappingsPage - 1}
                            />

                            <div className="d-flex align-items-center ms-3">
                              <input
                                type="text"
                                className="form-control me-2"
                                style={{ width: "80px" }}
                                value={mappingsPageSearchInput}
                                onChange={handleMappingsPageSearchInput}
                                placeholder="Page #"
                              />
                              <button
                                className="btn btn-primary"
                                onClick={handleMappingsPageSearchSubmit}
                                disabled={!mappingsPageSearchInput || parseInt(mappingsPageSearchInput) < 1 || parseInt(mappingsPageSearchInput) > (mappingsTotalPages || 1)}
                              >
                                Go
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                {/*END: Mappings Tab */}

              </div>
            </div>
          </div>

          {/* Error modals */}
          {productWithVendorErrors &&
            <div className="card card-body product-table">
              {loading && <FullLoading />}
              {!loading && (
                <>
                  <div className="d-flex justify-content-between">
                    <h4 className="mb-2 text-danger">Product Errors</h4>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setProductWithVendorErrors(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="table-responsive mb-3">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Row No.</th>
                          <th scope="col">Product Name</th>
                          <th scope="col">Vendor Name</th>
                          <th scope="col">Vendor Email</th>
                          <th scope="col">Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          productWithVendorErrors.map((item) => {
                            return (
                              <tr key={`err_item_${item.Row}`}>
                                <td>{item.Row || "---"}</td>
                                <td>{item.productName || "---"}</td>
                                <td>{item.vendorName || "---"}</td>
                                <td>{item.vendorEmail || "---"}</td>
                                <td>
                                  {typeof item.errors === 'string' ?
                                    item.errors
                                    :
                                    item.errors?.map((err, idx) => {
                                      return (
                                        <p key={idx} className="mb-0">{err}</p>
                                      )
                                    })
                                  }
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {Math.ceil(productWithVendorErrors.length / limit) > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  pageCount={Math.ceil(productWithVendorErrors.length / limit)}
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  renderOnZeroPageCount={null}
                  className="pagination"
                />
              )}

            </div>
          }

          {productErrors &&
            <div className="card card-body product-table">
              {loading && <FullLoading />}
              {!loading && (
                <>
                  <div className="d-flex justify-content-between mb-2">
                    <h4 className="mb-2 text-danger">Product Errors</h4>
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => setProductErrors(null)}
                    >
                      Close
                    </button>
                  </div>

                  <div className="table-responsive mb-3">
                    <table className="table table-striped table-hover">
                      <thead>
                        <tr>
                          <th scope="col">Row No.</th>
                          <th scope="col">Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          productErrors.map((item) => {
                            return (
                              <tr key={`err_item_${item.Row}`}>
                                <td>{item.Row || "---"}</td>
                                <td>
                                  {typeof item.error === 'string' ?
                                    item.error
                                    :
                                    item.error?.map((err, idx) => {
                                      return (
                                        <p key={idx} className="mb-0">{err}</p>
                                      )
                                    })
                                  }
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {Math.ceil(productErrors.length / limit) > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  pageCount={Math.ceil(productErrors.length / limit)}
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  renderOnZeroPageCount={null}
                  className="pagination"
                />
              )}
            </div>
          }
        </div>
      </section>

      <DisapproveModal
        show={showRejectModal}
        onHide={handleCloseRejectModal}
        selectedVendorId={selectedProductId}
        rejectListData={reasonList}
        inputValue={inputValue}
        selectVal={selectVal}
        handleInputDisapprove={handleInputDisapprove}
        handleSelect={handleSelect}
        submitApproveVendor={handleAcceptRejectProduct}
      />

      {/* Add Variant Modal */}
      <AddVariantModal
        isOpen={showAddVariantModal}
        onClose={() => setShowAddVariantModal(false)}
        onSuccess={handleAddVariantSuccess}
      />
    </>
  );
};

export default ProductManagement;
