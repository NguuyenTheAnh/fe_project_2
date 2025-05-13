import React, { useState, useContext, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Box,
    IconButton,
    InputAdornment,
    styled,
    useTheme,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Divider,
} from '@mui/material';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaSave, FaTimesCircle, FaKey, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import { AuthContext } from '../components/context/auth.context'; // Adjust path as needed
import { notification } from 'antd'; // Using Ant Design notification
import { useNavigate } from 'react-router-dom';
import { updateAccountApi } from '../util/api';
import { date } from 'yup';
import { Password } from '@mui/icons-material';

// Styled Components
const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(211, 33, 45, 0.2)'}`,
}));

const PageContainer = styled(Box)(({ theme }) => ({
    minHeight: 'calc(100vh - 64px - 48px)', // Adjust based on header/footer height
    padding: theme.spacing(2, 0),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
}));

const SectionTitle = styled(Typography)(({ theme }) => ({
    color: '#D3212D',
    marginBottom: theme.spacing(2.5),
    fontWeight: '600',
    borderBottom: `2px solid rgba(211, 33, 45, 0.2)`,
    paddingBottom: theme.spacing(1),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        borderRadius: '8px',
        '& fieldset': {
            borderColor: 'rgba(0, 0, 0, 0.23)',
        },
        '&:hover fieldset': {
            borderColor: '#F26649',
        },
        '&.Mui-focused fieldset': {
            borderColor: '#D3212D',
        },
    },
    '& .MuiInputLabel-root.Mui-focused': {
        color: '#D3212D',
    },
}));

const GradientButton = styled(Button)({
    background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
    borderRadius: 8,
    border: 0,
    color: 'white',
    height: 48,
    padding: '0 30px',
    boxShadow: '0 3px 5px 2px rgba(211, 33, 45, .3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 10px 4px rgba(211, 33, 45, .3)',
        background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
    },
});

const CancelButton = styled(Button)(({ theme }) => ({
    borderRadius: 8,
    border: `1px solid ${theme.palette.grey[400]}`,
    color: theme.palette.grey[700],
    height: 48,
    padding: '0 30px',
    marginRight: theme.spacing(2),
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.grey[500],
    },
}));

const ChangePasswordButton = styled(Button)(({ theme }) => ({
    color: '#D3212D',
    borderColor: 'rgba(211, 33, 45, 0.5)',
    borderRadius: 8,
    textTransform: 'none',
    padding: theme.spacing(1, 2),
    '&:hover': {
        backgroundColor: 'rgba(211, 33, 45, 0.08)',
        borderColor: '#D3212D',
    },
}));

const DeleteAccountButton = styled(Button)(({ theme }) => ({
    color: '#D3212D',
    borderColor: 'rgba(211, 33, 45, 0.5)',
    borderRadius: 8,
    textTransform: 'none',
    padding: theme.spacing(1, 2),
    '&:hover': {
        backgroundColor: 'rgba(211, 33, 45, 0.08)',
        borderColor: '#D3212D',
    },
}));

const DeleteButton = styled(Button)({
    background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
    borderRadius: 8,
    border: 0,
    color: 'white',
    padding: '8px 24px',
    boxShadow: '0 3px 5px 2px rgba(211, 33, 45, .3)',
    transition: 'all 0.3s ease',
    '&:hover': {
        boxShadow: '0 6px 10px 4px rgba(211, 33, 45, .3)',
        background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
    },
});

