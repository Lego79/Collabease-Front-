// components/layout/LeftMenuLayout.tsx
import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import styled from 'styled-components';

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
`;

const Sidebar = styled.div`
  width: 250px;
  background-color: #2c3e50;
  color: white;
  padding: 20px 0;
  flex-shrink: 0;
`;

const MainContent = styled.div`
  flex: 1;
  padding: 20px;
  background-color: #f5f6f8;
`;

const MenuList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li<{ isActive?: boolean }>`
  padding: 12px 20px;
  cursor: pointer;
  background-color: ${props => props.isActive ? '#34495e' : 'transparent'};
  
  &:hover {
    background-color: #34495e;
  }
`;

const MenuLink = styled(Link)`
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 10px;
  
  &:hover {
    color: #ecf0f1;
  }
`;

const MenuIcon = styled.span`
  font-size: 18px;
`;

const MenuText = styled.span`
  font-size: 14px;
`;

const LeftMenuLayout = () => {
  const location = useLocation();
  const [menuItems] = useState([
    { id: 1, icon: "📋", title: "보드", path: "/board" },
    { id: 2, icon: "📝", title: "작업", path: "/tasks" },
    { id: 3, icon: "📊", title: "대시보드", path: "/dashboard" },
    { id: 4, icon: "👥", title: "팀", path: "/team" },
    { id: 5, icon: "⚙️", title: "설정", path: "/settings" }
  ]);

  return (
    <LayoutContainer>
      <Sidebar>
        <MenuList>
          {menuItems.map((item) => (
            <MenuItem 
              key={item.id}
              isActive={location.pathname === item.path}
            >
              <MenuLink to={item.path}>
                <MenuIcon>{item.icon}</MenuIcon>
                <MenuText>{item.title}</MenuText>
              </MenuLink>
            </MenuItem>
          ))}
        </MenuList>
      </Sidebar>
      <MainContent>
        <Outlet />
      </MainContent>
    </LayoutContainer>
  );
};

export default LeftMenuLayout;
