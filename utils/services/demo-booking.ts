import axiosInstance from "../axios";
export const getDemoBookingList = (page = 1, limit = 10)=>{

    return new Promise(async (resolve, reject) =>{

        try {
            let response = await axiosInstance.get(
              `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/book-a-demo?page=${page}&limit=${limit}`
            );
            resolve(response);
        } catch (error) {
          reject({ error });
        }
    });

}

export const updateDemoBookingRemark = (id, remark) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/book-a-demo/`,
        { id, remark }
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};