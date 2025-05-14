import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Grid,
    Card,
    CardMedia,
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
} from '@mui/material';
import { styled } from '@mui/system';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import axios from 'axios';
import { notification } from 'antd';
import { createDishApi, deleteDishApi, getDishApi, updateDishApi, uploadDishImageApi } from '../util/apiDish';

// Styled components with fixed dimensions
const DishCardWrapper = styled(Box)(({ theme }) => ({
    width: '100%',
    height: '100%',
    display: 'flex',
    justifyContent: 'center',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    width: '320px', // Fixed width
    height: '400px', // Fixed height
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

const StyledCardMedia = styled(CardMedia)({
    height: '200px', // Fixed height for image
    backgroundSize: 'cover',
    backgroundPosition: 'center',
});

const StyledCardContent = styled(CardContent)({
    flexGrow: 1,
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    height: '140px', // Fixed height for content
    overflow: 'hidden',
});

const StyledCardActions = styled(CardActions)({
    padding: '8px 16px 16px 16px',
    justifyContent: 'space-between',
    height: '60px', // Fixed height for actions
});

const DishName = styled(Typography)({
    fontWeight: 'bold',
    wordBreak: 'break-word', // Allow text to wrap naturally
    lineHeight: '1.2em',
    maxHeight: '2.4em', // Allow up to 2 lines
    overflow: 'hidden',
});

const PriceChip = styled(Chip)(({ theme }) => ({
    backgroundColor: '#D3212D',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.9rem',
}));

const StatusChip = styled(Chip)(({ status }) => ({
    backgroundColor: status === 'Available' ? '#4CAF50' : '#F44336',
    color: 'white',
    fontWeight: 'bold',
    fontSize: '0.85rem',
}));

const CategoryChip = styled(Chip)({
    backgroundColor: '#FFE4D6',
    color: '#D3212D',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    marginRight: '8px',
});

const ActionButton = styled(Button)(({ color }) => ({
    borderRadius: '8px',
    textTransform: 'none',
    minWidth: 'auto',
    padding: '6px 12px',
    backgroundColor: color === 'edit' ? '#4CAF50' : color === 'delete' ? '#F44336' : '#D3212D',
    color: 'white',
    '&:hover': {
        backgroundColor: color === 'edit' ? '#3d8b40' : color === 'delete' ? '#d32f2f' : '#b71c1c',
    },
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

const DishesDashboard = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State variables for dish listing
    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(6);
    const [category, setCategory] = useState('');
    const [status, setStatus] = useState('');
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState('');
    const [totalItems, setTotalItems] = useState(0);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedDish, setSelectedDish] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    // State variables for add dish modal
    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        dish_name: '',
        price: '',
        category: '',
        status: '',
        image_name: null,
        description: '',
    });
    const [formErrors, setFormErrors] = useState({});
    const [addLoading, setAddLoading] = useState(false);

    // State variables for edit dish modal
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        dish_id: '',
        dish_name: '',
        price: '',
        category: '',
        status: '',
        image_name: null,
        existing_image: '',
        description: '',
    });
    const [editFormErrors, setEditFormErrors] = useState({});
    const [editLoading, setEditLoading] = useState(false);

    // Fetch dishes from API
    const fetchDishes = async () => {
        setLoading(true);
        try {
            const params = {
                page,
                limit,
                ...(category && { category }),
                ...(status && { status }),
                ...(search && { search }),
                ...(sort && { sort }),
            };

            const response = await getDishApi(params);

            if (response && response.statusCode === 200) {
                const { totalDishes, totalPage, currentPage, dishes: dishesData } = response.data;
                setDishes(dishesData || []);
                setTotalPages(totalPage || 1);
                setTotalItems(totalDishes || 0);
            } else {
                throw new Error('Failed to fetch dishes');
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to load dishes. Please try again later.',
            });
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch and refetch when filters change
    useEffect(() => {
        fetchDishes();
    }, [page, limit, category, status, sort]);

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page !== 1) {
                setPage(1); // Reset to first page when search changes
            } else {
                fetchDishes();
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [search]);

    // Handle page change
    const handlePageChange = (event, value) => {
        setPage(value);
    };

    // Handle search input change
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
    };

    // Toggle sort order
    const handleSortToggle = () => {
        setSort(sort === 'asc' ? 'desc' : 'asc');
    };

    // Open delete confirmation dialog
    const handleOpenDeleteDialog = (dish) => {
        setSelectedDish(dish);
        setDeleteDialogOpen(true);
    };

    // Close delete confirmation dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setSelectedDish(null);
    };

    // Delete dish
    const handleDeleteDish = async () => {
        if (!selectedDish) return;

        setDeleteLoading(true);
        try {
            await deleteDishApi(selectedDish.dish_id);

            notification.success({
                message: 'Success',
                description: 'Dish deleted successfully!',
            });

            fetchDishes();
        } catch (error) {
            console.error('Error deleting dish:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to delete dish. Please try again.',
            });
        } finally {
            setDeleteLoading(false);
            handleCloseDeleteDialog();
        }
    };

    // Handle edit dish
    const handleEditDish = (dish) => {
        setEditFormData({
            dish_id: dish.dish_id,
            dish_name: dish.dish_name || '',
            price: dish.price || '',
            category: dish.category || '',
            status: dish.status || 'Available',
            image_name: null,
            existing_image: dish.image_name || '',
            description: dish.description || '',
        });
        setEditFormErrors({});
        setEditDialogOpen(true);
    };

    // Handle close edit dialog
    const handleCloseEditDialog = () => {
        setEditDialogOpen(false);
        setEditFormData({
            dish_id: '',
            dish_name: '',
            price: '',
            category: '',
            status: '',
            image_name: null,
            existing_image: '',
            description: '',
        });
        setEditFormErrors({});
    };

    // Handle edit form change
    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData((prev) => ({ ...prev, [name]: value }));
        setEditFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    // Handle image change for edit
    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setEditFormData((prev) => ({ ...prev, image_name: file }));
            setEditFormErrors((prev) => ({ ...prev, image_name: '' }));
        } else {
            setEditFormErrors((prev) => ({
                ...prev,
                image_name: 'Please upload a valid image (PNG, JPG)',
            }));
        }
    };

    // Validate edit form
    const validateEditForm = () => {
        const errors = {};
        if (!editFormData.dish_name.trim()) errors.dish_name = 'Dish name is required';
        if (!editFormData.price || editFormData.price <= 0) errors.price = 'Price must be a positive number';
        if (!editFormData.category) errors.category = 'Category is required';
        if (!editFormData.status) errors.status = 'Status is required';
        if (!editFormData.image_name && !editFormData.existing_image) errors.image_name = 'Image is required';
        return errors;
    };

    // Handle save edited dish
    const handleSaveEditDish = async () => {
        const errors = validateEditForm();
        if (Object.keys(errors).length > 0) {
            setEditFormErrors(errors);
            return;
        }

        setEditLoading(true);
        try {
            let imageName = editFormData.existing_image;

            // Upload new image if provided
            if (editFormData.image_name) {
                const formDataImage = new FormData();
                formDataImage.append('imageUpload', editFormData.image_name);
                const uploadResponse = await uploadDishImageApi(formDataImage);

                if (uploadResponse.statusCode !== 201) {
                    throw new Error('Failed to upload image');
                }
                imageName = uploadResponse.data.fileName;
            }

            // Prepare dish data for update
            const dishData = {
                dish_name: editFormData.dish_name,
                price: parseFloat(editFormData.price),
                image_name: imageName,
                status: editFormData.status,
                category: editFormData.category,
                description: editFormData.description || null,
            };

            // Send PATCH request
            const updateResponse = await updateDishApi(editFormData.dish_id, dishData);

            if (updateResponse.statusCode === 200) {
                notification.success({
                    message: 'Success',
                    description: 'Dish updated successfully!',
                });
                fetchDishes();
                handleCloseEditDialog();
            } else {
                throw new Error('Failed to update dish');
            }
        } catch (error) {
            console.error('Error updating dish:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to update dish. Please try again.',
            });
        } finally {
            setEditLoading(false);
        }
    };

    // Handle add new dish modal
    const handleOpenAddDialog = () => {
        setAddDialogOpen(true);
    };

    const handleCloseAddDialog = () => {
        setAddDialogOpen(false);
        setFormData({
            dish_name: '',
            price: '',
            category: '',
            status: '',
            image_name: null,
            description: '',
        });
        setFormErrors({});
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: '' }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file && ['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
            setFormData((prev) => ({ ...prev, image_name: file }));
            setFormErrors((prev) => ({ ...prev, image_name: '' }));
        } else {
            setFormErrors((prev) => ({
                ...prev,
                image_name: 'Please upload a valid image (PNG, JPG)',
            }));
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!formData.dish_name.trim()) errors.dish_name = 'Dish name is required';
        if (!formData.price || formData.price <= 0) errors.price = 'Price must be a positive number';
        if (!formData.category) errors.category = 'Category is required';
        if (!formData.status) errors.status = 'Status is required';
        if (!formData.image_name) errors.image_name = 'Image is required';
        return errors;
    };

    const handleAddDish = async () => {
        const errors = validateForm();
        if (Object.keys(errors).length > 0) {
            setFormErrors(errors);
            return;
        }

        setAddLoading(true);
        try {
            // Upload image
            const formDataImage = new FormData();
            formDataImage.append('imageUpload', formData.image_name);
            const uploadResponse = await uploadDishImageApi(formDataImage);

            if (uploadResponse.statusCode !== 201) {
                throw new Error('Failed to upload image');
            }

            const imageName = uploadResponse.data.fileName;

            // Create dish
            const dishData = {
                dish_name: formData.dish_name,
                price: parseFloat(formData.price),
                image_name: imageName,
                status: formData.status,
                category: formData.category,
                description: formData.description || null,
            };

            const createResponse = await createDishApi(dishData);

            if (createResponse.statusCode === 201) {
                notification.success({
                    message: 'Success',
                    description: 'Dish added successfully!',
                });
                fetchDishes();
                handleCloseAddDialog();
            } else {
                throw new Error('Failed to create dish');
            }
        } catch (error) {
            console.error('Error adding dish:', error);
            notification.error({
                message: 'Error',
                description: 'Failed to add dish. Please try again.',
            });
        } finally {
            setAddLoading(false);
        }
    };

    // Function to get image URL
    const getImageUrl = (imageName) => {
        if (!imageName) return 'https://via.placeholder.com/300x225?text=No+Image';
        return `http://localhost:8000/images/${imageName}`;
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="h4" component="h1" sx={{ color: '#D3212D', fontWeight: 'bold', mb: { xs: 2, md: 0 } }}>
                    Menu Management
                </Typography>
                <AddButton
                    startIcon={<FaPlus />}
                    onClick={handleOpenAddDialog}
                >
                    Add New Dish
                </AddButton>
            </Box>

            <FilterContainer>
                <TextField
                    placeholder="Search dishes..."
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
                    <InputLabel>Category</InputLabel>
                    <Select
                        value={category}
                        label="Category"
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        <MenuItem value="">All Categories</MenuItem>
                        <MenuItem value="Chicken">Chicken</MenuItem>
                        <MenuItem value="Water">Water</MenuItem>
                    </Select>
                </FormControl>

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
                    Price: {sort === 'asc' ? 'Low to High' : 'High to Low'}
                </Button>
            </FilterContainer>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#D3212D' }} />
                </Box>
            ) : dishes.length > 0 ? (
                <>
                    <Grid container spacing={3} justifyContent="center">
                        {dishes.map((dish) => (
                            <Grid item xs={12} sm={6} md={4} key={dish.dish_id}>
                                <DishCardWrapper>
                                    <StyledCard>
                                        <StyledCardMedia
                                            image={getImageUrl(dish.image_name)}
                                            title={dish.dish_name}
                                        />
                                        <StyledCardContent>
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                                <StatusChip
                                                    label={dish.status || 'Available'}
                                                    status={dish.status || 'Available'}
                                                    size="small"
                                                />
                                                <PriceChip
                                                    label={`${dish.price?.toLocaleString() || 0}₫`}
                                                    size="small"
                                                />
                                            </Box>
                                            <DishName gutterBottom variant="h6" component="div">
                                                {dish.dish_name}
                                            </DishName>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 'auto' }}>
                                                <CategoryChip label={dish.category || 'Uncategorized'} size="small" />
                                            </Box>
                                        </StyledCardContent>
                                        <StyledCardActions>
                                            <ActionButton
                                                size="small"
                                                startIcon={<FaEdit />}
                                                color="edit"
                                                onClick={() => handleEditDish(dish)}
                                            >
                                                Edit
                                            </ActionButton>
                                            <ActionButton
                                                size="small"
                                                startIcon={<FaTrash />}
                                                color="delete"
                                                onClick={() => handleOpenDeleteDialog(dish)}
                                            >
                                                Delete
                                            </ActionButton>
                                        </StyledCardActions>
                                    </StyledCard>
                                </DishCardWrapper>
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
                        Showing {dishes.length} of {totalItems} dishes
                    </Typography>
                </>
            ) : (
                <NoResultsContainer>
                    <Typography variant="h6" sx={{ color: 'text.secondary', mb: 2 }}>
                        No dishes found
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                        Try adjusting your search or filters
                    </Typography>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSearch('');
                            setCategory('');
                            setStatus('');
                            setSort('');
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
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '8px',
                    }
                }}
            >
                <DialogTitle sx={{ color: '#D3212D' }}>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete "{selectedDish?.dish_name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px' }}>
                    <Button
                        onClick={handleCloseDeleteDialog}
                        sx={{ color: 'gray' }}
                        disabled={deleteLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleDeleteDish}
                        variant="contained"
                        color="error"
                        disabled={deleteLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
                            },
                        }}
                    >
                        {deleteLoading ? 'Deleting...' : 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add New Dish Dialog */}
            <Dialog
                open={addDialogOpen}
                onClose={handleCloseAddDialog}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '8px',
                        width: '100%',
                        maxWidth: '500px',
                    }
                }}
            >
                <DialogTitle sx={{ color: '#D3212D' }}>
                    Add New Dish
                </DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            label="Dish Name"
                            name="dish_name"
                            value={formData.dish_name}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            error={!!formErrors.dish_name}
                            helperText={formErrors.dish_name}
                        />
                        <TextField
                            label="Price"
                            name="price"
                            type="number"
                            value={formData.price}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            error={!!formErrors.price}
                            helperText={formErrors.price}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                            }}
                        />
                        <FormControl size="small" fullWidth error={!!formErrors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={formData.category}
                                label="Category"
                                onChange={handleFormChange}
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="Chicken">Chicken</MenuItem>
                                <MenuItem value="Water">Water</MenuItem>
                            </Select>
                            {formErrors.category && (
                                <Typography variant="caption" color="error">
                                    {formErrors.category}
                                </Typography>
                            )}
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!formErrors.status}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                label="Status"
                                onChange={handleFormChange}
                            >
                                <MenuItem value="">Select Status</MenuItem>
                                <MenuItem value="Available">Available</MenuItem>
                                <MenuItem value="Unavailable">Unavailable</MenuItem>
                            </Select>
                            {formErrors.status && (
                                <Typography variant="caption" color="error">
                                    {formErrors.status}
                                </Typography>
                            )}
                        </FormControl>
                        <Box>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{
                                    background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
                                    },
                                }}
                            >
                                Upload Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleImageChange}
                                />
                            </Button>
                            {formData.image_name && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected: {formData.image_name.name}
                                </Typography>
                            )}
                            {formErrors.image_name && (
                                <Typography variant="caption" color="error">
                                    {formErrors.image_name}
                                </Typography>
                            )}
                        </Box>
                        <TextField
                            label="Description (Optional)"
                            name="description"
                            value={formData.description}
                            onChange={handleFormChange}
                            size="small"
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </FormContainer>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleCloseAddDialog}
                        sx={{ color: 'gray' }}
                        disabled={addLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleAddDish}
                        variant="contained"
                        disabled={addLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
                            },
                        }}
                    >
                        {addLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Dish Dialog */}
            <Dialog
                open={editDialogOpen}
                onClose={handleCloseEditDialog}
                PaperProps={{
                    sx: {
                        borderRadius: '12px',
                        padding: '8px',
                        width: '100%',
                        maxWidth: '500px',
                    }
                }}
            >
                <DialogTitle sx={{ color: '#D3212D' }}>
                    Edit Dish
                </DialogTitle>
                <DialogContent>
                    <FormContainer>
                        <TextField
                            label="Dish Name"
                            name="dish_name"
                            value={editFormData.dish_name}
                            onChange={handleEditFormChange}
                            size="small"
                            fullWidth
                            error={!!editFormErrors.dish_name}
                            helperText={editFormErrors.dish_name}
                        />
                        <TextField
                            label="Price"
                            name="price"
                            type="number"
                            value={editFormData.price}
                            onChange={handleEditFormChange}
                            size="small"
                            fullWidth
                            error={!!editFormErrors.price}
                            helperText={editFormErrors.price}
                            InputProps={{
                                endAdornment: <InputAdornment position="end">₫</InputAdornment>,
                            }}
                        />
                        <FormControl size="small" fullWidth error={!!editFormErrors.category}>
                            <InputLabel>Category</InputLabel>
                            <Select
                                name="category"
                                value={editFormData.category}
                                label="Category"
                                onChange={handleEditFormChange}
                            >
                                <MenuItem value="">Select Category</MenuItem>
                                <MenuItem value="Chicken">Chicken</MenuItem>
                                <MenuItem value="Water">Water</MenuItem>
                            </Select>
                            {editFormErrors.category && (
                                <Typography variant="caption" color="error">
                                    {editFormErrors.category}
                                </Typography>
                            )}
                        </FormControl>
                        <FormControl size="small" fullWidth error={!!editFormErrors.status}>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={editFormData.status}
                                label="Status"
                                onChange={handleEditFormChange}
                            >
                                <MenuItem value="">Select Status</MenuItem>
                                <MenuItem value="Available">Available</MenuItem>
                                <MenuItem value="Unavailable">Unavailable</MenuItem>
                            </Select>
                            {editFormErrors.status && (
                                <Typography variant="caption" color="error">
                                    {editFormErrors.status}
                                </Typography>
                            )}
                        </FormControl>
                        <Box>
                            <Button
                                variant="contained"
                                component="label"
                                sx={{
                                    background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
                                    },
                                }}
                            >
                                Upload New Image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleEditImageChange}
                                />
                            </Button>
                            {editFormData.image_name && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Selected: {editFormData.image_name.name}
                                </Typography>
                            )}
                            {editFormData.existing_image && !editFormData.image_name && (
                                <Typography variant="body2" sx={{ mt: 1 }}>
                                    Current: {editFormData.existing_image}
                                </Typography>
                            )}
                            {editFormErrors.image_name && (
                                <Typography variant="caption" color="error">
                                    {editFormErrors.image_name}
                                </Typography>
                            )}
                        </Box>
                        <TextField
                            label="Description (Optional)"
                            name="description"
                            value={editFormData.description}
                            onChange={handleEditFormChange}
                            size="small"
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </FormContainer>
                </DialogContent>
                <DialogActions sx={{ padding: '16px 24px', justifyContent: 'flex-end' }}>
                    <Button
                        onClick={handleCloseEditDialog}
                        sx={{ color: 'gray' }}
                        disabled={editLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSaveEditDish}
                        variant="contained"
                        disabled={editLoading}
                        sx={{
                            background: 'linear-gradient(45deg, #D3212D 30%, #FF944D 90%)',
                            '&:hover': {
                                background: 'linear-gradient(45deg, #C01F2A 30%, #F06B3A 90%)',
                            },
                        }}
                    >
                        {editLoading ? 'Saving...' : 'Save'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default DishesDashboard;