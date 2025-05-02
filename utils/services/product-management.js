import axiosInstance from "../axios";

export const getCategories = (page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/category-list?page=${page}&limit=${limit}`
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};
export const getCategoriesDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/category-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const createCategory = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/create-category`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};
export const updateCategory = (values, id) => {
  let payload = {};
  payload.title = values.title;
  payload.parent_id = "" + values?.parent_id;
  payload.slug = values?.slug;
  payload.status = "" + values?.status;
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/update-category/${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const deleteCategory = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/delete-category/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

export const productExport = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/export-products`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getAllProducts = (
  limit = 10, 
  page = 1, 
  searchString, 
  vendorApprove, 
  vendorId, 
  isFeatured, 
  addedBy = null, 
  categoryId = null, 
  dateFrom = null,
  dateTo = null,
  approvalStatus = null,
  onlyAddedByAdmin = false
) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Construct the URL exactly as the backend expects it
      let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-list?limit=${limit}&page=${page}`;
      
      // Add parameters that the backend controller actually supports
      if(searchString){
        url += `&productName=${encodeURIComponent(searchString)}`;
      }
      if(vendorApprove){
        url += `&vendorApprove=${encodeURIComponent(vendorApprove)}`;
      }
      if(vendorId){
        url += `&vendorId=${encodeURIComponent(vendorId)}`;
      }
      if(isFeatured){
        url += `&isFeatured=${encodeURIComponent(isFeatured)}`;
      }
      
      // Handle added_by filtering
      if(addedBy){
        url += `&addedBy=${encodeURIComponent(addedBy)}`;
      }
      
      // Special case for admin-added products
      if(onlyAddedByAdmin || (addedBy && addedBy === "1")){
        url += `&onlyAddedByAdmin=true`;
      }
      
      // Handle category filtering
      if(categoryId){
        url += `&categoryId=${encodeURIComponent(categoryId)}`;
      }

      // Handle date filtering
      if(dateFrom){
        url += `&dateFrom=${encodeURIComponent(dateFrom)}`;
      }
      if(dateTo){
        url += `&dateTo=${encodeURIComponent(dateTo)}`;
      }

      // Handle approval status filtering
      if(approvalStatus !== null && approvalStatus !== ""){
        url += `&is_approve=${encodeURIComponent(approvalStatus)}`;
      }
      
      // Add a cache-busting parameter to prevent 304 responses
      const timestamp = Date.now();
      url += `&_t=${timestamp}`;
      
      // Make the request for products
      const response = await axiosInstance.get(url);
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

export const approvedProductList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/products/approved-product-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getProductDetailsById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij July 25, 2024 [Improved error handling for product details API]
      // Changes by Agnij August 15, 2024 [Added connection error handling]
      console.log(`Fetching product details for ID: ${id}`);
      
      // Set a timeout of 5 seconds to prevent long hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_WEB_URL}/products/vendor-product-details/${id}`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId); // Clear the timeout
        
        // Handle case where API only returns status: 1 without data
        if (response?.status === 200 && response.data && response.data.status === 1) {
          if (!response.data.data) {
            console.log('API returned status 1 but no data, creating default response structure');
            // Provide a default response structure
            response.data = {
              ...response.data,
              data: {
                id: id,
                name: 'Product information unavailable',
                status: 1,
                product_images: [],
                product_categories: [],
                product_variants: []
              },
              vendor_list: []
            };
          }
        }
        
        console.log('Product details API response:', response);
        resolve(response);
      } catch (requestError) {
        clearTimeout(timeoutId); // Clear the timeout
        throw requestError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      console.error(`Error fetching product details for ID ${id}:`, error);
      
      // Create a fallback response instead of rejecting
      const fallbackResponse = {
        status: 200,
        data: {
          status: 1,
          message: "Using fallback data due to connection error",
          data: {
            id: id,
            name: 'Product information temporarily unavailable',
            status: 1,
            product_images: [],
            product_categories: [],
            product_variants: []
          },
          vendor_list: []
        }
      };
      
      console.log("Using fallback response:", fallbackResponse);
      resolve(fallbackResponse);
    }
  });
};

export const deleteProduct = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-delete/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

export const acceptProduct = (id, status, reject_reason_id = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij August 19, 2024 [Fixed approval functionality]
      console.log("Processing approval for:", { id, status, reject_reason_id });
      
      // Create payload with status and optional reject reason
      const payload = { status };
      if (reject_reason_id) {
        payload.reject_reason_id = reject_reason_id;
      }
      
      // Determine if this is a mapping ID (prefixed with 'mapping_')
      const isMappingId = typeof id === 'string' && id.startsWith('mapping_');
      
      // Extract the actual ID if it has a prefix
      const actualId = isMappingId ? id.replace('mapping_', '') : id;
      
      console.log("Using endpoint for:", { isMappingId, actualId });
      
      // Choose the appropriate endpoint
      const endpoint = isMappingId 
        ? `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/mapping-approve/${actualId}`
        : `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/accept-product/${actualId}`;
      
      let response = await axiosInstance.put(endpoint, payload);
      resolve(response.data || { message: "Operation successful" });
    } catch (error) {
      console.error("Error in acceptProduct:", error);
      reject({ error });
    }
  });
};

