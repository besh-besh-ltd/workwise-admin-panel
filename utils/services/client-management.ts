import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

export const handleAddClient = (values) => {
  console.log("values-->", values);
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendorapprove/add-vendor-approve`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

export const handleUpdateClient = (id, values) => {
  console.log("api called *");
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendorapprove/update-vendor-approve/${id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

export const handleGetClientList = (
  page = 1,
  limit = 10,
  searchString,
  status
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response;
      if (searchString || status) {
        response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendorapprove/all-vendor-approve-list?page=${page}&limit=${limit}&name=${searchString}&status=${status}`
        );
      } else {
        response = await axiosInstance.get(
          `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendorapprove/all-vendor-approve-list?page=${page}&limit=${limit}`
        );
      }
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const handleGetClient = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendorapprove/vendor-approve-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};
