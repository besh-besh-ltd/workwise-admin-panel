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
  console.log("");
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
      let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/products/vendor-product-details/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
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

export const acceptProduct = (id, status) => {
  let payload = {};
  if (status === '1') {
    payload.status = status;
  } else {
    payload = status;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/accept-product/${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

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
export const searchAllVariants = (searchTerm) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Changes by Agnij May 18, 2025 [Fixed variants search API handling]
      // Add a timestamp to prevent 304 responses
      const timestamp = Date.now();
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/search-variants?search_term=${encodeURIComponent(searchTerm || "")}&_t=${timestamp}`,
        { validateStatus: status => (status >= 200 && status < 300) || status === 304 }
      );
      
      console.log('Variants search response:', response);
      
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
      console.error(`Error searching variants with term ${searchTerm}:`, error);
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
