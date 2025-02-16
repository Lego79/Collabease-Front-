// components/layout/MainLayout.tsx
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';

const MainContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: #f5f6f8;
`;

const ContentWrapper = styled.div`
  flex: 1;
  max-width: 1920px;
  margin: 0 auto;
  padding: 20px;
`;

const MainLayout = () => {
  return (
    <MainContainer>
      <ContentWrapper>
        <Outlet />
      </ContentWrapper>
    </MainContainer>
  );
};

export default MainLayout;
