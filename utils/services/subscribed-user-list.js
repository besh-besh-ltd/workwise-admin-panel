import axiosInstance from "@/utils/axios";
import axiosFormData from "../axios/form-data";

export const getSubscribedUserList = (
  page = 1,
  limit = 10,
  id,
  search,
  user_type,
  status,
  subscriptionStatus,
  download
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response;
      let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/all-subscriber-list?page=${page}&limit=${limit}`;

      const queryParams = [];

      if (id) {
        queryParams.push(`id=${id}`);
      }

      if (search) {
        queryParams.push(`search=${search}`);
      }

      if (user_type) {
        queryParams.push(`user_type=${user_type}`);
      }

      if (status === 1 || status === 0) {
        queryParams.push(`status=${status}`);
      }

      if (subscriptionStatus === true || subscriptionStatus === false) {
        queryParams.push(`expire=${subscriptionStatus}`);
      }

      if (download) {
        queryParams.push(`download=${download}`);
      }

      if (queryParams.length > 0) {
        url += `&${queryParams.join("&")}`;
      }
      if (download) {
        response = await axiosInstance.get(url, {
          responseType: "blob", // Set responseType to 'blob' to receive binary data
        });
      } else {
        response = await axiosInstance.get(url);
      }

      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};
