import axiosInstance from "@/utils/axios";

export const getContactUsPage = (page = 1, limit = 10) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/contact-us-list?page=${page}&limit=${limit}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}