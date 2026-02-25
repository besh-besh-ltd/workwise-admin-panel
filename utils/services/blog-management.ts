import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

export const handleAddBlog = (values) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-blog`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleUpdateBlog = (id, values) => {
    console.log("api called *")
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-Blog/${id}`, values);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleDeleteBlog = (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.delete(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-blog/${id}`);
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
};

export const handleGetBlogList = (page = 1, limit = 10, searchString) => {
    return new Promise(async (resolve, reject) => {
        try {
            let response;
            if (searchString) {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/blog-list?page=${page}&limit=${limit}&search=${searchString}`
                );
            } else {
                response = await axiosInstance.get(
                    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/blog-list?page=${page}&limit=${limit}`
                );
            }
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
}

export const handleBlogCategoryList = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/blog-category-list`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}