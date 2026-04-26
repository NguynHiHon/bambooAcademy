import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Button, Paper, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField,
    CircularProgress, MenuItem, Stack, FormControl, InputLabel, Select,
    Chip, Tooltip, Tabs, Tab, Badge, Card, Divider
} from '@mui/material';
import { Add, Edit, Delete, Class as ClassIcon, People, AttachMoney, PersonRemove, Restore, Inventory } from '@mui/icons-material';
import classService from '../services/classService';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import { toast } from 'sonner';

export default function ClassManagement() {
    const [classes, setClasses] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({ name: '', course: '', description: '' });
    const [saving, setSaving] = useState(false);
    
    const [tabValue, setTabValue] = useState(0); // 0: Active, 1: Archived
    const [counts, setCounts] = useState({ active: 0, archived: 0 });

    // Quản lý học sinh trong lớp
    const [studentDialogOpen, setStudentDialogOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [classEnrollments, setClassEnrollments] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const status = tabValue === 0 ? 'active' : 'archived';
            const [classesData, coursesData, allStatusClasses] = await Promise.all([
                classService.getAllClasses({ status }),
                courseService.getAllCourses(),
                classService.getAllClasses() // Lấy tất cả để đếm số lượng
            ]);
            
            setClasses(classesData);
            setCourses(coursesData);
            
            // Đếm số lượng để hiển thị trên Tab
            const activeCount = allStatusClasses.filter(c => c.status === 'active').length;
            const archivedCount = allStatusClasses.filter(c => c.status === 'archived').length;
            setCounts({ active: activeCount, archived: archivedCount });
            
        } catch (error) {
            toast.error('Lỗi khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [tabValue]);

    const handleOpen = (item = null) => {
        if (item) {
            setEditingClass(item);
            setFormData({ 
                name: item.name, 
                course: item.course?._id || '', 
                description: item.description || '' 
            });
        } else {
            setEditingClass(null);
            setFormData({ name: '', course: '', description: '' });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingClass(null);
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.course) {
            toast.warning('Vui lòng chọn khóa học và nhập tên lớp');
            return;
        }

        setSaving(true);
        try {
            if (editingClass) {
                await classService.updateClass(editingClass._id, formData);
                toast.success('Cập nhật lớp thành công');
            } else {
                await classService.createClass(formData);
                toast.success('Tạo lớp thành công');
            }
            fetchData();
            handleClose();
        } catch (error) {
            toast.error('Lỗi khi lưu');
        } finally {
            setSaving(false);
        }
    };

    const handleArchive = async (id) => {
        if (window.confirm('Trúc có muốn "Lưu trữ" lớp này không? Lớp sẽ biến mất khỏi thời khóa biểu nhưng lịch sử cũ vẫn được giữ lại.')) {
            try {
                await classService.deleteClass(id);
                toast.success('Đã lưu trữ lớp học thành công. Trúc có thể xem lại ở tab "Đã lưu trữ".');
                fetchData();
            } catch (error) {
                toast.error('Không thể lưu trữ');
            }
        }
    };

    const handleRestore = async (id) => {
        if (window.confirm('Trúc muốn khôi phục lớp này trở lại trạng thái hoạt động?')) {
            try {
                await classService.updateClass(id, { status: 'active' });
                toast.success('Đã khôi phục lớp học thành công!');
                fetchData();
            } catch (error) {
                toast.error('Không thể khôi phục');
            }
        }
    };

    const handleOpenStudents = async (cls) => {
        setSelectedClass(cls);
        setStudentDialogOpen(true);
        setLoadingStudents(true);
        try {
            const enrollments = await enrollmentService.getEnrollmentsByClass(cls._id);
            setClassEnrollments(enrollments);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách học sinh');
        } finally {
            setLoadingStudents(false);
        }
    };

    const promptUpdateFee = async (enroll) => {
        const currentFee = enroll.customFeePerLesson || '';
        const defaultFee = selectedClass?.course?.feePerLesson || 0;
        
        const val = window.prompt(
            `Cài đặt học phí ưu tiên cho [${enroll.student.fullName}]\n` +
            `- Giá gốc khóa học: ${defaultFee.toLocaleString()} đ/buổi\n` +
            `- Nhập số tiền ưu tiên (để trống nếu muốn thu theo giá gốc):`,
            currentFee
        );
        
        if (val === null) return;

        const fee = val.trim() === '' ? null : Number(val);
        if (val.trim() !== '' && isNaN(fee)) {
            return toast.error('Số tiền không hợp lệ, vui lòng nhập số');
        }

        try {
            await enrollmentService.updateEnrollment(enroll._id, { customFeePerLesson: fee });
            toast.success('Đã cập nhật học phí ưu tiên');
            const enrollments = await enrollmentService.getEnrollmentsByClass(selectedClass._id);
            setClassEnrollments(enrollments);
        } catch (error) {
            toast.error('Lỗi khi cập nhật học phí');
        }
    };

    const handleDropStudent = async (enroll) => {
        if (window.confirm(`Trúc có chắc chắn muốn xóa học sinh [${enroll.student.fullName}] khỏi lớp này?`)) {
            try {
                await enrollmentService.deleteEnrollment(enroll._id);
                toast.success('Đã xóa học sinh khỏi lớp');
                const enrollments = await enrollmentService.getEnrollmentsByClass(selectedClass._id);
                setClassEnrollments(enrollments);
            } catch (error) {
                toast.error('Lỗi khi xóa học sinh');
            }
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: { xs: 3, md: 4 }, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
                <Box>
                    <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        Quản lý Lớp học
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Tổ chức học sinh và theo dõi trạng thái hoạt động.
                    </Typography>
                </Box>
                <Button fullWidth={window.innerWidth < 600} variant="contained" startIcon={<Add />} onClick={() => handleOpen()} sx={{ disableElevation: true, borderRadius: 2, py: 1 }}>
                    Thêm lớp mới
                </Button>
            </Box>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: { xs: 2, md: 3 } }}>
                <Tabs value={tabValue} onChange={(e, v) => setTabValue(v)} textColor="primary" indicatorColor="primary">
                    <Tab 
                        label={
                            <Badge badgeContent={counts.active} color="primary" sx={{ '& .MuiBadge-badge': { right: -12, top: 2 } }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '1rem' } }}>Đang chạy</Typography>
                            </Badge>
                        } 
                    />
                    <Tab 
                        label={
                            <Badge badgeContent={counts.archived} color="warning" sx={{ '& .MuiBadge-badge': { right: -12, top: 2 } }}>
                                <Typography sx={{ fontWeight: 700, fontSize: { xs: '0.8rem', sm: '1rem' } }}>Lưu trữ</Typography>
                            </Badge>
                        } 
                    />
                </Tabs>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>
            ) : (
                <>
                    {/* Desktop Table */}
                    <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, boxShadow: 'none', border: '1px solid #eee', borderRadius: 3, overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: '#f9f9f9' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Tên lớp</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Khóa học</TableCell>
                                    <TableCell sx={{ fontWeight: 700 }}>Mô tả</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Học sinh</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {classes.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 10 }}>
                                            <Box sx={{ opacity: 0.5 }}>
                                                <Inventory sx={{ fontSize: 48, mb: 1 }} />
                                                <Typography variant="body1">
                                                    {tabValue === 0 ? "Trúc chưa có lớp học nào đang hoạt động." : "Chưa có lớp nào trong danh sách lưu trữ."}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    classes.map((item) => (
                                        <TableRow key={item._id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>
                                                <Stack direction="row" spacing={1} alignItems="center">
                                                    <ClassIcon fontSize="small" color={tabValue === 0 ? "primary" : "disabled"} />
                                                    {item.name}
                                                </Stack>
                                            </TableCell>
                                            <TableCell>{item.course?.name || 'N/A'}</TableCell>
                                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.9rem' }}>{item.description || '-'}</TableCell>
                                            <TableCell align="center">
                                                <Button 
                                                    size="small" 
                                                    variant="outlined" 
                                                    startIcon={<People />}
                                                    onClick={() => handleOpenStudents(item)}
                                                    sx={{ borderRadius: 4, textTransform: 'none' }}
                                                >
                                                    Danh sách
                                                </Button>
                                            </TableCell>
                                            <TableCell align="right">
                                                {tabValue === 0 ? (
                                                    <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                                                        <Tooltip title="Chỉnh sửa thông tin">
                                                            <IconButton onClick={() => handleOpen(item)} color="primary" size="small"><Edit fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Chuyển vào Lưu trữ">
                                                            <IconButton onClick={() => handleArchive(item._id)} color="warning" size="small"><Delete fontSize="small" /></IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                ) : (
                                                    <Tooltip title="Khôi phục lớp học này (Gỡ lưu trữ)">
                                                        <Button 
                                                            variant="contained" 
                                                            color="success" 
                                                            size="small" 
                                                            startIcon={<Restore />}
                                                            onClick={() => handleRestore(item._id)}
                                                            sx={{ textTransform: 'none', borderRadius: 4, px: 2 }}
                                                        >
                                                            Khôi phục
                                                        </Button>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Mobile Card List */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                        {classes.length === 0 ? (
                            <Box sx={{ py: 5, textAlign: 'center', opacity: 0.5 }}>
                                <Inventory sx={{ fontSize: 48, mb: 1 }} />
                                <Typography variant="body2">{tabValue === 0 ? "Không có lớp hoạt động." : "Không có lớp lưu trữ."}</Typography>
                            </Box>
                        ) : (
                            classes.map((item) => (
                                <Card key={item._id} sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <Box sx={{ p: 2 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                            <Box>
                                                <Typography fontWeight={700} color="primary.main">{item.name}</Typography>
                                                <Typography variant="caption" color="text.secondary">{item.course?.name || 'Chưa chọn khóa'}</Typography>
                                            </Box>
                                            <Chip label="Đang dạy" size="small" color={tabValue === 0 ? "success" : "default"} sx={{ height: 20, fontSize: '0.65rem' }} />
                                        </Box>
                                        
                                        <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.85rem' }}>
                                            {item.description || 'Không có mô tả cho lớp học này.'}
                                        </Typography>

                                        <Divider sx={{ mb: 2 }} />

                                        <Stack direction="row" spacing={1} justifyContent="space-between">
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                startIcon={<People />} 
                                                onClick={() => handleOpenStudents(item)}
                                                sx={{ borderRadius: 2, fontSize: '0.75rem' }}
                                            >
                                                Học sinh
                                            </Button>
                                            <Stack direction="row" spacing={0.5}>
                                                {tabValue === 0 ? (
                                                    <>
                                                        <IconButton size="small" color="primary" onClick={() => handleOpen(item)} sx={{ border: '1px solid', borderColor: 'primary.light' }}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                        <IconButton size="small" color="warning" onClick={() => handleArchive(item._id)} sx={{ border: '1px solid', borderColor: 'warning.light' }}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </>
                                                ) : (
                                                    <Button size="small" variant="contained" color="success" startIcon={<Restore />} onClick={() => handleRestore(item._id)} sx={{ borderRadius: 2 }}>
                                                        Khôi phục
                                                    </Button>
                                                )}
                                            </Stack>
                                        </Stack>
                                    </Box>
                                </Card>
                            ))
                        )}
                    </Box>
                </>
            )}

            {/* Dialog Thêm/Sửa Lớp */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                    {editingClass ? 'Sửa thông tin lớp' : 'Tạo lớp học mới'}
                </DialogTitle>
                <DialogContent sx={{ pt: 2 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <FormControl fullWidth required>
                            <InputLabel>Thuộc khóa học</InputLabel>
                            <Select
                                value={formData.course}
                                label="Thuộc khóa học"
                                onChange={(e) => setFormData({ ...formData, course: e.target.value })}
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <TextField
                            label="Tên lớp"
                            fullWidth
                            required
                            placeholder="VD: Lớp A1"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                        <TextField
                            label="Ghi chú"
                            multiline
                            rows={2}
                            fullWidth
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose} color="inherit">Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" disabled={saving}>Lưu lớp học</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Quản lý Học sinh trong lớp */}
            <Dialog open={studentDialogOpen} onClose={() => setStudentDialogOpen(false)} fullWidth maxWidth="md">
                <DialogTitle component="div" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontFamily: 'Playfair Display' }}>
                        Học sinh lớp: {selectedClass?.name}
                    </Typography>
                    {selectedClass && (
                        <Chip label={`Giá gốc: ${selectedClass.course?.feePerLesson?.toLocaleString() || 0} đ/buổi`} color="primary" variant="outlined" />
                    )}
                </DialogTitle>
                <DialogContent dividers>
                    {loadingStudents ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}><CircularProgress /></Box>
                    ) : classEnrollments.length === 0 ? (
                        <Typography sx={{ textAlign: 'center', py: 5, color: 'text.secondary' }}>
                            Chưa có học sinh nào trong lớp này.
                        </Typography>
                    ) : (
                        <TableContainer>
                            <Table size="small">
                                <TableHead sx={{ bgcolor: '#f4f6f8' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>Họ tên</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Số điện thoại</TableCell>
                                        <TableCell align="center" sx={{ fontWeight: 700 }}>Mức phí áp dụng</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {classEnrollments.map(enroll => (
                                        <TableRow key={enroll._id} hover>
                                            <TableCell sx={{ fontWeight: 600 }}>{enroll.student.fullName}</TableCell>
                                            <TableCell>{enroll.student.phone}</TableCell>
                                            <TableCell align="center">
                                                {enroll.customFeePerLesson !== null ? (
                                                    <Chip 
                                                        label={`${enroll.customFeePerLesson.toLocaleString()} đ`} 
                                                        color="success" 
                                                        size="small" 
                                                        sx={{ fontWeight: 'bold' }}
                                                    />
                                                ) : (
                                                    <Typography variant="body2" color="text.secondary">Giá gốc khóa học</Typography>
                                                )}
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Cài đặt phí ưu tiên">
                                                    <IconButton color="primary" onClick={() => promptUpdateFee(enroll)}>
                                                        <AttachMoney fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa khỏi lớp">
                                                    <IconButton color="error" onClick={() => handleDropStudent(enroll)}>
                                                        <PersonRemove fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setStudentDialogOpen(false)} color="inherit">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
