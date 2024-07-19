import axiosInstance from "@/utils/axios";

export const productReviewListAPI = (page = 1, limit = 10) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-list-review?limit=${limit}&page=${page}`
            );
            resolve(response);
        }
        catch (error) {
            reject({ message: error });
        }
    })
}

export const productReview = (payload) => {
    return new Promise(async(resolve, reject) => {
        try {
            let response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-accept-review`,
                payload
            );
            resolve(response);
        }
        catch (error) {
            reject({ message: error });
        }
    })
}