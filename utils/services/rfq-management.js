import axiosInstance from "@/utils/axios";

export const getRFQDetails = (rfq_id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/rfq-list/${rfq_id}`);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const getRFQList = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/rfq-list`, payload);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const updateStatus = (payload) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/update-status`, payload);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};


export const sendRFQReminderToVendor = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/send-reminder/${id}`);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const getVendorsForReminder = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/vendors-for-reminder/${id}`);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const sendSelectiveReminder = (id, vendorIds) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/send-selective-reminder/${id}`, {
                vendor_ids: vendorIds
            });
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};