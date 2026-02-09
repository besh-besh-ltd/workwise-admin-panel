import axiosInstance from "@/utils/axios";


export const createRolePermission = (values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/add-role-permission`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const updateRolePermission = (values, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/update-role-permission/${id}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const getRolesDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/roles-permission-details/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getSubadminDropdown = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/subadmin-dropdown`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const getMenuList = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/roles/menu-list-checkbox`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}