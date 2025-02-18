import React, { Suspense, useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { CSpinner, useColorModes } from '@coreui/react'
import './scss/style.scss'
import './scss/examples.scss'
import 'antd/dist/reset.css';


// Lazy-loaded 컴포넌트들
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./pages/login/Login'))
const OAuthRedirect = React.lazy(() => import('./pages/login/OAuthRedirect'))
const Register = React.lazy(() => import('./views/pages/register/Register'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const Loader = () => (
  <div className="pt-3 text-center">
    <CSpinner color="primary" variant="grow" />
  </div>
)

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }
    if (!isColorModeSet()) {
      setColorMode(storedTheme)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // createBrowserRouter를 사용한 라우터 설정
  const router = createBrowserRouter([
    {
      path: '/',
      element: (
        <Suspense fallback={<Loader />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: '/login',
      element: (
        <Suspense fallback={<Loader />}>
          <Login />
        </Suspense>
      ),
    },
    {
      path: '/oauth-redirect',
      element: (
        <Suspense fallback={<Loader />}>
          <OAuthRedirect />
        </Suspense>
      ),
    },
    {
      path: '/register',
      element: (
        <Suspense fallback={<Loader />}>
          <Register />
        </Suspense>
      ),
    },
    {
      path: '/404',
      element: (
        <Suspense fallback={<Loader />}>
          <Page404 />
        </Suspense>
      ),
    },
    {
      path: '/500',
      element: (
        <Suspense fallback={<Loader />}>
          <Page500 />
        </Suspense>
      ),
    },
    {
      path: '*',
      element: (
        <Suspense fallback={<Loader />}>
          <DefaultLayout />
        </Suspense>
      ),
    },
  ])

  return <RouterProvider router={router} />
}

export default App
