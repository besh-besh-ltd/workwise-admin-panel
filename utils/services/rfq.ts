import axiosInstance from "@/utils/axios";
import axiosFormData from "@/utils/axios/form-data";

export const vendorApproveList = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/users/vendorapprove-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const categoryList = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/products/category-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const vendorList = (vendorSearchTerm) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/vendor-dropdown-list`, {
        params: {
          search: vendorSearchTerm
        }
      });
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

