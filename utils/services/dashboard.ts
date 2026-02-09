import axiosInstance from "../axios";


export const handleDashboardAnalyticsList = () => {
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axiosInstance.get(
                `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/analytics-dashboard`
            );
            resolve(response);
        } catch (error) {
            reject({ error });
        }
    });
}