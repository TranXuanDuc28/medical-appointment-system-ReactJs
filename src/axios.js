import axios from 'axios';
import _ from 'lodash';

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND_URL,
    withCredentials: true
});



instance.interceptors.response.use(
    (response) => {
        // Thrown error for request with OK status code
        const { data } = response;

        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;
        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            if (originalRequest.url === '/api/refresh-token') {
                return Promise.reject(error);
            }
            originalRequest._retry = true;
            try {
                const res = await instance.post('/api/refresh-token');
                if (res && res.errCode === 0) {
                    return instance(originalRequest);
                }
            } catch (refreshError) {
                console.error("Refresh token expired or invalid:", refreshError);
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default instance;
