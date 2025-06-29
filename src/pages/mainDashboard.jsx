import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Paper,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Card,
    CardContent,
    useTheme,
    useMediaQuery,
    Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    LineChart,
    Line,
    ResponsiveContainer
} from 'recharts';
import { FaChartBar, FaChartLine, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';
import { notification } from 'antd';
import { getTransactionsApi } from '../util/api';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 56px - 56px)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(4),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));

const ChartCard = styled(Card)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(211, 33, 45, 0.1)',
    marginBottom: theme.spacing(3),
    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
}));

const ChartHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
}));

const StatCard = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '16px',
    background: '#FFFFFF',
    color: '#333333',
    textAlign: 'center',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    transition: 'all 0.3s ease-in-out',
    position: 'relative',
    overflow: 'hidden',
    '&:hover': {
        transform: 'translateY(-4px)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.16)',
    },
    '&::before': {
        content: '""',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, #D3212D 0%, #F26649 100%)',
    }
}));

const MainDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Chart data states
    const [monthlyData, setMonthlyData] = useState([]);
    const [yearlyData, setYearlyData] = useState([]);

    // Filter states
    const currentYear = new Date().getFullYear();
    const [selectedYear, setSelectedYear] = useState(currentYear);

    // Generate years array (current year and 4 previous years) - static calculation
    const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4];

    const fetchTransactions = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getTransactionsApi();
            if (response && response.data && response.statusCode === 200) {
                setTransactions(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response?.message || 'Failed to fetch transactions');
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err.message || 'Could not load transaction data.');
            notification.error({
                message: 'Error fetching data',
                description: err.message || 'Could not load transaction data.',
                placement: "bottomRight"
            });
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Process monthly data for selected year
    useEffect(() => {
        if (transactions.length > 0) {
            const monthlyRevenue = Array.from({ length: 12 }, (_, i) => ({
                month: new Date(2024, i).toLocaleString('en-US', { month: 'short' }),
                revenue: 0,
                transactions: 0
            }));

            transactions.forEach(transaction => {
                if (!transaction.transaction_date) return;

                const transactionDate = new Date(Number(transaction.transaction_date));
                const transactionYear = transactionDate.getFullYear();
                const transactionMonth = transactionDate.getMonth();

                if (transactionYear === selectedYear) {
                    const netAmount = Number(transaction.amount_in || 0) - Number(transaction.amount_out || 0);
                    monthlyRevenue[transactionMonth].revenue += netAmount;
                    monthlyRevenue[transactionMonth].transactions += 1;
                }
            });

            setMonthlyData(monthlyRevenue);
        } else {
            setMonthlyData([]);
        }
    }, [transactions, selectedYear]);

    // Process yearly data for 5 years
    useEffect(() => {
        if (transactions.length > 0) {
            const yearlyRevenue = availableYears.map(year => ({
                year: year.toString(),
                revenue: 0,
                transactions: 0
            }));

            transactions.forEach(transaction => {
                if (!transaction.transaction_date) return;

                const transactionDate = new Date(Number(transaction.transaction_date));
                const transactionYear = transactionDate.getFullYear();

                const yearIndex = availableYears.findIndex(year => year === transactionYear);
                if (yearIndex !== -1) {
                    const netAmount = Number(transaction.amount_in || 0) - Number(transaction.amount_out || 0);
                    yearlyRevenue[yearIndex].revenue += netAmount;
                    yearlyRevenue[yearIndex].transactions += 1;
                }
            });

            setYearlyData(yearlyRevenue.reverse()); // Reverse to show oldest to newest
        } else {
            setYearlyData([]);
        }
    }, [transactions]); // Remove availableYears from dependency

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US').format(value);
    };

    const formatTooltipCurrency = (value, name) => {
        if (name === 'revenue') {
            return [`${formatCurrency(value)}đ`, 'Revenue'];
        }
        return [`${formatCurrency(value)}`, name];
    };

    // Calculate total stats
    const currentYearRevenue = monthlyData.reduce((sum, month) => sum + month.revenue, 0);
    const currentYearTransactions = monthlyData.reduce((sum, month) => sum + month.transactions, 0);
    const averageMonthlyRevenue = currentYearRevenue / 12;

    if (loading) {
        return (
            <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)' }}>
                <CircularProgress sx={{ color: '#D3212D' }} />
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            <HeaderBox>
                <Typography variant="h4" component="h1" sx={{ color: '#D3212D', fontWeight: 'bold' }}>
                    Revenue Dashboard
                </Typography>
            </HeaderBox>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Summary Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                padding: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaDollarSign size={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#666', mb: 0.5 }}>
                                {selectedYear} Revenue
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {formatCurrency(currentYearRevenue)}đ
                            </Typography>
                        </Box>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                padding: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaChartBar size={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#666', mb: 0.5 }}>
                                Transactions
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {currentYearTransactions}
                            </Typography>
                        </Box>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                padding: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaCalendarAlt size={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#666', mb: 0.5 }}>
                                Avg Monthly
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {formatCurrency(averageMonthlyRevenue)}đ
                            </Typography>
                        </Box>
                    </StatCard>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 1.5
                        }}>
                            <Box sx={{
                                padding: 1.5,
                                borderRadius: '12px',
                                background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                color: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <FaChartLine size={24} />
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#666', mb: 0.5 }}>
                                Best Month
                            </Typography>
                            <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#333' }}>
                                {monthlyData.length > 0
                                    ? monthlyData.reduce((max, month) => month.revenue > max.revenue ? month : max, monthlyData[0]).month
                                    : 'N/A'
                                }
                            </Typography>
                        </Box>
                    </StatCard>
                </Grid>
            </Grid>

            {/* Monthly Revenue Chart */}
            <ChartCard>
                <ChartHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FaChartBar size={24} color="#D3212D" />
                        <Typography variant="h5" sx={{ color: '#D3212D', fontWeight: 'bold' }}>
                            Monthly Revenue
                        </Typography>
                    </Box>
                    <FormControl size="small" sx={{ minWidth: 120 }}>
                        <InputLabel>Year</InputLabel>
                        <Select
                            value={selectedYear}
                            label="Year"
                            onChange={handleYearChange}
                            sx={{ borderRadius: '8px' }}
                        >
                            {availableYears.map(year => (
                                <MenuItem key={year} value={year}>{year}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </ChartHeader>
                <Box sx={{ width: '100%', height: isMobile ? 300 : 400 }}>
                    <ResponsiveContainer>
                        <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <defs>
                                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#D3212D" />
                                    <stop offset="100%" stopColor="#F26649" />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="month"
                                stroke="#666"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={formatTooltipCurrency}
                                labelStyle={{ color: '#333' }}
                                contentStyle={{
                                    backgroundColor: '#FFF8F0',
                                    border: '1px solid #D3212D',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Bar
                                dataKey="revenue"
                                fill="url(#colorGradient)"
                                name="Revenue"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </Box>
            </ChartCard>

            {/* Yearly Revenue Trend */}
            <ChartCard>
                <ChartHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <FaChartLine size={24} color="#D3212D" />
                        <Typography variant="h5" sx={{ color: '#D3212D', fontWeight: 'bold' }}>
                            5-Year Revenue Trend
                        </Typography>
                    </Box>
                </ChartHeader>
                <Box sx={{ width: '100%', height: isMobile ? 300 : 400 }}>
                    <ResponsiveContainer>
                        <LineChart data={yearlyData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis
                                dataKey="year"
                                stroke="#666"
                                fontSize={12}
                            />
                            <YAxis
                                stroke="#666"
                                fontSize={12}
                                tickFormatter={formatCurrency}
                            />
                            <Tooltip
                                formatter={formatTooltipCurrency}
                                labelStyle={{ color: '#333' }}
                                contentStyle={{
                                    backgroundColor: '#FFF8F0',
                                    border: '1px solid #D3212D',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="revenue"
                                stroke="#D3212D"
                                strokeWidth={3}
                                dot={{ fill: '#D3212D', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, stroke: '#D3212D', strokeWidth: 2, fill: '#F26649' }}
                                name="Revenue"
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </Box>
            </ChartCard>
        </PageContainer>
    );
};

export default MainDashboard;