import React, { useState } from 'react';
import { 
    Box, Fab, Paper, Typography, IconButton, 
    Stack, Avatar, Fade, Button 
} from '@mui/material';
import { 
    Close, Psychology, OpenInNew, AutoStories 
} from '@mui/icons-material';

const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const notebookUrl = 'https://notebooklm.google.com/notebook/6039e697-42ed-4216-9f70-156942eb26cb';

    const openNotebook = () => {
        const width = 500;
        const height = 700;
        const left = window.screen.width - width - 50;
        const top = 100;
        
        window.open(
            notebookUrl, 
            'NotebookLM_Assistant', 
            `width=${width},height=${height},left=${left},top=${top},status=no,menubar=no,toolbar=no,location=no`
        );
        setIsOpen(false);
    };

    return (
        <Box sx={{ position: 'fixed', bottom: 30, right: 30, zIndex: 9999 }}>
            {/* Launch UI Overlay (Quick Menu) */}
            <Fade in={isOpen}>
                <Paper
                    elevation={15}
                    sx={{
                        position: 'absolute',
                        bottom: 80,
                        right: 0,
                        width: '300px',
                        display: isOpen ? 'flex' : 'none',
                        flexDirection: 'column',
                        borderRadius: 4,
                        overflow: 'hidden',
                        border: '2px solid #EEDCE1'
                    }}
                >
                    <Box sx={{ p: 2, bgcolor: '#B76E79', color: 'white', textAlign: 'center' }}>
                        <Psychology sx={{ fontSize: 40, mb: 1 }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>Trợ Lý Tri Thức AI</Typography>
                    </Box>
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ mb: 3, color: '#4A3B42' }}>
                            Hải Hoàn đã sẵn sàng hỗ trợ em tra cứu tri thức. Nhấn bên dưới để bắt đầu nhé!
                        </Typography>
                        <Button 
                            fullWidth
                            variant="contained" 
                            onClick={openNotebook}
                            startIcon={<OpenInNew />}
                            sx={{ 
                                bgcolor: '#B76E79', 
                                borderRadius: 5,
                                fontWeight: 700,
                                mb: 1,
                                '&:hover': { bgcolor: '#9A5B64' }
                            }}
                        >
                            Mở Trợ Lý Riêng
                        </Button>
                        <Button 
                            fullWidth
                            size="small"
                            onClick={() => setIsOpen(false)}
                            sx={{ color: '#8B7E84' }}
                        >
                            Để sau ạ
                        </Button>
                    </Box>
                </Paper>
            </Fade>

            {/* Pulsing Floating Button */}
            <Fab
                color="primary"
                onClick={() => setIsOpen(!isOpen)}
                sx={{
                    bgcolor: '#B76E79',
                    width: 60,
                    height: 60,
                    '&:hover': { bgcolor: '#9A5B64', transform: 'scale(1.1)' },
                    boxShadow: '0 8px 16px rgba(183, 110, 121, 0.3)',
                    animation: isOpen ? 'none' : 'pulse 2s infinite',
                    transition: 'all 0.3s ease'
                }}
            >
                {isOpen ? <Close /> : <Psychology />}
            </Fab>

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(183, 110, 121, 0.4); }
                    70% { transform: scale(1.1); box-shadow: 0 0 0 15px rgba(183, 110, 121, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(183, 110, 121, 0); }
                }
            `}</style>
        </Box>
    );
};

export default AIChatbox;
