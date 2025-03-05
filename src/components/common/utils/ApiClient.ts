// src/utils/apiClient.ts
import axios from 'axios';
import { BASE_URL } from '../../../api/config';

const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // 필요한 경우 쿠키 전달
});

// 요청 인터셉터를 통해 로컬 스토리지의 토큰을 헤더에 자동으로 추가
apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

export default apiClient;
