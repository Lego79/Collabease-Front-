// vite.config.ts에서 기본값 설정 가능
// 그리고 코드에서는 import.meta.env를 사용합니다.
export const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/";
