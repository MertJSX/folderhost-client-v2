import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const axiosInstance = axios.create({
    baseURL: `${API_BASE_URL}/api`,
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get("token");
        if (token) {
            config.headers.Authorization = token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.data?.err === "invalid token" || error.response?.data?.err === "wrong password") {
            Cookies.remove("token");
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;