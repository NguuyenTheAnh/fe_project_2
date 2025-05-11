import axios from "axios";
// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true
});

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(function (config) {
    // Do something before request is sent
    config.headers.Authorization = `Bearer ${localStorage.getItem("access_token")}`;
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instance.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    if (response && response.data) return response.data;
    return response;
},
    // function (error) {
    //     // Any status codes that falls outside the range of 2xx cause this function to trigger
    //     // Do something with response error
    //     console.log(">>> check error: ", error);
    //     if (error?.response?.data) return error?.response?.data;
    //     return Promise.reject(error);
    // }
    async (err) => {
        const originalConfig = err.config;

        if (originalConfig.url !== "/api/v1/auth/login" && err.response) {
            // Access Token was expired
            if (err.response.status === 401 && !originalConfig._retry) {
                originalConfig._retry = true;

                try {
                    const rs = await instance.get("/api/v1/auth/refresh");
                    localStorage.setItem("access_token", rs.data.access_token);

                    return instance(originalConfig);
                } catch (_error) {
                    console.error('Refresh_token không hợp lệ:', _error);
                    window.location.href = '/login';
                    return Promise.reject(_error);
                }
            }
        }

        return Promise.reject(err);
    }
);

export default instance;