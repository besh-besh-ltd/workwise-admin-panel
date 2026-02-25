import { AxiosResponse } from "axios";
import axiosInstance from "../axios";
import axiosFormData from "../axios/form-data";

// Type definitions
interface MarqueePayload {
  text: string;
  direction: string;
  speed: number;
  is_visible: boolean;
  background_color: string;
}

// ============ MARQUEE APIS ============

const handleGetMarquee = async (): Promise<AxiosResponse> => {
  const response = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/get-marquee`
  );
  return response;
};

const handleCreateMarquee = async (values: MarqueePayload): Promise<AxiosResponse> => {
  const response = await axiosInstance.post(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-marquee`,
    values
  );
  return response;
};

const handleUpdateMarquee = async (
  id: string | number,
  values: MarqueePayload
): Promise<AxiosResponse> => {
  const response = await axiosInstance.put(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-marquee/${id}`,
    values
  );
  return response;
};

// ============ EVENT APIS ============

const handleGetEventList = async (page: number): Promise<AxiosResponse> => {
  const response = await axiosInstance.get(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/event-list?page=${page}&limit=20`
  );
  return response;
};

const handleCreateEvent = async (values: FormData): Promise<AxiosResponse> => {
  const response = await axiosFormData.post(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/create-event`,
    values
  );
  return response;
};

const handleUpdateEvent = async (
  id: string | number,
  values: FormData
): Promise<AxiosResponse> => {
  const response = await axiosFormData.put(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-event/${id}`,
    values
  );
  return response;
};

const handleDeleteEvent = async (id: string | number): Promise<AxiosResponse> => {
  const response = await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-event/${id}`
  );
  return response;
};

export {
  handleGetMarquee,
  handleCreateMarquee,
  handleUpdateMarquee,
  handleGetEventList,
  handleCreateEvent,
  handleUpdateEvent,
  handleDeleteEvent,
};