export const rejectListProduct = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/reject-reason-dropdown-list?type=2`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

export const mapVendorWithProduct = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/map-vendor-with-product`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const searchProductsV2 = (values, type = "products") => {
  if (type == "products") {
    let payload = {
      category_id: values.cat_id,
      search_key: values.search_key,
      vendor_name: values.vendor_name,
      // approved_by_id: values.approved_by,
    };

    return new Promise(async (resolve, reject) => {
      try {
        let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/rfq/search-product`, payload);
        resolve(response);
      } catch (error) {
        reject({ message: error });
      }
    });
  } else {
    let payload = {
      category_id: values.cat_id,
      search_key: values.search_key,
      approved_by_id: values.approved_by,
      state: values.state == 0 ? "" : values.state,
      city: values.city == 0 ? "" : values.city,
      vendor_name: values.vendor_name,
      is_private: values.is_private,
      preferred_vendor: values.preferred_vendor,
    };

    return new Promise(async (resolve, reject) => {
      try {
        let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/rfq/search-vendor`, payload);
        resolve(response);
      } catch (error) {
        reject({ message: error });
      }
    });
  }
};

export const getProductDescription = () =>{
  return new Promise (async (resolve , reject)=>{
    try {
      let response =await axiosInstance.get(
      `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-description-get`
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  })
};

export const deleteProductDescription = (id) =>{
  return new Promise (async (resolve , reject) =>{
    try {
      let response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-description-delete/${id}`
      );
      resolve(response.data);
    } catch (error) {
      reject(error);
    }
  })
};

export const addProductDescription =  (produjctObj) => {
  return new Promise (async (resolve , reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-description-add`,
        produjctObj
      )
      resolve (response);
    } catch (error) {
      reject(error);
    }
  })
};

export const editProductsDescription = (productObj) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-description-edit`,
        productObj
      );
   
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

export const getOneProductDescription = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-description-get/${id}`
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

export const addProductTechSpec =  (productId, techSpec ) => {
  return new Promise (async (resolve , reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/product-tech-specs-add`,
        {productId, techSpec}
      )
      resolve (response);
    } catch (error) {
      reject(error);
    }
  })
};

export const uploadProductImages = (productId, files) => {
  return new Promise(async (resolve, reject) => {
    try {
      const formData = new FormData();
      for (let file of files) {
        formData.append('images', file); // make sure this matches field name used in multer
      }
      formData.append('productId', productId); // optionally send productId

      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/upload-product-images`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};

export const getAdminUsersList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/admin-users-list`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

// Product variant services
export const addProductVariant = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-variant`,
        values
      );
      
      resolve({
        status: 201,
        data: response
      });
    } catch (error) {
      console.error('Error in addProductVariant service:', error);
      reject(error?.response?.data || { message: 'Network or server error' });
    }
  });
};

