import axiosInstance from "@/utils/axios";

// Named export for getLocationData
export const getLocationData = (offset, limit) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/get-location?limit=${limit}&offset=${offset}`
      );
      resolve(response);
      
    } catch (error) {
      reject({ error });
    }
  });
};

// Named export for searchLocation
export const searchLocation = (offset, limit, state) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/get-location?limit=${limit}&offset=${offset}&state=${state}`
      );
      resolve(response);
    } catch (error) {
      reject({ error });
    }
  });
};

export const addLocation = (state_name, city_name) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.post(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/add-location`,
        {
          state_name,
          city_name
        }
      );
      console.log(response.data); // Check if the response is correct
      resolve(response.data);
    } catch (error) {
      console.error("Error adding location:", error); // Log the error to the console
      reject(error);
    }
  });
};

export const updateLocation = (state_id,state_name,city_id,city_name) =>{
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.put(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/update-location?state_id=${state_id}&state_name=${state_name}&city_id=${city_id}&city_name=${city_name}`
        
      );
      console.log(response.data); // Check if the response is correct
      resolve(response.data);
       
    } catch (error) {
      console.error("Error adding location:", error); // Log the error to the console
      reject(error);
    }
  })
}

export const searchCity = (searchCity) => {
  return new Promise(async (resolve, reject) => {
    try {
      let response = await axiosInstance.get(
        `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/get-location?search=${searchCity}`
      );
      resolve(response);
      
    } catch (error) {
      reject({ error });
    }
  
  })
}

{/*
  export const deleteLocation = (city_id) =>{
return new Promise(async (resolve, reject) => {
try {
  let response = await axiosInstance.delete(
    `${process.env.NEXT_PUBLIC_API_WEB_URL}/admin/cms/delete-location/${city_id}`);
    console.log(response.data); // Check if the response is correct
    resolve(response.data);

}catch(error){
  console.error("Error adding location:", error); // Log the error to the console
  reject(error);
}

})
} */}

