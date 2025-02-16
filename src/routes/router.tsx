// import { createBrowserRouter, Navigate } from 'react-router-dom';
// import MainLayout from '../components/layout/MainLayout';
// import LeftMenuLayout from '../components/layout/LeftMenuLayout';
// import Board from '../pages/board/Board';
// import Login from '../pages/login/Login';
// import OAuthRedirect from '../pages/login/OAuthRedirect';
// import ProtectedRoute from './ProtectedRoute';

// export const router = createBrowserRouter([
//   {
//     path: '/',
//     element: <MainLayout />,
//     children: [
//       {
//         index: true, // 기본 경로
//         element: <Navigate to="/login" replace />,
//       },
//       {
//         path: 'login',
//         element: <Login />,
//       },
//       {
//         path: 'oauth-redirect',
//         element: <OAuthRedirect />,
//       },
//       {
//         // 보호된 영역: 토큰이 있는 경우에만 접근 가능하도록 ProtectedRoute로 감싸기
//         element: (
//           <ProtectedRoute>
//             <LeftMenuLayout />
//           </ProtectedRoute>
//         ),
//         children: [
//           {
//             path: 'board',
//             element: <Board />,
//           },
//           {
//             path: 'tasks',
//             element: <div>작업 페이지</div>,
//           },
//           {
//             path: 'dashboard',
//             element: <div>대시보드 페이지</div>,
//           },
//           {
//             path: 'team',
//             element: <div>팀 페이지</div>,
//           },
//           {
//             path: 'settings',
//             element: <div>설정 페이지</div>,
//           },
//         ],
//       },
//     ],
//   },
// ]);