export const getProductVariants = (productId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-variant/${productId}`,
        { validateStatus: status => (status >= 200 && status < 300) || status === 304 }
      );
      
      if (response.status === 304 && !response.data) {
        response.data = { status: 1, data: [] };
      } else if (!response.data) {
        response.data = { status: 1, data: [] };
      }
      
      resolve(response);
    } catch (error) {
      console.error(`Error fetching variants for product ${productId}:`, error);
      reject({ message: error });
    }
  });
};

export const updateProductVariant = (variantId, values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-variant/${variantId}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const deleteProductVariant = (variantId) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-variant/${variantId}`
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const mapVariantWithVendor = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/map-variant-with-vendor`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

// Changes by Agnij April 30, 2025 [Added direct variant search function]
export const searchAllVariants = (id, searchTerm, startDate, endDate, vendorId, categoryId, addedBy, approvalStatus) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij July 25, 2024 [Added all filter parameters]
      // Add a timestamp to prevent 304 responses
      const timestamp = Date.now();
      
      // Build query params
      let queryParams = `id=${id}`
      if (searchTerm)
        queryParams = `search_term=${encodeURIComponent(searchTerm || "")}`;
      if (startDate) {
        queryParams += `&start_date=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        queryParams += `&end_date=${encodeURIComponent(endDate)}`;
      }
      if (vendorId) {
        queryParams += `&vendor_id=${encodeURIComponent(vendorId)}`;
      }
      if (categoryId) {
        queryParams += `&category_id=${encodeURIComponent(categoryId)}`;
      }
      if (addedBy) {
        queryParams += `&added_by=${encodeURIComponent(addedBy)}`;
      }
      if (approvalStatus !== undefined && approvalStatus !== null && approvalStatus !== "") {
        queryParams += `&is_approve=${encodeURIComponent(approvalStatus)}`;
      }
      queryParams += `&_t=${timestamp}`;
      
      // Changes by Agnij May 02, 2025 [Adding alternative endpoint for v_rank issue]
      // Try using a special endpoint that avoids the v_rank error
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/search-variants-safe?${queryParams}`,
        { validateStatus: status => (status >= 200 && status < 300) || status === 304 }
      );
      
      // Handle various response formats
      if (response?.data?.data) {
        // The response already has the expected format
        resolve(response);
      } else if (response?.data) {
        // Response has data but not in the expected format
        resolve({
          status: 200,
          data: {
            status: 1,
            data: response.data
          }
        });
      } else {
        // Empty or invalid response
        resolve({
          status: 200,
          data: {
            status: 1,
            data: []
          }
        });
      }
    } catch (error) {
      console.error("Error in searchAllVariants:", error);
      // Return empty data on error instead of rejecting
      resolve({
        status: 200,
        data: {
          status: 1,
          data: []
        }
      });
    }
  });
};

// Changes by Agnij May 18, 2025 [Added function to get variant-vendor mappings]
// Changes by Agnij August 15, 2024 [Fixed pagination issues]
export const getVariantMappings = (id = null, searchTerm, startDate, endDate, vendorId, categoryId, addedBy, approvalStatus, page, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij July 25, 2024 [Added all filter parameters]
      // Add a timestamp to prevent 304 responses
      const timestamp = Date.now();
      
      // Parse pagination parameters to ensure they're valid
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      
      // Build query params
      let queryParams = '';
      if (id) {
        queryParams = `id=${id}`;
      }
      if(searchTerm) {
        queryParams += queryParams ? `&search_term=${encodeURIComponent(searchTerm || "")}` : `search_term=${encodeURIComponent(searchTerm || "")}`;
      }
      if (startDate) {
        queryParams += `&start_date=${encodeURIComponent(startDate)}`;
      }
      if (endDate) {
        queryParams += `&end_date=${encodeURIComponent(endDate)}`;
      }
      if (vendorId) {
        queryParams += `&vendor_id=${encodeURIComponent(vendorId)}`;
      }
      if (categoryId) {
        queryParams += `&category_id=${encodeURIComponent(categoryId)}`;
      }
      if (addedBy) {
        queryParams += `&added_by=${encodeURIComponent(addedBy)}`;
      }
      if (approvalStatus !== undefined && approvalStatus !== null && approvalStatus !== "") {
        queryParams += `&is_approve=${encodeURIComponent(approvalStatus)}`;
      }
      
      // Changes by Agnij August 15, 2024 [Always include pagination parameters]
      queryParams += `&page=${pageNum}`;
      queryParams += `&limit=${limitNum}`;
      queryParams += `&_t=${timestamp}`;
      
      // Changes by Agnij May 02, 2025 [Added debugging log for API call]
      console.log(`Calling variant-mappings API with query: ${queryParams}`);
      
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/variant-mappings?${queryParams}`,
        { validateStatus: status => (status >= 200 && status < 300) || status === 304 }
      );
      
      // Changes by Agnij August 15, 2024 [Enhanced response handling]
      console.log("Mapping API response:", response?.data);
      
      if (response?.data) {
        // Check if the response includes both data and pagination
        if (response.data.data && response.data.pagination) {
          // The response already has the expected format with pagination
          resolve(response);
        } else if (response.data.data) {
          // Response has data but no pagination - add default pagination
          const totalItems = Array.isArray(response.data.data) ? response.data.data.length : 0;
          const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));
          
          resolve({
            status: 200,
            data: {
              status: 1,
              data: response.data.data,
              pagination: {
                total: totalItems,
                page: pageNum,
                limit: limitNum,
                pages: totalPages
              }
            }
          });
        } else {
          // Only data without nested structure - wrap it
          const dataArray = Array.isArray(response.data) ? response.data : [];
          const totalItems = dataArray.length;
          const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));
          
          resolve({
            status: 200,
            data: {
              status: 1,
              data: dataArray,
              pagination: {
                total: totalItems,
                page: pageNum,
                limit: limitNum,
                pages: totalPages
              }
            }
          });
        }
      } else {
        // Empty or invalid response
        resolve({
          status: 200,
          data: {
            status: 1,
            data: [],
            pagination: {
              total: 0,
              page: pageNum,
              limit: limitNum,
              pages: 1 // Ensure at least 1 page for UI
            }
          }
        });
      }
    } catch (error) {
      console.error("Error in getVariantMappings:", error);
      // Return empty data on error instead of rejecting
      resolve({
        status: 200,
        data: {
          status: 1,
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page) || 1,
            limit: parseInt(limit) || 10,
            pages: 1 // Ensure at least 1 page for UI
          }
        }
      });
    }
  });
};
