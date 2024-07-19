import axiosInstance from "../axios/index";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";

function handleGetBuyerList(limit = 10, page = 1, verified, organization, name) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-list?limit=${limit}&page=${page}&verified=${verified}&organization=${organization}&name=${name}`
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
}

function handleApproveBuyer(id, status) {
  let payload = {};
  payload.status = status;
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosxdata.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/accept-buyer/${id}`,
        payload
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleDeleteBuyerProfile(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.delete(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/delete-buyer/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleUpdateBuyer(values, editData) {
  if (values.image == "") {
    delete values.image;
  }
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosFormData.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/update-buyer/${editData.id}`,
        values
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}
function handleGetBuyerDetails(id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleGetBuyerRfqList(page=1, limit=10, id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-rfq-list/${id}?page=${page}&limit=${limit}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleGetSubscriptionDetails(id){
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-subscription-details/${id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

export {
  handleGetBuyerList,
  handleApproveBuyer,
  handleDeleteBuyerProfile,
  handleUpdateBuyer,
  handleGetBuyerDetails,
  handleGetBuyerRfqList,
  handleGetSubscriptionDetails
};
