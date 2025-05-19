import React, { useState, useEffect, useCallback } from 'react';
import {
    Container,
    Box,
    Typography,
    List,
    ListItem,
    ListItemText,
    Paper,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Divider,
    useTheme,
    useMediaQuery,
    InputAdornment,
    Chip, // Added Chip import
    Alert, // Added Alert import (was used in error display)
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import {
    FaPlus, FaEye, FaEdit, FaTrash, FaCalendarDay, FaHashtag, FaDollarSign, FaTable, FaBarcode
} from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import { notification } from 'antd';
import {
    getTransactionsApi, createTransactionApi, updateTransactionApi, deleteTransactionApi, getTablesApi
} from '../util/api';

// --- Styled Components ---
const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: '#FFFFFF', // Theme background color
    minHeight: 'calc(100vh - 56px - 56px)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
    flexWrap: 'wrap',
    gap: theme.spacing(2),
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

const TransactionListItem = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2, 3), // Consistent spacing (16px, 24px)
    marginBottom: theme.spacing(2), // Consistent spacing (16px)
    borderRadius: '12px', // Rounded corners
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'box-shadow 0.3s ease-in-out',
    '&:hover': {
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    },
}));

const FormContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(2.5),
    padding: theme.spacing(1, 0),
}));

const NoResultsContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6, 0),
    width: '100%',
    minHeight: '300px',
    border: `2px dashed ${theme.palette.grey[300]}`,
    borderRadius: '12px',
    backgroundColor: alpha(theme.palette.grey[100], 0.5)
}));
const PaymentsDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [transactions, setTransactions] = useState([]);
    const [tables, setTables] = useState([]); // For table_id dropdown
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentTransaction, setCurrentTransaction] = useState(null);
    const [formData, setFormData] = useState({
        transaction_id: '', id_zalopay: '', transaction_date: '',
        amount_in: '', amount_out: '', accumulated: '', table_id: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [modalLoading, setModalLoading] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

    const fetchTransactions = useCallback(async () => {
        setLoading(true); setError(null);
        try {
            const response = await getTransactionsApi(); // No filters for now
            if (response && response.data && response.statusCode === 200) {
                setTransactions(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response?.message || 'Failed to fetch transactions');
            }
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError(err.message || 'Could not load transactions.');
            notification.error({ message: 'Error fetching transactions', description: err.message || 'Could not load transactions.', placement: "bottomRight" });
            setTransactions([]);
        } finally { setLoading(false); }
    }, []);

    const fetchTablesForSelect = async () => {
        try {
            const tableRes = await getTablesApi({ limit: 1000 }); // Fetch all tables for dropdown
            setTables(Array.isArray(tableRes?.data?.tables) ? tableRes.data.tables : Array.isArray(tableRes?.data) ? tableRes.data : []);
        } catch (err) {
            console.error("Error fetching tables for select:", err);
            notification.error({ message: 'Error fetching tables', description: 'Could not load tables for form.', placement: "bottomRight" });
        }
    };

    useEffect(() => { fetchTransactions(); fetchTablesForSelect(); }, [fetchTransactions]);

    const resetFormData = () => {
        setFormData({
            transaction_id: '', id_zalopay: '', transaction_date: '',
            amount_in: '', amount_out: '', accumulated: '', table_id: '',
        });
        setFormErrors({});
    };

    const handleOpenModal = (transaction = null) => {
        if (transaction) {
            setIsEditMode(true); setCurrentTransaction(transaction);
            setFormData({
                transaction_id: transaction.transaction_id || '',
                id_zalopay: transaction.id_zalopay || '',
                transaction_date: transaction.transaction_date ? Number(transaction.transaction_date) : '', // Ensure number
                amount_in: transaction.amount_in?.toString() || '',
                amount_out: transaction.amount_out?.toString() || '',
                accumulated: transaction.accumulated?.toString() || '',
                table_id: transaction.table_id?.toString() || '',
            });
        } else {
            setIsEditMode(false); setCurrentTransaction(null); resetFormData();
        }
        setFormErrors({}); setIsModalOpen(true);
    };

    const handleCloseModal = () => { setIsModalOpen(false); setIsEditMode(false); setCurrentTransaction(null); resetFormData(); };

    const validateForm = () => {
        const errors = {};
        if (!formData.transaction_id.trim()) errors.transaction_id = "Transaction ID is required";
        if (!formData.id_zalopay.trim()) errors.id_zalopay = "ZaloPay ID is required";
        if (formData.transaction_date === '' || isNaN(Number(formData.transaction_date))) errors.transaction_date = "Transaction Date (timestamp) is required";
        if (formData.amount_in === '' || isNaN(Number(formData.amount_in))) errors.amount_in = "Amount In is required and must be a number";
        if (formData.amount_out === '' || isNaN(Number(formData.amount_out))) errors.amount_out = "Amount Out is required and must be a number";
        if (formData.accumulated === '' || isNaN(Number(formData.accumulated))) errors.accumulated = "Accumulated is required and must be a number";
        if (!formData.table_id) errors.table_id = "Table ID is required";
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleFormChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (formErrors[name]) { setFormErrors(prev => ({ ...prev, [name]: null })); }
    };

    const handleSubmitForm = async () => {
        if (!validateForm()) return;
        setModalLoading(true);
        try {
            const payload = {
                ...formData,
                transaction_date: Number(formData.transaction_date),
                amount_in: Number(formData.amount_in),
                amount_out: Number(formData.amount_out),
                accumulated: Number(formData.accumulated),
                table_id: Number(formData.table_id),
            };
            if (isEditMode && currentTransaction) {
                await updateTransactionApi(currentTransaction.transaction_id, payload);
                notification.success({ message: 'Success', description: 'Transaction updated successfully!', placement: "bottomRight" });
            } else {
                await createTransactionApi(payload);
                notification.success({ message: 'Success', description: 'Transaction created successfully!', placement: "bottomRight" });
            }
            fetchTransactions(); handleCloseModal();
        } catch (err) {
            console.error("Error submitting transaction form:", err);
            const apiError = err.response?.data?.message || err.message || 'Operation failed.';
            notification.error({ message: 'Error', description: Array.isArray(apiError) ? apiError.join('; ') : apiError, placement: "bottomRight" });
        } finally { setModalLoading(false); }
    };

    const handleOpenDetailModal = (transaction) => { setCurrentTransaction(transaction); setIsDetailModalOpen(true); };
    const handleCloseDetailModal = () => { setIsDetailModalOpen(false); setCurrentTransaction(null); };

    const handleDeleteTransaction = async (transactionId) => {
        if (window.confirm("Are you sure you want to delete this transaction?")) {
            try {
                await deleteTransactionApi(transactionId);
                notification.success({ message: "Transaction deleted successfully!", placement: "bottomRight" });
                fetchTransactions();
            } catch (err) {
                notification.error({ message: "Failed to delete transaction.", placement: "bottomRight" });
                console.error("Delete transaction error:", err);
            }
        }
    };

    const formatDateFromTimestamp = (timestamp) => {
        if (!timestamp) return 'N/A';
        try {
            return new Date(Number(timestamp)).toLocaleString('en-GB', {
                day: '2-digit', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
            });
        } catch (e) { return 'Invalid Date'; }
    };
    const formatCurrency = (amount) => `${Number(amount).toLocaleString('vi-VN')}đ`;

    if (loading) {
        return (
            <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)' }}>
                <CircularProgress sx={{ color: '#D3212D' }} />
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <HeaderBox>
                <Typography variant="h4" component="h1" sx={{ color: '#D3212D', fontWeight: 'bold' }}>
                    Payment Transactions
                </Typography>
            </HeaderBox>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {transactions.length === 0 && !loading && !error && (
                <NoResultsContainer>
                    <FaDollarSign size={60} color={theme.palette.grey[400]} style={{ marginBottom: theme.spacing(2) }} />
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 1 }}>No transactions found.</Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>Click "Add Transaction" to get started.</Typography>
                </NoResultsContainer>
            )}

            <List sx={{ backgroundColor: 'transparent' }}>
                {transactions.map((transaction) => (
                    <TransactionListItem key={transaction.transaction_id} elevation={2}>
                        <Grid container spacing={2} alignItems="center" justifyContent={"space-between"}>
                            <Grid item xs={12} md={9}>
                                <Typography variant="h6" sx={{ color: '#D3212D', fontWeight: 'bold', mb: 1 }}>
                                    ID: {transaction.transaction_id}
                                </Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}><FaBarcode /> ZaloPay ID: {transaction.id_zalopay}</Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}><FaCalendarDay /> Date: {formatDateFromTimestamp(transaction.transaction_date)}</Typography>
                                <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}><FaTable /> Table: {transaction.table?.table_name || `ID: ${transaction.table_id}`}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                    <Chip label={`In: ${formatCurrency(transaction.amount_in)}`} size="small" sx={{ backgroundColor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark, fontWeight: '500', borderRadius: '8px' }} />
                                    <Chip label={`Out: ${formatCurrency(transaction.amount_out)}`} size="small" sx={{ backgroundColor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark, fontWeight: '500', borderRadius: '8px' }} />
                                    <Chip label={`Balance: ${formatCurrency(transaction.accumulated)}`} size="small" sx={{ backgroundColor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark, fontWeight: '500', borderRadius: '8px' }} />
                                </Box>
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>Recorded: {formatDateFromTimestamp(transaction.created_at)}</Typography>
                            </Grid>
                            <Grid item xs={12} md={3} sx={{ display: 'flex', flexDirection: { xs: 'row', md: 'column' }, alignItems: 'center', justifyContent: { xs: 'flex-start', md: 'center' }, gap: 1, mt: { xs: 2, md: 0 } }}>
                                <Button variant="outlined" size="small" startIcon={<FaEye />} onClick={() => handleOpenDetailModal(transaction)} sx={{ borderRadius: '8px', borderColor: alpha(theme.palette.info.main, 0.7), color: theme.palette.info.main, '&:hover': { backgroundColor: alpha(theme.palette.info.main, 0.08) } }}>View</Button>
                                {/* <IconButton onClick={() => handleDeleteTransaction(transaction.transaction_id)} size="small" sx={{color: theme.palette.error.main}}><FaTrash /></IconButton> */}
                            </Grid>
                        </Grid>
                    </TransactionListItem>
                ))}
            </List>

            {/* Add/Edit Modal */}
            <Dialog open={isModalOpen} onClose={handleCloseModal} PaperProps={{ sx: { borderRadius: '12px', padding: theme.spacing(1), width: '100%', maxWidth: '600px' } }}>
                <DialogTitle sx={{ color: '#D3212D', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {isEditMode ? 'Edit Transaction' : 'Add New Transaction'}
                    <IconButton onClick={handleCloseModal}><CloseIcon /></IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <FormContainer>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Transaction ID" name="transaction_id" value={formData.transaction_id} onChange={handleFormChange} fullWidth required error={!!formErrors.transaction_id} helperText={formErrors.transaction_id} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' } }} disabled={isEditMode} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="ZaloPay ID" name="id_zalopay" value={formData.id_zalopay} onChange={handleFormChange} fullWidth required error={!!formErrors.id_zalopay} helperText={formErrors.id_zalopay} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField label="Transaction Date (Timestamp)" name="transaction_date" type="number" value={formData.transaction_date} onChange={handleFormChange} fullWidth required error={!!formErrors.transaction_date} helperText={formErrors.transaction_date} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' } }} />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth error={!!formErrors.table_id} size="small" required>
                                    <InputLabel>Table</InputLabel>
                                    <Select name="table_id" value={formData.table_id} label="Table" onChange={handleFormChange} sx={{ borderRadius: '8px' }}>
                                        <MenuItem value=""><em>Select Table</em></MenuItem>
                                        {tables.map(table => (<MenuItem key={table.table_id} value={table.table_id}>{table.table_name} (ID: {table.table_id})</MenuItem>))}
                                    </Select>
                                    {formErrors.table_id && <Typography variant="caption" color="error">{formErrors.table_id}</Typography>}
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Amount In" name="amount_in" type="number" value={formData.amount_in} onChange={handleFormChange} fullWidth required error={!!formErrors.amount_in} helperText={formErrors.amount_in} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' }, endAdornment: <InputAdornment position="end">đ</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Amount Out" name="amount_out" type="number" value={formData.amount_out} onChange={handleFormChange} fullWidth required error={!!formErrors.amount_out} helperText={formErrors.amount_out} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' }, endAdornment: <InputAdornment position="end">đ</InputAdornment> }} />
                            </Grid>
                            <Grid item xs={12} sm={4}>
                                <TextField label="Accumulated" name="accumulated" type="number" value={formData.accumulated} onChange={handleFormChange} fullWidth required error={!!formErrors.accumulated} helperText={formErrors.accumulated} size="small" sx={{ borderRadius: '8px' }} InputProps={{ sx: { borderRadius: '8px' }, endAdornment: <InputAdornment position="end">đ</InputAdornment> }} />
                            </Grid>
                        </Grid>
                    </FormContainer>
                </DialogContent>
                <DialogActions sx={{ padding: theme.spacing(2, 3, 3, 3) }}>
                    <Button onClick={handleCloseModal} sx={{ color: theme.palette.text.secondary, borderRadius: '8px' }} disabled={modalLoading}>Cancel</Button>
                    <Button onClick={handleSubmitForm} variant="contained" disabled={modalLoading} sx={{ background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)', '&:hover': { background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)' }, borderRadius: '8px' }}>
                        {modalLoading ? <CircularProgress size={24} color="inherit" /> : (isEditMode ? 'Save Changes' : 'Create Transaction')}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Detail Modal */}
            {currentTransaction && isDetailModalOpen && (
                <Dialog open={isDetailModalOpen} onClose={handleCloseDetailModal} PaperProps={{ sx: { borderRadius: '12px', padding: theme.spacing(1) } }} maxWidth="sm" fullWidth>
                    <DialogTitle sx={{ color: '#D3212D', fontWeight: 'bold', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        Transaction Details: {currentTransaction.transaction_id}
                        <IconButton onClick={handleCloseDetailModal}><CloseIcon /></IconButton>
                    </DialogTitle>
                    <DialogContent dividers sx={{ p: 3, backgroundColor: '#FFFFFF' }}>
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Transaction Info</Typography>
                        <Typography><strong>ZaloPay ID:</strong> {currentTransaction.id_zalopay}</Typography>
                        <Typography><strong>Date:</strong> {formatDateFromTimestamp(currentTransaction.transaction_date)}</Typography>
                        <Typography><strong>Amount In:</strong> {formatCurrency(currentTransaction.amount_in)}</Typography>
                        <Typography><strong>Amount Out:</strong> {formatCurrency(currentTransaction.amount_out)}</Typography>
                        <Typography><strong>Accumulated:</strong> {formatCurrency(currentTransaction.accumulated)}</Typography>
                        <Typography><strong>Recorded At:</strong> {formatDateFromTimestamp(currentTransaction.created_at)}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: '600' }}>Associated Table</Typography>
                        <Typography><strong>Table Name:</strong> {currentTransaction.table?.table_name || 'N/A'}</Typography>
                        <Typography><strong>Table ID:</strong> {currentTransaction.table_id}</Typography>
                        <Typography><strong>Payment Status:</strong> {currentTransaction.table?.payment_status || 'N/A'}</Typography>
                    </DialogContent>
                    <DialogActions sx={{ padding: theme.spacing(1.5, 3, 2, 3), backgroundColor: '#FFF8F0' }}>
                        <Button onClick={handleCloseDetailModal} sx={{ color: theme.palette.text.secondary, borderRadius: '8px' }}>Close</Button>
                    </DialogActions>
                </Dialog>
            )}
        </PageContainer>
    );
};

export default PaymentsDashboard;