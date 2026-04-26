import React, { useState, useEffect } from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';
import { axiosPublic } from '../../config/axiosPublic';

const RomanticGreeting = () => {
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);
    const [displayedText, setDisplayedText] = useState('');
    const theme = useTheme();

    useEffect(() => {
        const fetchGreeting = async () => {
            try {
                const res = await axiosPublic.get('/api/ai/greeting');
                if (res.data.status === 'success') {
                    setGreeting(res.data.greeting);
                }
            } catch (err) {
                console.error('Failed to fetch AI greeting:', err);
                setGreeting('Chào em, chúc em một ngày tốt lành từ Hải Hoàn!');
            } finally {
                setLoading(false);
            }
        };

        fetchGreeting();
    }, []);

    // Typing Effect Logic
    useEffect(() => {
        if (!loading && greeting) {
            let index = 0;
            const timer = setInterval(() => {
                setDisplayedText(greeting.substring(0, index + 1));
                index++;
                if (index >= greeting.length) {
                    clearInterval(timer);
                }
            }, 50); // Speed of typing
            return () => clearInterval(timer);
        }
    }, [loading, greeting]);

    if (!greeting && !loading) return null;

    return (
        <Box sx={{ position: 'relative', overflow: 'hidden', py: 2, px: 2 }}>
            {/* Subtle Petal Animation Overlay */}
            <div className="petal-container">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className={`petal petal-${i + 1}`} />
                ))}
            </div>

            <Paper
                elevation={0}
                sx={{
                    maxWidth: '800px',
                    mx: 'auto',
                    p: 3,
                    borderRadius: 4,
                    background: 'rgba(255, 255, 255, 0.7)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(212, 175, 55, 0.2)',
                    textAlign: 'center',
                    position: 'relative',
                    zIndex: 2
                }}
            >
                <Typography
                    variant="h6"
                    sx={{
                        fontStyle: 'italic',
                        color: '#D4AF37', // Gold color
                        fontWeight: 600,
                        mb: 1,
                        fontSize: '1.1rem',
                        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
                    }}
                >
                    Lời thương gửi người ấy...
                </Typography>
                
                <Typography
                    variant="body1"
                    sx={{
                        color: theme.palette.text.primary,
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        minHeight: '3em',
                        fontWeight: 500,
                        whiteSpace: 'pre-line',
                        '&::after': {
                            content: '"|"',
                            animation: 'blink 1s step-end infinite',
                            color: '#D4AF37',
                            marginLeft: '2px'
                        }
                    }}
                >
                    {displayedText}
                </Typography>
            </Paper>

            <style>{`
                @keyframes blink {
                    from, to { opacity: 1; }
                    50% { opacity: 0; }
                }

                .petal-container {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1;
                }

                .petal {
                    position: absolute;
                    background: radial-gradient(circle at 30% 30%, #ffc0cb, #ff69b4);
                    width: 12px;
                    height: 12px;
                    border-radius: 100% 0% 100% 100%;
                    opacity: 0.4;
                    filter: blur(0.5px);
                }

                .petal-1 { left: 10%; animation: fall 10s linear infinite; top: -20px; }
                .petal-2 { left: 30%; animation: fall 12s linear infinite 2s; top: -20px; }
                .petal-3 { left: 50%; animation: fall 9s linear infinite 1s; top: -20px; }
                .petal-4 { left: 70%; animation: fall 14s linear infinite 3s; top: -20px; }
                .petal-5 { left: 85%; animation: fall 11s linear infinite 0.5s; top: -20px; }
                .petal-6 { left: 95%; animation: fall 13s linear infinite 4s; top: -20px; }

                @keyframes fall {
                    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                    10% { opacity: 0.4; }
                    90% { opacity: 0.2; }
                    100% { transform: translateY(200px) rotate(360deg); opacity: 0; }
                }
            `}</style>
        </Box>
    );
};

export default RomanticGreeting;
