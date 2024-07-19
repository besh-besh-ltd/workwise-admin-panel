import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

const handleGetFaqList = (page) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/faq-list?page=${page}&limit=20`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};
const handleAddFaq = (values) => {
  console.log("values-->", values);
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-faq`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};
const handleAddBanner = (values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-banner`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

const handleUpdateBanner = (id, values) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-banner/${id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

const handleDeleteBanner = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-banner/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

const handleGetBanner = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/banner-detail/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};
const handleGetFaq = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/faq-detail/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};
const handleUpdateFaq = (values, id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-faq/${id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

const handleDeleteFaq = (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-faq/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

const getPageList = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/page-list`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

function handleGetVendorDetails(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/vendor-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleAddVendor(values) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/create-vendor`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleUpdateVendor(values, editData) {
  if (values.image == "") {
    delete values.image;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${editData.id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleDeleteVendorProfile(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/delete-vendor/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleDisableVendorProfile(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/block-vendor/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
export {
  handleAddBanner,
  getPageList,
  handleGetVendorDetails,
  handleAddVendor,
  handleDeleteVendorProfile,
  handleDisableVendorProfile,
  handleUpdateVendor,
  handleGetBanner,
  handleUpdateBanner,
  handleDeleteBanner,
  handleGetFaqList,
  handleAddFaq,
  handleGetFaq,
  handleUpdateFaq,
  handleDeleteFaq,
};
