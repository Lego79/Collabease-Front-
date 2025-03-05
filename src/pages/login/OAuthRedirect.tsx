// src/pages/login/OAuthRedirect.tsx
import { jwtDecode } from 'jwt-decode';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface JwtPayload {
  sub: string;
  exp: number;
  memberId: string;
  userNickname: string;
  // 기타 클레임 필드...
}

const OAuthRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      
      // 토큰 디코딩 예시 (npm 패키지 jwt-decode 필요)
      const decoded: JwtPayload = jwtDecode(token);
      console.log("Decoded Token: ", decoded);
      // 여기서 decoded.memberId, decoded.userNickname을 활용할 수 있습니다.

      setTimeout(() => {
        navigate('/board');
      }, 0);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  return <div>로그인 처리 중...</div>;
};

export default OAuthRedirect;