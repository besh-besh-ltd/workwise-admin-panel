import axiosInstance from "../axios";

export const handleGetNotificationList = (limit = 10, page = 1, status = 1, notification_type, name) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/notification/notification-list?limit=${limit}&page=${page}&status=${status}&notification_type=${notification_type}&name=${name}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const createNotification = (values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/notification/create-notification`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const getNotificationDetails = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/notification/notification-details/${data}`
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const handleUpdateNotification = (values, id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/notification/update-notification/${id}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const handleDeleteNotification = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/notification/delete-notification/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

