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

export const getAllProducts = (limit = 10, page = 1, searchString, vendorApprove, vendorId, isFeatured, addedBy = null, categoryId = null, onlyAddedByAdmin = false, dateFrom = null, dateTo = null, status = null) => {
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
        url += `&created_by=${encodeURIComponent(addedBy)}`;
      }
      
      // Special case for admin-added products
      if(onlyAddedByAdmin){
        url += `&onlyAddedByAdmin=1`;
      }
      
      // Handle category filtering
      if(categoryId){
        url += `&categoryId=${encodeURIComponent(categoryId)}`;
      }

      // Handle date filtering
      if(dateFrom){
        url += `&date_from=${encodeURIComponent(dateFrom)}`;
      }
      if(dateTo){
        url += `&date_to=${encodeURIComponent(dateTo)}`;
      }

      // Handle status filtering - ensure it's sent as a number
      if(status !== null && status !== undefined && status !== ''){
        url += `&is_approve=${encodeURIComponent(status)}`;
      }
      
      // Add a cache-busting parameter to prevent 304 responses
      const timestamp = Date.now();
      url += `&_t=${timestamp}`;
      
      // Make the request for products
      const response = await axiosInstance.get(url);
     
      // Check if the response is in the expected format
      if (response.data && typeof response.data === 'object' && 'status' in response.data && response.data.status === 1) {
        if ('data' in response.data && 'total_count' in response.data) {
          resolve(response.data);
        } 
        else if ('data' in response.data && Array.isArray(response.data.data)) {
          const products = response.data.data;
          const totalCount = products.length;
          const approveCount = products.filter(p => p.is_approve === 1).length;
          const disapproveCount = totalCount - approveCount;
          
          const result = {
            ...response.data,
            total_count: totalCount,
            approve_count: approveCount,
            disapprove_count: disapproveCount
          };
          resolve(result);
        }
      } else {
        reject(new Error('Invalid response format'));
      }
    } catch (error) {
      reject(error);
    }
  });
};

export const approvedProductList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`products/approved-product-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getProductDetailsById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`products/vendor-product-details/${id}`);
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
        let response = await axiosInstance.post(`/rfq/search-vendor`, payload);
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
