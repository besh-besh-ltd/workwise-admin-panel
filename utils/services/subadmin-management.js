import axiosInstance from "@/utils/axios";
import axiosFormData from "../axios/form-data";

export const createSubAdmin = (values) => {
    if (values.image == "") {
        delete values.image;
    }
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/create-sub-admin`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const updateSubAdmin = (values, id) => {
    if (values.image == "") {
        delete values.image;
    }
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/update-subadmin/${id}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const getSubAdminList = (page = 1, limit = 10, name) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            if (name) {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/subadmin-list?page=${page}&limit=${limit}&name=${name}`
                );
            } else {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/subadmin-list?page=${page}&limit=${limit}`
                );
            }
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getSubAdminDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/subadmin-details/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
} 