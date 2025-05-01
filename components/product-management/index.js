import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllProducts, deleteProduct, rejectListProduct, acceptProduct, mapVendorWithProduct, mapVariantWithVendor, getCategories, getAdminUsersList, searchProductsV2, searchAllVariants, getVariantMappings } from "@/utils/services/product-management";
import axiosFormData from "@/utils/axios/form-data";
import FullLoading from "../loading/FullLoading";
import { ToastContainer, toast } from "react-toastify";
import ReactPaginate from "react-paginate";
import { productExport } from "@/utils/services/product-management";
import DisapproveModal from "../modal/disapprove-modal";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import Select, { components } from "react-select";
import { vendorApproveList } from "@/utils/services/rfq";
import { vendorList } from "@/utils/services/rfq";
import { getAdminProfile } from "@/utils/services/login";
import AddVariantModal from '../modal/AddVariantModal';
import { getProductVariants } from '../../utils/services/product-management';

// Custom styles for Product Select Component
const customStyles = {
  option: (provided, state) => ({
    ...provided,
    marginBottom: '1px solid #000',
    color: state.isSelected ? '#0d6efd' : '#212529',
    backgroundColor: state.isSelected ? '#f0f0f0' : provided.backgroundColor,
  }),
};

// Modified Select Component to show email along with vendor Name
const CustomSelectOption = (props) => (
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


const ProductManagement = () => {
  const router = useRouter();
  const id = Date.now().toString();
  const [enableBulkUpload, setEnableBulkUpload] = useState(false);
  const [enableBulkProdUpload, setEnableBulkProdUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [prodFile, setProdFile] = useState(null);
  const [loading, setloading] = useState(false);
  const [products, setproducts] = useState([]);
  const [productData, setProductData] = useState([]); // Added state for product data
  const [updateProduct, setUpdateProduct] = useState("");
  const [uploadProgress, setuploadProgress] = useState(0);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(parseInt(router.query.page) || 1);
  const [totalPages, settotalPages] = useState(null);
  const [selectedProductId, setselectedProductsId] = useState('');
  const [reasonList, setReasonList] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  // Changes by Agnij Aprill 30, 2025 [Added tabular navigation state]
  const [activeTab, setActiveTab] = useState(router.query.tab || 'products');
  const [variantsPage, setVariantsPage] = useState(parseInt(router.query.variantsPage) || 1);
  const [variantsLimit, setVariantsLimit] = useState(10);
  const [variantsTotalPages, setVariantsTotalPages] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loadingVariants, setLoadingVariants] = useState(false);
  const [mappingsPage, setMappingsPage] = useState(parseInt(router.query.mappingsPage) || 1);
  const [mappingsLimit, setMappingsLimit] = useState(10);
  const [mappingsTotalPages, setMappingsTotalPages] = useState(null);
  const [mappings, setMappings] = useState([]);
  const [loadingMappings, setLoadingMappings] = useState(false);
  
  // Filter states for current active filters
  const [searchString, setSearchString] = useState(router.query.search || '');
  const [selectedApproveVendor, setSelectedApproveVendor] = useState(router.query.approveVendor || "");
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(router.query.vendor || "");
  const [selectedFeatured, setSelectedFeatured] = useState(router.query.featured || "");
  const [userType, setUserType] = useState(null);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(router.query.category || "");
  const [selectedAddedBy, setSelectedAddedBy] = useState(router.query.addedBy || "");
  const [addedByOptions, setAddedByOptions] = useState([]);
  const [dateFrom, setDateFrom] = useState(router.query.dateFrom || "");
  const [dateTo, setDateTo] = useState(router.query.dateTo || "");
  const [selectedApprovalStatus, setSelectedApprovalStatus] = useState(router.query.approvalStatus || "");

  // Filter values state for pending filters (before search)
  const [filterValues, setFilterValues] = useState({
    searchString: router.query.search || '',
    approveVendor: router.query.approveVendor || "",
    vendor: router.query.vendor || "",
    featured: router.query.featured || "",
    category: router.query.category || "",
    addedBy: router.query.addedBy || "",
    dateFrom: router.query.dateFrom || "",
    dateTo: router.query.dateTo || "",
    approvalStatus: router.query.approvalStatus || ""
  });

  const [productSearchTerm, setProductSearchTerm] = useState('');

  const handleFilterChange = (type, selectedOption) => {
    const value = selectedOption && typeof selectedOption === 'object' ? selectedOption.value : selectedOption;
    
    // Update filter values
    setFilterValues(prev => ({
      ...prev,
      [type]: value || ""
    }));

    // Update URL parameters immediately
    updateUrlParams({
      [type]: value || ""
    });
  };

  const handleSearch = (e) => {
    setFilterValues(prev => ({
      ...prev,
      searchString: e.target.value
    }));
  };

  const handleSearchClick = () => {
    setPage(1);
    setPageSearchInput("");
    
    // Update all states with filter values
    setSearchString(filterValues.searchString);
    setSelectedApproveVendor(filterValues.approveVendor);
    setSelectedVendor(filterValues.vendor);
    setSelectedFeatured(filterValues.featured);
    setSelectedCategory(filterValues.category);
    setSelectedAddedBy(filterValues.addedBy);
    setDateFrom(filterValues.dateFrom);
    setDateTo(filterValues.dateTo);
    setSelectedApprovalStatus(filterValues.approvalStatus);

    // Update URL with all filter values
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
      approvalStatus: filterValues.approvalStatus
    });
  };

  const resetFilters = () => {
    // Reset filter values
    setFilterValues({
      searchString: "",
      approveVendor: "",
      vendor: "",
      featured: "",
      category: "",
      addedBy: "",
      dateFrom: "",
      dateTo: "",
      approvalStatus: ""
    });

    // Reset states
    setSearchString("");             
    setSelectedApproveVendor("");    
    setSelectedVendor("");           
    setSelectedFeatured("");         
    setSelectedCategory("");         
    setSelectedAddedBy("");          
    setDateFrom("");                 
    setDateTo("");                   
    setSelectedApprovalStatus("");
    setPage(1);                      
    
    // Remove all URL query parameters
    router.push({
      pathname: router.pathname
    }, undefined, { shallow: true });
    
    // Call getProducts to fetch data without filters
    getProducts();
  };

  const [inputValue, setInputValue] = useState("");
  const [selectVal, setSelectValue] = useState("");
  const [productWithVendorErrors, setProductWithVendorErrors] = useState(null);
  const [productErrors, setProductErrors] = useState(null);

  const [mapMultipleProductsWithVendor, setMapMultipleProductsWithVendor] = useState([])
  const [isAddingDataProcessing, setIsAddingDataProcessing] = useState(false);

  const [productLoading, setProductLoading] = useState(false);
  const [vendorApprovedList, setVendorApprovedList] = useState([]);
  const [vendorProductsList, setVendorProductsList] = useState([]);
  const [openProductMap, setOpenProductMap] = useState(false);
  const [productMapObj, setproductMapObj] = useState({
    product: null,
    vendor: null,
    approved_by: null
  });
  const [totalCount, setTotalCount] = useState({ total_count: 0, disapprove_count: 0, approve_count: 0 });
  const [pageSearchInput, setPageSearchInput] = useState("");

  const approvalStatusOptions = [
    { label: 'Approved', value: '1' },
    { label: 'Disapproved', value: '0' }
  ];

  const customSelectStyles = {
    control: (base) => ({
      ...base,
      height: "30px",
      maxWidth: "300px",
      borderRadius: "6px",
      paddingLeft: "10px",
      marginRight: "15px",
    }),
  };

  const isFeaturesArray = [
    { label: 'Yes', value: '1' },
    { label: 'No', value: '0' },
  ]

  const handleInputDisapprove = (e) => {
    setInputValue(e.target.value);
  }
  const handleSelect = (e) => {
    setSelectValue(e.target.value);
  }

  const indexNum = (cell, row, enumObject, index) => {
    return <div>{index + 1}</div>;
  };
  const addressEdit = (_cell, row) => {
    return (
      <div>
        {row?.city}, {row?.state}
      </div>
    );
  };

  const uploadToClient = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setFile(i);
    }
  };

  const uploadToClientProd = (event) => {
    if (event.target.files && event.target.files[0]) {
      const i = event.target.files[0];
      setProdFile(i);
    }
  };

  const openRejectModal = (id) => {
    setShowRejectModal(true)
    setselectedProductsId(id)
  }

  const handlePageClick = (e) => {
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

  const handlePageSearchInput = (e) => {
    const value = e.target.value;
    // Allow only numbers and ensure it's within valid range
    if (/^\d*$/.test(value)) {
      setPageSearchInput(value);
    }
  };

  const handlePageSearchSubmit = () => {
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

  const handleEllipsisClick = (isNext) => {
    const totalPageCount = Math.ceil(totalCount.total_count / limit);
    const currentPage = page; // Current page (1-based index)
    

    if (isNext) {
      // Right ellipsis: Go to middle between current page and last page
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
      // Left ellipsis: Go to middle between first page (1) and current page
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

  const getUserProfile = async () => {
    try {
      const res = await getAdminProfile();
      setUserType(res.data.user_type);
    } catch (error) {
      console.log(error);
    }
  }

  const getVendor = () => {
    vendorList()
      .then((rsp) => {
        let lists = rsp.data.map((s) => ({
          label: s.organization_name ? s.organization_name : s.name,  // Fallback to name if organization_name is null
          value: s.id,
          email: s.email || "Email Not Available",  // Handle null email
          phone: s.mobile || "Phone Not Available", // Handle null phone
        }));
        setVendorData(lists);
      })
      .catch((error) => {
        setloading(false);
      });
  }

  const getReasonList = () => {
    rejectListProduct()
      .then((res) => {
        setReasonList(res?.data)
      })
      .catch((error) => {
        let txt = "";
        for (let x in error?.error?.response?.data?.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      })
  }

  const handleAcceptRejectProduct = (id, status) => {
    acceptProduct(id, status)
      .then((res) => {
        setShowRejectModal(false);
        setselectedProductsId("")
        setInputValue("")
        setSelectValue("")
        toast.success(res.message);
        getProducts();
        getReasonList();
      })
      .catch((error) => {
        let txt = "";
        for (let x in error.error.response.data.errors) {
          txt = error.error.response.data.errors[x];
        }
        toast.error(txt);
      })
  }

  const uploadToServer = async () => {
    if (!file) {
      toast.error("Please select a file!");
      return;
    }
    setloading(true);
    const formData = new FormData();
    formData.append("file", file);

    axiosFormData
      .post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/bulk-product-create`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setuploadProgress(percentCompleted);
          },
        }
      )
      .then((response) => {
        setloading(false);
        if (response.errorsObj) {
          setProductWithVendorErrors(response.errorsObj)
          toast.warning("Partially added products.")
        }
        else
          toast.success(response.message);
        getProducts();
      })
      .catch((error) => {
        if (error.response?.data?.errorsObj) {
          setProductWithVendorErrors(error.response?.data?.errorsObj)
        }
        toast.error(error.response?.data?.message)
      })
      .finally(() => {
        setloading(false);
        setuploadProgress(0);
        setFile(null);
        setEnableBulkUpload(false);
      })
  };

  const uploadToServerProd = async () => {
    if (!prodFile) {
      toast.error("Please select a file!");
      return;
    }
    setloading(true);
    const formData = new FormData();
    formData.append("file", prodFile);

    axiosFormData
      .post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/bulk-only-product-create`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setuploadProgress(percentCompleted);
          },
        }
      )
      .then((res) => {
        setloading(false);
        toast.success(res.message);
        if (res.errors && res.errors.length > 0) {
          setProductErrors(res.errors)
        }
        setProdFile(null);
        setEnableBulkProdUpload(false);
        getProducts();
      })
      .catch((error) => {
        setloading(false);
      });
  };

  const getProducts = () => {
    // Set loading but keep current products to prevent flickering
    setloading(true);
    
    // Pass all filters to the API
    getAllProducts(
      limit,                    // Number of products to fetch per page
      page,                     // Use current page instead of hardcoded 1
      searchString,             // Use actual search string
      selectedApproveVendor,    // Use selected vendor approval filter
      selectedVendor,           // Use selected vendor ID filter
      selectedFeatured,         // Use selected featured filter
      selectedAddedBy,          // Use selected added by filter
      selectedCategory,         // Use selected category filter
      dateFrom,                 // Use selected from date filter
      dateTo,                   // Use selected to date filter
      selectedApprovalStatus    // Use selected approval status filter
    )
      .then((res) => {
        setloading(false);
        
        // Handle API response
        const productsData = res.data || [];
        
        // Calculate total pages based on filtered count
        const calculatedTotalPages = Math.ceil(res.filtered_count / limit);
        
        // If current page is greater than total pages, reset to page 1
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
          return; // This will trigger a re-fetch with page 1
        }
        
        // Set pagination based on filtered count
        settotalPages(calculatedTotalPages);
        
        // Update total counts with filtered data
        setTotalCount({
          total_count: res.total_count || 0,
          approve_count: res.approve_count || 0,
          disapprove_count: res.disapprove_count || 0,
          filtered_count: res.filtered_count || 0,
          filtered_approve_count: res.filtered_approve_count || 0,
          filtered_disapprove_count: res.filtered_disapprove_count || 0,
          is_filtered: Boolean(searchString || selectedApproveVendor || selectedVendor || 
            selectedFeatured || selectedCategory || selectedAddedBy || dateFrom || 
            dateTo || selectedApprovalStatus)
        });

        // Apply the checked property to products
        const productsWithChecked = productsData.map(item => ({ ...item, isChecked: false }));
        setproducts(productsWithChecked);
        setProductData(productsWithChecked); // Set product data for variant mapping
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setloading(false);
        setproducts([]);
        setTotalCount({
          total_count: 0,
          approve_count: 0,
          disapprove_count: 0,
          filtered_count: 0,
          filtered_approve_count: 0,
          filtered_disapprove_count: 0,
          is_filtered: false
        });
        settotalPages(0);
      });
  };

  const getSubCats = (item) => {
    let cats = "";
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

  const selectProduct = (e, citem) => {
    let pp = [];
    //item.isChecked = e.target.checked;
    pp = products.map((item) => {
      if (item.id === citem.id) {
        item.isChecked = e.target.checked;
      }
      return item;
    });
    setproducts(pp);
  };
  const selectAllProduct = (e, item) => {
    let pp = [];
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

  const handleExport = () => {
    let pp = [];
    products.map((item) => {
      if (item.isChecked) {
        pp.push(item.id);
      }
    });

    if (pp.length > 0) {
      let post_data = { product_id: pp };
      productExport(post_data).then((response) => {
        window.open(response.download_url);
      });
    } else {
      toast.error("No items are selected!");
    }
  };

  const handleUpdateProduct = (item) => {
    router.push(`/product-management/edit-product/${item.id}`);
    setUpdateProduct(item);
  };

  const handleDeleteProduct = (id) => {
    let prodId = id
    deleteProduct(prodId)
      .then((res) => {
        setloading(false);
        toast.success(res.message);
        getProducts();
        router.push(`product-management`);
        // settotalPages(Math.ceil(res.total_count / limit));
      })
      .catch((err) => {
        setloading(false);
      });
  }

  // Function to fetch vendor approved-by list
  const getVendorApproveList = () => {
    vendorApproveList()
      .then((res) => {
        let approved_options = res.data.map((s) => ({
          label: s.vendor_approve,
          value: s.id,
        }));
        setVendorApprovedList(approved_options);
      })
      .catch((error) => {
        console.log(error)
      });
  };

  // Function to format product data along with it's categories 
  const formatGroupedData = (groupedData) => {
    return Object.values(groupedData).flatMap(items =>
      items.map(item => ({
        value: item.id,
        label: item.name,
        categories: item.product_categories.map(cat => cat.category_name).join(" | ")
      }))
    );
  }

  // Function to filter out unique products with categories
  const groupBySlug = (data) => {
    const groupedData = data.reduce((acc, item) => {
      const slug = item.slug;
      if (!acc[slug]) acc[slug] = [];

      const isUnique = !acc[slug].some((existingItem) =>
        JSON.stringify(existingItem.product_categories) === JSON.stringify(item.product_categories)
      );
      if (isUnique) acc[slug].push(item);
      return acc;
    }, {});
    return formatGroupedData(groupedData);
  }

  // Search Product Function
  const getVendorProductList = useCallback((search_key) => {
    setProductSearchTerm(search_key);
    
    if (search_key.length < 3) {
      setVendorProductsList([]);
      setProductLoading(false);
      return;
    }
    
    setProductLoading(true);
    // Reset only the product field when data is loading
    setproductMapObj((prevState) => ({
      ...prevState,
      product: null,
    }));
  
    setVendorProductsList([]); // Clear previous product list
    
    // Use searchProductsV2 which makes a call to rfq/search-product API
    searchProductsV2({
      search_key: search_key,
      cat_id: "",
      vendor_name: ""
    }, "products")
      .then((res) => {
        // Format the products to display in the UI
        const products = res.data || [];
        const formattedProducts = products.map(item => ({
          value: item.product_id,
          label: item.product_name,
          description: item.description,
          categories: item.category_name,
          similarity_score: item.similarity_score,
          rank: item.rank
        }));
        
        setVendorProductsList(formattedProducts);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setProductLoading(false));
  }, []);

  // Debouncing the search product API call for 300ms
  const debounceGetVendorProductList = useCallback(
    (inputValue) => {
      const debounceTimeout = 300;
      clearTimeout(window.debounceTimer);
      window.debounceTimer = setTimeout(() => {
        getVendorProductList(inputValue);
      }, debounceTimeout);
    },
    [getVendorProductList]
  );

  const handleMappingObj = (selectedOption, { name }) => {
    if (name === "approved_by" && !productMapObj.product) {
      toast.error("Please Choose a Product First.", { position: "top-right" })
      return
    }
    setproductMapObj((prevState) => ({
      ...prevState,
      [name]: selectedOption
    }));
  }  

  const handleOpenProductMap = () => {
    setOpenProductMap(true);
    setIsVariantMapping(true); // Always set to true for variant mapping
    
    // Reset the form when opening the modal
    setproductMapObj({
      product: null,
      vendor: null,
      approved_by: null
    });

    setMapMultipleProductsWithVendor([]);
    
    // Changes by Agnij May 30, 2025 [Load all variants to populate the dropdown]
    setLoadingVariants(true);
    console.log("Loading variants for mapping modal");
    
    // Use the searchAllVariants function to get all available variants
    searchAllVariants("")
      .then(response => {
        if (response?.data?.data) {
          const variants = response.data.data || [];
          console.log(`Found ${variants.length} variants for mapping`);
          
          // Format variants for select component
          const formattedVariants = variants.map(variant => ({
            value: variant.id,
            label: `${variant.variant_name || variant.name} (${variant.product_name || 'Unknown Product'})`,
            data: variant
          }));
          
          setVariantsList(formattedVariants);
        } else {
          console.log("No variants found or invalid data format");
          setVariantsList([]);
        }
      })
      .catch(error => {
        console.error("Error loading variants:", error);
        toast.error("Failed to load variants");
        setVariantsList([]);
      })
      .finally(() => {
        setLoadingVariants(false);
      });
  };

  const fetchAllProductVariants = useCallback(async (searchTerm = null) => {
    // Changes by Agnij April 30, 2025 [Updated to support searching variants]
    setLoadingVariants(true);
    
    if (searchTerm) {
      console.log(`Searching for variants with term: ${searchTerm}`);
    } else {
      console.log("Loading all variants");
    }
    
    try {
      // Get all products
      const products = productData || [];
      
      if (products.length === 0) {
        console.log("No products found, can't fetch variants");
        setVariantsList([]);
        setLoadingVariants(false);
        return;
      }
      
      // First approach: get variants for each product individually
      const variantPromises = products.map(product => 
        getProductVariants(product.id)
          .then(response => {
            let variantData = [];
            
            // Try to extract data carefully to avoid undefined errors
            if (response?.data) {
              if (Array.isArray(response.data)) {
                // Direct array response
                variantData = response.data;
              } else if (response.data.data && Array.isArray(response.data.data)) {
                // Nested data object
                variantData = response.data.data;
              } else if (response.data.status === 1 && !response.data.data) {
                // Empty data with success status
                variantData = [];
              }
            }
            
            // Only map if we have variants
            if (variantData.length > 0) {
              return variantData.map(variant => ({
                value: variant.id,
                label: `${variant.variant_name || variant.name} (${product.name || 'Unknown Product'})`,
                data: variant,
                product_id: product.id
              }));
            }
            return [];
          })
          .catch(error => {
            console.error(`Error fetching variants for product ${product.id}:`, error);
            return [];
          })
      );
      
      // Wait for all promises to resolve
      const variantResults = await Promise.all(variantPromises);
      
      // Combine all results and filter out any undefined or null values
      let allVariants = variantResults.flat().filter(Boolean);
      
      // If we have a search term, filter the variants
      if (searchTerm && searchTerm.length >= 2) {
        const filteredVariants = allVariants.filter(variant => {
          return variant.label.toLowerCase().includes(searchTerm.toLowerCase());
        });
        console.log(`Found ${filteredVariants.length} variants matching "${searchTerm}" out of ${allVariants.length} total variants`);
        allVariants = filteredVariants;
      }
      
      // Update state with filtered variants
      setVariantsList(allVariants);
    } catch (error) {
      console.error('Error in fetchAllProductVariants:', error);
      toast.error('An error occurred while fetching variants');
    } finally {
      setLoadingVariants(false);
    }
  }, [productData]);

  const handleSubmitMapping = async () => {
    if(!mapMultipleProductsWithVendor || mapMultipleProductsWithVendor?.length <= 0) {
      toast.error("Select products and vendors to add");
      return 0;
    }

    setIsAddingDataProcessing(true);

    for (const productMap of mapMultipleProductsWithVendor) {
    const { product, vendor, approved_by } = productMap;
    
    if (!product || !vendor) {
      toast.error("Product and Vendor fields are required.");
      return;
    }

    try {
        // Different API call based on if mapping a product or variant
        if (isVariantMapping) {
          // Changes by Agnij May 30, 2025 [Fixed parameter name from variant_id to product_variant_id]
          const payload = {
            product_variant_id: product.value,
            vendor_id: vendor.value,
            approved_by: approved_by?.map((item) => item.value) || null
          };
          
          console.log("Mapping variant with vendor using payload:", payload);
          const res = await mapVariantWithVendor(payload);
          toast.success(res.message || "Variant mapped successfully");
        } else {
      const payload = {
        product_id: product.value,
        vendor_id: vendor.value,
        approved_by: approved_by?.map((item) => item.value) || null
          };
          
      const res = await mapVendorWithProduct(payload);
          toast.success(res.message);
        }
    } catch (error) {
        console.log(error);
        toast.error(error.message?.response?.data?.message || "An error occurred");
    }
  }

    // Reset form state
  setproductMapObj({
    product: null,
    vendor: null,
    approved_by: null
  });

    setMapMultipleProductsWithVendor([]);
  setIsAddingDataProcessing(false);
    setOpenProductMap(false);
    getProducts();
    
    // Changes by Agnij May 30, 2025 [Refresh mappings tab data after adding new mappings]
    if (activeTab === 'mappings') {
      getAllMappings();
    }
  };

  const handleAddProductForBulk = async () => {
    const { product, vendor, approved_by } = productMapObj;

    if (!product || !vendor) {
      toast.error("Product and Vendor fields are required.");
      return;
    }

    setMapMultipleProductsWithVendor((prevState) => [...prevState, productMapObj]);
      
    toast.success(`${isVariantMapping ? "Variant" : "Product"} added for bulk submission.`);
  };

  const handleRemoveProduct = (index) => {
    setMapMultipleProductsWithVendor((prevState) => prevState.filter((_, i) => i !== index));
    toast.success("Product removed successfully.");
  };

  const updateUrlParams = (newParams) => {
    // Build a new URL with merged parameters
    const url = new URL(window.location.href);
    const updatedSearchParams = new URLSearchParams(url.search);
    
    // Update with new parameters
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        updatedSearchParams.delete(key);
      } else {
        updatedSearchParams.set(key, value);
      }
    });
    
    // Update the URL without refreshing the page
    const newUrl = `${window.location.pathname}?${updatedSearchParams.toString()}`;
    
    // Changes by Agnij Aprill 30, 2025 [Added tab parameter to URL]
    // Add tab to URL if not in the params
    if (!updatedSearchParams.has('tab') && activeTab) {
      updatedSearchParams.set('tab', activeTab);
    }
    
    router.push(
      { pathname: router.pathname, query: Object.fromEntries(updatedSearchParams) },
      undefined,
      { shallow: true }
    );
  };
  
  // Changes by Agnij Aprill 30, 2025 [Added tab switching function]
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    updateUrlParams({ tab: tabName });
    
    // Reset page number when switching tabs
    if (tabName === 'products') {
      setPage(1);
    } else if (tabName === 'variants') {
      setVariantsPage(1);
      // Fetch variants if not already loaded
      if (variants.length === 0) {
        getAllVariants();
      }
    } else if (tabName === 'mappings') {
      setMappingsPage(1);
      // Fetch mappings if not already loaded
      if (mappings.length === 0) {
        getAllMappings();
      }
    }
  };
  
  // Changes by Agnij Aprill 30, 2025 [Added function to get all variants]
  const getAllVariants = () => {
    setLoadingVariants(true);
    
    const params = {
      page: variantsPage,
      limit: variantsLimit,
      search: searchString
    };
    
    // Changes by Agnij May 18, 2025 [Fixed variants fetching]
    try {
    // Use the existing searchAllVariants function to get variants
    searchAllVariants(params.search || "")
        .then(response => {
        if (response?.data?.data) {
          const variantsData = response.data.data;
            console.log("Variants data received:", variantsData);
            
            if (variantsData && Array.isArray(variantsData)) {
              // Format variants to include more information
              const formattedVariants = variantsData.map(variant => ({
                ...variant,
                variant_name: variant.name, // Ensure variant_name is available
                product_name: variant.product_name || 'Unknown Product',
                category_info: Array.isArray(variant.category_names) ? variant.category_names.join(', ') : '',
                created_at_formatted: new Date(variant.created_at).toLocaleString()
              }));
              
              // Apply filtering if needed
              const filteredVariants = formattedVariants.filter(variant => {
                // Add any additional filtering logic here
            return true;
          });
          
          const totalItems = filteredVariants.length;
              
              // Calculate indices for pagination
          const startIndex = (params.page - 1) * params.limit;
          const endIndex = startIndex + params.limit;
          
          // Get the current page of variants
          const paginatedVariants = filteredVariants.slice(startIndex, endIndex);
          
              console.log(`Showing ${paginatedVariants.length} of ${totalItems} variants`);
          setVariants(paginatedVariants);
          setVariantsTotalPages(Math.ceil(totalItems / params.limit));
        } else {
              console.log("No variants found or invalid data format");
              setVariants([]);
              setVariantsTotalPages(0);
            }
          } else {
            console.error("Invalid response format:", response);
          setVariants([]);
          setVariantsTotalPages(0);
        }
      })
        .catch(error => {
        console.error("Error fetching variants:", error);
        toast.error("Failed to fetch variants");
        setVariants([]);
          setVariantsTotalPages(0);
      })
      .finally(() => {
        setLoadingVariants(false);
      });
    } catch (error) {
      console.error("Exception in getAllVariants:", error);
      setLoadingVariants(false);
      setVariants([]);
      setVariantsTotalPages(0);
    }
  };
  
  // Changes by Agnij Aprill 30, 2025 [Added function to get all mappings]
  const getAllMappings = () => {
    setLoadingMappings(true);
    
    const params = {
      page: mappingsPage,
      limit: mappingsLimit,
      search: searchString
    };
    
    // Changes by Agnij May 30, 2025 [Updated to properly display vendor details]
    try {
      // Use the real variant mappings API instead of mock data
      getVariantMappings(params.search || "")
        .then(response => {
          if (response?.data?.data) {
            const mappingsData = response.data.data;
            console.log(`Received ${mappingsData.length} variant-vendor mappings`);
          
            // Format mappings for display
            let formattedMappings = mappingsData.map(mapping => {
              // Use the vendor_display_name which combines organization name and name
              const vendorName = mapping.vendor_display_name || mapping.vendor_name || 'Unknown Vendor';
              
              return {
                id: mapping.variant_id,
                mapping_id: mapping.mapping_id,
                name: mapping.variant_name || `Variant ID: ${mapping.variant_id}`,
                product_name: mapping.product_name || 'Unknown Product',
                category_info: '',  // No category info in simplified query
                vendor_id: mapping.vendor_id,
                vendor_name: vendorName,
                vendor_email: mapping.vendor_email || 'N/A',
                mapped_at: mapping.mapped_at,
                mapped_at_formatted: mapping.mapped_at ? new Date(mapping.mapped_at).toLocaleString() : 'Unknown',
                is_mapped: true
              };
            });
          
            // Calculate pagination values
            const totalItems = formattedMappings.length;
            const startIndex = (params.page - 1) * params.limit;
            const endIndex = startIndex + params.limit;
          
            // Get the current page of mappings
            const paginatedMappings = formattedMappings.slice(startIndex, endIndex);
          
            console.log(`Showing ${paginatedMappings.length} of ${totalItems} mappings`);
            setMappings(paginatedMappings);
            setMappingsTotalPages(Math.ceil(totalItems / params.limit));
          } else {
            console.log("No mappings found or invalid data format");
            setMappings([]);
            setMappingsTotalPages(0);
          }
        })
        .catch(error => {
          console.error("Error fetching mappings:", error);
          toast.error("Failed to fetch mappings");
          setMappings([]);
          setMappingsTotalPages(0);
        })
        .finally(() => {
          setLoadingMappings(false);
        });
    } catch (error) {
      console.error("Exception in getAllMappings:", error);
      setLoadingMappings(false);
      setMappings([]);
      setMappingsTotalPages(0);
    }
  };
  
  // Changes by Agnij Aprill 30, 2025 [Added variants pagination handler]
  const handleVariantsPageClick = (event) => {
    const selectedPage = event.selected + 1;
    setVariantsPage(selectedPage);
    
    // Update URL params
    updateUrlParams({ variantsPage: selectedPage });
    
    // Fetch data with new page
    getAllVariants();
  };
  
  // Changes by Agnij Aprill 30, 2025 [Added mappings pagination handler]
  const handleMappingsPageClick = (event) => {
    const selectedPage = event.selected + 1;
    setMappingsPage(selectedPage);
    
    // Update URL params
    updateUrlParams({ mappingsPage: selectedPage });
    
    // Fetch data with new page
    getAllMappings();
  };

  // Handle filter changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Clear existing products and reset pagination when filters change
    setproducts([]);
    setPageSearchInput("");
    
    // Fetch new data with updated filters
    getProducts();
  }, [
    searchString,
    selectedApproveVendor,
    selectedVendor,
    selectedFeatured,
    selectedCategory,
    selectedAddedBy,
    dateFrom,
    dateTo,
    selectedApprovalStatus,
    page
  ]);

  // Sync state with URL params
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
    
    if (page) setPage(parseInt(page));
    if (search !== undefined) setSearchString(search);
    if (approveVendor !== undefined) setSelectedApproveVendor(approveVendor);
    if (vendor !== undefined) setSelectedVendor(vendor);
    if (featured !== undefined) setSelectedFeatured(featured);
    if (category !== undefined) setSelectedCategory(category);
    if (addedBy !== undefined) setSelectedAddedBy(addedBy);
    if (urlDateFrom !== undefined) setDateFrom(urlDateFrom);
    if (urlDateTo !== undefined) setDateTo(urlDateTo);
    if (approvalStatus !== undefined) setSelectedApprovalStatus(approvalStatus);

    // Update filterValues state to match URL parameters
    setFilterValues(prev => ({
      ...prev,
      searchString: search || '',
      approveVendor: approveVendor || '',
      vendor: vendor || '',
      featured: featured || '',
      category: category || '',
      addedBy: addedBy || '',
      dateFrom: urlDateFrom || '',
      dateTo: urlDateTo || '',
      approvalStatus: approvalStatus || ''
    }));
  }, [router.query]);

  // Initial data loading
  useEffect(() => {
    // Fetch initial data
    getProducts();
    fetchCategories();
    fetchAddedByOptions();
    getUserProfile();
    getVendor();
    getVendorApproveList();
    getReasonList();
    
    // Changes by Agnij Aprill 30, 2025 [Handle tab from URL]
    if (router.query.tab) {
      setActiveTab(router.query.tab);
      
      // Load data for the active tab
      if (router.query.tab === 'variants') {
        getAllVariants();
      } else if (router.query.tab === 'mappings') {
        getAllMappings();
      }
    }
  }, []);

  useEffect(() => {
    getReasonList();
    getVendorApproveList();
  }, []);

  // Track if this is the first render
  const isFirstRender = React.useRef(true);

  const fetchCategories = async () => {
    try {
      const response = await getCategories(1, 1000); // Get a large number of categories to ensure we get all parent categories
      
      // Filter categories with parent_id 0 as requested
      const parentCategories = response.data.filter(category => {
        const parentId = category.parent_id;
        return parentId === 0 || parentId === "0" || parentId === null;
      });
      
      // Create options only from parent categories (parent_id = 0)
      const categoryOptions = parentCategories.map(cat => ({
        label: cat.title || cat.name || cat.category_name,
        value: cat.id,
        slug: cat.slug
      }));
      
      setCategories(categoryOptions);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchAddedByOptions = async () => {
    try {
      const response = await getAdminUsersList();
      
      const adminOptions = response.data.map(user => ({
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

  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setSelectedCategory(value);
  };

  const handleAddedByChange = (e) => {
    const value = e.target.value;
    setSelectedAddedBy(value);
  };

  const getApprovalInfo = (item) => {
    // Get the added by ID and approved by ID
    const addedById = item.added_by;
    const approvedById = item.vendor_approved_by;
    
    // Find the admin name for added by
    let addedByName = "N/A";
    if (!isNaN(addedById)) {
      const admin = addedByOptions.find(admin => admin.value === parseInt(addedById));
      if (admin) {
        addedByName = `${admin.label}`;
      }
    }
    
    // Find the admin name for approved by
    let approvedByName = "N/A";
    if (!isNaN(approvedById)) {
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

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setselectedProductsId("");
    setInputValue("");
    setSelectValue("");
  };

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .product-search-results {
        scrollbar-width: thin;
        scrollbar-color: #007bff #f8f9fa;
      }
      
      .product-search-results::-webkit-scrollbar {
        width: 6px;
      }
      
      .product-search-results::-webkit-scrollbar-track {
        background: #f8f9fa;
      }
      
      .product-search-results::-webkit-scrollbar-thumb {
        background-color: #007bff;
        border-radius: 6px;
      }
      
      .product-search-results > div {
        transition: background-color 0.2s ease;
        padding: 8px;
        border-radius: 4px;
      }
      
      .product-search-results > div:hover {
        background-color: #f8f9fa;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Inside the ProductManagement component, add state variables for variant management
  const [showAddVariantModal, setShowAddVariantModal] = useState(false);
  const [variantsList, setVariantsList] = useState([]);
  const [isVariantMapping, setIsVariantMapping] = useState(false);

  // Add a function to fetch product variants
  const fetchProductVariants = useCallback(async (productId) => {
    // Changes by Agnij April 30, 2025 [Fixed variant fetching for a specific product]
    if (!productId) {
      console.log("Cannot fetch variants: No product ID provided");
      return;
    }
    
    console.log(`Fetching variants for product ID: ${productId}`);
    setLoadingVariants(true);
    
    try {
      const response = await getProductVariants(productId);
      
      if (response?.data?.status === 1) {
        const variants = response.data.data || [];
        console.log(`Found ${variants.length} variants for product ${productId}`);
        
        // Format variants for select component, handling both name and variant_name fields
        const formattedVariants = variants.map(variant => ({
          value: variant.id,
          label: `${variant.variant_name || variant.name} (${variant.product_name || 'Unknown Product'})`,
          data: variant
        }));
        
        setVariantsList(formattedVariants);
        
        // Reset the original list for search functionality
        window._originalVariantsList = [...formattedVariants];
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

  // Add handlers for variant management
  const handleAddVariantSuccess = (data) => {
    // Changes by Agnij April 30, 2025 [Fixed variant list refresh after adding variant]
    console.log('Add variant success with data:', data);
    
    // Reset any stored original variant list for search
    if (window._originalVariantsList) {
      window._originalVariantsList = null;
    }
    
    // Determine which product ID to refresh variants for
    let refreshProductId = null;
    
    if (data && data.product_id) {
      // Use the product_id from the response
      refreshProductId = data.product_id;
      console.log(`Using product_id from response: ${refreshProductId}`);
    } else {
      // Fallback to the last selected product
      refreshProductId = selectedProduct?.id;
      console.log(`No product_id in response, using selected product: ${refreshProductId}`);
    }
    
    // Only refresh if we have a valid product ID
    if (refreshProductId) {
      console.log(`Refreshing variants for product ${refreshProductId}`);
      fetchProductVariants(refreshProductId);
    } else {
      console.error('Cannot refresh variants: No product ID available');
      toast.warning('Added variant, but could not refresh variant list');
    }
    
    // Close the modal
    setShowAddVariantModal(false);
  };

  return (
    <>
      <ToastContainer />
      <div className="content-header">
        <div className="container-fluid">
          <div className="row">
            <h1 className="m-0 text-dark">Product</h1>
          </div>
        </div>
      </div>

      <section className="content">
        <div className="container-fluid">
          {/* Changes by Agnij June 14, 2024 [Added tab navigation] */}
          <div className="card card-primary card-outline card-tabs">
            <div className="card-header p-0 pt-1 border-bottom-0">
              <ul className="nav nav-tabs" role="tablist">
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('products')}
                    role="tab" 
                    aria-selected={activeTab === 'products'}
                    href="#"
                  >
                    Products
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'variants' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('variants')}
                    role="tab" 
                    aria-selected={activeTab === 'variants'}
                    href="#"
                  >
                    Variants
                  </a>
                </li>
                <li className="nav-item">
                  <a 
                    className={`nav-link ${activeTab === 'mappings' ? 'active' : ''}`} 
                    onClick={() => handleTabChange('mappings')}
                    role="tab" 
                    aria-selected={activeTab === 'mappings'}
                    href="#"
                  >
                    Mappings
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="card-body">
              <div className="tab-content">
                {/* Products Tab */}
                <div className={`tab-pane fade ${activeTab === 'products' ? 'active show' : ''}`}>
                  {/* Filter controls for products */}
            {!enableBulkUpload && !enableBulkProdUpload && !openProductMap && (
                    <div className="card card-body">
              <div className="row g-3">
                {/* Search and Primary Filters */}
                <div className="col-sm-3 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Products"
                    value={filterValues.searchString}
                    onChange={handleSearch}
                  />
                </div>
                <div className="col-sm-3 mb-3">
                  <Select
                    id={id}
                    options={vendorApprovedList}
                    placeholder="Approved Vendor"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="approved-vendor-select"
                    value={filterValues.approveVendor ? vendorApprovedList.find(opt => opt.value === filterValues.approveVendor) : null}
                    onChange={(selectedOption) => handleFilterChange('approveVendor', selectedOption)}
                  />
                </div>
                <div className="col-sm-3 mb-3">
                  <Select
                    id={id}
                    options={vendorData}
                    placeholder="Select Vendor"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="vendor-select"
                    value={filterValues.vendor ? vendorData.find(opt => opt.value === filterValues.vendor) : null}
                    onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                    components={{ Option: CustomSelectOption }}
                  />
                </div>
                <div className="col-sm-3 mb-3">
                  <Select
                    id={id}
                    options={approvalStatusOptions}
                    placeholder="Filter by Approval Status"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="approval-status-select"
                    value={filterValues.approvalStatus ? approvalStatusOptions.find(opt => opt.value === filterValues.approvalStatus) : null}
                    onChange={(selectedOption) => handleFilterChange('approvalStatus', selectedOption)}
                  />
                </div>

                {/* Secondary Filters */}
                <div className="col-sm-3 mb-3">
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
                <div className="col-sm-3 mb-3">
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
                <div className="col-sm-3 mb-3">
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
                <div className="col-sm-3 mb-3">
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
                      className="btn btn-secondary"
                    >
                      Search
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push("/product-management/add-product")}
                      className="btn btn-primary"
                    >
                      <i className="fa fa-plus"></i> Add Product
                    </button>
                    <button
                      type="button"
                      className="btn btn-primary me-2"
                      onClick={() => handleOpenProductMap()}
                      style={{ backgroundColor: '#0046ad', borderColor: '#0046ad' }}
                    >
                      Map Variant with Vendor
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={() => setShowAddVariantModal(true)}
                    >
                      Add Variant
                    </button>
                    {userType != 6 &&
                      <button
                        type="button"
                        className="btn btn-primary"
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
          <div className="card card-body product-table">
            {loading && <FullLoading />}
            {!loading && (
              <table className="table table-striped table-hover table-responsive mb-3">
                <thead>
                  <tr className="text-nowrap">
                    <th scope="col">
                      <input
                        type="checkbox"
                        name="select_all_products"
                        onClick={(e) => selectAllProduct(e)}
                      />
                    </th>
                    <th scope="col">Product Name</th>
                    <th scope="col">Category</th>
                    <th scope="col">Accept/Reject</th>
                    <th scope="col">Sub Category</th>
                    <th scope="col">Vendors</th>
                    <th scope="col">Approval Status</th>
                    <th scope="col">Image</th>
                    <th scope="col">TDS</th>
                    <th scope="col">QAP</th>
                    <th scope="col">Created At</th>
                    <th scope="col">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products &&
                    products.map((item) => {
                      return (
                        <tr key={item.id} className={item.is_deleted == 1 ? 'deleted-row' : ''} >
                          <td>
                            <input
                              type="checkbox"
                              name="select_product"
                              checked={item.isChecked}
                              readOnly
                              onClick={(e) => selectProduct(e, item)}
                            />
                          </td>
                          <td>{item.name}</td>
                          <td className="subcatstd">
                            <span className="badge badge-warning">
                              {item.product_categories.length > 0
                                ? item.product_categories[0].category_name
                                : "-"}
                            </span>
                          </td>
                          <td>
                            {item?.is_approve === 1 ? "Approved" : "Rejected"}
                          </td>
                          <td className="subcatstd">{getSubCats(item)}</td>
                          <td>{ item?.vendor ? item?.vendor_name: "-"}</td>
                          <td>
                            {(userType && userType != 6) && (
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
                            {getApprovalInfo(item)}
                          </td>

                          <td>
                            {item?.new_image_name ? <img
                              width={60}
                              height={60}
                              src={item?.new_image_name}
                              alt="new_image"
                            /> : "--"}
                          </td>
                          <td>
                            {item?.tds_new_file_name ? (
                              <a href={item?.tds_new_file_name} target="_blank">
                                        <i className="fa fa-file"></i>
                              </a>
                            ) : '--'}
                          </td>
                          <td>
                            {item?.qap_new_file_name ? (
                              <a href={item?.qap_new_file_name} target="_blank">
                                        <i className="fa fa-file"></i>
                              </a>
                            ) : '--'}
                          </td>
                          <td style={{ width: "100px" }}>
                            {new Date(item.created_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
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
                              {userType != 6 &&
                                <span
                                  className="fa fa-edit"
                                  onClick={() => handleUpdateProduct(item)}
                                ></span>}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}

            <div className="d-flex justify-content-between align-items-center">
              <div>
                {/* Always show database totals */}
                <p><b>Total Products: </b>{totalCount.total_count}</p>
                <p><b>Total Approved Products: </b>{totalCount.approve_count}</p>
                <p><b>Total Disapproved Products: </b>{totalCount.disapprove_count}</p>
                
                {/* Show filtered counts when filtering is applied */}
                {totalCount.is_filtered && (
                  <div className="mt-2 pt-2 border-top">
                    <p><b>Filtered Results: </b>{totalCount.filtered_count}</p>
                    <p><b>Filtered Approved: </b>{totalCount.filtered_approve_count}</p>
                    <p><b>Filtered Disapproved: </b>{totalCount.filtered_disapprove_count}</p>
                  </div>
                )}
              </div>
              {/* Always show pagination if we have total count from API */}
              <div className="d-flex flex-column align-items-center gap-2">
                {/* Pagination Section */}
                <div className="d-flex justify-content-between align-items-center mt-3">
                  {totalCount.filtered_count > 0 && (
                    <>
                      <ReactPaginate
                        previousLabel={"Previous"}
                        nextLabel={"Next"}
                        breakLabel={"..."}
                        pageCount={totalPages}
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
                          disabled={!pageSearchInput || parseInt(pageSearchInput) < 1 || parseInt(pageSearchInput) > totalPages}
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
                <div className={`tab-pane fade ${activeTab === 'variants' ? 'active show' : ''}`}>
                  <div className="card card-body">
                    <div className="row g-3">
                      {/* Search and filters for variants */}
                      <div className="col-sm-3 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Variants"
                          value={filterValues.searchString}
                          onChange={handleSearch}
                        />
                      </div>
                      
                      <div className="col-sm-3 mb-3">
                        <Select
                          options={categories}
                          placeholder="Category"
                          styles={customSelectStyles}
                          isClearable={true}
                          instanceId="category-select"
                          value={filterValues.category ? categories.find(opt => opt.value === filterValues.category) : null}
                          onChange={(selectedOption) => handleFilterChange('category', selectedOption)}
                        />
                      </div>
                      
                      <div className="col-sm-3 mb-3">
                        <Select
                          options={vendorData}
                          placeholder="Vendor"
                          styles={customSelectStyles}
                          isClearable={true}
                          instanceId="vendor-select"
                          value={filterValues.vendor ? vendorData.find(opt => opt.value === filterValues.vendor) : null}
                          onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                        />
                      </div>
                      
                      <div className="col-sm-3 mb-3">
                        <div className="d-flex">
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              getAllVariants();
                            }}
                          >
                            Search
                          </button>
                          <button
                            className="btn btn-secondary ms-2"
                            onClick={resetFilters}
                          >
                            Reset
                          </button>
                        </div>
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
                                    // Implement select all for variants
                                    const checked = e.target.checked;
                                    const updatedVariants = variants.map(variant => ({
                                      ...variant,
                                      isChecked: checked
                                    }));
                                    setVariants(updatedVariants);
                                  }}
                                />
                              </th>
                              <th>Name</th>
                              <th>Product</th>
                              <th>Category</th>
                              <th>Vendors</th>
                              <th>Status</th>
                              <th>Created By</th>
                              <th>Updated By</th>
                              <th>Created At</th>
                              <th>Updated At</th>
                              <th>Actions</th>
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
                                        // Toggle checkbox for a single variant
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
                                    {variant.vendor_name 
                                      ? <span className="badge badge-info">{variant.vendor_name}</span> 
                                      : "-"}
                                  </td>
                                  <td>
                                    {/* Similar approval controls as products */}
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
                                            onClick={() => openRejectModal(variant.id)}
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
                                              onClick={() => handleAcceptRejectProduct(variant.id, '1')}
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
                                    {/* Changes by Agnij June 14, 2024 [Added created by display] */}
                                    {variant.created_by ? 
                                      addedByOptions.find(user => user.value === parseInt(variant.created_by))?.label || variant.created_by 
                                      : "-"}
                                  </td>
                                  <td>
                                    {/* Changes by Agnij June 14, 2024 [Added updated by display] */}
                                    {variant.updated_by ? 
                                      addedByOptions.find(user => user.value === parseInt(variant.updated_by))?.label || variant.updated_by 
                                      : "-"}
                                  </td>
                                  <td>
                                    {variant.created_at ? 
                                      new Date(variant.created_at).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }) : "-"}
                                  </td>
                                  <td>
                                    {variant.updated_at ? 
                                      new Date(variant.updated_at).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                      }) : "-"}
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-primary me-2"
                                      onClick={() => {
                                        router.push(`/product-management/variant/${variant.id}`);
                                      }}
                                    >
                                      <i className="fas fa-eye"></i> View
                                    </button>
                                    <button
                                      className="btn btn-sm btn-info"
                                      onClick={() => {
                                        router.push(`/product-management/edit-variant/${variant.id}`);
                                      }}
                                    >
                                      <i className="fas fa-edit"></i> Edit
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="11" className="text-center">
                                  No variants found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                    
                    {/* Variants pagination */}
                    {variants.length > 0 && variantsTotalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p><b>Total Variants: </b>{variants.length}</p>
                          <p><b>Page: </b>{variantsPage} of {variantsTotalPages}</p>
                        </div>
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
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Mappings Tab */}
                <div className={`tab-pane fade ${activeTab === 'mappings' ? 'active show' : ''}`}>
                  <div className="card card-body">
                    <div className="row g-3">
                      {/* Search and filters for mappings */}
                      <div className="col-sm-3 mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Search Mappings"
                          value={filterValues.searchString}
                          onChange={handleSearch}
                        />
                      </div>
                      
                      <div className="col-sm-3 mb-3">
                        <Select
                          options={vendorData}
                          placeholder="Vendor"
                          styles={customSelectStyles}
                          isClearable={true}
                          instanceId="vendor-select-mappings"
                          value={filterValues.vendor ? vendorData.find(opt => opt.value === filterValues.vendor) : null}
                          onChange={(selectedOption) => handleFilterChange('vendor', selectedOption)}
                        />
                      </div>
                      
                      <div className="col-sm-3 mb-3">
                        <div className="d-flex">
                          <button
                            className="btn btn-primary"
                            onClick={() => {
                              getAllMappings();
                            }}
                          >
                            Search
                          </button>
                          <button
                            className="btn btn-secondary ms-2"
                            onClick={resetFilters}
                          >
                            Reset
                          </button>
                        </div>
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
                              <th>Variant</th>
                              <th>Product</th>
                              <th>Vendor</th>
                              <th>Vendor Email</th>
                              <th>Category</th>
                              <th>Status</th>
                              <th>Mapped On</th>
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
                                    <span className="badge badge-warning">
                                      {mapping.category_names && mapping.category_names.length > 0 
                                        ? mapping.category_names[0] 
                                        : "-"}
                                    </span>
                                  </td>
                                  <td>
                                    {/* Approval controls similar to products and variants */}
                                    {mapping.is_mapped ? (
                                      <span className="badge badge-success">Mapped</span>
                                    ) : (
                                      <span className="badge badge-danger">Not Mapped</span>
                                    )}
                                  </td>
                                  <td>
                                    {mapping.mapped_at_formatted || "-"}
                                  </td>
                                  <td>
                                    <button
                                      className="btn btn-sm btn-info"
                                      onClick={() => {
                                        router.push(`/product-management/mapping/${mapping.id}`);
                                      }}
                                    >
                                      <i className="fas fa-edit"></i> Edit
                                    </button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan="8" className="text-center">
                                  No mappings found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      )}
                    </div>
                    
                    {/* Mappings pagination */}
                    {mappings.length > 0 && mappingsTotalPages > 1 && (
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <p><b>Total Mappings: </b>{mappings.length}</p>
                          <p><b>Page: </b>{mappingsPage} of {mappingsTotalPages}</p>
                        </div>
                        <ReactPaginate
                          previousLabel={"Previous"}
                          nextLabel={"Next"}
                          breakLabel={"..."}
                          pageCount={mappingsTotalPages}
                          marginPagesDisplayed={2}
                          pageRangeDisplayed={3}
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
                      </div>
                    )}
                  </div>
                </div>
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
                                    item.errors.map((err) => {
                                      return (
                                        <p className="mb-0">{err}</p>
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
                                    item.error.map((err) => {
                                      return (
                                        <p className="mb-0">{err}</p>
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
