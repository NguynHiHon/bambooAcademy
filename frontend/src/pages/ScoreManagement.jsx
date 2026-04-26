import React, { useEffect, useState } from 'react';
import {
    Box, Container, Typography, Paper, Card, CardContent,
    FormControl, InputLabel, Select, MenuItem, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, TextField,
    Button, CircularProgress, Avatar, Stack, Tab, Tabs, Divider
} from '@mui/material';
import Grid from '@mui/material/GridLegacy';
import { Grade, History, TrendingUp, Save } from '@mui/icons-material';
import classService from '../services/classService';
import enrollmentService from '../services/enrollmentService';
import scoreService from '../services/scoreService';
import { toast } from 'sonner';

export default function ScoreManagement() {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0);

    // Form state for entry
    const [scoreData, setScoreData] = useState({}); // { studentId: { score: '', comment: '' } }
    const [scoreType, setScoreType] = useState('daily');
    const [saving, setSaving] = useState(false);

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

    useEffect(() => {
        if (selectedClass) {
            const fetchStudents = async () => {
                try {
                    const data = await enrollmentService.getEnrollmentsByClass(selectedClass);
                    setEnrollments(data);
                    // Reset score data
                    const initialScores = {};
                    data.forEach(e => {
                        initialScores[e.student._id] = { score: '', comment: '' };
                    });
                    setScoreData(initialScores);
                } catch (error) {
                    toast.error('Lỗi khi tải danh sách học sinh');
                }
            };
            fetchStudents();
        }
    }, [selectedClass]);

    const handleScoreChange = (studentId, field, value) => {
        setScoreData(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], [field]: value }
        }));
    };

    const handleSaveScores = async () => {
        const studentsToSave = Object.keys(scoreData).filter(id => scoreData[id].score !== '');
        if (studentsToSave.length === 0) {
            toast.warning('Vui lòng nhập điểm ít nhất cho một học sinh');
            return;
        }

        setSaving(true);
        try {
            const promises = studentsToSave.map(studentId =>
                scoreService.addScore({
                    student: studentId,
                    class: selectedClass,
                    score: parseFloat(scoreData[studentId].score),
                    comment: scoreData[studentId].comment,
                    type: scoreType,
                    date: new Date()
                })
            );
            await Promise.all(promises);
            toast.success('Đã lưu điểm thành công');
            // Clear inputs
            const cleared = { ...scoreData };
            studentsToSave.forEach(id => cleared[id] = { score: '', comment: '' });
            setScoreData(cleared);
        } catch (error) {
            toast.error('Lỗi khi lưu điểm');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;

    return (
        <Container maxWidth="lg">
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" color="primary.dark" sx={{ mb: 1 }}>
                    Quản lý Điểm số & Tiến độ
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Ghi lại điểm số hàng ngày để theo dõi sự tiến bộ của học sinh
                </Typography>
            </Box>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Card sx={{ p: 1 }}>
                        <CardContent>
                            <Stack spacing={3}>
                                <FormControl fullWidth>
                                    <InputLabel>Chọn lớp học</InputLabel>
                                    <Select
                                        value={selectedClass}
                                        label="Chọn lớp học"
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                    >
                                        {classes.map(c => <MenuItem key={c._id} value={c._id}>{c.name}</MenuItem>)}
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Loại điểm</InputLabel>
                                    <Select
                                        value={scoreType}
                                        label="Loại điểm"
                                        onChange={(e) => setScoreType(e.target.value)}
                                    >
                                        <MenuItem value="daily">Điểm hàng ngày (Chăm chỉ)</MenuItem>
                                        <MenuItem value="test">Bài kiểm tra</MenuItem>
                                        <MenuItem value="midterm">Giữa kỳ</MenuItem>
                                        <MenuItem value="final">Cuối kỳ</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} md={8}>
                    <Paper sx={{ width: '100%' }}>
                        <Tabs value={tab} onChange={(e, v) => setTab(v)} sx={{ px: 2, pt: 1 }}>
                            <Tab icon={<Grade />} label="Nhập điểm" iconPosition="start" />
                            <Tab icon={<History />} label="Lịch sử" iconPosition="start" disabled />
                        </Tabs>
                        <Divider />

                        <Box sx={{ p: 2 }}>
                            {tab === 0 && (
                                <>
                                    <TableContainer>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Học sinh</TableCell>
                                                    <TableCell width={120}>Điểm (0-10)</TableCell>
                                                    <TableCell>Nhận xét</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {enrollments.map((e) => (
                                                    <TableRow key={e.student._id}>
                                                        <TableCell>
                                                            <Stack direction="row" spacing={1} alignItems="center">
                                                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem', bgcolor: 'primary.light' }}>
                                                                    {e.student.fullName[0]}
                                                                </Avatar>
                                                                <Typography variant="body2">{e.student.fullName}</Typography>
                                                            </Stack>
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                type="number"
                                                                variant="standard"
                                                                inputProps={{ min: 0, max: 10, step: 0.1 }}
                                                                value={scoreData[e.student._id]?.score || ''}
                                                                onChange={(ev) => handleScoreChange(e.student._id, 'score', ev.target.value)}
                                                            />
                                                        </TableCell>
                                                        <TableCell>
                                                            <TextField
                                                                variant="standard"
                                                                fullWidth
                                                                placeholder="Nhận xét sự tiến bộ..."
                                                                value={scoreData[e.student._id]?.comment || ''}
                                                                onChange={(ev) => handleScoreChange(e.student._id, 'comment', ev.target.value)}
                                                            />
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                        <Button
                                            variant="contained"
                                            startIcon={<Save />}
                                            onClick={handleSaveScores}
                                            disabled={saving}
                                        >
                                            Lưu điểm hôm nay
                                        </Button>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
}
