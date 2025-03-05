// src/utils/tokenUtils.ts
import { jwtDecode } from 'jwt-decode';

/**
 * 주어진 JWT 토큰을 디코딩하여 페이로드를 반환하는 유틸리티 함수
 */
export function decodeToken(token: string): any {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch (e) {
    console.error('Invalid token', e);
    return null;
  }
}
