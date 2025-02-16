// src/pages/login/OAuthRedirect.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuthRedirect: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('accessToken', token);
      console.log("token get", token);
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
