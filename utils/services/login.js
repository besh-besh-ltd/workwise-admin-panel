import axios from "axios";

function handleLogin(values) {
  let payload = {};
  payload.username = values.username;
  payload.password = values.password;
  console.log("api url", process.env.NEXT_PUBLIC_API_WEB_URL);
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
}

export { handleLogin };
