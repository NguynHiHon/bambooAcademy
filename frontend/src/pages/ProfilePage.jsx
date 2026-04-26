import React, { useEffect, useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import userService from '../services/userService';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Avatar,
  TextField,
  Divider,
  Tabs,
  Tab,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Logout as LogoutIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Lock as LockIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { toast } from 'sonner';


// Tab Panel Component
function TabPanel({ children, value, index, ...other }) {
  return (
    <div role="tabpanel" hidden={value !== index} {...other}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const ProfilePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
  const { profile, isFetching, error } = useSelector((state) => state.user);
  const accessToken = useSelector((state) => state.token.accessToken);

  const [tabValue, setTabValue] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: '',
    phone: '',
    address: '',
  });
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleFetchProfile = useCallback(async () => {
    try {
      await userService.fetchUserProfile(dispatch);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }
    if (!profile && accessToken) {
      handleFetchProfile();
    }
  }, [isAuthenticated, profile, accessToken, navigate, handleFetchProfile]);

  useEffect(() => {
    if (profile) {
      setEditData({
        fullName: profile.fullName || '',
        phone: profile.phone || '',
        address: profile.address || '',
      });
    }
  }, [profile]);

  const handleLogout = async () => {
    await signOutUser(dispatch, navigate);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await userService.updateUserProfile(editData);
      toast.success('Cập nhật thông tin thành công!');
      setIsEditing(false);
      // Refresh profile data
      await handleFetchProfile();
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Cập nhật thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    setIsSaving(true);
    try {
      await userService.updateUserProfile({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        newPasswordConfirm: passwordData.confirmPassword,
      });
      toast.success('Đổi mật khẩu thành công!');
      setPasswordDialog(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err?.response?.data?.message || err?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại.';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isFetching) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress sx={{ color: '#f26522' }} />
      </Box>
    );
  }

  const userProfile = profile || currentUser;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Simple Header */}
      <Box sx={{ bgcolor: '#fff', py: 2, px: 3, borderBottom: '1px solid #eee' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography
              component={Link}
              to="/"
              variant="h5"
              sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', fontFamily: 'Playfair Display' }}
            >
              BamBoo<span style={{ color: '#D4AF37' }}>-Academy</span>
            </Typography>
            <Button
              component={Link}
              to="/"
              startIcon={<HomeIcon />}
              sx={{ color: '#666' }}
            >
              Trang chủ
            </Button>
          </Box>
        </Container>
      </Box>


      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#333' }}>
            TÀI KHOẢN CỦA TÔI
          </Typography>
        </Box>


        <Grid container spacing={4}>
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Card sx={{ mb: 3 }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '3rem',
                  }}
                >
                  {userProfile?.username?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {userProfile?.fullName || userProfile?.username || 'Người dùng'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {userProfile?.email || userProfile?.username}
                </Typography>
                <Chip
                  label={
                    userProfile?.role === 'admin'
                      ? 'Quản trị viên'
                      : userProfile?.role === 'staff'
                        ? 'Nhân viên'
                        : 'Khách hàng'
                  }
                  color={userProfile?.role === 'admin' ? 'error' : userProfile?.role === 'staff' ? 'warning' : 'primary'}
                  size="small"
                />
              </CardContent>
            </Card>

            <Card>
              <List>
                {(userProfile?.role === 'admin' || userProfile?.role === 'staff') && (
                  <>
                    <ListItem
                      component={Link}
                      to="/admin/dashboard"
                      sx={{ '&:hover': { bgcolor: '#f5f5f5' }, cursor: 'pointer' }}
                    >
                      <ListItemIcon>
                        <AdminIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText primary="Trang quản trị" />
                    </ListItem>
                    <Divider />
                  </>
                )}
                <ListItem onClick={() => setPasswordDialog(true)} sx={{ '&:hover': { bgcolor: '#f5f5f5' }, cursor: 'pointer' }}>
                  <ListItemIcon>
                    <LockIcon sx={{ color: '#666' }} />
                  </ListItemIcon>
                  <ListItemText primary="Đổi mật khẩu" />
                </ListItem>
                <Divider />
                <ListItem onClick={handleLogout} sx={{ '&:hover': { bgcolor: '#ffebee' }, cursor: 'pointer' }}>
                  <ListItemIcon>
                    <LogoutIcon color="error" />
                  </ListItemIcon>
                  <ListItemText primary="Đăng xuất" sx={{ color: 'error.main' }} />
                </ListItem>
              </List>
            </Card>

          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    sx={{
                      '& .MuiTab-root.Mui-selected': { color: '#f26522' },
                      '& .MuiTabs-indicator': { bgcolor: '#f26522' },
                    }}
                  >
                    <Tab icon={<PersonIcon />} label="Thông tin" iconPosition="start" />
                    <Tab icon={<HistoryIcon />} label="Hoạt động" iconPosition="start" />
                  </Tabs>
                </Box>

                {/* Profile Info Tab */}
                <TabPanel value={tabValue} index={0}>
                  {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                      Không thể tải thông tin người dùng. Vui lòng thử lại.
                    </Alert>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>
                      Thông tin cá nhân
                    </Typography>
                    {!isEditing ? (
                      <Button startIcon={<EditIcon />} onClick={() => setIsEditing(true)} color="primary">
                        Chỉnh sửa
                      </Button>
                    ) : (
                      <Box>
                        <Button
                          startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                          onClick={handleSaveProfile}
                          disabled={isSaving}
                          sx={{ color: '#f26522', mr: 1 }}
                        >
                          {isSaving ? 'Đang lưu...' : 'Lưu'}
                        </Button>
                        <Button startIcon={<CancelIcon />} onClick={() => setIsEditing(false)} color="inherit" disabled={isSaving}>
                          Hủy
                        </Button>
                      </Box>
                    )}
                  </Box>

                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Tên đăng nhập"
                        value={userProfile?.username || ''}
                        disabled
                        InputProps={{
                          startAdornment: <PersonIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Họ và tên"
                        name="fullName"
                        value={isEditing ? editData.fullName : userProfile?.fullName || ''}
                        onChange={handleEditChange}
                        disabled={!isEditing}
                        placeholder="Chưa cập nhật"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Email"
                        value={userProfile?.email || 'Chưa cập nhật'}
                        disabled
                        InputProps={{
                          startAdornment: <EmailIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Số điện thoại"
                        name="phone"
                        value={isEditing ? editData.phone : userProfile?.phone || ''}
                        onChange={handleEditChange}
                        disabled={!isEditing}
                        placeholder="Chưa cập nhật"
                        InputProps={{
                          startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Địa chỉ"
                        name="address"
                        value={isEditing ? editData.address : userProfile?.address || ''}
                        onChange={handleEditChange}
                        disabled={!isEditing}
                        placeholder="Chưa cập nhật"
                        multiline
                        rows={2}
                        InputProps={{
                          startAdornment: (
                            <LocationIcon sx={{ mr: 1, color: 'text.secondary', alignSelf: 'flex-start', mt: 1 }} />
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 4 }} />

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Thông tin tài khoản
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                        <Typography variant="body2" color="text.secondary">
                          Vai trò
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {userProfile?.role === 'admin'
                            ? 'Quản trị viên'
                            : userProfile?.role === 'staff'
                              ? 'Nhân viên'
                              : 'Khách hàng'}
                        </Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Paper sx={{ p: 2, bgcolor: '#f9f9f9' }}>
                        <Typography variant="body2" color="text.secondary">
                          Ngày tham gia
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                          {userProfile?.createdAt
                            ? new Date(userProfile.createdAt).toLocaleDateString('vi-VN')
                            : 'N/A'}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </TabPanel>

                {/* Activity Tab */}
                <TabPanel value={tabValue} index={1}>
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <HistoryIcon sx={{ fontSize: 60, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">
                      Lịch sử hoạt động
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                      Xem các hoạt động gần đây của bạn
                    </Typography>
                  </Box>

                </TabPanel>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Change Password Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Đổi mật khẩu</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu hiện tại"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, currentPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Mật khẩu mới"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, newPassword: e.target.value }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              type="password"
              label="Xác nhận mật khẩu mới"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)} disabled={isSaving}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handlePasswordChange}
            disabled={isSaving}
            sx={{ bgcolor: '#f26522', '&:hover': { bgcolor: '#d55419' } }}
          >
            {isSaving ? 'Đang xử lý...' : 'Đổi mật khẩu'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProfilePage;
