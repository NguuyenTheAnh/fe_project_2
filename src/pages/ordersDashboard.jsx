import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Container,
    Box,
    Typography,
    Grid,
    Card,
    CardContent,
    CardActions,
    Button,
    TextField,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Pagination,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Chip,
    IconButton,
    InputAdornment,
    Tooltip,
    useTheme,
    useMediaQuery,
    Divider,
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    FaSearch, FaPlus, FaEye, FaSyncAlt,
    FaSortAmountUp, FaSortAmountDown, FaCalendarAlt, FaUserFriends, FaTable, FaUserCog,
    FaShoppingCart
} from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import { notification } from 'antd';
import { getOrderApi, getOrderByIdApi, createOrderApi, updateOrderApi, deleteOrderApi, getGuestsApi, getTablesApi, getStaffApi } from '../util/api';
import { AuthContext } from '../components/context/auth.context';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => (({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 56px - 56px)',
})));

const HeaderBox = styled(Box)(({ theme }) => (({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
})));

const AddButton = styled(Button)(({ theme }) => (({
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
})));

const FilterContainer = styled(Box)(({ theme }) => (({
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
})));

const OrderCardStyled = styled(Card)(({ theme }) => (({
    width: '340px',
    minWidth: '340px',
    maxWidth: '340px',
    height: '100%',
    minHeight: '290px',
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
})));

const StyledCardContent = styled(CardContent)(({
    flexGrow: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
}));

const StyledCardActions = styled(CardActions)(({
    padding: '12px 16px',
    justifyContent: 'space-between',
    borderTop: `1px solid #eee`,
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
    let backgroundColor;
    switch (status) {
        case 'Completed':
            backgroundColor = theme.palette.success.main;
            break;
        case 'Pending':
            backgroundColor = theme.palette.warning.main;
            break;
        case 'Cancelled':
            backgroundColor = theme.palette.error.main;
            break;
        default:
            backgroundColor = theme.palette.grey[500];
    }
    return {
        fontWeight: 'bold',
        color: theme.palette.common.white,
        backgroundColor,
        fontSize: '0.8rem',
        borderRadius: '16px',
    };
});

const FormContainer = styled(Box)(({ theme }) => (({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: theme.spacing(1, 0),
})));

const NoResultsContainer = styled(Box)(({ theme }) => (({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 0),
    width: '100%',
})));

const CardActionButton = styled(Button)(({ theme }) => (({
    textTransform: 'none',
    fontSize: '0.8rem',
    padding: theme.spacing(0.75, 1.5),
    minWidth: '90px',
    borderRadius: '8px',
})));

const OrdersDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { auth } = useContext(AuthContext);

    const [orders, setOrders] = useState([]);
    const [guests, setGuests] = useState([]);
    const [tables, setTables] = useState([]);
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1); // Current active page
    const [limit, setLimit] = useState(isMobile ? 4 : 6); // Orders per page (responsive)
    const [totalPages, setTotalPages] = useState(1); // Total pages from API
    const [totalOrders, setTotalOrders] = useState(0); // Total orders count from API
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('DESC');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentOrder, setCurrentOrder] = useState(null);
    const [formData, setFormData] = useState({
        options: '', status: 'Pending', total_order: '',
        guest_id: '', table_id: '', order_handler_id: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [modalLoading, setModalLoading] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [detailModalLoading, setDetailModalLoading] = useState(false);
    const [orderDetails, setOrderDetails] = useState(null);
    const [isProcessConfirmOpen, setIsProcessConfirmOpen] = useState(false);
    const [orderToProcess, setOrderToProcess] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // 'page' and 'limit' are sent as parameters to the API
            const params = { page, limit, search: searchTerm, status: statusFilter, sort: sortOrder };
            const response = await getOrderApi(params);
            if (response && response.data && response.statusCode === 200) {
                setOrders(Array.isArray(response.data.orders) ? response.data.orders : []);
                // API response provides totalPage and totalOrders
                setTotalPages(response.data.totalPage || 1);
                setTotalOrders(response.data.totalOrders || 0);
            } else {
                throw new Error(response?.message || 'Failed to fetch orders');
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError(err.message || 'Could not load orders.');
            notification.error({ message: 'Error fetching orders', description: err.message || 'Could not load orders.' });
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, limit, searchTerm, statusFilter, sortOrder]); // 'page' and 'limit' are dependencies

    const fetchRelatedData = async () => {
        try {
            const guestRes = await getGuestsApi({ limit: 1000 });
            setGuests(Array.isArray(guestRes?.data?.guests) ? guestRes.data.guests : Array.isArray(guestRes?.data) ? guestRes.data : []);
            const tableRes = await getTablesApi({ limit: 1000 });
            setTables(Array.isArray(tableRes?.data?.tables) ? tableRes.data.tables : Array.isArray(tableRes?.data) ? tableRes.data : []);
            const staffRes = await getStaffApi({ limit: 1000, role: 'Employee,Manager' });
            setStaff(Array.isArray(staffRes?.data?.accounts) ? staffRes.data.accounts : Array.isArray(staffRes?.data) ? staffRes.data : []);
        } catch (err) {
            console.error("Error fetching related data for forms:", err);
            notification.error({ message: 'Error fetching form data', description: 'Could not load data for dropdowns.' });
            setGuests([]); setTables([]); setStaff([]);
        }
    };

    useEffect(() => { fetchOrders(); }, [fetchOrders]);
    useEffect(() => { fetchRelatedData(); }, []);
    useEffect(() => {
        const timer = setTimeout(() => { if (page !== 1 && searchTerm) setPage(1); }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, page]);

    const handlePageChange = (event, value) => setPage(value);

    const handleSearchChange = (event) => { setSearchTerm(event.target.value); if (page !== 1) setPage(1); };
    const handleStatusFilterChange = (event) => { setPage(1); setStatusFilter(event.target.value); };
    const handleSortToggle = () => { setPage(1); setSortOrder(prev => prev === 'ASC' ? 'DESC' : 'ASC'); };
    const resetFormData = () => {
        setFormData({ options: '', status: 'Pending', total_order: '', guest_id: '', table_id: '', order_handler_id: '' });
        setFormErrors({});
    };

    const handleOpenAddEditModal = (order = null) => {
        if (order) {
            setIsEditMode(true); setCurrentOrder(order);
            setFormData({
                options: order.options || '', status: order.status || 'Pending',
                total_order: order.total_order?.toString() || '', guest_id: order.guest_id?.toString() || '',
                table_id: order.table_id?.toString() || '', order_handler_id: order.order_handler_id?.toString() || '',
            });
        } else {
            setIsEditMode(false); setCurrentOrder(null); resetFormData();
        }
        setFormErrors({}); setIsModalOpen(true);
    };

    const handleCloseAddEditModal = () => { setIsModalOpen(false); setIsEditMode(false); setCurrentOrder(null); resetFormData(); };

    const validateForm = () => {
        const errors = {};
        if (!formData.status) errors.status = "Status is required";
        if (!formData.total_order || isNaN(Number(formData.total_order)) || Number(formData.total_order) < 0) {
            errors.total_order = "Total order must be a non-negative number";
        }
        if (!formData.guest_id) errors.guest_id = "Guest is required";
        if (!formData.table_id) errors.table_id = "Table is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const handleSubmitForm = async () => {
        if (!validateForm()) return;
        setModalLoading(true);
        try {
            const payload = {
                options: formData.options || null,
                status: formData.status,
                total_order: Number(formData.total_order),
                guest_id: Number(formData.guest_id),
                table_id: Number(formData.table_id),
                order_handler_id: formData.order_handler_id ? Number(formData.order_handler_id) : null,
            };
            if (isEditMode && currentOrder) {
                await updateOrderApi(currentOrder.order_id, payload);
                notification.success({ message: 'Success', description: 'Order updated successfully!', placement: 'bottomRight' });
            } else {
                await createOrderApi(payload);
                notification.success({ message: 'Success', description: 'Order created successfully!', placement: 'bottomRight' });
            }
            fetchOrders();
            handleCloseAddEditModal();
        } catch (err) {
            console.error("Error submitting form:", err);
            const apiErrorMessage = err.response?.data?.message;
            let description = 'Operation failed.';
            if (apiErrorMessage) {
                if (Array.isArray(apiErrorMessage)) {
                    description = apiErrorMessage.join('; ');
                } else {
                    description = apiErrorMessage;
                }
            } else if (err.message) {
                description = err.message;
            }
            notification.error({ message: 'Error', description, placement: 'bottomRight' });
        } finally {
            setModalLoading(false);
        }
    };

    const handleOpenDetailModal = async (order) => {
        setCurrentOrder(order);
        setIsDetailModalOpen(true);
        setDetailModalLoading(true);
        setOrderDetails(null);

        try {
            const response = await getOrderByIdApi(order.order_id);
            if (response && response.statusCode === 200) {
                setOrderDetails(response.data);
            } else {
                notification.error({
                    message: 'Error',
                    description: 'Could not load order details.'
                });
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to fetch order details.'
            });
        } finally {
            setDetailModalLoading(false);
        }
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setCurrentOrder(null);
        setOrderDetails(null);
        setDetailModalLoading(false);
    };

    const initiateProcessOrder = (order) => {
        if (order.order_handler_id) {
            notification.info({ message: "Order already assigned.", placement: "bottomRight" });
            return;
        }
        setOrderToProcess(order);
        setIsProcessConfirmOpen(true);
    };

    const confirmAndProcessOrder = async () => {
        if (!orderToProcess) return;

        const accountId = auth.account?.account_id;
        if (!accountId) {
            notification.error({ message: "Error", description: "User account ID not found. Please re-login.", placement: "bottomRight" });
            setIsProcessConfirmOpen(false);
            setOrderToProcess(null);
            return;
        }
        try {
            setModalLoading(true);
            await updateOrderApi(orderToProcess.order_id, { order_handler_id: accountId });
            notification.success({ message: "Success", description: `Order #${orderToProcess.order_id} is now assigned to you.`, placement: "bottomRight" });
            fetchOrders();
        } catch (err) {
            console.error("Error processing order:", err);
            notification.error({ message: "Error", description: err.response?.data?.message || err.message || "Failed to process order.", placement: "bottomRight" });
        } finally {
            setModalLoading(false);
            setIsProcessConfirmOpen(false);
            setOrderToProcess(null);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });
        } catch (e) { return 'Invalid Date'; }
    };

    if (loading && orders.length === 0 && !error) {
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
                    Order Management
                </Typography>
                {/* The AddButton can be used if manual order creation is still needed */}
                {/* <AddButton startIcon={<FaPlus />} onClick={() => handleOpenAddEditModal()} > Add New Order </AddButton> */}
            </HeaderBox>

            <FilterContainer>
                <TextField
                    placeholder="Search by Order ID, Guest, Table..."
                    variant="outlined" size="small" value={searchTerm} onChange={handleSearchChange}
                    InputProps={{ startAdornment: (<InputAdornment position="start"><FaSearch color="#D3212D" /></InputAdornment>), sx: { borderRadius: '8px' } }}
                    sx={{ flexGrow: 1, minWidth: { xs: '100%', sm: '200px' } }}
                />
                <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: '150px' } }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={handleStatusFilterChange} sx={{ borderRadius: '8px' }}>
                        <MenuItem value="">All</MenuItem>
                        <MenuItem value="Pending">Pending</MenuItem>
                        <MenuItem value="Completed">Completed</MenuItem>
                    </Select>
                </FormControl>
                <Button
                    variant="outlined" startIcon={sortOrder === 'ASC' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                    onClick={handleSortToggle}
                    sx={{ borderColor: '#D3212D', color: '#D3212D', borderRadius: '8px', '&:hover': { borderColor: '#b71c1c', backgroundColor: alpha(theme.palette.primary.main, 0.04) }, minWidth: { xs: '100%', sm: 'auto' } }}
                >
                    Date: {sortOrder === 'ASC' ? 'Oldest' : 'Newest'}
                </Button>
            </FilterContainer>

            {loading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}><CircularProgress sx={{ color: '#D3212D' }} /></Box>}
            {error && !loading && <Typography color="error" sx={{ textAlign: 'center', my: 3 }}>{error}</Typography>}

            {!loading && orders.length === 0 && !error && (
                <NoResultsContainer>
                    <FaShoppingCart size={60} color={theme.palette.grey[400]} style={{ marginBottom: theme.spacing(2) }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>No orders found</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>Try adjusting your search or filters, or check back later.</Typography>
                </NoResultsContainer>
            )}

            <Grid container spacing={3} justifyContent="center">
                {orders.map(order => (
                    <Grid item xs={12} sm={6} md="auto" key={order.order_id} sx={{ display: 'flex', justifyContent: 'center' }}>
                        <OrderCardStyled>
                            <StyledCardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }} >
                                    <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', color: theme.palette.text.primary }} >
                                        Order #{order.order_id}
                                    </Typography>
                                    <StatusChip label={order.status} status={order.status} size="small" />
                                </Box>
                                <Divider sx={{ my: 1.5 }} />
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}><FaUserFriends /> Guest: {order.guest?.guest_name || `ID: ${order.guest_id}`}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}><FaTable /> Table: {order.table?.table_name || `ID: ${order.table_id}`}</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.75 }}><FaUserCog /> Handler: {order.orderHandler?.email || (order.order_handler_id ? `ID: ${order.order_handler_id}` : <Typography component="span" sx={{ color: theme.palette.warning.dark, fontStyle: 'italic' }}>Unassigned</Typography>)}</Typography>
                                <Typography variant="body1" sx={{ fontWeight: 'bold', color: '#D3212D', mt: 1.5 }}>Total: {Number(order.total_order).toLocaleString('vi-VN')}đ</Typography>
                                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5 }}><FaCalendarAlt /> {formatDate(order.created_at)}</Typography>
                                {order.options && <Typography variant="caption" sx={{ mt: 1, fontStyle: 'italic', color: theme.palette.text.hint }}>Options: {order.options}</Typography>}
                            </StyledCardContent>
                            <StyledCardActions>
                                <CardActionButton
                                    variant="outlined"
                                    onClick={() => handleOpenDetailModal(order)}
                                    startIcon={<FaEye />}
                                    sx={{ borderColor: alpha(theme.palette.info.main, 0.7), color: theme.palette.info.main, '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.08), borderColor: theme.palette.info.main } }}
                                >
                                    View
                                </CardActionButton>
                                <CardActionButton
                                    variant="contained"
                                    onClick={() => initiateProcessOrder(order)}
                                    disabled={!!order.order_handler_id || modalLoading}
                                    startIcon={<FaSyncAlt />}
                                    sx={{
                                        backgroundColor: !!order.order_handler_id ? theme.palette.grey[500] : '#D3212D',
                                        '&:hover': { backgroundColor: !!order.order_handler_id ? theme.palette.grey[500] : '#b71c1c' },
                                        color: 'white',
                                        '&.Mui-disabled': {
                                            backgroundColor: theme.palette.grey[300],
                                            color: theme.palette.grey[500],
                                        }
                                    }}
                                >
                                    {order.order_handler_id ? 'Assigned' : 'Process'}
                                </CardActionButton>
                            </StyledCardActions>
                        </OrderCardStyled>
                    </Grid>
                ))}
            </Grid>

            {totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                    <Pagination
                        count={totalPages} // Total number of pages
                        page={page} // Currently active page
                        onChange={handlePageChange} // Function to call when page changes
                        color="primary"
                        showFirstButton showLastButton
                        sx={{
                            '& .MuiPaginationItem-root': { color: '#D3212D', borderRadius: '8px' },
                            '& .Mui-selected': { backgroundColor: alpha(theme.palette.primary.main, 0.12) + ' !important', color: '#D3212D', fontWeight: 'bold' },
                        }}
                    />
                </Box>
            )}
            {totalOrders > 0 && !loading &&
                <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mt: totalPages <= 1 ? 4 : 0 }}>
                    Showing {orders.length} of {totalOrders} orders
                </Typography>
            }

            {/* Process Confirmation Dialog */}
            <Dialog open={isProcessConfirmOpen} onClose={() => setIsProcessConfirmOpen(false)} PaperProps={{ sx: { borderRadius: '12px', padding: theme.spacing(1) } }}>
                <DialogTitle sx={{ color: '#D3212D', fontWeight: 'bold' }}>Confirm Order Processing</DialogTitle>
                <DialogContent>
                    <Typography>
                        Processing this order will involve updating the table status when the customer finishes dining and handling payment at the counter if the transaction on the customer's phone fails. Are you sure?
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: theme.spacing(1, 2, 2, 2) }}>
                    <Button onClick={() => setIsProcessConfirmOpen(false)} sx={{ color: theme.palette.text.secondary, borderRadius: '8px' }}>Cancel</Button>
                    <Button
                        onClick={confirmAndProcessOrder}
                        variant="contained"
                        disabled={modalLoading}
                        sx={{ backgroundColor: '#D3212D', '&:hover': { backgroundColor: '#b71c1c' }, borderRadius: '8px' }}
                    >
                        {modalLoading ? <CircularProgress size={24} color="inherit" /> : "OK"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Modal - Kept for manual creation/editing if needed */}
            {isModalOpen && (
                <Dialog open={isModalOpen} onClose={handleCloseAddEditModal} PaperProps={{ sx: { borderRadius: '12px', padding: '8px', width: '100%', maxWidth: '500px' } }}>
                    <DialogTitle sx={{ color: '#D3212D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                        {isEditMode ? 'Edit Order' : 'Add New Order'}
                        <IconButton onClick={handleCloseAddEditModal}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <FormContainer>
                            <TextField label="Options (Optional)" name="options" value={formData.options} onChange={handleFormChange} fullWidth multiline rows={2} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' } }} />
                            <FormControl fullWidth error={!!formErrors.status} size="small">
                                <InputLabel>Status</InputLabel>
                                <Select name="status" value={formData.status} label="Status" onChange={handleFormChange} sx={{ borderRadius: '8px' }}>
                                    <MenuItem value="Pending">Pending</MenuItem>
                                    <MenuItem value="Completed">Completed</MenuItem>
                                </Select>
                                {formErrors.status && <Typography variant="caption" color="error">{formErrors.status}</Typography>}
                            </FormControl>
                            <TextField label="Total Order Amount" name="total_order" type="number" value={formData.total_order} onChange={handleFormChange} fullWidth required error={!!formErrors.total_order} helperText={formErrors.total_order} size="small" InputProps={{ endAdornment: <InputAdornment position="end">đ</InputAdornment>, sx: { borderRadius: '8px' } }} sx={{ borderRadius: '8px' }} />
                            <FormControl fullWidth error={!!formErrors.guest_id} size="small" required>
                                <InputLabel>Guest</InputLabel>
                                <Select name="guest_id" value={formData.guest_id} label="Guest" onChange={handleFormChange} sx={{ borderRadius: '8px' }}>
                                    <MenuItem value=""><em>Select Guest</em></MenuItem>
                                    {guests.map(guest => (<MenuItem key={guest.guest_id} value={guest.guest_id}>{guest.guest_name} (ID: {guest.guest_id})</MenuItem>))}
                                </Select>
                                {formErrors.guest_id && <Typography variant="caption" color="error">{formErrors.guest_id}</Typography>}
                            </FormControl>
                            <FormControl fullWidth error={!!formErrors.table_id} size="small" required>
                                <InputLabel>Table</InputLabel>
                                <Select name="table_id" value={formData.table_id} label="Table" onChange={handleFormChange} sx={{ borderRadius: '8px' }}>
                                    <MenuItem value=""><em>Select Table</em></MenuItem>
                                    {tables.map(table => (<MenuItem key={table.table_id} value={table.table_id}>{table.table_name} (ID: {table.table_id})</MenuItem>))}
                                </Select>
                                {formErrors.table_id && <Typography variant="caption" color="error">{formErrors.table_id}</Typography>}
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel>Order Handler (Optional)</InputLabel>
                                <Select name="order_handler_id" value={formData.order_handler_id} label="Order Handler (Optional)" onChange={handleFormChange} sx={{ borderRadius: '8px' }}>
                                    <MenuItem value=""><em>None</em></MenuItem>
                                    {staff.map(s => (<MenuItem key={s.account_id} value={s.account_id}>{s.email} (ID: {s.account_id})</MenuItem>))}
                                </Select>
                            </FormControl>
                        </FormContainer>
                    </DialogContent>
                    <DialogActions sx={{ padding: theme.spacing(2, 3, 3, 3) }}>
                        <Button onClick={handleCloseAddEditModal} sx={{ color: theme.palette.text.secondary, borderRadius: '8px' }} disabled={modalLoading}>Cancel</Button>
                        <Button
                            onClick={handleSubmitForm}
                            variant="contained"
                            disabled={modalLoading}
                            sx={{ background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)', '&:hover': { background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)' }, borderRadius: '8px' }}
                        >
                            {modalLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Create Order')}
                        </Button>
                    </DialogActions>
                </Dialog>
            )}

            {currentOrder && isDetailModalOpen && (
                <Dialog open={isDetailModalOpen} onClose={handleCloseDetailModal} PaperProps={{ sx: { borderRadius: '12px', padding: theme.spacing(1) } }} maxWidth="md" fullWidth>
                    <DialogTitle sx={{ color: '#D3212D', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 'bold' }}>
                        Order Details #{currentOrder.order_id}
                        <IconButton onClick={handleCloseDetailModal}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 3, backgroundColor: '#FFFFFF' }}>
                        {detailModalLoading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                                <CircularProgress sx={{ color: '#D3212D' }} />
                            </Box>
                        ) : orderDetails ? (
                            <>
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Order Information</Typography>
                                <Typography><strong>Status:</strong> <StatusChip label={orderDetails.status} status={orderDetails.status} size="small" /></Typography>
                                <Typography><strong>Total:</strong> {Number(orderDetails.total_order).toLocaleString('vi-VN')}đ</Typography>
                                <Typography><strong>Options:</strong> {orderDetails.options || 'N/A'}</Typography>
                                <Typography><strong>Created At:</strong> {formatDate(orderDetails.created_at)}</Typography>
                                <Typography><strong>Updated At:</strong> {formatDate(orderDetails.updated_at)}</Typography>

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Order Items</Typography>
                                {orderDetails.guest?.cart?.cartItems && orderDetails.guest.cart.cartItems.length > 0 ? (
                                    <Box sx={{ mt: 1 }}>
                                        {orderDetails.guest.cart.cartItems.map((item, index) => (
                                            <Box key={index} sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                py: 1.5,
                                                px: 2,
                                                mb: 1,
                                                backgroundColor: '#FFF8F0',
                                                borderRadius: '8px',
                                                border: '1px solid rgba(211, 33, 45, 0.1)'
                                            }}>
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: '500', color: '#333' }}>
                                                        {item.dish?.dish_name || 'Unknown Dish'}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#D3212D', fontWeight: '500' }}>
                                                        {Number(item.dish?.price || 0).toLocaleString('vi-VN')}đ each
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body1" sx={{ fontWeight: '600', color: '#333' }}>
                                                        Qty: {item.quantity}
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ color: '#D3212D', fontWeight: '600' }}>
                                                        {Number((item.dish?.price || 0) * item.quantity).toLocaleString('vi-VN')}đ
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))}
                                    </Box>
                                ) : (
                                    <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }}>No items found</Typography>
                                )}

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Guest Details</Typography>
                                <Typography><strong>Name:</strong> {orderDetails.guest?.guest_name || 'N/A'}</Typography>
                                <Typography><strong>Guest ID:</strong> {orderDetails.guest_id}</Typography>

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Table Details</Typography>
                                <Typography><strong>Name:</strong> {orderDetails.table?.table_name || 'N/A'}</Typography>
                                <Typography><strong>Table ID:</strong> {orderDetails.table_id}</Typography>
                                <Typography><strong>Capacity:</strong> {orderDetails.table?.capacity || 'N/A'}</Typography>
                                <Typography><strong>Table Status:</strong> {orderDetails.table?.status || 'N/A'}</Typography>
                                <Typography><strong>Payment Status:</strong> {orderDetails.table?.payment_status || 'N/A'}</Typography>

                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Order Handler</Typography>
                                <Typography><strong>Email:</strong> {orderDetails.orderHandler?.email || 'N/A'}</Typography>
                                <Typography><strong>Handler ID:</strong> {orderDetails.order_handler_id || 'N/A'}</Typography>
                            </>
                        ) : (
                            <Typography color="error" sx={{ textAlign: 'center', py: 2 }}>
                                Failed to load order details
                            </Typography>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ padding: theme.spacing(1.5, 3, 2, 3), backgroundColor: '#FFFFFF' }}>
                        <Button onClick={handleCloseDetailModal} sx={{ color: theme.palette.text.secondary, borderRadius: '8px' }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </PageContainer>
    );
};

export default OrdersDashboard;