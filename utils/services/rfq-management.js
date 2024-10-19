import axiosInstance from "@/utils/axios";

export const getRFQDetails = (rfq_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(`admin/rfq/rfq-list/${rfq_id}`);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const getRFQList = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`admin/rfq/rfq-list`, payload);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const updateStatus = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`admin/rfq/update-status`, payload);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};