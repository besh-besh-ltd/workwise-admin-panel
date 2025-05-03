import axiosInstance from "@/utils/axios";
import axiosFormData from "@/utils/axios/form-data";

export const addProducts = (payload) => {
	console.log(process.env.NEXT_PUBLIC_API_URL)
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.post(
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
			// Extract error message from response if available
			let errorMessage;
			
			if (error.response?.data) {
				// If there's a specific error message from the backend
				errorMessage = error.response.data.message || error.response.data.error;
				
				// If there are validation errors
				if (error.response.data.errors) {
					errorMessage = Object.values(error.response.data.errors)
						.flat()
						.join(', ');
				}
			}
			
			// Fallback error message
			if (!errorMessage) {
				errorMessage = "Failed to update product. Please try again.";
			}
			
			reject({
				message: errorMessage,
				error: error,
				response: error.response?.data
			});
		}
	});
}