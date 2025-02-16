// src/api/axiosInstance.ts
import axios from 'axios';
import { BASE_URL } from './config';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

// 인터셉터에서 localStorage의 토큰을 읽어 헤더에 추가합니다.
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    console.log('axios 인터셉터 - 토큰 값:', token);
    if (token) {
      // 헤더에 토큰 추가
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
