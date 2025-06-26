import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";
import axiosxdata from "../axios/xxx-form-data";


function handleGetPrivateVendorList() {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-private-vendor-list`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}


function handleApprovePrivateVendor(payload) {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosxdata.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/review-buyers-private-vendor`,
                payload
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

function handleUpdatePrivateVendor(values, editDataId) {
    if (values.image == "") {
        delete values.image;
    }
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.put(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/update-vendor/${editDataId}`,
                values
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

function rejectList() {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/vendor/reject-reason-dropdown-list`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

function handleBulkBuyerVendorMapping(formData) {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosFormData.post(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/buyer/buyer-vendor-mapping`,
                formData
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}

export {
    handleGetPrivateVendorList,
    handleApprovePrivateVendor,
    handleUpdatePrivateVendor,
    rejectList,
    handleBulkBuyerVendorMapping,
};
