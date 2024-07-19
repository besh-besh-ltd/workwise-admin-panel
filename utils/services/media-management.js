import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

const handleGetMediaManagement = (page) => {
	return new Promise(async (resolve, reject) => {
		try {
			let response = await axiosInstance.get(
				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/media/media-list?page=${page}&limit=10&name=`
			);
			resolve(response);
		} catch (error) {
			reject({ error });
		}
	});
};

// function handleDeleteMediaManagement(id) {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let response = await axiosInstance.post(
// 				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-pagecontent/${id}`
// 			);
// 			resolve(response);
// 		} catch (error) {
// 			reject({ error });
// 		}
// 	});
// }

// const handleGetPageList = () => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let response = await axiosInstance.get(
// 				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/page-list`
// 			);
// 			resolve(response);
// 		} catch (error) {
// 			reject({ error });
// 		}
// 	});
// };
// const handleGetPageContentDetail = (id) => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let response = await axiosInstance.get(
// 				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/page-content-detail/${id}`
// 			);
// 			resolve(response);
// 		} catch (error) {
// 			reject({ error });
// 		}
// 	});
// };

// const handleAddSection = (values) => {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let response = await axiosInstance.post(
// 				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-pagecontent`,
// 				values
// 			);
// 			resolve(response);
// 		} catch (error) {
// 			reject({ error });
// 		}
// 	});
// };
// function handleUpdateSection(values, id) {
// 	return new Promise(async (resolve, reject) => {
// 		try {
// 			let response = await axiosInstance.post(
// 				`${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-pagecontent/${id}`,
// 				values
// 			);
// 			resolve(response);
// 		} catch (error) {
// 			reject({ error });
// 		}
// 	});
// }

export {
	handleGetMediaManagement,
	// handleDeleteMediaManagement,
	// handleGetPageList,
	// handleAddSection,
	// handleUpdateSection,
	// handleGetPageContentDetail,
	// handleDeleteSection,
};
