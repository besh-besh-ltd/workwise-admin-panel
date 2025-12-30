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

export const getClientRfqList = (page = 1, limit = 10, search = '', dateFilter = 'all', startDate = '', endDate = '', companyIds = []) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/client-rfq-list?page=${page}&limit=${limit}&search=${search}`,
        { dateFilter, startDate, endDate, companyIds }
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getClientCompanylist = () =>{
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/companies-list`);
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    }
    );
}
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

export const sendSelectiveReminder = (id, vendorIds, useMailGun) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/rfq/send-selective-reminder/${id}`, {
                vendor_ids: vendorIds,
                use_mailgun: useMailGun
            });
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};