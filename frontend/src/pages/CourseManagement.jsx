import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, Chip, Stack, Card, Divider
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
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        Quản lý Khóa học
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tạo và quản lý các chương trình giảng dạy.
                    </Typography>
                </Box>
                <Button
                    fullWidth={window.innerWidth < 600}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{ borderRadius: 2, py: 1 }}
                >
                    Thêm khóa học mới
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress color="secondary" />
                </Box>
            ) : (
                <>
                    {/* Desktop Table */}
                    <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, border: '1px solid #eee', boxShadow: 'none', borderRadius: 3, overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f9f9f9' }}>
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
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                <Stack direction="row" spacing={1.5} alignItems="center">
                                                    <School fontSize="small" color="primary" />
                                                    {course.name}
                                                </Stack>
                                            </TableCell>
                                            <TableCell sx={{ color: 'text.secondary', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {course.description || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Typography sx={{ fontWeight: 700, color: 'secondary.dark' }}>
                                                    {course.feePerLesson?.toLocaleString()} đ
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

                    {/* Mobile Card List */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                        {courses.length === 0 ? (
                            <Typography sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>Chưa có khóa học nào.</Typography>
                        ) : (
                            courses.map((course) => (
                                <Card key={course._id} sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <Box sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={700} color="primary.main">{course.name}</Typography>
                                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.dark', mt: 0.5 }}>
                                                    {course.feePerLesson?.toLocaleString()} đ/buổi
                                                </Typography>
                                            </Box>
                                            <Chip
                                                label={course.status === 'active' ? 'Đang mở' : 'Lưu trữ'}
                                                color={course.status === 'active' ? 'success' : 'default'}
                                                size="small"
                                                sx={{ height: 20, fontSize: '0.65rem' }}
                                            />
                                        </Box>
                                        
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.85rem' }}>
                                            {course.description || 'Không có mô tả cho khóa học này.'}
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <IconButton size="small" onClick={() => handleOpen(course)} color="primary" sx={{ border: '1px solid', borderColor: 'primary.light' }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" onClick={() => handleDelete(course._id)} color="error" sx={{ border: '1px solid', borderColor: 'error.light' }}>
                                                <Delete fontSize="small" />
                                            </IconButton>
                                        </Stack>
                                    </Box>
                                </Card>
                            ))
                        )}
                    </Box>
                </>
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
