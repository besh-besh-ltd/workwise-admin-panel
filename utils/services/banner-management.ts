import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

const handleGetBannerList = (page) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/banner-listing?page=${page}&limit=20`
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
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-banner/${id}`,values);
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
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-banner/${id}`);
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
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/banner-detail/${id}`);
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

export {
  handleGetBannerList,
  handleAddBanner,
  getPageList,
  handleDeleteVendorProfile,
  handleGetBanner,
  handleUpdateBanner,
  handleDeleteBanner
};
