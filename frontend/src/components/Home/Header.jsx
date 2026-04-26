import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    AppBar,
    Box,
    Toolbar,
    Typography,
    Button,
    Container,
    IconButton,
    Avatar,
    Menu,
    MenuItem,
    Divider,
    Stack
} from '@mui/material';

import { Person as PersonIcon } from '@mui/icons-material';
import { signOutUser } from '../../services/authService';

export default function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    return (
        <AppBar position="static" sx={{ bgcolor: '#fff', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    <Typography
                        variant="h5"
                        noWrap
                        component={Link}
                        to="/"
                        sx={{
                            mr: 2,
                            display: 'flex',
                            fontWeight: 700,
                            color: 'primary.main',
                            textDecoration: 'none',
                            flexGrow: 1,
                            letterSpacing: 1,
                            fontFamily: '"Playfair Display", serif',
                        }}
                    >
                        BamBoo<span style={{ color: '#D4AF37' }}>-Academy</span>
                    </Typography>

                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 4 }}>
                        {isAuthenticated && (
                            <>
                                <Typography
                                    component={Link}
                                    to="/students"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Học sinh
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/classes"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Lớp học
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/courses"

                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.95rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Khóa học
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/schedule"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Lịch dạy
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/attendance"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Điểm danh
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/scores"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Điểm số
                                </Typography>
                                <Typography
                                    component={Link}
                                    to="/tuition"
                                    sx={{
                                        color: 'text.primary',
                                        textDecoration: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.9rem',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Học phí
                                </Typography>
                            </>
                        )}


                    </Box>

                    <Box sx={{ flexGrow: 0 }}>

                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
                                    Chào cô, {currentUser?.fullName || currentUser?.username}
                                </Typography>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid #D4AF37' }}>
                                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                                        {currentUser?.username?.[0].toUpperCase()}
                                    </Avatar>
                                </IconButton>
                                <Menu
                                    sx={{ mt: '45px' }}
                                    id="menu-appbar"
                                    anchorEl={anchorElUser}
                                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    keepMounted
                                    transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                    open={Boolean(anchorElUser)}
                                    onClose={handleCloseUserMenu}
                                >
                                    <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                                        <Typography textAlign="center">Hồ sơ</Typography>
                                    </MenuItem>
                                    <Divider />
                                    <MenuItem onClick={async () => { handleCloseUserMenu(); await signOutUser(dispatch, navigate); }}>
                                        <Typography textAlign="center" color="error">Đăng xuất</Typography>
                                    </MenuItem>
                                </Menu>
                            </Box>
                        ) : (
                            <Stack direction="row" spacing={2}>
                                <Button component={Link} to="/signin" sx={{ color: 'text.primary' }}>Đăng nhập</Button>
                                <Button component={Link} to="/signup" variant="contained" color="primary">Đăng ký</Button>
                            </Stack>
                        )}
                    </Box>

                </Toolbar>
            </Container>
        </AppBar>
    );
}


