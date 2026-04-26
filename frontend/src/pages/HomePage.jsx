import React, { useState, useEffect, useMemo } from 'react';
import {
    Box, Typography, Container, Paper, IconButton, Stack,
    Chip, Dialog, DialogTitle, DialogContent, DialogActions,
    Button, TextField, Tooltip, Alert, FormControl, InputLabel, Select, MenuItem, Divider,
    useMediaQuery
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import {
    ChevronLeft, ChevronRight, Today, Cancel,
    Restore, CalendarMonth, AccessTime, Add, People, Class, AutoStories
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import scheduleOverrideService from '../services/scheduleOverrideService';
import studentService from '../services/studentService';
import classService from '../services/classService';
import courseService from '../services/courseService';

const DAYS_LABEL = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0]; // Thứ 2 → CN

const PERIODS = [
    { value: 'Morning', label: 'SÁNG' },
    { value: 'Afternoon', label: 'CHIỀU' },
    { value: 'LateAfternoon', label: 'CHIỀU TỐI' },
    { value: 'Evening', label: 'TỐI' }
];

const getMonday = (d) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
};

const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

const formatWeekRange = (monday) => {
    const sunday = new Date(monday);
    sunday.setDate(sunday.getDate() + 6);
    return `${formatDate(monday)} - ${formatDate(sunday)}`;
};

// --- BẢNG MÀU THANH LỊCH (ROSE GOLD PROFESSIONAL) ---
const COLORS = {
    primary: '#B76E79', // Rose Gold
    primaryLight: '#EAC8D1', // Soft Pink
    bgMain: '#FCF9F9', // Pearl White
    bgCard: '#FFFFFF',
    border: '#EEDCE1',
    textDark: '#4A3B42',
    textMuted: '#8B7E84',
    
    // Status Colors (Soft Professional)
    statusDefault: { border: '#84A98C', bg: '#F6FAF7', text: '#4D6A54' }, // Sage Green
    statusMakeup: { border: '#A09ABC', bg: '#F7F6FB', text: '#554D73' },  // Soft Lavender
    statusCancelled: { border: '#E07A5F', bg: '#FCF5F3', text: '#8A4A38' }, // Soft Coral
    statusRescheduled: { border: '#DEB887', bg: '#FDFBF7', text: '#8B6A45' } // Warm Sand
};

