import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";
import axios from "axios";

function handleGetVendorList(limit = 10, page = 1, verified, organization, name, email, dateFrom, dateTo, status, created_by, source, subscription_plan, is_private , mobile) {
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
      if (source) url += `&source=${source}`;
      if (subscription_plan) url += `&subscription_plan=${subscription_plan}`;
      if (is_private) url += `&is_private=${is_private}`;
      if (mobile) url += `&mobile=${mobile}`;


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

function getVendorlocations(company_id) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/get-vendor-locations/${company_id}`
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

function saveVendorlocations(payload) {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/add-vendor-location`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

function updateVendorlocation(payload,id) {
  return new Promise(async (resolve, reject) => {
    try {

      const response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor-location/:${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
}

function handleDeleteVendorLocation(loc_id){
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/delete-vendor-location/${loc_id}`
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


export const fetchVendorDocuments = async (page = 1, limit = 10) => {
  const res = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/get-vendor-profile-documents?page=${page}&limit=${limit}`
  );
  return res;
};

// Approve a vendor document
// In @/utils/services/vendor-management.js
export const approveVendorDocument = async (data) => {
  try {
    const response = await axiosxdata.put(
      `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/approve-vendor-profile-documents`,
      data
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

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

// Fetch subscription plans for vendors
function getSubscriptionList(values) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/subscription-list?user_type=3`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  })
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

function handleGetBuyerCompanyDropdown(search = "", limit = 100) {
  return new Promise(async (resolve, reject) => {
    try {
      let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/buyer-company-dropdown?limit=${limit}`;
      if (search) {
        url += `&search=${encodeURIComponent(search)}`;
      }
      const response = await axiosInstance.get(url);
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleGetSpocList(limit = 10, page = 1) {
  return new Promise(async (resolve, reject) => {
    try {
      const cacheBuster = Date.now();
      const url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/spoc-list?limit=${limit}&page=${page}&cb=${cacheBuster}`;

      // Fetch paginated SPOCs
      const response = await axiosInstance.get(url);

      // Return full axios response so caller can access response.data
      resolve(response);
    } catch (error) {
      console.error('Error in handleGetSpocList:', error);
      reject(error);
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
  handleUpdateVendorSpoc,
  addNewSpoc,
  getSubscriptionList,
  handleDeleteSpoc,
  getAdminsList,
  handleGetSpocList,
  handleGetBuyerCompanyDropdown,
  getVendorlocations,
  saveVendorlocations,
  updateVendorlocation,
  handleDeleteVendorLocation
};
