import React, { useState, useEffect } from 'react';
import { 
    Container, Box, Typography, Paper, Table, TableBody, 
    TableCell, TableContainer, TableHead, TableRow, TextField, 
    Button, IconButton, Dialog, DialogTitle, DialogContent, 
    DialogActions, Stack, Avatar, Chip, CircularProgress,
    Divider, MenuItem, Select, FormControl, InputLabel,
    Tooltip, Alert, Card
} from '@mui/material';
import { 
    Add, Edit, Delete, Home, School, ContactPhone, 
    PersonAdd, Info, Warning
} from '@mui/icons-material';
import studentService from '../services/studentService';
import courseService from '../services/courseService';
import enrollmentService from '../services/enrollmentService';
import classService from '../services/classService';
import timetableService from '../services/timetableService';
import GridLegacy from '@mui/material/GridLegacy';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [courses, setCourses] = useState([]);
    const [classes, setClasses] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [allTimetables, setAllTimetables] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedCourse, setSelectedCourse] = useState('all');

    // Dialog states
    const [open, setOpen] = useState(false);
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [enrollData, setEnrollData] = useState({ student: null, classId: '', courseId: '' });

    const [formData, setFormData] = useState({
        fullName: '',
        address: '',
        school: '',
        phone: '',
        parentName: '',
        parentPhone: '',
        learningAbility: 'Khá'
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            // Fetch core data first
            const [studentData, courseData, enrollmentData, classData] = await Promise.all([
                studentService.getAllStudents().catch(() => []),
                courseService.getAllCourses().catch(() => []),
                enrollmentService.getAllEnrollments().catch(() => []),
                classService.getAllClasses().catch(() => [])
            ]);
            
            setStudents(studentData || []);
            setCourses(courseData || []);
            setEnrollments(enrollmentData || []);
            setClasses(classData || []);

            // Fetch timetables - handle errors per class
            const timetables = {};
            if (classData && classData.length > 0) {
                const timetableResults = await Promise.allSettled(
                    classData.map(c => timetableService.getSlotsByClass(c._id))
                );
                
                classData.forEach((c, index) => {
                    if (timetableResults[index].status === 'fulfilled') {
                        timetables[c._id] = timetableResults[index].value;
                    } else {
                        timetables[c._id] = [];
                    }
                });
            }
            setAllTimetables(timetables);

        } catch (error) {
            console.error('Lỗi nghiêm trọng khi lấy dữ liệu:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleOpen = (student = null) => {
        if (student) {
            setEditingStudent(student);
            setFormData({
                fullName: student.fullName || '',
                address: student.address || '',
                school: student.school || '',
                phone: student.phone || '',
                parentName: student.parentName || '',
                parentPhone: student.parentPhone || '',
                learningAbility: student.learningAbility || 'Khá'
            });
        } else {
            setEditingStudent(null);
            setFormData({
                fullName: '',
                address: '',
                school: '',
                phone: '',
                parentName: '',
                parentPhone: '',
                learningAbility: 'Khá'
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setEditingStudent(null);
    };

    const handleEnrollOpen = (student) => {
        setEnrollData({ student, classId: '', courseId: '' });
        setEnrollOpen(true);
    };

    const handleEnrollClose = () => {
        setEnrollOpen(false);
        setEnrollData({ student: null, classId: '', courseId: '' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.fullName) return alert('Vui lòng nhập tên học sinh');
        try {
            if (editingStudent) {
                await studentService.updateStudent(editingStudent._id, formData);
            } else {
                await studentService.createStudent(formData);
            }
            fetchData();
            handleClose();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Trúc có chắc chắn muốn xóa học sinh này?')) {
            try {
                await studentService.deleteStudent(id);
                fetchData();
            } catch (error) {
                alert('Lỗi khi xóa: ' + error.message);
            }
        }
    };

    const handleEnrollSubmit = async () => {
        if (!enrollData.classId || !enrollData.student) return;
        try {
            await enrollmentService.enrollStudent({
                student: enrollData.student._id,
                class: enrollData.classId
            });
            fetchData();
            handleEnrollClose();
        } catch (error) {
            alert('Lỗi ghi danh: ' + error.message);
        }
    };

    const checkOverlap = (classId) => {
        if (!enrollData.student || !classId) return null;
        
        const newClass = classes.find(c => c._id === classId);
        if (!newClass) return null;

        const newCourseId = (newClass.course?._id || newClass.course || '').toString();
        const studentEnrollments = enrollments.filter(e => {
            const studentId = (e.student?._id || e.student || '').toString();
            return studentId === enrollData.student._id.toString();
        });
        
        const alreadyInCourse = studentEnrollments.find(e => {
            const cCourseId = (e.class?.course?._id || e.class?.course || e.class || '').toString();
            return cCourseId === newCourseId;
        });

        if (alreadyInCourse) {
            return `Học sinh đã tham gia lớp "${alreadyInCourse.class?.name || 'khác'}" trong khóa học này rồi.`;
        }

        const newClassSlots = allTimetables[classId] || [];
        for (const enrollment of studentEnrollments) {
            const currentId = enrollment.class?._id || enrollment.class;
            const currentSlots = allTimetables[currentId] || [];
            for (const nSlot of newClassSlots) {
                for (const cSlot of currentSlots) {
                    if (nSlot.dayOfWeek === cSlot.dayOfWeek && nSlot.slot === cSlot.slot) {
                        const currentClassName = classes.find(c => c._id === currentId)?.name || 'Lớp khác';
                        return `Trùng lịch với lớp ${currentClassName} vào ${nSlot.dayOfWeek} (${nSlot.slot})`;
                    }
                }
            }
        }
        return null;
    };

    const overlapError = checkOverlap(enrollData.classId);

    const filteredStudents = selectedCourse === 'all' 
        ? students 
        : students.filter(s => {
            return enrollments.some(e => {
                const studentId = (e.student?._id || e.student || '').toString();
                const courseIdInEnroll = (e.class?.course?._id || e.class?.course || e.class || '').toString();
                return studentId === s._id.toString() && courseIdInEnroll === selectedCourse.toString();
            });
        });

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Box>
                    <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontFamily: 'Playfair Display', fontWeight: 700 }}>
                        Quản lý Học sinh
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Typography variant="body2" color="text.secondary">Lọc theo khóa học:</Typography>
                        <FormControl size="small" sx={{ minWidth: 200 }}>
                            <Select
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                                sx={{ bgcolor: '#fff', borderRadius: 2 }}
                            >
                                <MenuItem value="all">Tất cả học sinh</MenuItem>
                                {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Stack>
                </Box>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<Add />}
                    onClick={() => handleOpen()}
                    sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                >
                    Thêm học sinh
                </Button>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
                    <CircularProgress color="secondary" />
                </Box>
            ) : (
                <>
                    {/* Desktop Table View */}
                    <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: { xs: 'none', md: 'block' }, overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(46, 125, 50, 0.05)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Học sinh</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Lực học</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Lớp học</TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: 'primary.dark' }}>Phụ huynh</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700, color: 'primary.dark' }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredStudents.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                            <Info color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                            <Typography color="text.secondary">Không tìm thấy học sinh nào</Typography>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredStudents.map((s) => (
                                        <TableRow key={s._id} hover>
                                            <TableCell>
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700, width: 45, height: 45 }}>
                                                        {s.fullName?.[0]?.toUpperCase() || 'S'}
                                                    </Avatar>
                                                    <Box>
                                                        <Typography sx={{ fontWeight: 700, fontSize: '0.95rem' }}>{s.fullName || 'Học sinh chưa có tên'}</Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', mb: 0.2 }}>
                                                            <Home sx={{ fontSize: 12 }} /> {s.address || 'Chưa có địa chỉ'}
                                                        </Typography>
                                                        <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main', fontWeight: 500 }}>
                                                            <School sx={{ fontSize: 12 }} /> {s.school || 'Chưa cập nhật trường'}
                                                        </Typography>
                                                    </Box>
                                                </Stack>
                                            </TableCell>
                                            <TableCell>
                                                <Chip 
                                                    label={s.learningAbility || 'Khá'} 
                                                    size="small" 
                                                    sx={{ 
                                                        bgcolor: 'primary.light', 
                                                        color: 'primary.dark',
                                                        fontWeight: 600
                                                    }} 
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                                    {enrollments
                                                        .filter(e => (e.student?._id || e.student || '').toString() === s._id.toString())
                                                        .map((e, idx) => (
                                                            <Tooltip key={idx} title={e.class?.course?.name || 'Thông tin khóa học'}>
                                                                <Chip 
                                                                    label={e.class?.name || 'N/A'}
                                                                    size="small"
                                                                    variant="outlined"
                                                                    color="secondary"
                                                                    sx={{ fontWeight: 500 }}
                                                                />
                                                            </Tooltip>
                                                        ))
                                                    }
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Box>
                                                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{s.parentName || 'N/A'}</Typography>
                                                    <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <ContactPhone sx={{ fontSize: 12 }} /> {s.parentPhone || '-'}
                                                    </Typography>
                                                </Box>
                                            </TableCell>
                                            <TableCell align="right">
                                                <Tooltip title="Ghi danh vào lớp">
                                                    <IconButton onClick={() => handleEnrollOpen(s)} color="secondary" size="small">
                                                        <PersonAdd fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <IconButton onClick={() => handleOpen(s)} color="primary" size="small">
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                                <IconButton onClick={() => handleDelete(s._id)} color="error" size="small">
                                                    <Delete fontSize="small" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Mobile Card View */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                        {filteredStudents.length === 0 ? (
                            <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
                                <Info color="disabled" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography color="text.secondary">Không tìm thấy học sinh nào</Typography>
                            </Paper>
                        ) : (
                            filteredStudents.map((s) => (
                                <Card key={s._id} sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                    <Box sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                            <Avatar sx={{ bgcolor: 'primary.main', fontWeight: 700 }}>
                                                {s.fullName?.[0]?.toUpperCase() || 'S'}
                                            </Avatar>
                                            <Box sx={{ flexGrow: 1 }}>
                                                <Typography sx={{ fontWeight: 700 }}>{s.fullName}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{s.school}</Typography>
                                            </Box>
                                            <Chip label={s.learningAbility} size="small" color="primary" variant="outlined" />
                                        </Stack>
                                        
                                        <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />
                                        
                                        <Stack spacing={1} sx={{ mb: 2 }}>
                                            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <strong>PH:</strong> {s.parentName} - {s.parentPhone}
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
                                                <Typography variant="body2"><strong>Lớp:</strong></Typography>
                                                {enrollments
                                                        .filter(e => (e.student?._id || e.student || '').toString() === s._id.toString())
                                                        .map((e, idx) => (
                                                            <Chip key={idx} label={e.class?.name} size="small" sx={{ height: 20 }} />
                                                        ))
                                                }
                                                {enrollments.filter(e => (e.student?._id || e.student || '').toString() === s._id.toString()).length === 0 && (
                                                    <Typography variant="caption" color="text.disabled">Chưa vào lớp</Typography>
                                                )}
                                            </Box>
                                        </Stack>

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            <Button size="small" variant="outlined" color="secondary" startIcon={<PersonAdd />} onClick={() => handleEnrollOpen(s)}>
                                                Ghi danh
                                            </Button>
                                            <IconButton size="small" color="primary" onClick={() => handleOpen(s)} sx={{ bgcolor: 'rgba(46, 125, 50, 0.05)' }}>
                                                <Edit fontSize="small" />
                                            </IconButton>
                                            <IconButton size="small" color="error" onClick={() => handleDelete(s._id)} sx={{ bgcolor: 'rgba(211, 47, 47, 0.05)' }}>
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

            {/* Student Info Dialog */}
            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
                <DialogTitle sx={{ fontFamily: 'Playfair Display', fontSize: '1.8rem', color: 'primary.dark' }}>
                    {editingStudent ? 'Cập nhật hồ sơ học sinh' : 'Hồ sơ học sinh mới'}
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    <GridLegacy container spacing={3}>
                        <GridLegacy item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Họ và tên học sinh"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                sx={{ mb: 2 }}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Địa chỉ nhà"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Trường đang học"
                                value={formData.school}
                                onChange={(e) => setFormData({ ...formData, school: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="Số điện thoại cá nhân"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                        </GridLegacy>
                        <GridLegacy item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Họ tên phụ huynh"
                                value={formData.parentName}
                                onChange={(e) => setFormData({ ...formData, parentName: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <TextField
                                fullWidth
                                label="SĐT Phụ huynh liên hệ"
                                value={formData.parentPhone}
                                onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })}
                                sx={{ mb: 2 }}
                            />
                            <FormControl fullWidth>
                                <InputLabel>Lực học dự kiến</InputLabel>
                                <Select
                                    value={formData.learningAbility}
                                    label="Lực học dự kiến"
                                    onChange={(e) => setFormData({ ...formData, learningAbility: e.target.value })}
                                >
                                    <MenuItem value="Giỏi">Giỏi</MenuItem>
                                    <MenuItem value="Khá">Khá</MenuItem>
                                    <MenuItem value="Trung bình">Trung bình</MenuItem>
                                </Select>
                            </FormControl>
                        </GridLegacy>
                    </GridLegacy>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={handleClose}>Hủy</Button>
                    <Button onClick={handleSubmit} variant="contained" color="primary">
                        {editingStudent ? 'Cập nhật' : 'Thêm mới'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Enrollment Dialog */}
            <Dialog open={enrollOpen} onClose={handleEnrollClose} fullWidth maxWidth="xs">
                <DialogTitle sx={{ fontFamily: 'Playfair Display', color: 'primary.dark' }}>
                    Ghi danh vào lớp học
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 3 }}>
                    <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Học sinh: <strong>{enrollData.student?.fullName}</strong>
                    </Typography>
                    
                    <FormControl fullWidth sx={{ mb: 3 }}>
                        <InputLabel id="course-select-label">Chọn Khóa học</InputLabel>
                        <Select
                            labelId="course-select-label"
                            value={enrollData.courseId}
                            label="Chọn Khóa học"
                            onChange={(e) => setEnrollData({ ...enrollData, courseId: e.target.value, classId: '' })}
                        >
                            {courses.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }} disabled={!enrollData.courseId}>
                        <InputLabel id="class-select-label">Chọn Lớp học</InputLabel>
                        <Select
                            labelId="class-select-label"
                            value={enrollData.classId}
                            label="Chọn Lớp học"
                            onChange={(e) => setEnrollData({ ...enrollData, classId: e.target.value })}
                        >
                            {classes
                                .filter(c => {
                                    const cCourseId = (typeof c.course === 'object' ? c.course?._id : c.course) || '';
                                    const selectedId = enrollData.courseId || '';
                                    return cCourseId.toString() === selectedId.toString();
                                })
                                .map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)
                            }
                            {(() => {
                                const filtered = classes.filter(c => {
                                    const cCourseId = (typeof c.course === 'object' ? c.course?._id : c.course) || '';
                                    return cCourseId.toString() === (enrollData.courseId || '').toString();
                                });
                                if (filtered.length === 0) {
                                    return <MenuItem disabled>Không tìm thấy lớp học nào cho khóa này</MenuItem>;
                                }
                                return null;
                            })()}

                        </Select>
                    </FormControl>

                    {overlapError && (
                        <Alert severity="error" icon={<Warning />} sx={{ mt: 2 }}>
                            {overlapError}
                        </Alert>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleEnrollClose}>Đóng</Button>
                    <Button 
                        onClick={handleEnrollSubmit} 
                        variant="contained" 
                        color="secondary"
                        disabled={!enrollData.classId || !!overlapError}
                    >
                        Xác nhận ghi danh
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default StudentManagement;
