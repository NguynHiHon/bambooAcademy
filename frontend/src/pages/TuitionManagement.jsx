import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField,
    Button, CircularProgress, Stack, Avatar, Divider, Chip, IconButton
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { Payments, ReceiptLong, Calculate, Paid } from '@mui/icons-material';
import classService from '../services/classService';
import enrollmentService from '../services/enrollmentService';
import tuitionService from '../services/tuitionService';
import { toast } from 'sonner';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';

export default function TuitionManagement() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [month, setMonth] = useState(dayjs().month() + 1);
    const [year, setYear] = useState(dayjs().year());
    
    const [tuitionList, setTuitionList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [calculating, setCalculating] = useState(false);

    useEffect(() => {
        const fetchClasses = async () => {
            try {
                const data = await classService.getAllClasses();
                setClasses(data);
                if (data.length > 0) setSelectedClass(data[0]._id);
            } catch (error) {
                toast.error('Lỗi khi tải danh sách lớp');
            } finally {
                setLoading(false);
            }
        };
        fetchClasses();
    }, []);

    const handleCalculate = async () => {
        if (!selectedClass) return;
        setCalculating(true);
        try {
            // Get all students in class
            const enrollments = await enrollmentService.getEnrollmentsByClass(selectedClass);
            
            // Calculate for each student
            const results = await Promise.all(enrollments.map(async (e) => {
                const report = await tuitionService.calculateTuition({
                    studentId: e.student._id,
                    classId: selectedClass,
                    month,
                    year
                });
                return { ...report, studentName: e.student.fullName };
            }));
            
            setTuitionList(results);
        } catch (error) {
            toast.error('Lỗi khi tính học phí');
        } finally {
            setCalculating(false);
        }
    };

    const handleRecordPayment = async (report) => {
        const amount = prompt(`Nhập số tiền học sinh ${report.studentName} đóng (Dư nợ: ${report.balance.toLocaleString()}đ):`, report.balance);
        if (amount === null) return;
        
        try {
            await tuitionService.recordPayment({
                student: report.studentId,
                amount: parseFloat(amount),
                month,
                year,
                notes: `Đóng học phí tháng ${month}/${year}`
            });
            toast.success('Ghi nhận thanh toán thành công');
            handleCalculate(); // Refresh
        } catch (error) {
            toast.error('Lỗi khi ghi nhận thanh toán');
        }
    };

    const handleExportExcel = () => {
        if (tuitionList.length === 0) {
            toast.warning('Không có dữ liệu để xuất! Vui lòng tính học phí trước.');
            return;
        }

        const className = classes.find(c => c._id === selectedClass)?.name || '';
        const data = tuitionList.map(item => ({
            'Họ và tên': item.studentName,
            'Số buổi học': item.attendanceCount,
            'Đơn giá/Buổi': item.feePerLesson,
            'Tổng học phí': item.totalFee,
            'Đã đóng': item.totalPaid,
            'Còn nợ': item.balance
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "HocPhi");

        // Format column widths
        const wscols = [
            {wch: 25}, // Họ tên
            {wch: 15}, // Số buổi
            {wch: 15}, // Đơn giá
            {wch: 15}, // Tổng
            {wch: 15}, // Đã đóng
            {wch: 15}, // Còn nợ
        ];
        ws['!cols'] = wscols;

        XLSX.writeFile(wb, `Hoc_Phi_Lop_${className.replace(/\s+/g, '_')}_Thang_${month}_${year}.xlsx`);
        toast.success('Đã xuất file Excel học phí');
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                    <Typography variant="h4" color="primary.dark" sx={{ mb: 1, fontWeight: 700, fontSize: { xs: '1.5rem', md: '2.125rem' } }}>
                        Thống kê Học phí
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Học phí được tính tự động dựa trên số buổi học sinh có mặt thực tế.
                    </Typography>
                </Box>
                <Button
                    variant="outlined"
                    startIcon={<ReceiptLong />}
                    onClick={handleExportExcel}
                    sx={{ display: { xs: 'none', sm: 'flex' }, borderRadius: 2 }}
                >
                    Xuất Excel
                </Button>
            </Box>

            <Paper sx={{ p: 3, mb: 4, borderRadius: 3, border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <FormControl fullWidth>
                            <InputLabel>Lớp học</InputLabel>
                            <Select value={selectedClass} label="Lớp học" onChange={(e) => setSelectedClass(e.target.value)}>
                                {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <FormControl fullWidth>
                            <InputLabel>Tháng</InputLabel>
                            <Select value={month} label="Tháng" onChange={(e) => setMonth(e.target.value)}>
                                {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => <MenuItem key={m} value={m}>T{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <TextField fullWidth label="Năm" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Stack direction="row" spacing={1}>
                            <Button 
                                variant="contained" 
                                sx={{ flexGrow: 1, py: 1.2, fontWeight: 700, borderRadius: 2 }}
                                startIcon={<Calculate />} 
                                onClick={handleCalculate}
                                disabled={calculating}
                            >
                                {calculating ? 'Đang tính...' : 'Tính học phí'}
                            </Button>
                            <IconButton 
                                color="primary" 
                                onClick={handleExportExcel}
                                sx={{ display: { xs: 'flex', sm: 'none' }, border: '1px solid' }}
                            >
                                <ReceiptLong />
                            </IconButton>
                        </Stack>
                    </Grid>
                </Grid>
            </Paper>

            {tuitionList.length > 0 && (
                <>
                    {/* Desktop Table */}
                    <TableContainer component={Paper} sx={{ display: { xs: 'none', md: 'block' }, borderRadius: 3, overflow: 'hidden' }}>
                        <Table>
                            <TableHead sx={{ bgcolor: 'rgba(212, 175, 55, 0.05)' }}>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 700 }}>Học sinh</TableCell>
                                    <TableCell align="center" sx={{ fontWeight: 700 }}>Số buổi học</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Đơn giá/Buổi</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Tổng học phí</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Đã đóng</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Còn nợ</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 700 }}>Thao tác</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tuitionList.map((item, index) => (
                                    <TableRow key={index} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1.5} alignItems="center">
                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'secondary.main' }}>{item.studentName[0]}</Avatar>
                                                <Typography variant="body2" fontWeight={600}>{item.studentName}</Typography>
                                            </Stack>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip label={`${item.attendanceCount} buổi`} size="small" variant="outlined" color="primary" />
                                        </TableCell>
                                        <TableCell align="right">{item.feePerLesson.toLocaleString()}đ</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{item.totalFee.toLocaleString()}đ</TableCell>
                                        <TableCell align="right" sx={{ color: 'success.main' }}>{item.totalPaid.toLocaleString()}đ</TableCell>
                                        <TableCell align="right" sx={{ color: item.balance > 0 ? 'error.main' : 'inherit', fontWeight: 700 }}>
                                            {item.balance.toLocaleString()}đ
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="secondary" 
                                                startIcon={<Paid />}
                                                onClick={() => handleRecordPayment(item)}
                                                disabled={item.balance <= 0}
                                                sx={{ borderRadius: 2 }}
                                            >
                                                Đóng tiền
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Mobile Card List */}
                    <Box sx={{ display: { xs: 'flex', md: 'none' }, flexDirection: 'column', gap: 2 }}>
                        {tuitionList.map((item, index) => (
                            <Card key={index} sx={{ borderRadius: 3, border: '1px solid #eee', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                                <Box sx={{ p: 2 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Avatar sx={{ bgcolor: 'secondary.main' }}>{item.studentName[0]}</Avatar>
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography fontWeight={700}>{item.studentName}</Typography>
                                            <Typography variant="caption" color="text.secondary">Học phí tháng {month}/{year}</Typography>
                                        </Box>
                                        <Chip label={`${item.attendanceCount} buổi`} size="small" color="primary" />
                                    </Stack>
                                    
                                    <Divider sx={{ my: 1.5, borderStyle: 'dotted' }} />
                                    
                                    <Grid container spacing={1} sx={{ mb: 2 }}>
                                        <Grid item xs={6}>
                                            <Typography variant="caption" color="text.secondary">Tổng cộng:</Typography>
                                            <Typography variant="body2" fontWeight={700}>{item.totalFee.toLocaleString()}đ</Typography>
                                        </Grid>
                                        <Grid item xs={6} textAlign="right">
                                            <Typography variant="caption" color="text.secondary">Đã đóng:</Typography>
                                            <Typography variant="body2" color="success.main" fontWeight={700}>{item.totalPaid.toLocaleString()}đ</Typography>
                                        </Grid>
                                        <Grid item xs={12} sx={{ mt: 1 }}>
                                            <Box sx={{ p: 1, bgcolor: item.balance > 0 ? 'rgba(211, 47, 47, 0.05)' : 'rgba(46, 125, 50, 0.05)', borderRadius: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="body2" fontWeight={600}>Còn nợ:</Typography>
                                                <Typography variant="h6" color={item.balance > 0 ? 'error.main' : 'success.main'} fontWeight={800} sx={{ fontSize: '1.1rem' }}>
                                                    {item.balance.toLocaleString()}đ
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    <Button 
                                        fullWidth 
                                        variant="contained" 
                                        color="secondary" 
                                        startIcon={<Paid />} 
                                        onClick={() => handleRecordPayment(item)}
                                        disabled={item.balance <= 0}
                                        sx={{ borderRadius: 2, py: 1 }}
                                    >
                                        Ghi nhận đóng tiền
                                    </Button>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                </>
            )}
        </Container>
    );
}
