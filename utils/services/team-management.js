import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

const API_URL = process.env.NEXT_PUBLIC_API_WEB_URL;

export const addTeamMember = (values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.post(
                `${API_URL}/admin/cms/create-team-member`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const updateTeamMember = (id, values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.put(
                `${API_URL}/admin/cms/update-team-member/${id}`, values);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const deleteTeamMember = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${API_URL}/admin/cms/delete-team-member/${id}`);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const getMemberDetailsById = (memberId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const response = await axiosInstance.get(
                `${API_URL}/admin/cms/team-member-detail/${memberId}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getTeamMemberList = (page = 1, limit = 10, searchString) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            if (searchString) {
                response = await axiosInstance.get(
                    `${API_URL}/admin/cms/team-member-list?page=${page}&limit=${limit}&search=${searchString}`
                );
            } else {
                response = await axiosInstance.get(
                    `${API_URL}/admin/cms/team-member-list?page=${page}&limit=${limit}`
                );
            }
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}