const ProfileSettings = () => {
    const { auth, setAuth } = useContext(AuthContext);
    const theme = useTheme();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
    });

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isCreatingNewPassword, setIsCreatingNewPassword] = useState(false);

    // Delete account states
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [deletePassword, setDeletePassword] = useState('');
    const [showDeletePassword, setShowDeletePassword] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (auth && auth.account) {
            setFormData(prev => ({
                ...prev,
                name: auth.account.name || '',
                email: auth.account.email || '',
                phone: auth.account.phone || '',
            }));
        }
    }, [auth]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleCreateNewPassword = () => {
        setIsCreatingNewPassword(prev => {
            if (!prev) {
                return true;
            } else {
                setFormData(currentData => ({
                    ...currentData,
                    newPassword: '',
                    confirmNewPassword: '',
                }));
                return false;
            }
        });
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (isCreatingNewPassword) {
            if (!formData.currentPassword) {
                notification.error({ message: 'Current Password Required', description: 'Please enter your current password to change it.' });
                setLoading(false);
                return;
            }
            if (formData.newPassword !== formData.confirmNewPassword) {
                notification.error({ message: 'Password Mismatch', description: 'New password and confirm password do not match.' });
                setLoading(false);
                return;
            }
            if (!formData.newPassword) {
                notification.error({ message: 'New Password Required', description: 'Please enter a new password.' });
                setLoading(false);
                return;
            }
        }

        console.log('Saving data:', formData);

        try {
            const { name, phone, newPassword } = formData;
            const dataUpdate = (newPassword) ? { name, phone, password: newPassword } : { name, phone };

            const res = await updateAccountApi(auth.account.account_id, dataUpdate);
            if (res && res.statusCode === 200) {
                notification.success({ message: 'Profile Updated', description: 'Your profile has been updated successfully.' });
            } else {
                notification.error({ message: 'Update Failed', description: 'Failed to update your profile. Please try again.' });
            }
        } catch (error) {
            console.error('Error saving data:', error);
            notification.error({ message: 'Error', description: 'An error occurred while saving your profile.' });
        }

        setTimeout(() => {
            setFormData(prev => ({
                ...prev,
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            }));
            setIsCreatingNewPassword(false);
            setLoading(false);
        }, 1500);
    };

    const handleCancel = () => {
        if (auth && auth.account) {
            setFormData({
                name: auth.account.name || '',
                email: auth.account.email || '',
                phone: auth.account.phone || '',
                currentPassword: '',
                newPassword: '',
                confirmNewPassword: '',
            });
        }
        setIsCreatingNewPassword(false);
        notification.info({ message: 'Changes Discarded', description: 'Your changes have been discarded.' });
    };

    // Delete account handlers
    const handleOpenDeleteDialog = () => {
        setDeleteDialogOpen(true);
        setDeletePassword('');
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDeletePassword('');
        setShowDeletePassword(false);
    };

    const handleDeleteAccount = async () => {
        if (!deletePassword) {
            notification.error({ message: 'Password Required', description: 'Please enter your password to confirm account deletion.' });
            return;
        }

        setDeleteLoading(true);

        // Simulate API call to delete account
        setTimeout(() => {
            // Here you would make an actual API call to delete the account
            // For example: await deleteAccountApi(auth.account.id, deletePassword);

            notification.success({
                message: 'Account Deleted',
                description: 'Your account has been successfully deleted.'
            });

            // Clear auth context and localStorage
            setAuth({
                isAuthenticated: false,
                account: {
                    account_id: "",
                    email: "",
                    role: ""
                }
            });
            localStorage.removeItem("access_token");

            // Redirect to login page
            navigate("/login");

            setDeleteLoading(false);
            setDeleteDialogOpen(false);
        }, 2000);
    };

    return (
        <PageContainer>
            <Container maxWidth="md">
                <StyledPaper elevation={3}>
                    <Typography variant="h4" component="h1" gutterBottom sx={{ color: '#D3212D', textAlign: 'center', fontWeight: 'bold', mb: 4 }}>
                        Profile Settings
                    </Typography>

                    <form onSubmit={handleSaveChanges}>
                        {/* Basic Information Section */}
                        <Box mb={4}>
                            <SectionTitle variant="h6">Basic Information</SectionTitle>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Full Name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><FaUser style={{ color: '#D3212D' }} /></InputAdornment>,
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Email"
                                        name="email"
                                        value={formData.email}
                                        variant="outlined"
                                        InputProps={{
                                            readOnly: true,
                                            startAdornment: <InputAdornment position="start"><FaEnvelope style={{ color: '#D3212D' }} /></InputAdornment>,
                                        }}
                                        helperText="Email cannot be changed."
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <StyledTextField
                                        fullWidth
                                        label="Phone Number"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        variant="outlined"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start"><FaPhone style={{ color: '#D3212D' }} /></InputAdornment>,
                                        }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        {/* Account Settings Section */}
                        <Box mb={4}>
                            <SectionTitle variant="h6">Account Settings</SectionTitle>
                            <Box>
                                {/* Current Password Section*/}
                                <Grid container spacing={3}>
                                    <Grid item xs={12}>
                                        <StyledTextField
                                            fullWidth
                                            label="Current Password"
                                            name="currentPassword"
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            variant="outlined"
                                            InputProps={{
                                                startAdornment: <InputAdornment position="start"><FaLock style={{ color: '#D3212D' }} /></InputAdornment>,
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)} edge="end">
                                                            {showCurrentPassword ? <FaEyeSlash /> : <FaEye />}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                </Grid>

                                {/* Create New Password Section - Dòng dưới */}
                                <Box sx={{ mt: 3 }}>
                                    {/* Nút Create New Password và mô tả */}
                                    <Grid container spacing={3}>
                                        <Grid item xs={12}>
                                            <Box display="flex" flexDirection="column" alignItems="flex-start">
                                                <ChangePasswordButton
                                                    variant="outlined"
                                                    onClick={handleToggleCreateNewPassword}
                                                    startIcon={<FaKey />}
                                                >
                                                    {isCreatingNewPassword ? 'Cancel New Password' : 'Create New Password'}
                                                </ChangePasswordButton>
                                                <Typography variant="body2" sx={{ mt: 1, color: 'gray' }}>
                                                    {isCreatingNewPassword ? "Required to set a new password" : "Enter if you wish to change your password"}
                                                </Typography>
                                            </Box>
                                        </Grid>
                                    </Grid>

                                    {/* Collapsible New Password Section */}
                                    <Collapse in={isCreatingNewPassword} timeout="auto" unmountOnExit>
                                        <Grid container spacing={2} sx={{ mt: 2 }}>
                                            <Grid item xs={12} md={6}>
                                                <StyledTextField
                                                    fullWidth
                                                    label="New Password"
                                                    name="newPassword"
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    value={formData.newPassword}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    disabled={!isCreatingNewPassword}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><FaLock style={{ color: '#D3212D' }} /></InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowNewPassword(!showNewPassword)} edge="end">
                                                                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <StyledTextField
                                                    fullWidth
                                                    label="Confirm New Password"
                                                    name="confirmNewPassword"
                                                    type={showConfirmNewPassword ? 'text' : 'password'}
                                                    value={formData.confirmNewPassword}
                                                    onChange={handleChange}
                                                    variant="outlined"
                                                    disabled={!isCreatingNewPassword}
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start"><FaLock style={{ color: '#D3212D' }} /></InputAdornment>,
                                                        endAdornment: (
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)} edge="end">
                                                                    {showConfirmNewPassword ? <FaEyeSlash /> : <FaEye />}
                                                                </IconButton>
                                                            </InputAdornment>
                                                        ),
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Collapse>
                                </Box>
                            </Box>
                        </Box>

                        {/* Actions Section */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
                            <CancelButton
                                variant="outlined"
                                onClick={handleCancel}
                                startIcon={<FaTimesCircle />}
                                disabled={loading}
                            >
                                Cancel
                            </CancelButton>
                            <GradientButton
                                type="submit"
                                variant="contained"
                                startIcon={<FaSave />}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Changes'}
                            </GradientButton>
                        </Box>
                    </form>

                    {/* Delete Account Section */}
                    <Box mt={6} pt={4} borderTop={1} borderColor="rgba(0, 0, 0, 0.12)">
                        <Typography variant="h6" color="error" gutterBottom fontWeight="500">
                            Danger Zone
                        </Typography>
                        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
                            <Box>
                                <Typography variant="body1" fontWeight="500">
                                    Delete Account
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Once you delete your account, there is no going back. Please be certain.
                                </Typography>
                            </Box>
                            <DeleteAccountButton
                                variant="outlined"
                                color="error"
                                onClick={handleOpenDeleteDialog}
                                startIcon={<FaTrash />}
                            >
                                Delete Account
                            </DeleteAccountButton>
                        </Box>
                    </Box>
                </StyledPaper>
            </Container>

            {/* Delete Account Confirmation Dialog */}
            <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-account-dialog-title"
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '8px',
                    }
                }}
            >
                <DialogTitle id="delete-account-dialog-title" sx={{ color: '#D3212D' }}>
                    <Box display="flex" alignItems="center">
                        <FaExclamationTriangle style={{ marginRight: '8px' }} />
                        Confirm Account Deletion
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText mb={3}>
                        This action cannot be undone. All your data will be permanently deleted.
                        Please enter your password to confirm.
                    </DialogContentText>
                    <StyledTextField
                        autoFocus
                        margin="dense"
                        label="Password"
                        type={showDeletePassword ? 'text' : 'password'}
                        fullWidth
                        variant="outlined"
                        value={deletePassword}
                        onChange={(e) => setDeletePassword(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><FaLock style={{ color: '#D3212D' }} /></InputAdornment>,
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton onClick={() => setShowDeletePassword(!showDeletePassword)} edge="end">
                                        {showDeletePassword ? <FaEyeSlash /> : <FaEye />}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button onClick={handleCloseDeleteDialog} sx={{ color: 'gray' }}>
                        Cancel
                    </Button>
                    <DeleteButton
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                    </DeleteButton>
                </DialogActions>
            </Dialog>
        </PageContainer>
    );
};

export default ProfileSettings;