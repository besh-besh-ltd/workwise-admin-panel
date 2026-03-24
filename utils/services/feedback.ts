import axiosInstance from "../axios";

interface FeedbackFilters {
    action_key?: string;
    event?: string;
    start_date?: string;
    end_date?: string;
}

export const handleGetFeedbackList = async (page = 1, limit = 10, filters?: FeedbackFilters) => {
    let url = `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/monitoring/feedback-list?page=${page}&limit=${limit}`;
    if (filters?.action_key) {
        url += `&action_key=${filters.action_key}`;
    }
    if (filters?.event) {
        url += `&event=${filters.event}`;
    }
    if (filters?.start_date) {
        url += `&start_date=${filters.start_date}`;
    }
    if (filters?.end_date) {
        url += `&end_date=${filters.end_date}`;
    }
    const response = await axiosInstance.get(url);
    return response;
};
