import axios from "axios";
import axiosInstance from "../axios";

export const handleLogin = (values) => {
    let payload = {};
    payload.username = values.username;
    payload.password = values.password;
    
    return new Promise(async (resolve, reject) => {
        try {
            let response = await axios.post(
              `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/auth/login`,
              payload
            );
            resolve(response);
        } catch (error) {
            reject({ message: error });
        }
    });
};

export const getAdminProfile = () => {  
  
  return new Promise(async (resolve, reject) => {
      try {
          let response = await axiosInstance.get(
            `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/auth/admin-profile`
          );
          resolve(response);
      } catch (error) {
          reject({ message: error });
      }
  });
}


