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

import { Person as PersonIcon, Menu as MenuIcon, Dashboard, People, Class, School, CalendarMonth, Assignment, RequestQuote } from '@mui/icons-material';
import { signOutUser } from '../../services/authService';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton } from '@mui/material';

export default function Header() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const { profile } = useSelector((state) => state.user);
    const displayAvatar = profile?.avatar || currentUser?.avatar;
    const [anchorElUser, setAnchorElUser] = React.useState(null);
    const [mobileOpen, setMobileOpen] = React.useState(false);

    const handleOpenUserMenu = (event) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const navItems = [
        { label: 'Học sinh', to: '/students', icon: <People /> },
        { label: 'Lớp học', to: '/classes', icon: <Class /> },
        { label: 'Khóa học', to: '/courses', icon: <School /> },
        { label: 'Lịch dạy', to: '/schedule', icon: <CalendarMonth /> },
        { label: 'Điểm danh', to: '/attendance', icon: <Assignment /> },
        { label: 'Điểm số', to: '/scores', icon: <Dashboard /> },
        { label: 'Học phí', to: '/tuition', icon: <RequestQuote /> },
    ];

    const drawer = (
        <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h6" sx={{ my: 2, fontWeight: 700, color: 'primary.main', fontFamily: 'Playfair Display' }}>
                BamBoo<span style={{ color: '#D4AF37' }}>-Academy</span>
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* User Info in Mobile Drawer */}
            {isAuthenticated && (
                <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(212, 175, 55, 0.05)', borderRadius: 4 }}>
                    <Avatar
                        src={displayAvatar}
                        sx={{ width: 60, height: 60, mx: 'auto', mb: 1.5, border: '2px solid #D4AF37' }}
                    >
                        {currentUser?.username?.[0].toUpperCase()}
                    </Avatar>
                    <Typography variant="subtitle1" fontWeight={700}>
                        Cô {currentUser?.fullName || currentUser?.username}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {currentUser?.email}
                    </Typography>
                </Box>
            )}

            <List sx={{ px: 1 }}>
                {navItems.map((item) => (
                    <ListItem key={item.to} disablePadding>
                        <ListItemButton
                            component={Link}
                            to={item.to}
                            onClick={handleDrawerToggle}
                            sx={{ py: 1.5, borderRadius: 3, mb: 0.5 }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 600 }} />
                        </ListItemButton>
                    </ListItem>
                ))}

                <Divider sx={{ my: 1 }} />

                {/* Profile & Logout in Mobile Menu */}
                <ListItem disablePadding>
                    <ListItemButton
                        component={Link}
                        to="/profile"
                        onClick={handleDrawerToggle}
                        sx={{ py: 1.5, borderRadius: 3, mb: 0.5 }}
                    >
                        <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}><PersonIcon /></ListItemIcon>
                        <ListItemText primary="Hồ sơ cá nhân" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                </ListItem>

                <ListItem disablePadding>
                    <ListItemButton
                        onClick={async () => {
                            handleDrawerToggle();
                            await signOutUser(dispatch, navigate);
                        }}
                        sx={{ py: 1.5, borderRadius: 3, color: 'error.main' }}
                    >
                        <ListItemIcon sx={{ color: 'error.main', minWidth: 40 }}>
                            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></svg>
                        </ListItemIcon>
                        <ListItemText primary="Đăng xuất" primaryTypographyProps={{ fontWeight: 600 }} />
                    </ListItemButton>
                </ListItem>
            </List>
        </Box>
    );

    return (
        <AppBar position="sticky" sx={{ bgcolor: '#fff', color: '#333', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', top: 0, zIndex: 1100 }}>
            <Container maxWidth="lg">
                <Toolbar disableGutters>
                    {/* Mobile Hamburger Icon */}
                    {isAuthenticated && (
                        <IconButton
                            color="inherit"
                            aria-label="open drawer"
                            edge="start"
                            onClick={handleDrawerToggle}
                            sx={{ mr: 2, display: { md: 'none' }, color: 'primary.main' }}
                        >
                            <MenuIcon />
                        </IconButton>
                    )}

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
                            flexGrow: { xs: 1, md: 0 },
                            letterSpacing: 1,
                            fontFamily: '"Playfair Display", serif',
                        }}
                    >
                        BamBoo<span style={{ color: '#D4AF37' }}>-Academy</span>
                    </Typography>

                    {/* Desktop Menu */}
                    <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 3 }}>
                        {isAuthenticated && navItems.map((item) => (
                            <Typography
                                key={item.to}
                                component={Link}
                                to={item.to}
                                sx={{
                                    color: 'text.primary',
                                    textDecoration: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.9rem',
                                    transition: '0.2s',
                                    '&:hover': { color: 'primary.main', transform: 'translateY(-2px)' }
                                }}
                            >
                                {item.label}
                            </Typography>
                        ))}
                    </Box>

                    {/* User Menu */}
                    <Box sx={{ flexGrow: 0 }}>
                        {isAuthenticated ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, md: 2 } }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, display: { xs: 'none', sm: 'block' } }}>
                                    Cô {currentUser?.fullName || currentUser?.username}
                                </Typography>
                                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0.5, border: '2px solid #D4AF37', transition: '0.3s', '&:hover': { transform: 'scale(1.1)' } }}>
                                    <Avatar src={displayAvatar} sx={{ bgcolor: 'primary.main', width: { xs: 32, md: 40 }, height: { xs: 32, md: 40 } }}>
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
                            <Stack direction="row" spacing={1}>
                                <Button component={Link} to="/signin" sx={{ color: 'text.primary', fontSize: { xs: '0.8rem', md: '1rem' } }}>Login</Button>
                                <Button component={Link} to="/signup" variant="contained" color="primary" sx={{ fontSize: { xs: '0.8rem', md: '1rem' }, px: { xs: 1, md: 2 } }}>Sign Up</Button>
                            </Stack>
                        )}
                    </Box>
                </Toolbar>
            </Container>

            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', md: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280, borderRadius: '0 20px 20px 0' },
                }}
            >
                {drawer}
            </Drawer>
        </AppBar>
    );
}


