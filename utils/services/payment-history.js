import axiosInstance from "@/utils/axios";

export const paymentHistoryAPI = (
  page = 1,
  limit = 10,
  start_date,
  end_date,
  payment_status,
  search,
  download
) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response;
      let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/payment-list?page=${page}&limit=${limit}`;

      const queryParams = [];

      if (start_date) {
        queryParams.push(`start_date=${start_date}`);
      }

      if (end_date) {
        queryParams.push(`end_date=${end_date}`);
      }

      if (payment_status === 1 || payment_status === 0) {
        queryParams.push(`payment_status=${payment_status}`);
      }

      if (search) {
        queryParams.push(`search=${search}`);
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
        resolve(response);
      } else {
        response = await axiosInstance.get(url);
        resolve(response);
      }
    } catch (error) {
      reject({ message: error });
    }
  });
};
