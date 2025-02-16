import { Link } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'

const Login = () => {

  const handleGoogleLogin = () => {
    // 백엔드의 구글 OAuth 로그인 엔드포인트로 리다이렉트
    window.location.href = "http://localhost:8080/oauth2/authorization/google";
  };
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>로그인 페이지</h1>
      <button onClick={handleGoogleLogin}>
        Google로 로그인하기
      </button>
    </div>
  );
};

export default Login
