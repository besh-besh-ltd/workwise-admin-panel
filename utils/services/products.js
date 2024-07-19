import axiosInstance from "@/utils/axios";
import axiosFormData from "@/utils/axios/form-data";

export const addProducts = (payload) => {
	console.log(process.env.NEXT_PUBLIC_API_URL)
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosFormData.post(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-add`,
				payload
			);
			resolve(response);
		} catch (error) {
			reject({ message: error });
		}
	});
};

export const getProducts = (value) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.get(`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-details/${value}`);
			resolve(response);
		} catch (error) {
			reject({ message: error });
		}
	});
};

export const handleUpdateProduct = (values, data) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosFormData.put(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/product/admin-product-edit/${data}`,
				values
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
}