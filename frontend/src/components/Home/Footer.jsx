import React from 'react';
import { Box, Container, Typography } from '@mui/material';

export default function Footer() {
    return (
        <Box sx={{ bgcolor: '#333', color: '#fff', py: 3, mt: 'auto' }}>
            <Container maxWidth="lg">
                <Typography variant="body2" align="center">
                    © {new Date().getFullYear()} App Base. Tất cả quyền được bảo lưu.
                </Typography>
            </Container>
        </Box>
    );
}
