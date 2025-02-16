// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));

  const saveTokens = (access: string, refresh?: string) => {
    localStorage.setItem('accessToken', access);
    setAccessToken(access);
    if (refresh) {
      localStorage.setItem('refreshToken', refresh);
      setRefreshToken(refresh);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setAccessToken(null);
    setRefreshToken(null);
  };

  // 토큰 갱신 로직은 access token 만료 시 refresh token을 이용해 재발급 받는 API 호출 등을 추가할 수 있습니다.
  // 예시) useEffect로 일정 주기마다 refresh token API를 호출하는 로직 등 구현 가능

  return {
    accessToken,
    refreshToken,
    saveTokens,
    logout,
  };
};
