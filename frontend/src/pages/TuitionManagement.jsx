import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField,
    Button, CircularProgress, Stack, Avatar, Divider, Chip
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';

import { Payments, ReceiptLong, Calculate, Paid } from '@mui/icons-material';
import classService from '../services/classService';
import enrollmentService from '../services/enrollmentService';
import tuitionService from '../services/tuitionService';
import { toast } from 'sonner';
import dayjs from 'dayjs';

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

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary.dark" sx={{ mb: 1 }}>
                    Thống kê Học phí
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Học phí được tính tự động dựa trên số buổi học sinh có mặt thực tế
                </Typography>
            </Box>

            <Paper sx={{ p: 3, mb: 4 }}>
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
                        <Button 
                            variant="contained" 
                            fullWidth 
                            size="large" 
                            startIcon={<Calculate />} 
                            onClick={handleCalculate}
                            disabled={calculating}
                        >
                            {calculating ? 'Đang tính toán...' : 'Tính học phí'}
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {tuitionList.length > 0 && (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead sx={{ bgcolor: 'rgba(212, 175, 55, 0.05)' }}>
                            <TableRow>
                                <TableCell>Học sinh</TableCell>
                                <TableCell align="center">Số buổi học</TableCell>
                                <TableCell align="right">Đơn giá/Buổi</TableCell>
                                <TableCell align="right">Tổng học phí</TableCell>
                                <TableCell align="right">Đã đóng</TableCell>
                                <TableCell align="right">Còn nợ</TableCell>
                                <TableCell align="right">Thao tác</TableCell>
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
                                        >
                                            Đóng tiền
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}
