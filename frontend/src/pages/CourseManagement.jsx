import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Chip, Stack, Card
} from '@mui/material';
import { Add, Edit, Delete, School } from '@mui/icons-material';
import courseService from '../services/courseService';
import { toast } from 'sonner';

export default function CourseManagement() {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingCourse, setEditingCourse] = useState(null);
    const [formData, setFormData] = useState({ name: '', description: '', feePerLesson: '' });
    const [saving, setSaving] = useState(false);

    const fetchCourses = async () => {
        try {
            const data = await courseService.getAllCourses();
            setCourses(data);
        } catch (error) {
            toast.error('Không thể tải danh sách khóa học');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const handleOpen = (course = null) => {
        if (course) {
            setEditingCourse(course);
            setFormData({ name: course.name, description: course.description, feePerLesson: course.feePerLesson });
        } else {
            setEditingCourse(null);
            setFormData({ name: '', description: '', feePerLesson: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingCourse(null);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.feePerLesson) {
            toast.warning('Vui lòng điền đầy đủ thông tin bắt buộc');
            return;
        }

        setSaving(true);
        try {
            if (editingCourse) {
                await courseService.updateCourse(editingCourse._id, formData);
                toast.success('Cập nhật khóa học thành công');
            } else {
                await courseService.createCourse(formData);
                toast.success('Tạo khóa học thành công');
            }
            fetchCourses();
            handleClose();
        } catch (error) {
            toast.error('Có lỗi xảy ra, vui lòng thử lại');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Trúc có chắc chắn muốn xóa khóa học này?')) {
            try {
                await courseService.deleteCourse(id);
                toast.success('Xóa khóa học thành công');
                fetchCourses();
            } catch (error) {
                toast.error('Không thể xóa khóa học');
            }
        }
    };

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h4" color="primary.dark" sx={{ mb: 1 }}>
                        Quản lý Khóa học
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tạo và quản lý các chương trình giảng dạy tại BamBoo-Academy
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{ borderRadius: 2 }}
                >
                    Thêm khóa học mới
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress color="secondary" />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ border: 'none' }}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'primary.light', opacity: 0.1 }}>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 700 }}>Tên khóa học</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Học phí / Buổi</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {courses.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                        <Typography color="text.secondary">Chưa có khóa học nào</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                courses.map((course) => (
                                    <TableRow key={course._id} hover>
                                        <TableCell sx={{ fontWeight: 600, color: 'primary.dark' }}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <School fontSize="small" />
                                                {course.name}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{course.description || '-'}</TableCell>
                                        <TableCell>
                                            <Typography sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(course.feePerLesson)}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Chip
                                                label={course.status === 'active' ? 'Đang mở' : 'Lưu trữ'}
                                                color={course.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton onClick={() => handleOpen(course)} color="primary" size="small">
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton onClick={() => handleDelete(course._id)} color="error" size="small">
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontFamily: 'Playfair Display', fontSize: '1.5rem' }}>
                    {editingCourse ? 'Chỉnh sửa khóa học' : 'Tạo khóa học mới'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Tên khóa học"
                            fullWidth
                            required
                            placeholder="VD: Toán lớp 12"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Học phí mỗi buổi (VNĐ)"
                            type="number"
                            fullWidth
                            required
                            placeholder="VD: 150000"
                            value={formData.feePerLesson}
                            onChange={(e) => setFormData({ ...formData, feePerLesson: e.target.value })}
                        />
                        <TextField
                            label="Mô tả khóa học"
                            multiline
                            rows={3}
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Hủy</Button>
                    <Button
                        onClick={handleSubmit}
                        variant="contained"
                        disabled={saving}
                        startIcon={saving && <CircularProgress size={16} />}
                    >
                        {saving ? 'Đang lưu...' : 'Lưu khóa học'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
