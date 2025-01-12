// axiosConfig.js
import axios from 'axios';

// 创建一个 axios 实例
const axiosInstance = axios.create({
  baseURL: 'http://10.12.170.113:8080/api', // 基础 URL
  // baseURL: 'http://192.168.8.220:8080/api', // 基础 URL
});

// 添加请求拦截器（可选）
axiosInstance.interceptors.request.use(
  (config) => {
    // 在请求发送前做一些处理，例如添加 token
    // config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 添加响应拦截器（可选）
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一处理错误
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

export { axiosInstance };
