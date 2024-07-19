import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

const handleGetSubscriptionFeatureList = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.get(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/subscription-feature-list`
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
};

const handleAddSubscription = (values) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.post(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/add-subscription`,
				values
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
};

const handleGetSubscriptionList = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.get(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/subscription-list`
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
};

const handleGetSubscriptionDetail = (id) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.get(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/subscription-details/${id}`
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
};

function handleUpdateSubscription(values, id) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.put(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/update-subscription/${id}`,
				values
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
}

function handleDeleteSubscription(id) {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.delete(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/subscription/delete-subscription/${id}`
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
}
export {
	handleGetSubscriptionFeatureList,
	handleAddSubscription,
	handleGetSubscriptionList,
	handleGetSubscriptionDetail,
	handleUpdateSubscription,
	handleDeleteSubscription,
};
