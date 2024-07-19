import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";

function handleGetOtherUserList(limit = 10, page = 1, verified, organization, name) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/other-user-list?limit=${limit}&page=${page}&verified=${verified}&organization=${organization}&name=${name}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleGetOtherUserDetails(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/other-user-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleApproveOtherUser(id, status) {
  let payload = {};

  if (typeof status === 'number' && status === 1) {
    // Approve scenario
    payload.status = status.toString(); // Convert status to string
  } else if(typeof status === 'number' && status === 0){
    payload ={
    reject_reason_id: 4,
    status: 0
    }
  }else {
    // Disapprove scenario
    payload = status;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/accept-other-user/${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleAddOtherUser(values) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/create-other-user`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleUpdateOtherUser(values, editData) {
  if (values.image == "") {
    delete values.image;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/update-other-user/${editData.id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleDeleteOtherUser(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/other/delete-other-user/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
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

function getAllProducts(limit = 10, page = 1) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/product-list?limit=${limit}&page=${page}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

export {
  handleGetOtherUserList,
  handleGetOtherUserDetails,
  handleAddOtherUser,
  handleUpdateOtherUser,
  handleApproveOtherUser,
  handleGetVendorDetails,
  handleAddVendor,
  handleDeleteVendorProfile,
  handleDeleteOtherUser,
  handleDisableVendorProfile,
  handleUpdateVendor,
  getAllProducts,
};
