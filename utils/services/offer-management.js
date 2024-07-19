import axiosInstance from "@/utils/axios";

export const addOffer = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/add-offer`,
                payload
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getOfferList = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/offer-list`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const updateOffer = (values, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/update-offer/${id}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const getOfferDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/offer-by-id/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const deleteOffer = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/coupon/delete-offer/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}