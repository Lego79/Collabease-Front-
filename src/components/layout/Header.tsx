// components/layout/Header.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AppBar, Toolbar, IconButton, InputBase, Typography, Box } from '@mui/material';
import { Notifications, MailOutline, Person, Search as SearchIcon } from '@mui/icons-material';

const Header: React.FC = () => {
  return (
    <AppBar position="sticky" color="inherit" elevation={1} sx={{ borderBottom: '1px solid #e0e0e0' }}>
      <Toolbar sx={{ maxWidth: 'lg', mx: 'auto', width: '100%', justifyContent: 'space-between' }}>
        {/* 로고 및 타이틀 */}
        <Box component={Link} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/reddit-logo.svg" alt="Reddit" style={{ height: 32, width: 32, marginRight: 8 }} />
          <Typography variant="h6" fontWeight="bold">reddit</Typography>
        </Box>

        {/* 검색 창 */}
        <Box sx={{ flex: 1, mx: 4, maxWidth: 600 }}>
          <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center', bgcolor: 'grey.100', borderRadius: 1, px: 2 }}>
            <SearchIcon sx={{ position: 'absolute', left: 8, color: 'grey.500' }} />
            <InputBase
              placeholder="Search Reddit"
              sx={{
                width: '100%',
                pl: 4,
                py: 1,
                '&:focus-within': {
                  bgcolor: 'background.paper',
                  boxShadow: '0 0 0 2px rgba(0, 114, 255, 0.2)',
                },
              }}
            />
          </Box>
        </Box>

        {/* 알림 및 사용자 아이콘 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton aria-label="notifications" sx={{ color: 'grey.600' }}>
            <Notifications />
          </IconButton>
          <IconButton aria-label="messages" sx={{ color: 'grey.600' }}>
            <MailOutline />
          </IconButton>
          <IconButton aria-label="user account" sx={{ color: 'grey.600' }}>
            <Person />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
