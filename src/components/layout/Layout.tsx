// components/layout/Layout.tsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import LeftMenu from './LeftMenuLayout';
import Header from './Header';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <LeftMenu />
        <main className="flex-1 p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;

