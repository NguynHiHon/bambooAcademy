import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Box, CircularProgress } from '@mui/material';

/**
 * ProtectedRoute - Component bảo vệ route dựa trên authentication và role
 * 
 * @param {ReactNode} children - Component con cần render
 * @param {Array} allowedRoles - Danh sách role được phép truy cập (mặc định: tất cả role đã đăng nhập)
 * @param {string} redirectTo - Đường dẫn chuyển hướng nếu không có quyền (mặc định: '/')
 * @param {boolean} requireAuth - Yêu cầu đăng nhập (mặc định: true)
 */
const ProtectedRoute = ({
    children,
    allowedRoles = [],
    redirectTo = '/',
    requireAuth = true
}) => {
    const location = useLocation();
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const { accessToken } = useSelector((state) => state.token);

    // Đang kiểm tra authentication (loading state)
    // Nếu có token nhưng chưa có currentUser thì đang load

    if (requireAuth && accessToken && !currentUser) {
        return (
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    minHeight: '100vh',
                    bgcolor: '#f5f5f5'
                }}
            >
                <CircularProgress sx={{ color: '#f26522' }} />
            </Box>
        );
    }

    // Chưa đăng nhập
    if (requireAuth && !isAuthenticated) {
        // Lưu lại đường dẫn hiện tại để redirect sau khi login
        return <Navigate to="/signin" state={{ from: location }} replace />;
    }

    // Kiểm tra role nếu có yêu cầu
    if (allowedRoles.length > 0 && currentUser) {
        const userRole = currentUser.role;

        if (!allowedRoles.includes(userRole)) {
            // Không có quyền truy cập
            return <Navigate to={redirectTo} replace />;
        }
    }

    return children;
};

/**
 * AdminRoute - Route chỉ dành cho admin
 */
export const AdminRoute = ({ children, redirectTo = '/' }) => {
    return (
        <ProtectedRoute allowedRoles={['admin']} redirectTo={redirectTo}>
            {children}
        </ProtectedRoute>
    );
};

/**
 * StaffRoute - Route dành cho admin và staff
 */
export const StaffRoute = ({ children, redirectTo = '/' }) => {
    return (
        <ProtectedRoute allowedRoles={['admin', 'staff']} redirectTo={redirectTo}>
            {children}
        </ProtectedRoute>
    );
};

/**
 * AuthRoute - Route yêu cầu đăng nhập (tất cả role)
 */
export const AuthRoute = ({ children, redirectTo = '/signin' }) => {
    return (
        <ProtectedRoute requireAuth={true} redirectTo={redirectTo}>
            {children}
        </ProtectedRoute>
    );
};

/**
 * GuestRoute - Route chỉ dành cho khách (chưa đăng nhập)
 * Ví dụ: trang signin, signup
 */
export const GuestRoute = ({ children, redirectTo = '/' }) => {
    const { isAuthenticated } = useSelector((state) => state.auth);

    if (isAuthenticated) {
        return <Navigate to={redirectTo} replace />;
    }

    return children;
};

export default ProtectedRoute;
