import axiosInstance from "@/utils/axios";

export const addCoupon = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/create-coupon`,
                payload
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const updateCoupon = (values, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/update-coupon/${id}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const getCouponList = (page = 1, limit = 10, couponVal) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            if (couponVal) {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/list-coupon?page=${page}&limit=${limit}&coupon=${couponVal}`
                );
            } else {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/list-coupon?page=${page}&limit=${limit}`
                );
            }
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getCouponDetails = (couponVal) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/list-coupon?coupon=${couponVal}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const deleteCoupon = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/delete-coupon/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}