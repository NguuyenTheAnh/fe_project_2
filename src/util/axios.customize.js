import axios from 'axios';

// Set config defaults when creating the instance
const instance = axios.create({
    baseURL: import.meta.env.VITE_BACKEND_URL,
    withCredentials: true,
});

// Alter defaults after instance has been created
// Add a request interceptor
instance.interceptors.request.use(
    function (config) {
        // Thêm token vào tiêu đề nếu có
        const accessToken = localStorage.getItem('access_token');
        const guestToken = localStorage.getItem('access_token_guest');

        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`;
        }
        if (guestToken) {
            config.headers['access_token_guest'] = guestToken;
        }

        return config;
    },
    function (error) {
        return Promise.reject(error);
    }
);

// Add a response interceptor
instance.interceptors.response.use(
    function (response) {
        // Any status code that lies within the range of 2xx causes this function to trigger
        if (response && response.data) return response.data;
        return response;
    },
    async (err) => {
        const originalConfig = err.config;

        if (err.response && err.response.status === 401 && !originalConfig._retry) {
            originalConfig._retry = true;

            try {
                // Xử lý refresh token cho management
                if (originalConfig.url !== '/api/v1/auth/login' && localStorage.getItem('access_token')) {
                    const rs = await instance.get('/api/v1/auth/refresh');
                    localStorage.setItem('access_token', rs.data.access_token);
                    originalConfig.headers.Authorization = `Bearer ${rs.data.access_token}`;
                    return instance(originalConfig);
                }
                // Xử lý refresh token cho guest
                else if (
                    originalConfig.url !== '/api/v1/guest-auth/login' &&
                    localStorage.getItem('access_token_guest')
                ) {
                    const rs = await instance.get('/api/v1/guest-auth/refresh');
                    localStorage.setItem('access_token_guest', rs.data.access_token_guest);
                    originalConfig.headers['access_token_guest'] = rs.data.access_token_guest;
                    return instance(originalConfig);
                }
            } catch (_error) {
                console.error('Invalid refresh token:', _error);
                // Chuyển hướng đến trang tương ứng dựa trên loại token
                if (localStorage.getItem('access_token')) {
                    localStorage.removeItem('access_token');
                    window.location.href = '/login';
                } else if (localStorage.getItem('access_token_guest')) {
                    localStorage.removeItem('access_token_guest');
                    window.location.href = '/login-guest';
                }
                return Promise.reject(_error);
            }
        }

        // Nếu không có token hoặc lỗi không phải 401, trả về lỗi để component xử lý
        return Promise.reject(err);
    }
);

export default instance;