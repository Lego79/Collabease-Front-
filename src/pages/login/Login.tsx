// src/pages/Login.tsx
// import googleLogo from '../../assest/images/google.jpg'; // 이미지 import
import googleLogo from '../../assets/images/google.jpg';

const Login: React.FC = () => {
  const handleGoogleLogin = () => {
    // 백엔드의 구글 OAuth 로그인 엔드포인트로 리다이렉트
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
      }}
    >
      <button
        onClick={handleGoogleLogin}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '10px 20px',
          fontSize: '16px',
          cursor: 'pointer',
        }}
      >
        <img
          src={googleLogo}
          alt="Google Logo"
          style={{ width: '24px', height: '24px', marginRight: '8px' }}
        />
        구글로 시작하기
      </button>
    </div>
  );
};

export default Login;
