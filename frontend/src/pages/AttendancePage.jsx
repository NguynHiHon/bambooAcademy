import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Button, Stack,
    Card, CardContent, IconButton, Chip, Divider, Avatar,
    Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Select, FormControl, InputLabel,
    CircularProgress, Tooltip, useMediaQuery, useTheme
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { CheckCircle, Cancel, EventBusy, MoreTime, CalendarMonth, FilterAlt, Close, ReceiptLong } from '@mui/icons-material';
import lessonService from '../services/lessonService';
import classService from '../services/classService';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

export default function AttendancePage() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Bộ lọc tháng/năm
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [year, setYear] = useState(dayjs().year());

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [attendance, setAttendance] = useState([]);
    const [openAttendance, setOpenAttendance] = useState(false);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const data = await classService.getAllClasses({ status: 'active' });
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]._id);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách lớp');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    const fetchLessons = async () => {
        if (!selectedClass) return;
        setLoading(true);
        try {
            const data = await lessonService.getLessons({ 
                classId: selectedClass,
                month,
                year
            });
            setLessons(data);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách buổi học');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLessons();
    }, [selectedClass, month, year]);

    const handleOpenAttendance = async (lesson) => {
        let lessonId = lesson._id;
        
        // Nếu đây là một "Khung" (isPlan), ta phải biến nó thành thực tế trước
        if (lesson.isPlan) {
            try {
                // Gọi API để tạo Lesson thực tế từ Khung
                const realLesson = await lessonService.createLessonFromPlan({
                    classId: selectedClass,
                    timetableSlot: lesson.timetableSlot,
                    date: lesson.date,
                    period: lesson.period,
                    actualTime: lesson.actualTime
                });
                lessonId = realLesson._id;
                // Cập nhật lại danh sách để mất chữ "Kế hoạch"
                fetchLessons();
            } catch (error) {
                return toast.error('Lỗi khi tạo buổi học thực tế');
            }
        }

        setSelectedLesson({ ...lesson, _id: lessonId });
        try {
            const data = await lessonService.getAttendance(lessonId);
            setAttendance(data);
            setOpenAttendance(true);
        } catch (error) {
            toast.error('Lỗi khi tải danh sách điểm danh');
        }
    };

    const handleMarkAttendance = async (studentId, status) => {
        try {
            await lessonService.updateAttendance({
                lessonId: selectedLesson._id,
                studentId,
                status
            });
            setAttendance(attendance.map(a => 
                a.student._id === studentId ? { ...a, status } : a
            ));
        } catch (error) {
            toast.error('Lỗi khi điểm danh');
        }
    };

    const handleCompleteLesson = async (lessonId) => {
        try {
            await lessonService.updateLesson(lessonId, { status: 'completed' });
            toast.success('Đã xác nhận hoàn thành buổi học');
            fetchLessons();
        } catch (error) {
            toast.error('Lỗi khi cập nhật trạng thái');
        }
    };

    const handleCancelLesson = async (lessonId) => {
        if (window.confirm('Trúc muốn hủy buổi học này? Buổi này sẽ không được tính học phí.')) {
            try {
                await lessonService.updateLesson(lessonId, { status: 'cancelled' });
                toast.success('Đã hủy buổi học');
                fetchLessons();
            } catch (error) {
                toast.error('Lỗi khi hủy buổi');
            }
        }
    };

    const handleExportExcel = async () => {
        if (!selectedClass) return;
        setSyncing(true);
        try {
            const data = await lessonService.getMonthlyReport({
                classId: selectedClass,
                month,
                year
            });

            if (data.length === 0) {
                toast.warning('Không có dữ liệu điểm danh thực tế trong tháng này.');
                return;
            }

            const className = classes.find(c => c._id === selectedClass)?.name || '';
            const exportData = data.map(item => ({
                'Ngày học': dayjs(item.date).format('DD/MM/YYYY'),
                'Giờ học': item.actualTime,
                'Họ tên học sinh': item.studentName,
                'Trạng thái điểm danh': item.status === 'present' ? 'Có mặt' : item.status === 'absent' ? 'Vắng mặt' : 'Chưa điểm danh',
                'Trạng thái buổi học': item.lessonStatus === 'completed' ? 'Đã hoàn thành' : item.lessonStatus === 'cancelled' ? 'Đã hủy' : 'Sắp học'
            }));

            const ws = XLSX.utils.json_to_sheet(exportData);
            const wb = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(wb, ws, "DiemDanh");

            // Format column widths
            const wscols = [
                {wch: 15}, // Ngày
                {wch: 15}, // Giờ
                {wch: 25}, // Tên
                {wch: 20}, // Trạng thái điểm danh
                {wch: 20}, // Trạng thái buổi học
            ];
            ws['!cols'] = wscols;

            XLSX.writeFile(wb, `Diem_Danh_Lop_${className.replace(/\s+/g, '_')}_Thang_${month}_${year}.xlsx`);
            toast.success('Đã xuất file Excel điểm danh');
        } catch (error) {
            toast.error('Lỗi khi xuất file Excel');
        } finally {
            setSyncing(false);
        }
    };

    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    const years = [dayjs().year() - 1, dayjs().year(), dayjs().year() + 1];

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: { xs: 2, md: 4 } }}>
                <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                    Điểm danh & Buổi học
                </Typography>
                
                <Paper sx={{ p: { xs: 1.5, md: 2 }, mt: 2, borderRadius: 3, boxShadow: '0 2px 10px rgba(0,0,0,0.03)', border: '1px solid #eee' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center">
                        <FormControl fullWidth sx={{ maxWidth: { md: 250 } }} size="small">
                            <InputLabel>Chọn lớp học</InputLabel>
                            <Select
                                value={selectedClass}
                                label="Chọn lớp học"
                                onChange={(e) => setSelectedClass(e.target.value)}
                            >
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>

                        <Stack direction="row" spacing={1} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' }, justifyContent: 'center' }}>
                            <FilterAlt color="action" fontSize="small" />
                            <Select
                                value={month}
                                onChange={(e) => setMonth(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 100 }}
                            >
                                {months.map(m => <MenuItem key={m} value={m}>Tháng {m}</MenuItem>)}
                            </Select>
                            <Select
                                value={year}
                                onChange={(e) => setYear(e.target.value)}
                                size="small"
                                sx={{ flex: 1, minWidth: 100 }}
                            >
                                {years.map(y => <MenuItem key={y} value={y}>Năm {y}</MenuItem>)}
                            </Select>
                        </Stack>

                        <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />
                        
                        <Button 
                            variant="outlined" 
                            startIcon={<ReceiptLong />} 
                            size="small" 
                            onClick={handleExportExcel}
                            disabled={syncing}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            {syncing ? 'Đang xuất...' : 'Xuất Excel tháng'}
                        </Button>
                    </Stack>
                </Paper>
            </Box>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress color="secondary" /></Box>
            ) : (
                <Grid container spacing={{ xs: 2, md: 3 }}>
                    {lessons.length === 0 ? (
                        <Grid item xs={12}>
                            <Box sx={{ py: 10, textAlign: 'center', opacity: 0.5 }}>
                                <CalendarMonth sx={{ fontSize: 60, mb: 2 }} />
                                <Typography>Không có buổi học nào trong tháng {month}/{year}.</Typography>
                            </Box>
                        </Grid>
                    ) : (
                        lessons.map((lesson) => (
                            <Grid item xs={12} md={6} key={lesson._id}>
                                <Card sx={{ 
                                    borderRadius: 3,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                    border: '1px solid #eee',
                                    borderLeft: `6px solid ${
                                        lesson.status === 'completed' ? '#2E7D32' : 
                                        lesson.status === 'cancelled' ? '#d32f2f' : '#D4AF37'
                                    }` 
                                }}>
                                    <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700} sx={{ fontSize: { xs: '1rem', md: '1.25rem' } }}>
                                                    {dayjs(lesson.date).format('dddd, DD/MM')}
                                                    {lesson.isPlan && <Chip label="Plan" size="small" sx={{ ml: 1, height: 18, fontSize: '0.6rem' }} />}
                                                </Typography>
                                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                                    <Chip label={lesson.period} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                                                    <Typography variant="body2" color="text.secondary" fontWeight={500}>
                                                        {lesson.actualTime}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                            <Chip 
                                                label={lesson.status === 'scheduled' ? 'Sắp học' : lesson.status === 'completed' ? 'Xong' : 'Hủy'} 
                                                size="small"
                                                color={lesson.status === 'completed' ? 'success' : lesson.status === 'cancelled' ? 'error' : 'warning'}
                                                sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                                            />
                                        </Box>

                                        <Divider sx={{ mb: 2 }} />

                                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                                            {lesson.status === 'scheduled' && (
                                                <>
                                                    <Button size="small" variant="contained" startIcon={<CheckCircle />} onClick={() => handleOpenAttendance(lesson)} sx={{ borderRadius: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                                        Điểm danh
                                                    </Button>
                                                    <Button size="small" color="success" onClick={() => handleCompleteLesson(lesson._id)} sx={{ borderRadius: 2, fontSize: { xs: '0.75rem', md: '0.875rem' } }}>
                                                        Dạy xong
                                                    </Button>
                                                    <IconButton color="error" onClick={() => handleCancelLesson(lesson._id)} size="small">
                                                        <EventBusy fontSize="small" />
                                                    </IconButton>
                                                </>
                                            )}
                                            {lesson.status === 'completed' && (
                                                <Button size="small" variant="text" color="primary" onClick={() => handleOpenAttendance(lesson)} sx={{ fontWeight: 600 }}>
                                                    Xem Điểm Danh
                                                </Button>
                                            )}
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))
                    )}
                </Grid>
            )}

            {/* Attendance Dialog */}
            <Dialog 
                open={openAttendance} 
                onClose={() => setOpenAttendance(false)} 
                fullWidth 
                maxWidth="xs"
                fullScreen={useMediaQuery('(max-width:600px)')}
            >
                <DialogTitle sx={{ fontFamily: 'Playfair Display', fontWeight: 700 }}>
                    Điểm danh học sinh
                    <Typography variant="caption" display="block" color="text.secondary">
                        {dayjs(selectedLesson?.date).format('DD/MM/YYYY')} | {selectedLesson?.actualTime}
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        {attendance.length === 0 && (
                            <Typography sx={{ textAlign: 'center', py: 2, color: 'text.secondary' }}>
                                Lớp hiện chưa có học sinh nào.
                            </Typography>
                        )}
                        {attendance.map((a) => (
                            <Box key={a._id} sx={{ 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center', 
                                p: 1.5, 
                                bgcolor: a.status === 'present' ? '#f0f9f0' : a.status === 'absent' ? '#fff5f5' : '#f9f9f9', 
                                borderRadius: 3,
                                border: '1px solid #eee'
                            }}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.light', color: 'primary.main', fontSize: '0.9rem', fontWeight: 700 }}>
                                        {a.student.fullName[0]}
                                    </Avatar>
                                    <Typography variant="body2" fontWeight={700}>{a.student.fullName}</Typography>
                                </Stack>
                                <Stack direction="row" spacing={0.5}>
                                    <Tooltip title="Có mặt">
                                        <IconButton 
                                            size="small" 
                                            color={a.status === 'present' ? 'success' : 'default'}
                                            onClick={() => handleMarkAttendance(a.student._id, 'present')}
                                        >
                                            <CheckCircle fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Vắng mặt">
                                        <IconButton 
                                            size="small" 
                                            color={a.status === 'absent' ? 'error' : 'default'}
                                            onClick={() => handleMarkAttendance(a.student._id, 'absent')}
                                        >
                                            <Cancel fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Stack>
                            </Box>
                        ))}
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setOpenAttendance(false)} color="inherit">Đóng</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
