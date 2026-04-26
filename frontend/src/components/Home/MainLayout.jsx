import React from 'react';
import { Box, CssBaseline, ThemeProvider } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import AIChatbox from './AIChatbox';
import theme from '../../theme';

export default function MainLayout() {
    return (
        <ThemeProvider theme={theme}>
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    bgcolor: 'background.default',
                }}
            >
                <CssBaseline />
                <Header />
                <Box component="main" sx={{ flexGrow: 1, py: { xs: 2, md: 4 } }}>
                    <Outlet />
                </Box>
                <Footer />
                <AIChatbox />
            </Box>
        </ThemeProvider>
    );
}
