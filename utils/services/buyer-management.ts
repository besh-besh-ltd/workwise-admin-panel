import axiosInstance from "../axios/index";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";

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

export interface BuyerListParams {
  limit?: number;
  page?: number;
  /** 't' active | 'f' inactive */
  verified?: string;
  /** One box: matches name, email, mobile, organisation or company. */
  search?: string;
  organization?: string;
  name?: string;
  email?: string;
  mobile?: string;
  /** A single user_type, or several as a comma-separated list. */
  user_type?: string;
  /** 'active' | 'expired' | 'none' */
  subscription_status?: string;
  /** 'monthly' | 'quarterly' | 'yearly' */
  subscription_cycle?: string;
}

// Takes an options object rather than eight positional arguments — the filter
// list has grown and `(10, 1, "", "", "", "")` said nothing about which blank
// was which. Values are URL-encoded, so a search containing & or # no longer
// truncates the query string.
function handleGetBuyerList(params: BuyerListParams = {}) {
  return new Promise(async (resolve, reject) => {
    try {
      const qs = new URLSearchParams();
      qs.set("limit", String(params.limit ?? 10));
      qs.set("page", String(params.page ?? 1));
      qs.set("include_company", "true");

      const optional: Array<keyof BuyerListParams> = [
        "verified",
        "search",
        "organization",
        "name",
        "email",
        "mobile",
        "user_type",
        "subscription_status",
        "subscription_cycle",
      ];
      optional.forEach((k) => {
        const v = params[k];
        if (v !== undefined && v !== null && String(v).trim() !== "") {
          qs.set(k, String(v).trim());
        }
      });

      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-list?${qs.toString()}`
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
}

// mukul 07-06-2025 , function is not in use, cross check and remove
function handleApproveBuyer(id: any, status: any) {
  let payload: any = {};
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

function handleGetBuyerRfqList(page = 1, limit = 10, id) {
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

function handleGetSubscriptionDetails(id) {
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
  generateRandomPassword,
};
