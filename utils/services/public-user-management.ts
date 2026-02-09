import axiosInstance from "../axios";


export const handleGetPublicUserList = (page, startDate , endDate) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/public/get-public-users?page=${page}&limit=20&start_date=${startDate}&end_date=${endDate}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};