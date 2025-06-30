import React, { useState, useEffect } from 'react';
import {
    Container,
    Box,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    useTheme,
    useMediaQuery,
    Chip,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaPlus, FaEye, FaTrash, FaUsers, FaExclamationTriangle } from 'react-icons/fa';
import { notification } from 'antd';
import { getAccountApi, createUserApi, getAccountByIdApi, updateAccountApi, deleteAccountApi } from '../util/api';

// Styled Components
const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 56px - 56px)',
}));

const HeaderBox = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: theme.spacing(4),
    padding: theme.spacing(3),
    background: '#FFFFFF',
    borderRadius: '16px',

}));

const ActionButton = styled(Button)(({ theme }) => ({
    background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
    color: 'white',
    borderRadius: '12px',
    padding: theme.spacing(1.5, 3),
    fontWeight: 'bold',
    textTransform: 'none',
    boxShadow: '0 4px 12px rgba(211, 33, 45, 0.3)',
    '&:hover': {
        background: 'linear-gradient(135deg, #B01E28 0%, #E5593D 100%)',
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 16px rgba(211, 33, 45, 0.4)',
    },
    transition: 'all 0.3s ease-in-out',
}));

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid rgba(211, 33, 45, 0.1)',
    background: '#FFFFFF',
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
    background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
    '& .MuiTableCell-head': {
        color: 'white',
        fontWeight: 'bold',
        fontSize: '1rem',
    },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: '#FAFAFA',
    },
    '&:hover': {
        backgroundColor: '#FFF8F0',
        transform: 'scale(1.001)',
        transition: 'all 0.2s ease-in-out',
    },
}));

const NoDataBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(6),
    textAlign: 'center',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
    borderRadius: '16px',
    border: '2px dashed #D3212D',
    margin: theme.spacing(3, 0),
}));

const ActionIconButton = styled(IconButton)(({ theme, actiontype }) => ({
    margin: theme.spacing(0, 0.5),
    padding: theme.spacing(1),
    borderRadius: '8px',
    transition: 'all 0.2s ease-in-out',
    ...(actiontype === 'view' && {
        color: '#2196F3',
        '&:hover': {
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            transform: 'scale(1.1)',
        },
    }),
    ...(actiontype === 'delete' && {
        color: '#F44336',
        '&:hover': {
            backgroundColor: 'rgba(244, 67, 54, 0.1)',
            transform: 'scale(1.1)',
        },
    }),
}));

const ManagementPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openViewDialog, setOpenViewDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [employeeToDelete, setEmployeeToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [newEmployee, setNewEmployee] = useState({
        email: '',
        password: '',
        role: 'Employee'
    });

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getAccountApi({ role: 'Employee' }); // Change to match API response format
            if (response && response.data && response.statusCode === 200) {
                setEmployees(Array.isArray(response.data) ? response.data : []);
            } else {
                throw new Error(response?.message || 'Failed to fetch employees');
            }
        } catch (err) {
            console.error("Error fetching employees:", err);
            setError(err.message || 'Could not load employee data.');
            notification.error({
                message: 'Error fetching data',
                description: err.message || 'Could not load employee data.',
                placement: "topRight"
            });
            setEmployees([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleAddEmployee = async () => {
        try {
            const response = await createUserApi(newEmployee.email, newEmployee.password, newEmployee.role);
            if (response && response.statusCode === 201) {
                notification.success({
                    message: 'Success',
                    description: 'Employee added successfully!',
                    placement: "topRight"
                });
                setOpenAddDialog(false);
                setNewEmployee({ email: '', password: '', role: 'Employee' });
                fetchEmployees();
            } else {
                throw new Error(response?.message || 'Failed to add employee');
            }
        } catch (err) {
            notification.error({
                message: 'Error',
                description: err.message || 'Could not add employee.',
                placement: "topRight"
            });
        }
    };

    const handleViewEmployee = async (employeeId) => {
        try {
            const response = await getAccountByIdApi(employeeId);
            if (response && response.data && response.statusCode === 200) {
                setSelectedEmployee(response.data);
                setOpenViewDialog(true);
            } else {
                throw new Error(response?.message || 'Failed to fetch employee details');
            }
        } catch (err) {
            notification.error({
                message: 'Error',
                description: err.message || 'Could not fetch employee details.',
                placement: "topRight"
            });
        }
    };

    const handleDeleteClick = (employee) => {
        setEmployeeToDelete(employee);
        setOpenDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!employeeToDelete) return;

        setDeleteLoading(true);
        try {
            const response = await deleteAccountApi(employeeToDelete.account_id);
            if (response && response.statusCode === 200) {
                notification.success({
                    message: 'Success',
                    description: `Employee ${employeeToDelete.email} has been deleted successfully!`,
                    placement: "topRight"
                });
                setOpenDeleteDialog(false);
                setEmployeeToDelete(null);
                fetchEmployees(); // Refresh the list
            } else {
                throw new Error(response?.message || 'Failed to delete employee');
            }
        } catch (err) {
            notification.error({
                message: 'Error',
                description: err.message || 'Could not delete employee.',
                placement: "topRight"
            });
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleCancelDelete = () => {
        setOpenDeleteDialog(false);
        setEmployeeToDelete(null);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <PageContainer sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 'calc(100vh - 112px)' }}>
                <CircularProgress sx={{ color: '#D3212D' }} />
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="xl">
            {/* Header */}
            <HeaderBox>
                <FaUsers size={36} color="#D3212D" style={{ marginBottom: 12 }} />
                <Typography variant="h4" component="h1" sx={{ color: '#D3212D', fontWeight: 'bold', mb: 0.5 }}>
                    Employee Management
                </Typography>
                <Typography variant="body1" sx={{ color: '#666', fontWeight: 'normal' }}>
                    Manage your restaurant staff accounts
                </Typography>
            </HeaderBox>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            {/* Add Employee Button */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4 }}>
                <ActionButton
                    startIcon={<FaPlus />}
                    onClick={() => setOpenAddDialog(true)}
                    size="medium"
                >
                    Add New Employee
                </ActionButton>
            </Box>

            {/* Employee Table */}
            {employees.length === 0 ? (
                <NoDataBox>
                    <FaUsers size={64} color="#D3212D" style={{ marginBottom: 16, opacity: 0.5 }} />
                    <Typography variant="h5" sx={{ color: '#D3212D', fontWeight: 'bold', mb: 2 }}>
                        No Employees Found
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
                        You haven't added any employees yet. Click the button above to add your first employee.
                    </Typography>
                </NoDataBox>
            ) : (
                <StyledTableContainer component={Paper}>
                    <Table>
                        <StyledTableHead>
                            <TableRow>
                                <TableCell>ID</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell>Created At</TableCell>
                                <TableCell align="center">Actions</TableCell>
                            </TableRow>
                        </StyledTableHead>
                        <TableBody>
                            {employees.map((employee) => (
                                <StyledTableRow key={employee.account_id}>
                                    <TableCell>
                                        <Chip
                                            label={`#${employee.account_id}`}
                                            size="small"
                                            sx={{
                                                background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                                color: 'white',
                                                fontWeight: 'bold'
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 'medium' }}>
                                        {employee.email}
                                    </TableCell>
                                    <TableCell sx={{ color: '#666' }}>
                                        {formatDate(employee.created_at)}
                                    </TableCell>
                                    <TableCell align="center">
                                        <ActionIconButton
                                            actiontype="view"
                                            onClick={() => handleViewEmployee(employee.account_id)}
                                            title="View Employee"
                                        >
                                            <FaEye />
                                        </ActionIconButton>
                                        <ActionIconButton
                                            actiontype="delete"
                                            onClick={() => handleDeleteClick(employee)}
                                            title="Delete Employee"
                                        >
                                            <FaTrash />
                                        </ActionIconButton>
                                    </TableCell>
                                </StyledTableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            )}

            {/* Add Employee Dialog */}
            <Dialog
                open={openAddDialog}
                onClose={() => setOpenAddDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    color: '#D3212D',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                }}>
                    Add New Employee
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2 }}>
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={newEmployee.email}
                            onChange={(e) => setNewEmployee({ ...newEmployee, email: e.target.value })}
                            margin="normal"
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            fullWidth
                            label="Password"
                            type="password"
                            value={newEmployee.password}
                            onChange={(e) => setNewEmployee({ ...newEmployee, password: e.target.value })}
                            margin="normal"
                            sx={{ mb: 2 }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2 }}>
                    <Button
                        onClick={() => setOpenAddDialog(false)}
                        sx={{ borderRadius: '8px' }}
                    >
                        Cancel
                    </Button>
                    <ActionButton
                        onClick={handleAddEmployee}
                        disabled={!newEmployee.email || !newEmployee.password}
                    >
                        Add Employee
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* View Employee Dialog */}
            <Dialog
                open={openViewDialog}
                onClose={() => setOpenViewDialog(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    color: '#D3212D',
                    fontWeight: 'bold',
                    fontSize: '1.5rem'
                }}>
                    Employee Details
                </DialogTitle>
                <DialogContent>
                    {selectedEmployee && (
                        <Box sx={{ pt: 2 }}>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                <strong>ID:</strong> #{selectedEmployee.account_id}
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                <strong>Email:</strong> {selectedEmployee.email}
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                <strong>Role:</strong>
                                <Chip
                                    label={selectedEmployee.role}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        background: 'linear-gradient(135deg, #D3212D 0%, #F26649 100%)',
                                        color: 'white'
                                    }}
                                />
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                <strong>Status:</strong>
                                <Chip
                                    label={selectedEmployee.is_active ? 'Active' : 'Inactive'}
                                    size="small"
                                    sx={{
                                        ml: 1,
                                        background: selectedEmployee.is_active
                                            ? 'linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)'
                                            : 'linear-gradient(135deg, #F44336 0%, #EF5350 100%)',
                                        color: 'white'
                                    }}
                                />
                            </Typography>
                            <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                <strong>Created:</strong> {formatDate(selectedEmployee.created_at)}
                            </Typography>
                            {selectedEmployee.updated_at && (
                                <Typography variant="h6" sx={{ mb: 2, color: '#333' }}>
                                    <strong>Updated:</strong> {formatDate(selectedEmployee.updated_at)}
                                </Typography>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <ActionButton onClick={() => setOpenViewDialog(false)}>
                        Close
                    </ActionButton>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog
                open={openDeleteDialog}
                onClose={handleCancelDelete}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFF8F0 100%)',
                        border: '2px solid #F44336',
                    }
                }}
            >
                <DialogTitle sx={{
                    textAlign: 'center',
                    color: '#F44336',
                    fontWeight: 'bold',
                    fontSize: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2
                }}>
                    <FaExclamationTriangle size={24} />
                    Confirm Delete
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 2, textAlign: 'center' }}>
                        <FaTrash size={48} color="#F44336" style={{ marginBottom: 16, opacity: 0.7 }} />
                        <Typography variant="h6" sx={{ mb: 2, color: '#333', fontWeight: 'bold' }}>
                            Are you sure you want to delete this employee?
                        </Typography>
                        {employeeToDelete && (
                            <Box sx={{
                                background: 'rgba(244, 67, 54, 0.1)',
                                padding: 2,
                                borderRadius: 2,
                                border: '1px solid rgba(244, 67, 54, 0.3)',
                                mb: 2
                            }}>
                                <Typography variant="body1" sx={{ mb: 1, color: '#333' }}>
                                    <strong>ID:</strong> #{employeeToDelete.account_id}
                                </Typography>
                                <Typography variant="body1" sx={{ mb: 1, color: '#333' }}>
                                    <strong>Email:</strong> {employeeToDelete.email}
                                </Typography>
                                <Typography variant="body1" sx={{ color: '#333' }}>
                                    <strong>Role:</strong> {employeeToDelete.role}
                                </Typography>
                            </Box>
                        )}
                        <Typography variant="body2" sx={{ color: '#666', fontStyle: 'italic' }}>
                            This action cannot be undone. All data related to this employee will be permanently removed.
                        </Typography>
                    </Box>
                </DialogContent>
                <DialogActions sx={{ p: 3, gap: 2, justifyContent: 'center' }}>
                    <Button
                        onClick={handleCancelDelete}
                        variant="outlined"
                        sx={{
                            borderRadius: '8px',
                            borderColor: '#666',
                            color: '#666',
                            '&:hover': {
                                borderColor: '#333',
                                backgroundColor: 'rgba(102, 102, 102, 0.1)'
                            }
                        }}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        variant="contained"
                        sx={{
                            borderRadius: '8px',
                            background: 'linear-gradient(135deg, #F44336 0%, #E53935 100%)',
                            color: 'white',
                            fontWeight: 'bold',
                            '&:hover': {
                                background: 'linear-gradient(135deg, #D32F2F 0%, #C62828 100%)',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(244, 67, 54, 0.4)',
                            },
                            '&:disabled': {
                                background: '#ccc',
                                color: '#666'
                            },
                            transition: 'all 0.3s ease-in-out',
                        }}
                        disabled={deleteLoading}
                        startIcon={deleteLoading ? <CircularProgress size={16} color="inherit" /> : <FaTrash />}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Employee'}
                    </Button>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default ManagementPage;