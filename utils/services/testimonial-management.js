import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

export const handleAddTestimonial = (values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-testimonial`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleUpdateTestimonial = (id, values) => {
    console.log("api called *")
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-testimonial/${id}`, values);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleGetTestimonialDetails = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/testimonial-detail/${id}`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export const handleDeleteTestimonial = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-testimonial/${id}`);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleGetTestimonialList = (page = 1, limit = 10, searchString) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            if (searchString) {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/testimonial-list?page=${page}&limit=${limit}&search=${searchString}`
                );
            } else {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/testimonial-list?page=${page}&limit=${limit}`
                );
            }
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}