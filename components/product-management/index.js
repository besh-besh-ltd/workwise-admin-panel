import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getAllProducts, deleteProduct, rejectListProduct, acceptProduct, mapVendorWithProduct } from "@/utils/services/product-management";
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
  const navigate = useRouter();
  const id = Date.now().toString();
  const [enableBulkUpload, setEnableBulkUpload] = useState(false);
  const [enableBulkProdUpload, setEnableBulkProdUpload] = useState(false);
  const [file, setFile] = useState(null);
  const [prodFile, setProdFile] = useState(null);
  const [loading, setloading] = useState(false);
  const [products, setproducts] = useState([]);
  const [updateProduct, setUpdateProduct] = useState("");
  const [uploadProgress, setuploadProgress] = useState(0);
  const [limit, setlimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, settotalPages] = useState(null);
  const [selectedProductId, setselectedProductsId] = useState('');
  const [reasonList, setReasonList] = useState([]);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [selectedApproveVendor, setSelectedApproveVendor] = useState("");
  const [vendorData, setVendorData] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState("");
  const [selectedFeatured, setSelectedFeatured] = useState("");
  const router = useRouter();
  const [userType, setUserType] = useState(null);


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
    console.log(row);
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

  const handleSearch = (e) => {
    setPage(1)
    setSearchString(e.target.value);

  }

  const handleCloseRejectModal = () => {
    setShowRejectModal(false);
    setselectedProductsId("")
    setInputValue("")
    setSelectValue("")
  }
  const handlePageClick = (e) => {
    setPage(e.selected + 1);
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
    setloading(true);
    setproducts([]);
    getAllProducts(limit, page, searchString, selectedApproveVendor, selectedVendor, selectedFeatured)
      .then((res) => {
        setloading(false);
        // settotalPages(Math.ceil(res.total_count / limit));
        settotalPages(res.total_count);
        setTotalCount({ total_count: res.total_count, disapprove_count: res.disapprove_count, approve_count: res.approve_count });
        res.data.map((item) => (item.isChecked = false));
        setproducts(res.data);
      })
      .catch((err) => {
        setloading(false);
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
    console.log(pp);

    /* axiosInstance
      .post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/export-products`,
        post_datapp
      )
      .then((response) => console.log(response)); */

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
    setProductLoading(true);
      // Reset only the product field when data is loading
      setproductMapObj((prevState) => ({
        ...prevState,
        product: null,
      }));
  
    setVendorProductsList([]); // Clear previous product list
    getAllProducts(20, 1, search_key)
      .then((res) => {
        const product_options = groupBySlug(res.data);
        setVendorProductsList(product_options);
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

  const handleSubmitMapping = async () => {

    if(!mapMultipleProductsWithVendor || mapMultipleProductsWithVendor?.length<=0)  {
        toast.error("select products and vendors to add");
        return 0
      }

      setIsAddingDataProcessing(true);

    for (const productMap of mapMultipleProductsWithVendor) {

    const { product, vendor, approved_by } = productMap;
    
    if (!product || !vendor) {
      toast.error("Product and Vendor fields are required.");
      return;
    }

    try {
      const payload = {
        product_id: product.value,
        vendor_id: vendor.value,
        approved_by: approved_by?.map((item) => item.value) || null
      }
      const res = await mapVendorWithProduct(payload);
      toast.success(res.message)
      setproductMapObj({
        product: null,
        vendor: null,
        approved_by: null
      });
      setOpenProductMap(false);
      getProducts();
    } catch (error) {
      console.log(error)
      toast.error(error.message?.response?.data?.message)
    }
  }

  setproductMapObj({
    product: null,
    vendor: null,
    approved_by: null
  });

  setMapMultipleProductsWithVendor([])
  setIsAddingDataProcessing(false);
  }



  const handleAddProductForBulk = async () => {

    const { product, vendor, approved_by } = productMapObj;

    if (!product || !vendor) {
      toast.error("Product and Vendor fields are required.");
      return;
    }

    setMapMultipleProductsWithVendor((prevState) => [...prevState, productMapObj]);
      
    toast.success("Product added for bulk submission.");
  }



  useEffect(() => {
    getUserProfile();
    getReasonList();
    getVendorApproveList();
    getVendor();
  }, []);

  useEffect(() => {
    getProducts();
  }, [page, searchString, selectedApproveVendor, selectedVendor, selectedFeatured]);

  
  const handleRemoveProduct = (index) => {
    setMapMultipleProductsWithVendor((prevState) => prevState.filter((_, i) => i !== index));
    toast.success("Product removed successfully.");
  };
  
  console.log(vendorData)

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
          <div className="card card-body">
            {!enableBulkUpload && !enableBulkProdUpload && !openProductMap && (
              <div className="row">
                {/* <div className="d-flex justify-content-end flex-wrap"> */}
                <div className="col-sm-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search Products"
                    onChange={handleSearch}
                  />
                </div>
                <div className="col-sm-3">
                  <Select
                    id={id}
                    options={vendorApprovedList}
                    placeholder="Approved Vendor"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="long-value-select"
                    onChange={(e) => setSelectedApproveVendor(e ? e.value : "")}
                  />
                </div>
                <div className="col-sm-3">
                  <Select
                    id={id}
                    options={vendorData}
                    placeholder="Select Vendor"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="long-value-select"
                    onChange={(e) => setSelectedVendor(e ? e.value : "")}
                  />
                </div>
                <div className="col-sm-3">
                  <Select
                    id={id}
                    options={isFeaturesArray}
                    placeholder="Select is featured"
                    styles={customSelectStyles}
                    isClearable={true}
                    instanceId="long-value-select"
                    onChange={(e) => setSelectedFeatured(e ? e.value : "")}
                  />
                </div>
                <div className="d-flex flex-wrap mt-3">
                  <button
                    type="button"
                    onClick={() =>
                      navigate.push("/product-management/add-product")
                    }
                    className="btn btn-primary mr-2"
                  >
                    <i className="fa fa-plus"></i> Add Product
                  </button>


                  <button
                    type="button"
                    className="btn btn-secondary mr-2"
                    onClick={() => {
                      setOpenProductMap(true)
                    }}
                  >
                    Map Product with Vendor
                  </button>

                  {userType != 6 &&
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      onClick={handleExport}
                    >
                      Export
                    </button>}
                </div>
                {/* </div> */}
                {/* </div> */}
              </div>
            )}
            {enableBulkUpload && (
              <div className="row">
                <div className="col-md-8">
                  <div className="input-group buyers-search">
                    <input
                      type="file"
                      className="form-control"
                      name="file"
                      accept=".xlsx"
                      onChange={uploadToClient}
                    />
                  </div>
                  <div className="d-flex mt-4">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      onClick={() => uploadToServer()}
                    >
                      Upload Excel
                    </button>
                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary mr-2"
                        onClick={() => {
                          setuploadProgress(0);
                          setEnableBulkUpload(false);
                          setFile(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {file && (
                    <div className={`progress mt-4 progress-${uploadProgress}`}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >{`${uploadProgress}%`}</div>
                    </div>
                  )}
                </div>
                <div className="col-md-4"></div>
              </div>
            )}

            {enableBulkProdUpload && (
              <div className="row">
                <div className="col-md-8">
                  <div className="input-group buyers-search">
                    <input
                      type="file"
                      className="form-control"
                      name="file"
                      accept=".xlsx"
                      onChange={uploadToClientProd}
                    />
                  </div>
                  <div className="d-flex mt-4">
                    <button
                      type="button"
                      className="btn btn-primary mr-2"
                      onClick={() => uploadToServerProd()}
                    >
                      Upload Product Excel
                    </button>
                    <div className="d-flex justify-content-end">
                      <button
                        type="button"
                        className="btn btn-secondary mr-2"
                        onClick={() => {
                          setuploadProgress(0);
                          setEnableBulkProdUpload(false);
                          setProdFile(null);
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  {file && (
                    <div className={`progress mt-4 progress-${uploadProgress}`}>
                      <div
                        className="progress-bar progress-bar-striped progress-bar-animated"
                        role="progressbar"
                        style={{ width: `${uploadProgress}%` }}
                        aria-valuenow={uploadProgress}
                        aria-valuemin="0"
                        aria-valuemax="100"
                      >{`${uploadProgress}%`}</div>
                    </div>
                  )}
                </div>
                <div className="col-md-4"></div>
              </div>
            )}
            {openProductMap && (
              <div className="row">
                <div className="col-12 d-flex justify-content-between">
                  <h2 className="fs-4 mb-3">Map Product with Vendor</h2>
                  <button
                    type="button"
                    className="btn btn-danger mb-3"
                    onClick={() => setOpenProductMap(false)}
                  >
                    Close
                  </button>
                </div>

              <div className="row mb-4">
                <div className="col-6 col-md-4">
                  <label htmlFor="vendor" className="form-label fw-bold">Vendor *</label>
                  <Select
                    name="vendor"
                    options={vendorData}
                    value={productMapObj.vendor}
                    isClearable={false}
                    isSearchable
                    placeholder="Select Vendor"
                    onChange={handleMappingObj}
                    components={{ Option: CustomSelectOption }}
                    className="mb-3"
                    />
                  </div>

                   <div className="col-6 col-md-4">
                     <label htmlFor="product" className="form-label fw-bold">Product Name *</label>
                     <input
                       type="text"
                       name="product"
                       className="form-control mb-3"
                       placeholder="Search Products by name"
                       onChange={(e) => debounceGetVendorProductList(e.target.value)}
                     />
                 
                     <div className="border rounded p-3">
                       <h5 className="mt-2 mb-3"> {productLoading ? "Searching Products": "Select Product"} </h5>
                  
                       {!productLoading && vendorProductsList?.length > 0 ? (
                         vendorProductsList.map((item, index) => (
                           <div
                             className="d-flex justify-content-between align-items-center border-bottom py-2"
                             key={item.label + "_" + index}
                           >
                             <div>
                               <p className="mb-0 fw-bold">{item.label}</p>
                               <p className="text-muted">{item.categories}</p>
                             </div>
                             <button
                               className={`btn ${productMapObj?.product?.value === item.value ? "btn-danger" : "btn-primary"} btn-sm`}
                               onClick={() =>
                                 productMapObj?.product?.value === item.value
                                   ? handleMappingObj(null, { name: "product" })
                                   : handleMappingObj(item, { name: "product" })
                               }
                             >
                               {productMapObj?.product?.value === item.value ? "Remove" : "Select"}
                             </button>
                           </div>
                         ))
                       ) : (
                         <p className="text-muted">No Product Available</p>
                       )}
                     </div>
                   </div>

                    <div className="col-6 col-md-4">
                      <label htmlFor="approved_by" className="form-label fw-bold">Approved By</label>
                  <Select
                    name="approved_by"
                    options={vendorApprovedList}
                    isMulti
                    isSearchable
                    isClearable={false}
                    onChange={handleMappingObj}
                    placeholder="Approved By"
                        className="mb-3"
                  />
                    </div>
                </div>

               <div className="text-end">
                    <button
                      type="button"
                      className="btn btn-primary px-4"
                      onClick={handleAddProductForBulk}
                      disabled={isAddingDataProcessing}
                    >
                      {isAddingDataProcessing ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Uploading...
                        </>
                      ) : (
                        "Add Product"
                      )}
                    </button>
                  </div>

                   
                   {/* Display Mapped Products */}
                   {mapMultipleProductsWithVendor.length > 0 && (
                     <div className="mt-4">
                       <h5 className="mb-3 fw-bold">Mapped Products</h5>
                       <div className="border rounded p-3 bg-light">
                         {mapMultipleProductsWithVendor.map((item, index) => (
                           <div
                             key={index}
                             className="d-flex justify-content-between align-items-center border-bottom py-2"
                           >
                             <div>
                               <p className="mb-0 fw-bold">{item.product.label}</p>
                               <p className="text-muted">{item.product.categories}</p>
                               <small><b>Vendor:</b> {item.vendor.label}</small>
                               <br />
                               <small><b>Approved By:</b> {item?.approved_by?.map(a => a.label)?.join(", ")}</small>
                             </div>
                             <button
                                 disabled={isAddingDataProcessing}
                               className="btn btn-danger btn-sm"
                               onClick={() => handleRemoveProduct(index)}
                             >
                                {isAddingDataProcessing ? (
                                <>
                                  <span className="spinner-border spinner-border-sm me-2"></span>
                                  Uploading...
                                </>
                              ) : (
                                "Remove"
                              )}
                             </button>
                           </div>
                         ))}
                       </div>
                     </div>
                   )}


                <div className="col-12 d-flex justify-content-end gap-4 my-3">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    disabled={isAddingDataProcessing}
                    onClick={handleSubmitMapping}
                  >
                    {isAddingDataProcessing ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Uploading...
                    </>
                  ) : (
                    "Submit"
                  )}
                  </button>
                </div>

                <div className="col-12 mt-3">
                  <p className=" border rounded-3 p-2 bg-light">
                    <b>Note: </b>
                    If you don't find the Product or Vendor, please add them first and retry.
                  </p>
                </div>
              </div>
            )}
          </div>

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

              {Math.ceil(productWithVendorErrors.length / 10) > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  pageCount={Math.ceil(productWithVendorErrors.length / 10)}
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
                          {/* <th scope="col">Product Name</th>
                        <th scope="col">Vendor Name</th>
                        <th scope="col">Vendor Email</th> */}
                          <th scope="col">Errors</th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          productErrors.map((item) => {
                            return (
                              <tr key={`err_item_${item.Row}`}>
                                <td>{item.Row || "---"}</td>
                                {/* <td>{item.productName || "---"}</td>
                              <td>{item.vendorName || "---"}</td>
                              <td>{item.vendorEmail || "---"}</td> */}
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

              {Math.ceil(productErrors.length / 10) > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  pageCount={Math.ceil(productErrors.length / 10)}
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  renderOnZeroPageCount={null}
                  className="pagination"
                />
              )}
            </div>
          }

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
                          {/* <td>{item.status == 1 ? "Active" : "Inactive"}</td> */}
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
                            <p className="text-sm text-capitalize text-nowrap mb-1"><b>Added By: </b>{item.added_by}</p>
                            <p className="text-sm text-capitalize text-nowrap mb-1"><b>Approved By: </b>{item.vendor_approved_by}</p>
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
                                <i class="fa fa-file"></i>
                              </a>
                            ) : '--'}
                          </td>
                          <td>
                            {item?.qap_new_file_name ? (
                              <a href={item?.qap_new_file_name} target="_blank">
                                <i class="fa fa-file"></i>
                              </a>
                            ) : '--'}
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
                              {/* <span
                                onClick={() => handleDeleteProduct(item.id)}
                                class="fa fa-trash ml-2">
                              </span> */}
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
            <p><b>Total Products: </b>{totalCount.total_count}</p>
            <p><b>Total Approved Products: </b>{totalCount.approve_count}</p>
            <p><b>Total Disapproved Products: </b>{totalCount.disapprove_count}</p>

            </div>
              {Math.ceil(totalPages / 10) > 1 && (
                <ReactPaginate
                  breakLabel="..."
                  nextLabel={<i className="fa fa-angle-right"></i>}
                  onPageChange={handlePageClick}
                  pageRangeDisplayed={2}
                  pageCount={Math.ceil(totalPages / 10)}
                  previousLabel={<i className="fa fa-angle-left"></i>}
                  renderOnZeroPageCount={null}
                  className="pagination"
                />
              )}
            </div>
          </div>

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
    </>
  );
};

export default ProductManagement;
