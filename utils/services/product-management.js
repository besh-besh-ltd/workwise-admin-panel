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
      // Changes by Agnij May 4, 2025 [Fixed product data retrieval to use database values]
      
      // Set a timeout of 5 seconds to prevent long hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      try {
        // Add cache busting to prevent 304 responses with empty data
        const timestamp = Date.now();
        
        // Added debug query parameter to show full database data
        const response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_WEB_URL}/products/vendor-product-details/${id}?_t=${timestamp}&debug=true`,
          { 
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            // Allow all successful status codes
            validateStatus: status => (status >= 200 && status < 300) || status === 304
          }
        );
        
        clearTimeout(timeoutId); // Clear the timeout
        
        // Handle empty or error responses
        if (response.status === 304 || !response?.data) {
          throw new Error('Empty response from API');
        }
        
        // Extract the raw product data
        let productData = null;
        
        if (response.data.data && typeof response.data.data === 'object') {
          // Standard API response with data object
          productData = response.data.data;
        } else if (response.data.product && typeof response.data.product === 'object') {
          // Some APIs return data in a 'product' field
          productData = response.data.product;
        } else if (response.data.result && typeof response.data.result === 'object') {
          // Some APIs use 'result' field
          productData = response.data.result;
        } else if (response.data && typeof response.data === 'object' && response.data.id) {
          // Direct product object in data
          productData = response.data;
        } else {
          // Look for product-like object in the response
          const findProductObject = (obj) => {
            if (!obj || typeof obj !== 'object') return null;
            
            // Check if this object looks like a product
            if (obj.id && (obj.name || obj.product_name)) {
              return obj;
            }
            
            // Check nested objects
            for (const key in obj) {
              if (typeof obj[key] === 'object') {
                const found = findProductObject(obj[key]);
                if (found) return found;
              }
            }
            
            return null;
          };
          
          productData = findProductObject(response.data);
        }
        
        // Ensure we have a properly structured product object
        const formattedProduct = {
          id: productData.id || id,
          name: productData.name || productData.product_name || 'Product information unavailable',
          status: productData.status || productData.is_active || 1,
          manufacturer: productData.manufacturer || 'Not specified',
          sku: productData.sku || `SKU-${id}`,
          description: productData.description || 'No description available',
          product_images: productData.product_images || productData.images || [],
          product_categories: productData.product_categories || productData.categories || [],
          product_variants: productData.product_variants || productData.variants || [],
          created_at: productData.created_at || new Date().toISOString(),
          updated_at: productData.updated_at || new Date().toISOString(),
          is_approve: productData.is_approve || productData.is_approved || 0,
          slug: productData.slug || ''
        };
        
        // Create a properly formatted response
        const formattedResponse = {
          ...response,
          data: {
            status: 1,
            message: "Product details retrieved successfully",
            data: formattedProduct,
            vendor_list: response.data.vendor_list || []
          }
        };
        
        resolve(formattedResponse);
      } catch (requestError) {
        clearTimeout(timeoutId); // Clear the timeout
        throw requestError; // Re-throw to be caught by the outer catch
      }
    } catch (error) {
      // Try an alternative endpoint as a fallback
      try {
        const alternativeResponse = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/get-product-by-id/${id}`,
          {
            headers: {
              'Cache-Control': 'no-cache'
            }
          }
        );
        
        if (alternativeResponse?.data) {
          let productData = null;
          if (alternativeResponse.data.data) {
            productData = alternativeResponse.data.data;
          } else if (alternativeResponse.data.product) {
            productData = alternativeResponse.data.product;
          } else if (alternativeResponse.data) {
            productData = alternativeResponse.data;
          }
          
          if (productData) {
            const formattedProduct = {
              id: productData.id || id,
              name: productData.name || productData.product_name || 'Product information unavailable',
              status: productData.status || productData.is_active || 1,
              manufacturer: productData.manufacturer || 'Not specified',
              sku: productData.sku || `SKU-${id}`,
              description: productData.description || 'No description available',
              product_images: productData.product_images || productData.images || [],
              product_categories: productData.product_categories || productData.categories || [],
              product_variants: productData.product_variants || productData.variants || [],
              created_at: productData.created_at || new Date().toISOString(),
              updated_at: productData.updated_at || new Date().toISOString(),
              is_approve: productData.is_approve || productData.is_approved || 0,
              slug: productData.slug || ''
            };
            
            const formattedResponse = {
              status: 200,
              data: {
                status: 1,
                message: "Product details retrieved successfully from alternative endpoint",
                data: formattedProduct,
                vendor_list: alternativeResponse.data.vendor_list || []
              }
            };
            
            resolve(formattedResponse);
            return;
          }
        }
      } catch (alternativeError) {
        // Create a fallback response if both endpoints fail
        const fallbackResponse = {
          status: 200,
          data: {
            status: 1,
            message: "Using fallback data due to API error",
            data: {
              id: id,
              name: 'Product information temporarily unavailable',
              status: 1,
              manufacturer: 'Not specified',
              sku: `SKU-${id}`,
              description: 'Unable to load product description at this time',
              product_images: [],
              product_categories: [],
              product_variants: [],
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              created_at_formatted: new Date().toLocaleString()
            },
            vendor_list: [],
            error: error.message || 'Unknown error'
          }
        };
        
        resolve(fallbackResponse);
      }
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

