import axiosInstance from "../axios/index";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";


export const AddBuyerOnPortalByAdmin = (values) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.post(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/users/user-registration`,
				values
			);
			resolve(response);
		} catch (error) {
			reject({ message: error });
		}
	});
};

export const RegisterCompanyByAdmin = (values) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosFormData.post(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/company-registration`,
				values
			);
			resolve(response);
		} catch (error) {
			reject({ message: error });
		}
	});
};

function handleGetBuyerList(limit = 10, page = 1, verified, organization, name, user_type) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-list?limit=${limit}&page=${page}&verified=${verified}&organization=${organization}&name=${name}&user_type=${user_type}&include_company=true`
      );
      resolve(response);
    } catch (error) {
      reject({ message: error });
    }
  });
}

function generateRandomPassword() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$";
  let password = "";
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// mukul 07-06-2025 , function is not in use, cross check and remove
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

function handleGetBuyerAccountLimits(company_id) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/account-limits/${company_id}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
}

function handleUpdateBuyerAccountLimits(company_id, limitsData) {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/update-account-limits/${company_id}`,
        limitsData
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
  handleGetSubscriptionDetails,
  handleGetBuyerAccountLimits,
  handleUpdateBuyerAccountLimits,
  generateRandomPassword
};
