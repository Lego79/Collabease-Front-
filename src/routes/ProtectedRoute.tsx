import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // localStorage에서 토큰을 읽습니다.
  const token = localStorage.getItem('accessToken');
  console.log("프로텍티드라우트 토큰= ", token);

  if (!token) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    return <Navigate to="/login" replace />;
  }
  return children;
};

export default ProtectedRoute;