export default function HomePage() {
    const { isAuthenticated, currentUser } = useSelector((state) => state.auth);
    const [weekStart, setWeekStart] = useState(getMonday(new Date()));
    const [schedule, setSchedule] = useState([]);
    const [stats, setStats] = useState({ students: 0, classes: 0, courses: 0 });
    const [loading, setLoading] = useState(false);

    const [actionDialog, setActionDialog] = useState({ open: false, slot: null, mode: null });
    const [rescheduleTarget, setRescheduleTarget] = useState({ dayOfWeek: '', period: '', time: '', targetWeek: 'same' });
    const [cancelledSlots, setCancelledSlots] = useState([]);
    const [makeupDialog, setMakeupDialog] = useState({ open: false, dayOfWeek: null, period: null });
    const [selectedMakeupSlot, setSelectedMakeupSlot] = useState('');
    const [makeupTime, setMakeupTime] = useState('');
    const [note, setNote] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchSchedule();
            fetchDashboardData();
        }
    }, [weekStart, isAuthenticated]);

    const fetchDashboardData = async () => {
        try {
            const [students, classes, courses] = await Promise.all([
                studentService.getAllStudents().catch(() => []),
                classService.getAllClasses().catch(() => []),
                courseService.getAllCourses().catch(() => [])
            ]);
            setStats({
                students: students?.length || 0,
                classes: classes?.length || 0,
                courses: courses?.length || 0
            });
        } catch (error) {
            console.error('Lỗi tải thống kê:', error);
        }
    };

    const fetchSchedule = async () => {
        setLoading(true);
        try {
            const data = await scheduleOverrideService.getWeekSchedule(weekStart.toISOString());
            setSchedule(data);
        } catch (error) {
            console.error('Lỗi tải lịch:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDayDate = (dayOfWeek) => {
        const date = new Date(weekStart);
        let diff = dayOfWeek - 1;
        if (dayOfWeek === 0) diff = 6;
        date.setDate(date.getDate() + diff);
        return formatDate(date);
    };

    const gridData = useMemo(() => {
        const grid = {};
        PERIODS.forEach(p => {
            grid[p.value] = {};
            DAYS_ORDER.forEach(d => {
                grid[p.value][d] = [];
            });
        });

        schedule.forEach(item => {
            if (grid[item.period] && grid[item.period][item.dayOfWeek] !== undefined) {
                grid[item.period][item.dayOfWeek].push(item);
            }
        });

        return grid;
    }, [schedule]);

    useEffect(() => {
        const cancelled = schedule.filter(s => s.type === 'cancelled');
        setCancelledSlots(cancelled);
    }, [schedule]);

    const changeWeek = (dir) => {
        const newDate = new Date(weekStart);
        newDate.setDate(newDate.getDate() + (dir * 7));
        setWeekStart(newDate);
    };

    const handleSlotClick = (slot) => {
        if (slot.type === 'cancelled' || slot.type === 'rescheduled_from') {
            setActionDialog({ open: true, slot, mode: 'restore' });
        } else if (slot.type === 'default' || slot.type === 'rescheduled_to') {
            setActionDialog({ open: true, slot, mode: 'action' });
        }
    };

    const handleEmptyCellClick = (dayOfWeek, period) => {
        if (cancelledSlots.length === 0) return;
        setMakeupDialog({ open: true, dayOfWeek, period });
        setSelectedMakeupSlot('');
        setMakeupTime('');
    };

    const handleCancel = async () => {
        try {
            await scheduleOverrideService.cancelSlot({
                originalSlot: actionDialog.slot.slotId,
                weekStart: weekStart.toISOString(),
                note
            });
            fetchSchedule();
            closeActionDialog();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const getTargetWeekStart = (option) => {
        if (option === 'same') return null;
        const offset = option === 'next' ? 7 : 14;
        const target = new Date(weekStart);
        target.setDate(target.getDate() + offset);
        return target.toISOString();
    };

    const handleReschedule = async () => {
        if (!rescheduleTarget.time) return alert('Vui lòng nhập giờ dạy bù');
        try {
            const newWeekStart = getTargetWeekStart(rescheduleTarget.targetWeek);
            await scheduleOverrideService.rescheduleSlot({
                originalSlot: actionDialog.slot.slotId,
                weekStart: weekStart.toISOString(),
                newWeekStart,
                newDayOfWeek: rescheduleTarget.dayOfWeek,
                newPeriod: rescheduleTarget.period,
                newTime: rescheduleTarget.time,
                note
            });
            fetchSchedule();
            closeActionDialog();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleRestore = async () => {
        try {
            await scheduleOverrideService.removeOverride(actionDialog.slot.overrideId);
            fetchSchedule();
            closeActionDialog();
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const handleQuickMakeup = async () => {
        if (!selectedMakeupSlot || !makeupTime) return;
        try {
            await scheduleOverrideService.rescheduleSlot({
                originalSlot: selectedMakeupSlot,
                weekStart: weekStart.toISOString(),
                newDayOfWeek: makeupDialog.dayOfWeek,
                newPeriod: makeupDialog.period,
                newTime: makeupTime,
                note: 'Dạy bù'
            });
            fetchSchedule();
            setMakeupDialog({ open: false, dayOfWeek: null, period: null });
        } catch (error) {
            alert('Lỗi: ' + error.message);
        }
    };

    const closeActionDialog = () => {
        setActionDialog({ open: false, slot: null, mode: null });
        setRescheduleTarget({ dayOfWeek: '', period: '', time: '', targetWeek: 'same' });
        setNote('');
    };

    const isToday = (dayOfWeek) => {
        const today = new Date();
        const mondayOfThisWeek = getMonday(today);
        return weekStart.getTime() === mondayOfThisWeek.getTime() && today.getDay() === dayOfWeek;
    };

    const isMobile = useMediaQuery('(max-width:900px)');

    if (!isAuthenticated) {
        return (
            <Box sx={{ background: `linear-gradient(135deg, ${COLORS.bgMain} 0%, #FFFFFF 100%)`, pt: { xs: 4, md: 8 }, pb: { xs: 6, md: 12 }, minHeight: '80vh' }}>
                <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
                    <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '4.5rem' }, color: COLORS.textDark, mb: 2, fontFamily: 'Playfair Display', fontWeight: 700 }}>
                        BamBoo<span style={{ color: COLORS.primary }}>-Academy</span>
                    </Typography>
                    <Typography variant="h5" sx={{ color: COLORS.textMuted, mb: 5, fontWeight: 500, fontSize: { xs: '1rem', md: '1.5rem' }, px: 2 }}>
                        Hệ thống quản lý lớp học chuyên nghiệp và tinh tế
                    </Typography>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ px: 4 }}>
                        <Button component={Link} to="/signin" variant="contained" size="large" sx={{ px: 5, py: 1.5, borderRadius: 1, bgcolor: COLORS.primary, '&:hover': { bgcolor: '#9A5B64' }, fontSize: '1.1rem', disableElevation: true }}>
                            Đăng nhập
                        </Button>
                        <Button component={Link} to="/signup" variant="outlined" size="large" sx={{ px: 5, py: 1.5, borderRadius: 1, color: COLORS.primary, borderColor: COLORS.primary, '&:hover': { borderColor: '#9A5B64', bgcolor: COLORS.bgMain }, fontSize: '1.1rem' }}>
                            Đăng ký
                        </Button>
                    </Stack>
                </Container>
            </Box>
        );
    }

    return (
        <Container maxWidth="xl" sx={{ py: { xs: 2, md: 5 } }}>
            {/* TỔNG QUAN (DASHBOARD) */}
            <Box sx={{ mb: { xs: 3, md: 5 } }}>
                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 1, fontFamily: 'Playfair Display', fontSize: { xs: '1.4rem', md: '2.125rem' } }}>
                    Xin chào {currentUser?.fullName || 'Thanh Trúc'}! 💖
                </Typography>
                <Typography variant="body1" sx={{ color: COLORS.textMuted, mb: 3, fontWeight: 500, fontSize: { xs: '0.9rem', md: '1.05rem' } }}>
                    Hôm nay cô có mệt không? Cùng xem qua lớp học nhé! 🌸
                </Typography>

                <Grid container spacing={{ xs: 2, md: 3 }}>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <Box sx={{ p: 1.5, bgcolor: '#FAF0F3', borderRadius: 2 }}>
                                <People sx={{ color: COLORS.primary, fontSize: { xs: 24, md: 32 } }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.students}</Typography>
                                <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Học sinh</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <Box sx={{ p: 1.5, bgcolor: '#FDF3F4', borderRadius: 2 }}>
                                <Class sx={{ color: '#C88E91', fontSize: { xs: 24, md: 32 } }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.classes}</Typography>
                                <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Lớp học</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                        <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, display: 'flex', alignItems: 'center', gap: 2, border: `1px solid ${COLORS.border}`, boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                            <Box sx={{ p: 1.5, bgcolor: '#F4EDF0', borderRadius: 2 }}>
                                <AutoStories sx={{ color: '#A67C8E', fontSize: { xs: 24, md: 32 } }} />
                            </Box>
                            <Box>
                                <Typography variant="h4" sx={{ fontWeight: 700, color: COLORS.textDark, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>{stats.courses}</Typography>
                                <Typography variant="caption" sx={{ color: COLORS.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Khóa học</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>
            </Box>

            {/* HEADER THỜI KHÓA BIỂU */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'flex-end' }, mb: 3, flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: COLORS.textDark, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }}>
                        <CalendarMonth sx={{ color: COLORS.primary }} /> Thời khóa biểu
                    </Typography>
                    <Typography variant="caption" sx={{ color: COLORS.textMuted, display: { xs: 'none', sm: 'block' } }}>
                        Click vào lịch để dời/hủy. Ô trống click để dạy bù.
                    </Typography>
                </Box>

                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ bgcolor: COLORS.bgCard, p: 0.5, borderRadius: 2, border: `1px solid ${COLORS.border}`, width: { xs: '100%', md: 'auto' }, justifyContent: 'space-between' }}>
                    <IconButton onClick={() => changeWeek(-1)} size="small" sx={{ color: COLORS.primary }}><ChevronLeft /></IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 700, px: 1, textAlign: 'center', color: COLORS.textDark }}>
                        {formatWeekRange(weekStart)}
                    </Typography>
                    <IconButton onClick={() => changeWeek(1)} size="small" sx={{ color: COLORS.primary }}><ChevronRight /></IconButton>
                    <IconButton onClick={() => setWeekStart(getMonday(new Date()))} size="small" sx={{ color: COLORS.primary }}>
                        <Today fontSize="small" />
                    </IconButton>
                </Stack>
            </Box>

            {/* BẢNG LỊCH CHUYÊN NGHIỆP */}
            {!isMobile ? (
                <Paper sx={{ border: `1px solid ${COLORS.border}`, borderRadius: 2, overflow: 'hidden', boxShadow: 'none' }}>
                    <Box sx={{ overflowX: 'auto' }}>
                        <Box sx={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', minWidth: 1000 }}>
                            {/* Header Row */}
                            <Box sx={{ p: 2, bgcolor: COLORS.bgMain, borderBottom: `2px solid ${COLORS.border}`, borderRight: `1px solid ${COLORS.border}` }} />
                            {DAYS_ORDER.map(d => (
                                <Box key={d} sx={{
                                    p: 1.5,
                                    bgcolor: isToday(d) ? COLORS.primaryLight : COLORS.bgMain,
                                    borderBottom: '2px solid',
                                    borderBottomColor: isToday(d) ? COLORS.primary : COLORS.border,
                                    borderRight: d !== 0 ? `1px solid ${COLORS.border}` : 'none',
                                    textAlign: 'center'
                                }}>
                                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: COLORS.textDark }}>
                                        {DAYS_LABEL[d]}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: isToday(d) ? COLORS.textDark : COLORS.textMuted }}>
                                        {getDayDate(d)}
                                    </Typography>
                                </Box>
                            ))}

                            {/* Period Rows */}
                            {PERIODS.map((period, pIndex) => (
                                <React.Fragment key={period.value}>
                                    <Box sx={{
                                        p: 1.5,
                                        bgcolor: '#FAF5F6',
                                        borderRight: `1px solid ${COLORS.border}`,
                                        borderBottom: pIndex < PERIODS.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Typography variant="caption" sx={{ fontWeight: 700, color: '#9A808C', letterSpacing: 1, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
                                            {period.label}
                                        </Typography>
                                    </Box>

                                    {DAYS_ORDER.map((d, dIndex) => {
                                        const cellItems = gridData[period.value]?.[d] || [];
                                        const isEmpty = cellItems.length === 0;
                                        const hasCancelled = cancelledSlots.length > 0;

                                        return (
                                            <Box
                                                key={`${period.value}-${d}`}
                                                onClick={() => isEmpty && hasCancelled && handleEmptyCellClick(d, period.value)}
                                                sx={{
                                                    p: 1, minHeight: 130, bgcolor: isToday(d) ? '#FFFDFD' : COLORS.bgCard,
                                                    borderRight: dIndex < 6 ? `1px solid ${COLORS.border}` : 'none',
                                                    borderBottom: pIndex < PERIODS.length - 1 ? `1px solid ${COLORS.border}` : 'none',
                                                    cursor: (isEmpty && hasCancelled) ? 'pointer' : 'default',
                                                    '&:hover': { bgcolor: (isEmpty && hasCancelled) ? '#FDF9FA' : '#FAFAFA' }
                                                }}
                                            >
                                                <Stack spacing={1}>
                                                    {cellItems.map((item, idx) => {
                                                        let theme = COLORS.statusDefault;
                                                        let isStrike = false;
                                                        if (item.type === 'rescheduled_to') theme = COLORS.statusMakeup;
                                                        else if (item.type === 'cancelled') { theme = COLORS.statusCancelled; isStrike = true; }
                                                        else if (item.type === 'rescheduled_from') { theme = COLORS.statusRescheduled; isStrike = true; }

                                                        return (
                                                            <Box
                                                                key={idx}
                                                                onClick={(e) => { e.stopPropagation(); handleSlotClick(item); }}
                                                                sx={{
                                                                    p: 1, bgcolor: theme.bg, borderLeft: `4px solid ${theme.border}`, borderRadius: 1, cursor: 'pointer',
                                                                    '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 4px 8px rgba(0,0,0,0.05)' }
                                                                }}
                                                            >
                                                                <Typography variant="subtitle2" sx={{ color: theme.text, fontWeight: 700, mb: 0.2, textDecoration: isStrike ? 'line-through' : 'none', fontSize: '0.8rem' }}>
                                                                    {item.className}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: theme.text, display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                                                                    <AccessTime sx={{ fontSize: 10 }} /> {item.time}
                                                                </Typography>
                                                            </Box>
                                                        );
                                                    })}
                                                </Stack>
                                            </Box>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </Box>
                    </Box>
                </Paper>
            ) : (
                /* MOBILE VIEW: Danh sách theo ngày */
                <Stack spacing={2}>
                    {DAYS_ORDER.map(d => {
                        const daySlots = [];
                        PERIODS.forEach(p => {
                            if (gridData[p.value][d]) daySlots.push(...gridData[p.value][d]);
                        });

                        return (
                            <Paper key={d} sx={{ p: 2, borderRadius: 3, border: `1px solid ${isToday(d) ? COLORS.primary : COLORS.border}`, bgcolor: isToday(d) ? '#FFFDFD' : '#fff' }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, color: isToday(d) ? COLORS.primary : COLORS.textDark, display: 'flex', justifyContent: 'space-between' }}>
                                    {DAYS_LABEL[d]} - {getDayDate(d)}
                                    {isToday(d) && <Chip label="Hôm nay" size="small" sx={{ height: 20, bgcolor: COLORS.primary, color: '#fff', fontWeight: 700, fontSize: '0.6rem' }} />}
                                </Typography>
                                
                                <Stack spacing={1.5}>
                                    {daySlots.length === 0 ? (
                                        <Typography variant="caption" color="text.disabled">Không có lớp học</Typography>
                                    ) : (
                                        daySlots.map((item, idx) => {
                                            let theme = COLORS.statusDefault;
                                            let isStrike = false;
                                            if (item.type === 'rescheduled_to') theme = COLORS.statusMakeup;
                                            else if (item.type === 'cancelled') { theme = COLORS.statusCancelled; isStrike = true; }
                                            else if (item.type === 'rescheduled_from') { theme = COLORS.statusRescheduled; isStrike = true; }

                                            return (
                                                <Box
                                                    key={idx}
                                                    onClick={() => handleSlotClick(item)}
                                                    sx={{
                                                        p: 1.5, bgcolor: theme.bg, borderLeft: `5px solid ${theme.border}`, borderRadius: 2,
                                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                                    }}
                                                >
                                                    <Box>
                                                        <Typography variant="body2" sx={{ fontWeight: 700, textDecoration: isStrike ? 'line-through' : 'none' }}>
                                                            {item.className}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {PERIODS.find(p => p.value === item.period)?.label}: {item.time}
                                                        </Typography>
                                                    </Box>
                                                    <ChevronRight sx={{ color: theme.border, opacity: 0.5 }} />
                                                </Box>
                                            )
                                        })
                                    )}
                                </Stack>
                            </Paper>
                        );
                    })}
                </Stack>
            )}

            {/* === DIALOGS === */}
            <Dialog open={actionDialog.open} onClose={closeActionDialog} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Playfair Display', color: COLORS.textDark, fontWeight: 700 }}>
                    {actionDialog.mode === 'restore' ? 'Khôi phục lịch' : 'Tùy chỉnh lịch dạy'}
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    {actionDialog.slot && (
                        <Box sx={{ mb: 2 }}>
                            <Alert severity="info" sx={{ mb: 3, borderRadius: 1, bgcolor: COLORS.bgMain, color: COLORS.textDark, '& .MuiAlert-icon': { color: COLORS.primary } }}>
                                <strong>{actionDialog.slot.className}</strong> — {DAYS_LABEL[actionDialog.slot.dayOfWeek]} ({actionDialog.slot.time})
                            </Alert>

                            {actionDialog.mode === 'restore' ? (
                                <Typography variant="body2" color="text.secondary">
                                    Trúc có chắc muốn khôi phục buổi học này về trạng thái mặc định ban đầu không?
                                </Typography>
                            ) : (
                                <Stack spacing={2.5}>
                                    <TextField
                                        label="Ghi chú / Lý do (Tùy chọn)"
                                        fullWidth
                                        size="small"
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                        placeholder="VD: Giáo viên nghỉ ốm..."
                                    />

                                    <Box>
                                        <Typography variant="subtitle2" sx={{ mb: 1.5, color: COLORS.textDark }}>Dời sang buổi khác (Dạy bù):</Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Bù vào tuần</InputLabel>
                                                    <Select value={rescheduleTarget.targetWeek} label="Bù vào tuần" onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, targetWeek: e.target.value })}>
                                                        <MenuItem value="same">Tuần này ({formatWeekRange(weekStart)})</MenuItem>
                                                        <MenuItem value="next">Tuần sau ({(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); return formatWeekRange(d); })()})</MenuItem>
                                                        <MenuItem value="next2">2 tuần sau ({(() => { const d = new Date(weekStart); d.setDate(d.getDate() + 14); return formatWeekRange(d); })()})</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Thứ</InputLabel>
                                                    <Select value={rescheduleTarget.dayOfWeek} label="Thứ" onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, dayOfWeek: e.target.value })}>
                                                        {DAYS_ORDER.map(d => <MenuItem key={d} value={d}>{DAYS_LABEL[d]}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={6}>
                                                <FormControl fullWidth size="small">
                                                    <InputLabel>Buổi</InputLabel>
                                                    <Select value={rescheduleTarget.period} label="Buổi" onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, period: e.target.value })}>
                                                        {PERIODS.map(p => <MenuItem key={p.value} value={p.value}>{p.label}</MenuItem>)}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <TextField label="Giờ dạy bù chính xác" fullWidth size="small" value={rescheduleTarget.time} onChange={(e) => setRescheduleTarget({ ...rescheduleTarget, time: e.target.value })} placeholder="VD: 14h30 - 16h30" />
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Stack>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, gap: 1, bgcolor: COLORS.bgMain, borderTop: `1px solid ${COLORS.border}` }}>
                    <Button onClick={closeActionDialog} sx={{ color: COLORS.textMuted }}>Đóng</Button>
                    {actionDialog.mode === 'restore' ? (
                        <Button onClick={handleRestore} variant="contained" sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#9A5B64' }, disableElevation: true }}>
                            Khôi phục
                        </Button>
                    ) : (
                        <>
                            <Button onClick={handleCancel} variant="outlined" sx={{ color: COLORS.statusCancelled.border, borderColor: COLORS.statusCancelled.border }}>
                                Hủy buổi
                            </Button>
                            <Button onClick={handleReschedule} variant="contained" sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#9A5B64' }, disableElevation: true }} disabled={!rescheduleTarget.dayOfWeek && rescheduleTarget.dayOfWeek !== 0}>
                                Xác nhận dời
                            </Button>
                        </>
                    )}
                </DialogActions>
            </Dialog>

            <Dialog open={makeupDialog.open} onClose={() => setMakeupDialog({ open: false, dayOfWeek: null, period: null })} maxWidth="xs" fullWidth>
                <DialogTitle sx={{ fontFamily: 'Playfair Display', color: COLORS.textDark, fontWeight: 700 }}>
                    Xếp lịch dạy bù
                </DialogTitle>
                <Divider />
                <DialogContent sx={{ pt: 2 }}>
                    <Alert severity="info" sx={{ mb: 3, borderRadius: 1, bgcolor: COLORS.bgMain, color: COLORS.textDark, '& .MuiAlert-icon': { color: COLORS.primary } }}>
                        Bù vào <strong>{DAYS_LABEL[makeupDialog.dayOfWeek]}</strong> — {PERIODS.find(p => p.value === makeupDialog.period)?.label}
                    </Alert>

                    <Stack spacing={2.5}>
                        <FormControl fullWidth size="small">
                            <InputLabel>Chọn lớp cần bù</InputLabel>
                            <Select value={selectedMakeupSlot} label="Chọn lớp cần bù" onChange={(e) => setSelectedMakeupSlot(e.target.value)}>
                                {cancelledSlots.map(s => (
                                    <MenuItem key={s.slotId} value={s.slotId}>
                                        {s.className} (Bỏ lỡ: {DAYS_LABEL[s.dayOfWeek]} - {s.time})
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField label="Giờ dạy bù cụ thể" fullWidth size="small" value={makeupTime} onChange={(e) => setMakeupTime(e.target.value)} placeholder="VD: 14h30 - 16h30" />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, px: 3, bgcolor: COLORS.bgMain, borderTop: `1px solid ${COLORS.border}` }}>
                    <Button onClick={() => setMakeupDialog({ open: false, dayOfWeek: null, period: null })} sx={{ color: COLORS.textMuted }}>Hủy</Button>
                    <Button onClick={handleQuickMakeup} variant="contained" sx={{ bgcolor: COLORS.primary, '&:hover': { bgcolor: '#9A5B64' }, disableElevation: true }} disabled={!selectedMakeupSlot || !makeupTime}>
                        Xác nhận bù
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}
