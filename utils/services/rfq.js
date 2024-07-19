import axiosInstance from "@/utils/axios";
import axiosFormData from "@/utils/axios/form-data";

export const getTerms = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/get-terms`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const handleUploadFile = (file) => {
  let payload = {};
  payload.file = file;
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(`/users/upload-file`, payload);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const vendorApproveList = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/users/vendorapprove-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const categoryList = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/products/category-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const vendorList = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`admin/vendor/vendor-dropdown-list`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const createRfq = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(`/rfq/create`, values);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getRFQS = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(`/rfq/getBuyerRfq`, payload);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};
export const getRFQById = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/getRfqById/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getVendorsByID = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(`/rfq/get-vendors`, values);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getVendorDetailsByID = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/users/vendor-profile/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getVendorRfqList = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(`/rfq/getMyRfq`,payload);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const sendQuotation = (payload) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(`/rfq/quote/create`,payload);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const getQuotes = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/get-quotes/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const downloadQuotesDetails = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/download-quote-results/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const closeRFQ = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/close-rfq/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};

export const sendReminder = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(`/rfq/send-reminder/${id}`);
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
};




