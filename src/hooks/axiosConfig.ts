// axiosConfig.js
import axios from 'axios';

// 创建一个 axios 实例
const axiosInstance = axios.create({
  baseURL: 'http://10.13.127.195:8080/api/chat', // 基础 URL
  // baseURL: 'https://ff553395-475c-4ab9-81e6-d8562452f5c0.mock.pstmn.io', // 基础 URL
  // baseURL: 'http://127.0.0.1:8080/api/chat', // 基础 URL
});

// 创建一个 axios 实例
const axiosTTS = axios.create({
  baseURL: 'http://10.12.170.113:8002/api/chat', // 基础 URL
  // baseURL: 'https://ff553395-475c-4ab9-81e6-d8562452f5c0.mock.pstmn.io', // 基础 URL
  // baseURL: 'http://127.0.0.1:8080/api/chat', // 基础 URL
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

// 创建一个 axios 实例
const axiosWhisper = axios.create({
  baseURL: 'http://10.12.170.113:8001', // 基础 URL
});

export { axiosInstance, axiosWhisper, axiosTTS };
