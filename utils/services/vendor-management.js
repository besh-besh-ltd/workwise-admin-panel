import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";
import axios from "axios";

function handleGetVendorList(limit = 10, page = 1, verified, organization, name, email, dateFrom, dateTo, status, created_by) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/vendor-list?limit=${limit}&page=${page}`;
      
      if (verified) url += `&verified=${verified}`;
      if (organization) url += `&organization=${organization}`;
      if (name) url += `&name=${name}`;
      if (email) url += `&email=${encodeURIComponent(email)}`;
      if (dateFrom) url += `&date_from=${dateFrom}`;
      if (dateTo) url += `&date_to=${dateTo}`;
      if (status) url += `&status=${status}`;
      if (created_by) url += `&created_by=${created_by}`;

      let response = await axiosInstance.get(url);
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
function handleGetVendorEditDetails(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/vendor-edit-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleGetStates(country_id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/general/states?country_id=${country_id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleGetCities(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/general/cities${id ? `/${id}` : ''}`
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
function handleApproveVendor(id, status) {
  let payload = {};

  if (typeof status === 'number' && status === 1) {
    // Approve scenario
    payload.status = status.toString(); // Convert status to string
  } else if(typeof status === 'number' && status === 0) {
    // Disapprove scenario
    payload = {
      reject_reason_id: 4,
status: 0
    };
  } else {
    // Disapprove scenario
    payload = status;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/accept-vendor/${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleUpdateVendor(values, editDataId) {
  if (values.image == "") {
    delete values.image;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${editDataId}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleUpdateVendorSpoc(values, vendorId,spocId) {

  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${vendorId}/update-spoc/${spocId}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  })
}
function handleDeleteSpoc (vendorId,spocId) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${vendorId}/delete-spoc/${spocId}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  })
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

function rejectList() {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/reject-reason-dropdown-list`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleVendorRfqList(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/vendor-rfq-list/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function addNewSpoc(values, vendorId){
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${vendorId}/add-spoc`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  })
} 

function getAdminsList() {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/admin-users-list`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

export {
  handleGetVendorList,
  handleGetVendorDetails,
  handleGetVendorEditDetails,
  handleAddVendor,
  handleGetCities,
  handleGetStates,
  handleDeleteVendorProfile,
  handleDisableVendorProfile,
  handleUpdateVendor,
  handleApproveVendor,
  rejectList,
  handleVendorRfqList,
  handleUpdateVendorSpoc,
  addNewSpoc,
  handleDeleteSpoc,
  getAdminsList
};