export const acceptProduct = (id, status, reject_reason_id = null, rejectReason) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij May 03, 2025 [Fixed status type handling and removed logs]
      
      // Create payload with status and optional reject reason
      // Ensure status is sent as a string as expected by the backend
      const payload = { 
        status: typeof status === 'number' ? status.toString() : status 
      };
      
      if (reject_reason_id) {
        // Ensure reject_reason_id is included correctly
        payload.reject_reason_id = reject_reason_id;
      }

      if(rejectReason) {
        payload.reject_reason = rejectReason
      }
      
      // Determine if this is a mapping ID (prefixed with 'mapping_')
      const isMappingId = typeof id === 'string' && id.startsWith('mapping_');
      
      // Extract the actual ID if it has a prefix
      const actualId = isMappingId ? id.replace('mapping_', '') : id;
      
      // Choose the appropriate endpoint
      const endpoint = isMappingId 
        ? `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/mapping-approve/${actualId}`
        : `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/accept-product/${actualId}`;
      
      let response = await axiosInstance.put(endpoint, payload);
      resolve(response.data || { message: "Operation successful" });
    } catch (error) {
      reject({ error });
    }
  });
};

export const acceptVariant = (id, status, reject_reason_id = null) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij May 03, 2025 [Fixed status type handling and removed logs]
      
      // Create payload with status and optional reject reason
      // Ensure status is sent as a string as expected by the backend
      const payload = { 
        status: typeof status === 'number' ? status.toString() : status 
      };
      
      if (reject_reason_id) {
        // Ensure reject_reason_id is included correctly
        payload.reject_reason_id = reject_reason_id;
      }
      
      // Determine if this is a mapping ID (prefixed with 'mapping_')
      const isMappingId = typeof id === 'string' && id.startsWith('mapping_');
      
      // Extract the actual ID if it has a prefix
      const actualId = isMappingId ? id.replace('mapping_', '') : id;
      
      // Choose the appropriate endpoint
      const endpoint = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/accept-variant/${actualId}`;
      
      let response = await axiosInstance.put(endpoint, payload);
      resolve(response.data || { message: "Operation successful" });
    } catch (error) {
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

export const getProductVariants = (productId, page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij May 3, 2025 [Removed console logs for cleaner code]
      
      // Add cache busting to prevent 304 responses
      const timestamp = Date.now();
      
      // Build complete URL for debugging purposes - added include_product_details and direct_db params
      const url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-variant/${productId}?page=${page}&limit=${limit}&include_details=true&include_product_details=true&direct_db=true&_t=${timestamp}`;
      
      let response = await axiosInstance.get(
        url,
        { 
          validateStatus: status => (status >= 200 && status < 300) || status === 304,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // Handle 304 responses or empty data
      if (response.status === 304) {
        response.data = { status: 1, data: [], pagination: { total: 0, page, limit, pages: 0 } };
      } else if (!response.data) {
        response.data = { status: 1, data: [], pagination: { total: 0, page, limit, pages: 0 } };
      } else if (response.data && !response.data.data) {
        
        // Check if response.data is the array itself (sometimes the backend returns just the array)
        if (Array.isArray(response.data)) {
          const dataArray = response.data;
          response.data = {
            status: 1,
            data: dataArray,
            pagination: {
              total: dataArray.length,
              page: parseInt(page),
              limit: parseInt(limit),
              pages: Math.ceil(dataArray.length / limit)
            }
          };
        } else {
          // Try to extract array from a nested field
          let variantsArray = null;
          
          if (response.data.variants && Array.isArray(response.data.variants)) {
            variantsArray = response.data.variants;
          } else if (response.data.product_variants && Array.isArray(response.data.product_variants)) {
            variantsArray = response.data.product_variants;
          } else if (response.data.results && Array.isArray(response.data.results)) {
            variantsArray = response.data.results;
          } else {
            // Look for any array in the response
            Object.keys(response.data).forEach(key => {
              if (Array.isArray(response.data[key]) && !variantsArray) {
                variantsArray = response.data[key];
              }
            });
          }
          
          if (variantsArray) {
            response.data.data = variantsArray;
          } else {
            response.data.data = [];
          }
          
          response.data.pagination = { 
            total: response.data.data.length, 
            page, 
            limit, 
            pages: Math.ceil(response.data.data.length / limit) 
          };
        }
      }
      
      // If there's no pagination info, create it
      if (!response.data.pagination) {
        const totalItems = Array.isArray(response.data.data) ? response.data.data.length : 0;
        response.data.pagination = {
          total: totalItems,
          page: parseInt(page),
          limit: parseInt(limit),
          pages: Math.ceil(totalItems / limit)
        };
      }
      
      // Extract product details directly from response if possible
      let productDetails = null;
      
      // Try to find product details in the response
      if (response.data.product) {
        productDetails = response.data.product;
      } else if (response.data.product_details) {
        productDetails = response.data.product_details;
      } else {
        // If not found, fetch product details separately
        try {
          const productResponse = await getProductDetailsById(productId);
          if (productResponse?.data?.data) {
            productDetails = productResponse.data.data;
          }
        } catch (productError) {
          // Continue without product details
        }
      }
      
      // Store product details in response for use by the frontend
      response.data.product_details = productDetails;

      // Enhance the variant data with additional info if missing
      if (response.data.data && Array.isArray(response.data.data)) {
        // Enhance each variant with additional information
        response.data.data = response.data.data.map(variant => {
          // Deep clone to avoid mutating the original object
          const enhancedVariant = { ...variant };
          
          // Use variant.product_name if it exists, otherwise use from product details
          if (!enhancedVariant.product_name && productDetails) {
            enhancedVariant.product_name = productDetails.name;
          }
          
          // Format category information
          if (enhancedVariant.categories && Array.isArray(enhancedVariant.categories) && enhancedVariant.categories.length > 0) {
            enhancedVariant.category_info = enhancedVariant.categories.map(c => c.name || c.category_name).join(', ');
          } else if (productDetails && productDetails.product_categories && 
                    Array.isArray(productDetails.product_categories) && 
                    productDetails.product_categories.length > 0) {
            // Fallback to product categories if variant categories not available
            enhancedVariant.category_info = productDetails.product_categories
              .map(c => c.category_name || c.name)
              .filter(Boolean)
              .join(', ');
          } else {
            enhancedVariant.category_info = enhancedVariant.category_info || enhancedVariant.category_name || '';
          }
          
          // Ensure variant has name field
          enhancedVariant.name = enhancedVariant.variant_name || enhancedVariant.name || `Variant #${enhancedVariant.id}`;
          enhancedVariant.variant_name = enhancedVariant.name;
          
          // Normalize created_at date if exists
          if (enhancedVariant.created_at) {
            try {
              // Check if it's already a Date object to avoid errors
              if (!(enhancedVariant.created_at instanceof Date)) {
                const createdDate = new Date(enhancedVariant.created_at);
                enhancedVariant.created_at_formatted = createdDate.toLocaleString();
              }
            } catch (e) {
              // Silent catch to avoid errors in date parsing
            }
          }
          
          // Add product reference
          enhancedVariant.product_id = productId;
          
          return enhancedVariant;
        });
      }
      
      resolve(response);
    } catch (error) {
      // Return an empty data structure instead of rejecting
      resolve({
        status: 200,
        data: {
          status: 1,
          data: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: 0
          },
          message: `Error loading variants: ${error.message || 'Unknown error'}`
        }
      });
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
// Changes by Agnij May 01, 2025 [Enhanced variant search with more detailed information]
// Changes by Agnij May 03, 2025 [Added pagination parameters]
// Changes by Agnij May 03, 2025 [Normalize response structure]
export const searchAllVariants = (id, searchTerm, startDate, endDate, vendorId, categoryId, addedBy, approvalStatus, page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij May 03, 2025 [Fixed approval status filter and removed logs]
      // Add a timestamp to prevent 304 responses
      const timestamp = Date.now();
      
      // Build query params
      let queryParams = new URLSearchParams(); // Use URLSearchParams for cleaner construction

      if (id) queryParams.set('id', id);
      if (searchTerm) queryParams.set('search_term', searchTerm);
      if (startDate) queryParams.set('start_date', startDate);
      if (endDate) queryParams.set('end_date', endDate);
      if (vendorId) queryParams.set('vendor_id', vendorId);
      if (categoryId) queryParams.set('category_id', categoryId);
      if (addedBy) queryParams.set('added_by', addedBy);
      if (approvalStatus !== undefined && approvalStatus !== null && approvalStatus !== "") {
        queryParams.set('is_approve', approvalStatus);
      }
      // Add pagination parameters
      if (page) queryParams.set('page', page);
      if (limit) queryParams.set('limit', limit);

      // Add include_details (if still needed, check backend) and cache busting
      queryParams.set('include_details', 'true'); 
      queryParams.set('_t', timestamp);

      const queryString = queryParams.toString();
      
      // Use the safe endpoint which now supports pagination
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/search-variants-safe?${queryString}`,
        { 
          validateStatus: status => (status >= 200 && status < 300) || status === 304,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      // console.log("searchAllVariants: Raw Axios response object:", response); 

      // Handle 304 Not Modified or empty responses - resolve with default structure
      if (response.status === 304 || !response.data) {
        console.warn('Search variants returned 304 or no data.');
        resolve({ data: [], pagination: { total: 0, page, limit, pages: 1 } });
        return;
      }

      // The response object itself has .data (array) and .pagination (object)
      const conditionMet = Boolean(response.data && Array.isArray(response.data) && response.pagination);
      // console.log("searchAllVariants: Checking condition (response.data && Array.isArray(response.data) && response.pagination):", conditionMet); 

      // Normalize the response before resolving
      if (conditionMet) {
        // Expected structure: The response object itself has .data (array) and .pagination (object)
        // console.log("searchAllVariants: Condition met. Resolving with expected structure.");
        resolve({
           data: response.data, 
           pagination: response.pagination
        });
      } else if (Array.isArray(response.data)) {
         // Data is just an array - wrap it with dummy pagination
         console.warn("searchAllVariants API returned an array directly. Creating dummy pagination.");
         const dataArray = response.data;
         const totalItems = dataArray.length;
         // Note: This pagination is estimated and might not reflect the true total if the array was already paginated by the backend incorrectly.
         resolve({
           data: dataArray,
           pagination: { total: totalItems, page: page, limit: limit, pages: Math.ceil(totalItems / limit) || 1 }
         });
      } else {
         // Unknown structure
         console.error("searchAllVariants: Condition NOT met and response.data is NOT an array. Received unexpected structure. Resolving with empty.");
         resolve({ data: [], pagination: { total: 0, page, limit, pages: 1 } });
      }

    } catch (error) {
      console.error('Error searching variants:', error);
      // Resolve with empty valid structure on error
      resolve({ data: [], pagination: { total: 0, page, limit, pages: 1 } });
    }
  });
};

// Changes by Agnij May 01, 2025 [Added function to get variant-vendor mappings]
// Changes by Agnij May 02, 2025 [Fixed pagination issues]
// Changes by Agnij May 03, 2025 [Removed console logs]
// Changes by Agnij June 12, 2024 [Added variant_id parameter]
export const getVariantMappings = (id = null, searchTerm, startDate, endDate, vendorId, categoryId, addedBy, approvalStatus, page, limit, variantId) => {
  return new Promise(async (resolve, reject) => {
    try {
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
      // Changes by Agnij June 12, 2024 [Add variant_id to query params if provided]
      if (variantId) {
        queryParams += `&variant_id=${encodeURIComponent(variantId)}`;
      }
      
      // Always include pagination parameters
      queryParams += `&page=${pageNum}`;
      queryParams += `&limit=${limitNum}`;
      queryParams += `&_t=${timestamp}`;
      
      // Changes by Agnij June 12, 2024 [Log query parameters for debugging]
      console.log('getVariantMappings API query params:', queryParams);
      
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/variant-mappings?${queryParams}`,
        { validateStatus: status => (status >= 200 && status < 300) || status === 304 }
      );
      
      if (response?.data) {
        // Check if the response includes both data and pagination
        if (response.data && response.pagination) {
          // The response already has the expected format with pagination
          resolve(response);
        } else if (response.data) {
          // Response has data but no pagination - add default pagination
          const totalItems = Array.isArray(response.data.data) ? response.data.data.length : 0;
          const totalPages = Math.max(1, Math.ceil(totalItems / limitNum));
          
          resolve({
            status: 200,
            data: {
              status: 1,
              data: response.data,
              pagination: {
                total: response.data.length,
                page: parseInt(page) || 1,
                limit: parseInt(limit) || 10,
                pages: Math.ceil(response.data.length / (parseInt(limit) || 10))
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
