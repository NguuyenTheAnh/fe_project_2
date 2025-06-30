import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Pagination,
    InputAdornment,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Chip,
    useTheme,
    useMediaQuery,
    Container,
    Avatar,
    Tooltip,
    Link,
    Snackbar,
} from '@mui/material';
import { styled } from '@mui/system';
import {
    FaSearch,
    FaEdit,
    FaTrash,
    FaPlus,
    FaSortAmountDown,
    FaSortAmountUp,
    FaUsers,
    FaChair,
    FaUserFriends,
    FaMoneyBill,
    FaCheckCircle,
    FaTimesCircle,
    FaHourglassHalf,
    FaQrcode,
    FaTimes,
    FaCopy,
    FaWifi,
    FaExclamationTriangle,
    FaClock,
} from 'react-icons/fa';
import axios from 'axios';
import { notification } from 'antd';
import { createTableApi, deleteTableApi, getTableApi, updateTableApi } from '../util/apiTable';
import { QRCodeSVG } from 'qrcode.react';
import { useNotifications } from '../hooks/useNotifications';
import socket from '../util/socket';
// Styled components with fixed dimensions
const TableCardWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    width: '320px', // Fixed width
    height: '280px', // Fixed height for table cards
    minWidth: '320px',
    maxWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
    },
}));

const StyledCardContent = styled(CardContent)({
    flexGrow: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    height: '180px', // Fixed height for content
    overflow: 'hidden',
});

const StyledCardActions = styled(CardActions)({
    padding: '8px 16px 16px 16px',
    justifyContent: 'space-between',
    height: '60px', // Fixed height for actions
});

const TableName = styled(Typography)({
    fontWeight: 'bold',
    fontSize: '1.5rem',
    wordBreak: 'break-word',
    lineHeight: '1.2em',
    maxHeight: '2.4em',
    overflow: 'hidden',
    marginBottom: '12px',
});

const TableId = styled(Typography)({
    color: '#888',
    fontSize: '0.8rem',
    marginBottom: '8px',
});
const StatusChip = styled(Chip)(({ status }) => {
    let bgColor = '#4CAF50'; // Default green for Available

    if (status === 'Occupied') {
        bgColor = '#F44336'; // Red
    } else if (status === 'Reserved') {
        bgColor = '#FF9800'; // Orange/Yellow
    } else if (status === 'Unavailable') {
        bgColor = '#F44336'; // Red
    }

    return {
        backgroundColor: bgColor,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.85rem',
    };
});

const PaymentChip = styled(Chip)(({ status }) => {
    let bgColor = '#4CAF50'; // Green for Paid

    if (status === 'Unpaid') {
        bgColor = '#F44336'; // Red
    } else if (status === 'Pending') {
        bgColor = '#FF9800'; // Orange/Yellow
    }

    return {
        backgroundColor: bgColor,
        color: 'white',
        fontWeight: 'bold',
        fontSize: '0.85rem',
    };
});

const CapacityChip = styled(Chip)({
    backgroundColor: '#E0E0E0',
    color: '#333',
    fontWeight: 'bold',
    fontSize: '0.85rem',
});

const ActionButton = styled(Button)(({ color, variant = 'contained' }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    minWidth: 'auto',
    padding: '6px 10px', // Slightly reduced padding for 3 buttons
    fontSize: '0.8rem', // Slightly smaller font for 3 buttons
    ...(variant === 'contained' && {
        backgroundColor: color === 'edit' ? '#4CAF50' : color === 'delete' ? '#F44336' : '#D3212D', // Default to primary red
        color: 'white',
        '&:hover': {
            backgroundColor: color === 'edit' ? '#3d8b40' : color === 'delete' ? '#d32f2f' : '#b71c1c',
        },
    }),
    ...(variant === 'outlined' && {
        borderColor: color === 'qr' ? '#D3212D' : theme.palette.grey[500],
        color: color === 'qr' ? '#D3212D' : theme.palette.text.primary,
        '&:hover': {
            backgroundColor: color === 'qr' ? 'rgba(211, 33, 45, 0.08)' : 'rgba(0,0,0,0.04)',
            borderColor: color === 'qr' ? '#D3212D' : theme.palette.grey[700],
        },
    }),
}));

const FilterContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
    marginBottom: '24px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
}));

const AddButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
    borderRadius: '8px',
    border: 0,
    color: 'white',
    height: '48px',
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(211, 33, 45, .3)',
    textTransform: 'none',
    fontWeight: 'bold',
    '&:hover': {
        background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
        boxShadow: '0 4px 8px 3px rgba(211, 33, 45, .4)',
    },
}));

const NoResultsContainer = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 0',
    width: '100%',
});

const FormContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    padding: '16px',
}));

const InfoRow = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    gap: '8px',
});

const QRCodeModalContent = styled(DialogContent)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
    gap: theme.spacing(2),
}));

const TablesDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State variables for table listing
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(6);
    const [status, setStatus] = useState('');
    const [paymentStatus, setPaymentStatus] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('asc');
    const [totalItems, setTotalItems] = useState(0);

    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedTable, setSelectedTable] = useState(null); // Used for both delete and edit
    const [deleteLoading, setDeleteLoading] = useState(false);

    // State variables for Add/Edit table modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [formData, setFormData] = useState({
        table_id: null, // For edit mode
        table_name: '',
        capacity: '',
        status: 'Available',
        payment_status: 'Unpaid',
    });
    const [formErrors, setFormErrors] = useState({});
    const [modalLoading, setModalLoading] = useState(false);

    // QR Code Modal State
    const [qrModalOpen, setQrModalOpen] = useState(false);
    const [qrCodeValue, setQrCodeValue] = useState('');
    const [qrTableInfo, setQrTableInfo] = useState(null);
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // Fetch tables from API
    const fetchTables = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                ...(paymentStatus && { payment_status: paymentStatus }),
                ...(status && { status }),
                ...(search && { search }),
                ...(sort && { sort }),
            };
            const response = await getTableApi(params);
            if (response && response.statusCode === 200) {
                const { totalTables, totalPage, tables: tablesData } = response.data;
                setTables(tablesData || []);
                setTotalPages(totalPage || 1);
                setTotalItems(totalTables || 0);
            } else {
                throw new Error('Failed to fetch tables');
            }
        } catch (error) {
            console.error('Error fetching tables:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to load tables. Please try again later.',
            });
            setTables([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    // Real-time notifications hook
    const { notifications, isConnected, manualReconnect } = useNotifications(fetchTables);

    // Effect để handle specific notifications và cập nhật table state
    useEffect(() => {
        const latestNotification = notifications[0];
        if (!latestNotification) return;

        switch (latestNotification.type) {
            case 'GUEST_LOGIN':
                handleGuestLoginNotification(latestNotification.data);
                break;
            case 'TABLE_OCCUPIED':
                handleTableOccupiedNotification(latestNotification.data);
                break;
            case 'GUEST_CHECKOUT':
                handleGuestCheckoutNotification(latestNotification.data);
                break;
            case 'PAYMENT_SUCCESS':
                handlePaymentSuccessNotification(latestNotification.data);
                break;
            case 'TABLE_STATUS_UPDATE':
                handleTableStatusUpdateNotification(latestNotification.data);
                break;
        }
    }, [notifications]);

    // Handler functions cho từng loại notification
    const handleGuestLoginNotification = (data) => {
        if (!data?.table_id) return;

        setTables(prevTables =>
            prevTables.map(table =>
                table.table_id === data.table_id
                    ? {
                        ...table,
                        status: data.new_status || 'Unavailable',
                        payment_status: data.new_payment_status || 'Unpaid',
                        guest_name: data.guest_name,
                        guest_id: data.guest_id,
                        occupied_time: data.timestamp
                    }
                    : table
            )
        );
    };

    const handleTableOccupiedNotification = (data) => {
        if (!data?.table_id) return;

        setTables(prevTables =>
            prevTables.map(table =>
                table.table_id === data.table_id
                    ? {
                        ...table,
                        status: data.new_status || 'Unavailable',
                        guest_name: data.guest_name,
                        occupied_time: data.timestamp
                    }
                    : table
            )
        );
    };

    const handleGuestCheckoutNotification = (data) => {
        if (!data?.table_id) return;

        setTables(prevTables =>
            prevTables.map(table =>
                table.table_id === data.table_id
                    ? {
                        ...table,
                        status: data.new_status || 'Available',
                        payment_status: data.new_payment_status || 'Paid',
                        guest_name: null,
                        guest_id: null,
                        occupied_time: null
                    }
                    : table
            )
        );
    };

    const handlePaymentSuccessNotification = (data) => {
        if (!data?.table_id) return;

        setTables(prevTables =>
            prevTables.map(table =>
                table.table_id === data.table_id
                    ? {
                        ...table,
                        payment_status: 'Paid',
                        payment_time: data.timestamp
                    }
                    : table
            )
        );
    };

    const handleTableStatusUpdateNotification = (data) => {
        if (!data?.table_id) return;

        setTables(prevTables =>
            prevTables.map(table =>
                table.table_id === data.table_id
                    ? { ...table, ...data }
                    : table
            )
        );
    };

    // Effect để handle connection status
    useEffect(() => {
        if (!isConnected) {
            console.log('WebSocket not connected, checking connection...');
        }
    }, [isConnected]);

    useEffect(() => {
        fetchTables();
    }, [page, limit, status, paymentStatus, sort]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1 && search) { // Only reset page if search is active
                setPage(1);
            } else {
                fetchTables();
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    const handleSortToggle = () => {
        setSort(sort === 'asc' ? 'desc' : 'asc');
    };

    const handleOpenDeleteDialog = (table) => {
        setSelectedTable(table);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedTable(null);
    };

    const handleDeleteTable = async () => {
        if (!selectedTable) return;
        setDeleteLoading(true);
        try {
            await deleteTableApi(selectedTable.table_id);
            notification.success({
                message: 'Success',
                description: 'Table deleted successfully!',
            });
            fetchTables();
        } catch (error) {
            console.error('Error deleting table:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to delete table. Please try again.',
            });
        } finally {
            setDeleteLoading(false);
            handleCloseDeleteDialog();
        }
    };

    // Modal (Add/Edit) Handlers
    const handleOpenModal = (tableToEdit = null) => {
        if (tableToEdit) {
            setIsEditMode(true);
            setFormData({
                table_id: tableToEdit.table_id,
                table_name: tableToEdit.table_name || '',
                capacity: tableToEdit.capacity || '',
                status: tableToEdit.status || 'Available',
                payment_status: tableToEdit.payment_status || 'Unpaid',
            });
        } else {
            setIsEditMode(false);
            setFormData({
                table_id: null,
                table_name: '',
                capacity: '',
                status: 'Available',
                payment_status: 'Unpaid',
            });
        }
        setFormErrors({});
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setIsEditMode(false); // Reset edit mode
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.table_name.trim()) errors.table_name = 'Table name is required';
        if (!formData.capacity || parseInt(formData.capacity) <= 0) errors.capacity = 'Capacity must be a positive number';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.payment_status) errors.payment_status = 'Payment status is required';
        return errors;
    };

    const handleSaveTable = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setModalLoading(true);
        try {
            const tableData = {
                table_name: formData.table_name,
                capacity: parseInt(formData.capacity),
                status: formData.status,
                payment_status: formData.payment_status,
            };

            if (isEditMode && formData.table_id) {
                // API PATCH Call for Edit
                const response = await updateTableApi(formData.table_id, tableData);
                if (response && response.statusCode === 200) {
                    notification.success({
                        message: 'Success',
                        description: 'Table updated successfully!',
                    });
                } else {
                    throw new Error(response.message || 'Failed to update table');
                }
            } else {
                // API POST Call for Add
                const response = await createTableApi(tableData);
                if (response && response.statusCode === 200) { // Assuming 201 for create, but API spec says 200
                    notification.success({
                        message: 'Success',
                        description: 'Table added successfully!',
                    });
                } else {
                    throw new Error(response.message || 'Failed to add table');
                }
            }
            fetchTables();
            handleCloseModal();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'adding'} table:`, error);
            notification.error({
                message: 'Error',
                description: error.message || `Failed to ${isEditMode ? 'update' : 'add'} table. Please try again.`,
            });
        } finally {
            setModalLoading(false);
        }
    };

    const getPaymentStatusIcon = (payment_status) => {
        switch (payment_status) {
            case 'Paid': return <FaCheckCircle color="#4CAF50" />;
            case 'Unpaid': return <FaTimesCircle color="#F44336" />;
            case 'Pending': return <FaHourglassHalf color="#FF9800" />;
            default: return null;
        }
    };

    // QR Code Modal Handlers
    const handleOpenQrModal = (table) => {
        const frontendUrl = import.meta.env.VITE_FRONTEND_URL; // Fallback if env var is not set
        const url = `${frontendUrl}/guest?table_id=${table.table_id}`;
        setQrCodeValue(url);
        setQrTableInfo(table);
        setQrModalOpen(true);
    };

    const handleCloseQrModal = () => {
        setQrModalOpen(false);
        setQrCodeValue('');
        setQrTableInfo(null);
    };

    const handleCopyToClipboard = () => {
        navigator.clipboard.writeText(qrCodeValue)
            .then(() => {
                setSnackbarOpen(true);
            })
            .catch(err => {
                console.error('Failed to copy URL: ', err);
                notification.error({ message: 'Error', description: 'Failed to copy URL.' });
            });
    };

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbarOpen(false);
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: { xs: 2, md: 0 } }}>
                    <Typography variant="h4" component="h1" sx={{ color: '#D3212D', fontWeight: 'bold' }}>
                        Table Management
                    </Typography>
                    <Tooltip title={isConnected ? 'Real-time notifications active' : 'Click to reconnect WebSocket'}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {isConnected ? (
                                <FaWifi style={{ color: '#4CAF50', fontSize: '16px' }} />
                            ) : (
                                <FaExclamationTriangle
                                    style={{ color: '#f44336', fontSize: '16px', cursor: 'pointer' }}
                                    onClick={() => {
                                        console.log('Attempting to reconnect...');
                                        socket.connect();
                                        notification.info({
                                            message: 'Reconnecting...',
                                            description: 'Attempting to reconnect to real-time notifications',
                                            placement: 'topRight',
                                            duration: 2,
                                        });
                                    }}
                                />
                            )}
                            <Typography variant="caption" sx={{ color: isConnected ? '#4CAF50' : '#f44336' }}>
                                {isConnected ? 'Live' : 'Offline'}
                            </Typography>
                        </Box>
                    </Tooltip>
                </Box>
                <AddButton
                    startIcon={<FaPlus />}
                    onClick={() => handleOpenModal()} // Open modal for adding
                >
                    Add New Table
                </AddButton>
            </Box>

            <FilterContainer>
                <TextField
                    placeholder="Search tables..."
                    variant="outlined"
                    size="small"
                    value={search}
                    onChange={handleSearchChange}
                    sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch color="#D3212D" />
                            </InputAdornment>
                        ),
                    }}
                />
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
                    <InputLabel>Status</InputLabel>
                    <Select
                        value={status}
                        label="Status"
                        onChange={(e) => setStatus(e.target.value)}
                    >
                        <MenuItem value="">All Status</MenuItem>
                        <MenuItem value="Available">Available</MenuItem>
                        <MenuItem value="Unavailable">Unavailable</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
                    <InputLabel>Payment Status</InputLabel>
                    <Select
                        value={paymentStatus}
                        label="Payment Status"
                        onChange={(e) => setPaymentStatus(e.target.value)}
                    >
                        <MenuItem value="">All Payment Status</MenuItem>
                        <MenuItem value="Paid">Paid</MenuItem>
                        <MenuItem value="Unpaid">Unpaid</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined"
                    startIcon={sort === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    onClick={handleSortToggle}
                    sx={{
                        borderColor: '#D3212D',
                        color: '#D3212D',
                        '&:hover': {
                            borderColor: '#b71c1c',
                            backgroundColor: 'rgba(211, 33, 45, 0.04)',
                        },
                        minWidth: { xs: '100%', sm: 'auto' }
                    }}
                >
                    Capacity: {sort === 'asc' ? 'Low to High' : 'High to Low'}
                </Button>
            </FilterContainer>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#D3212D' }} />
                </Box>
            ) : tables.length > 0 ? (
                <>
                    <Grid container spacing={3} justifyContent="center">
                        {tables.map((table) => (
                            <Grid item xs={12} sm={6} md={4} key={table.table_id}>
                                <TableCardWrapper>
                                    <StyledCard>
                                        <StyledCardContent>
                                            <TableId variant="body2">
                                                ID: {table.table_id}
                                            </TableId>
                                            <TableName variant="h5" component="div">
                                                {table.table_name}
                                            </TableName>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                                <StatusChip
                                                    label={table.status}
                                                    status={table.status}
                                                    size="small"
                                                />
                                                <CapacityChip
                                                    icon={<FaUsers />}
                                                    label={`${table.capacity} people`}
                                                    size="small"
                                                />
                                            </Box>
                                            <InfoRow>
                                                <FaMoneyBill color="#555" />
                                                <Typography variant="body2" sx={{ mr: 1 }}>
                                                    Payment:
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                    {getPaymentStatusIcon(table.payment_status)}
                                                    <Typography variant="body2" fontWeight="bold">
                                                        {table.payment_status}
                                                    </Typography>
                                                </Box>
                                            </InfoRow>
                                            {table.guest_name && (
                                                <InfoRow>
                                                    <FaUserFriends color="#555" />
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        Guest:
                                                    </Typography>
                                                    <Typography variant="body2" fontWeight="bold" sx={{ color: '#D3212D' }}>
                                                        {table.guest_name}
                                                    </Typography>
                                                </InfoRow>
                                            )}
                                            {table.occupied_time && (
                                                <InfoRow>
                                                    <FaClock color="#555" />
                                                    <Typography variant="body2" sx={{ mr: 1 }}>
                                                        Since:
                                                    </Typography>
                                                    <Typography variant="body2" fontSize="0.75rem" sx={{ color: '#666' }}>
                                                        {new Date(table.occupied_time).toLocaleTimeString('vi-VN', {
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </Typography>
                                                </InfoRow>
                                            )}
                                        </StyledCardContent>
                                        <StyledCardActions>
                                            <Tooltip title="Edit Table">
                                                <ActionButton
                                                    size="small"
                                                    startIcon={<FaEdit />}
                                                    color="edit"
                                                    onClick={() => handleOpenModal(table)} // Open modal for editing
                                                >
                                                    Edit
                                                </ActionButton>
                                            </Tooltip>
                                            <Tooltip title="QR Code">
                                                <ActionButton
                                                    size="small"
                                                    startIcon={<FaQrcode />}
                                                    variant="outlined"
                                                    color="qr"
                                                    onClick={() => handleOpenQrModal(table)}
                                                >
                                                    QR Code
                                                </ActionButton>
                                            </Tooltip>
                                            <Tooltip title="Delete Table">
                                                <ActionButton
                                                    size="small"
                                                    startIcon={<FaTrash />}
                                                    color="delete"
                                                    onClick={() => handleOpenDeleteDialog(table)}
                                                >
                                                    Delete
                                                </ActionButton>
                                            </Tooltip>
                                        </StyledCardActions>
                                    </StyledCard>
                                </TableCardWrapper>
                            </Grid>
                        ))}
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                        <Pagination
                            count={totalPages}
                            page={page}
                            onChange={handlePageChange}
                            color="primary"
                            showFirstButton
                            showLastButton
                            sx={{
                                '& .MuiPaginationItem-root': {
                                    color: '#D3212D',
                                },
                                '& .Mui-selected': {
                                    backgroundColor: 'rgba(211, 33, 45, 0.2) !important',
                                },
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                        Showing {tables.length} of {totalItems} tables
                    </Typography>
                </>
            ) : (
                <NoResultsContainer>
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                        No tables found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Try adjusting your search or filters
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearch('');
                            setStatus('');
                            setPaymentStatus('');
                            setSort('asc');
                            setPage(1);
                        }}
                        sx={{
                            borderColor: '#D3212D',
                            color: '#D3212D',
                            '&:hover': {
                                borderColor: '#b71c1c',
                                backgroundColor: 'rgba(211, 33, 45, 0.04)',
                            },
                        }}
                    >
                        Clear Filters
                    </Button>
                </NoResultsContainer>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                PaperProps={{ sx: { borderRadius: '12px', padding: '8px' } }}
            >
                <DialogTitle sx={{ color: '#D3212D' }}>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedTable?.table_name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={handleCloseDeleteDialog} sx={{ color: 'gray' }} disabled={deleteLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteTable}
                        variant="contained"
                        color="error"
                        disabled={deleteLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                            '&:hover': { background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)' },
                        }}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Table Dialog */}
            <Dialog
                open={isModalOpen}
                onClose={handleCloseModal}
                PaperProps={{ sx: { borderRadius: '12px', padding: '8px', width: '100%', maxWidth: '500px' } }}
            >
                <DialogTitle sx={{ color: '#D3212D' }}>
                    {isEditMode ? 'Edit Table' : 'Add New Table'}
                </DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            label="Table Name"
                            name="table_name"
                            value={formData.table_name}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            error={!!formErrors.table_name}
                            helperText={formErrors.table_name}
                        />
                        <TextField
                            label="Capacity"
                            name="capacity"
                            type="number"
                            value={formData.capacity}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            error={!!formErrors.capacity}
                            helperText={formErrors.capacity}
                            InputProps={{ endAdornment: <InputAdornment position="end">people</InputAdornment> }}
                        />
                        <FormControl size="small" fullWidth error={!!formErrors.status}>
                            <InputLabel>Status</InputLabel>
                            <Select name="status" value={formData.status} label="Status" onChange={handleFormChange}>
                                <MenuItem value="Available">Available</MenuItem>
                                <MenuItem value="Unavailable">Unavailable</MenuItem>
                            </Select>
                            {formErrors.status && <Typography variant="caption" color="error">{formErrors.status}</Typography>}
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!formErrors.payment_status}>
                            <InputLabel>Payment Status</InputLabel>
                            <Select name="payment_status" value={formData.payment_status} label="Payment Status" onChange={handleFormChange}>
                                <MenuItem value="Paid">Paid</MenuItem>
                                <MenuItem value="Unpaid">Unpaid</MenuItem>
                            </Select>
                            {formErrors.payment_status && <Typography variant="caption" color="error">{formErrors.payment_status}</Typography>}
                        </FormControl>
                    </FormContainer>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
                    <Button onClick={handleCloseModal} sx={{ color: 'gray' }} disabled={modalLoading}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveTable}
                        variant="contained"
                        disabled={modalLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                            '&:hover': { background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)' },
                        }}
                    >
                        {modalLoading ? 'Saving...' : (isEditMode ? 'Save Changes' : 'Add Table')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* QR Code Modal */}
            <Dialog open={qrModalOpen} onClose={handleCloseQrModal} PaperProps={{ sx: { borderRadius: '12px', padding: theme.spacing(1) } }}>
                <DialogTitle sx={{ color: '#D3212D', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    QR Code for {qrTableInfo?.table_name || 'Table'}
                    <IconButton onClick={handleCloseQrModal} size="small">
                        <FaTimes />
                    </IconButton>
                </DialogTitle>
                <QRCodeModalContent>
                    {qrCodeValue && <QRCodeSVG value={qrCodeValue} size={256} level="H" includeMargin={true} />}
                    <Typography variant="caption" sx={{ mt: 1, wordBreak: 'break-all' }}>
                        Scan to order or view details.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1, p: 1, border: '1px solid #eee', borderRadius: '8px', width: '100%' }}>
                        <Link href={qrCodeValue} target="_blank" rel="noopener noreferrer" sx={{ flexGrow: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: theme.palette.primary.main }}>
                            {qrCodeValue}
                        </Link>
                        <Tooltip title="Copy URL">
                            <IconButton onClick={handleCopyToClipboard} size="small">
                                <FaCopy />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </QRCodeModalContent>
                <DialogActions sx={{ padding: theme.spacing(1, 2, 2, 2) }}>
                    <Button onClick={handleCloseQrModal} sx={{ color: 'gray' }}>Close</Button>
                </DialogActions>
            </Dialog>
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message="URL copied to clipboard!"
            />
        </Container>
    );
};

export default TablesDashboard;