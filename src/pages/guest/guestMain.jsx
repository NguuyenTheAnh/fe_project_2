import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
    Box,
    Container,
    Typography,
    Grid,
    Card,
    CardMedia,
    CardContent,
    CardActions,
    Button,
    TextField,
    Tabs,
    Tab,
    Select,
    MenuItem,
    InputAdornment,
    CircularProgress,
    FormControl,
    InputLabel,
    useTheme,
    useMediaQuery,
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaSearch, FaSortAmountUp, FaSortAmountDown, FaShoppingCart } from 'react-icons/fa';
import CloseIcon from '@mui/icons-material/Close';
import { addDishToGuestCartApi, getGuestMenuApi } from '../../util/apiGuest';
import { notification } from 'antd';
import { GuestAuthContext } from '../../components/context/guest.context';

const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 90px)',
}));

const FilterBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    marginBottom: theme.spacing(1.5),
    padding: theme.spacing(1),
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)',
    [theme.breakpoints.up('sm')]: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing(1.5),
    },
}));

const DishCardStyled = styled(Card)(({ theme }) => ({
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
    transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
}));

const DishImage = styled(CardMedia)({
    paddingTop: '55%',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
});

const DishName = styled(Typography)(({ theme }) => ({
    fontWeight: '600',
    fontSize: '0.8rem',
    color: theme.palette.text.primary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    lineHeight: '1.2em',
    minHeight: '2.4em',
    wordBreak: 'break-word',
    width: '10.3em'
}));

const DishPrice = styled(Typography)(({ theme }) => ({
    fontWeight: '600',
    fontSize: '0.75rem',
    color: '#D3212D',
    marginBottom: theme.spacing(0.25),
}));

const ActionButtonBase = styled(Button)(({ theme }) => ({
    color: 'white',
    borderRadius: '4px',
    textTransform: 'none',
    fontSize: '0.65rem',
    padding: theme.spacing(0.375, 0.75),
    minWidth: 'auto',
    width: `calc(50% - ${theme.spacing(0.5)})`,
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const DetailButton = styled(ActionButtonBase)(({ theme }) => ({
    backgroundColor: '#D3212D',
    '&:hover': {
        backgroundColor: '#b71c1c',
    },
}));

const AddToCartButton = styled(ActionButtonBase)(({ theme }) => ({
    backgroundColor: '#f0ad4e',
    '&:hover': {
        backgroundColor: '#ec971f',
    },
}));

const LoadMoreButtonContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2),
}));

const ModalImage = styled('img')({
    width: '100%',
    maxHeight: '400px',
    objectFit: 'contain',
    borderRadius: '4px',
    marginBottom: '16px',
});

const GuestMain = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { fetchAndUpdateCartData } = useContext(GuestAuthContext); // Use fetchAndUpdateCartData

    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDishForModal, setSelectedDishForModal] = useState(null);

    const imageBaseUrl = `${import.meta.env.VITE_BACKEND_URL}/images/`;

    const getImageUrl = (imageName) => {
        if (!imageName) return 'https://via.placeholder.com/150x82?text=No+Image';
        return `${imageBaseUrl}${imageName}`;
    };

    const fetchDishes = useCallback(async (reset = false) => {
        if (reset || page === 1) {
            setInitialLoading(true);
        } else {
            setLoading(true);
        }

        try {
            const params = {
                page: reset ? 1 : page,
                limit: 10,
                ...(categoryFilter && { category: categoryFilter }),
                ...(searchQuery && { search: searchQuery }),
                ...(sortOrder && { sort: sortOrder }),
                status: 'Available',
            };
            const response = await getGuestMenuApi(params);

            if (response && response.statusCode === 200) {
                const { totalPage, currentPage, dishes: newDishesData } = response.data;
                setDishes(prev => (reset || page === 1) ? newDishesData : [...prev, ...newDishesData]);
                setTotalPages(totalPage || 1);
                setHasMore(currentPage < totalPage);
            } else {
                notification.error({ message: 'Error fetching menu', description: response?.message || 'Could not load items.', placement: "bottomRight", });
                if (reset || page === 1) setDishes([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
            notification.error({ message: 'Error', description: 'Failed to load menu. Please try again.', placement: "bottomRight", });
            if (reset || page === 1) setDishes([]);
            setHasMore(false);
        } finally {
            setLoading(false);
            setInitialLoading(false);
        }
    }, [page, categoryFilter, searchQuery, sortOrder]);

    useEffect(() => {
        fetchDishes(true);
    }, [categoryFilter, sortOrder]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (page !== 1) setPage(1);
            else fetchDishes(true);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchQuery]);

    useEffect(() => {
        if (page === 1) {
            fetchDishes(true);
        } else if (page > 1 && !initialLoading) {
            fetchDishes(false);
        }
    }, [page]);

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
    };

    const handleCategoryChange = (event, newValue) => {
        setPage(1);
        setCategoryFilter(newValue);
    };

    const handleSortChange = (event) => {
        setPage(1);
        setSortOrder(event.target.value);
    };

    const handleLoadMore = () => {
        if (hasMore && !loading && !initialLoading) {
            setPage(prevPage => prevPage + 1);
        }
    };

    const handleAddToCart = async (dishId, dishName) => { // Pass dishName for notification
        try {
            // Assuming addDishToGuestCartApi takes dish_id and quantity (defaulting to 1)
            // The API in util/apiGuest.js was defined as addDishToGuestCartApi(dish_id, quantity)
            // The previous call in guestMain was addDishToGuestCartApi(dish) which is incorrect.
            // It should be addDishToGuestCartApi(dish.dish_id, 1) or similar.
            // For now, I'll assume the API expects dish_id and a default quantity of 1.
            const response = await addDishToGuestCartApi(dishId);

            if (response && response.statusCode === 201) { // Check for your specific success status code
                notification.success({ message: `${dishName} added to cart!`, placement: "bottomRight", });
                await fetchAndUpdateCartData(); // Update context (cart count and total)
            } else {
                // Handle cases where API call was made but didn't succeed as expected
                notification.error({ message: `Failed to add ${dishName} to cart. ${response?.message || ''}`, placement: "bottomRight", });
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            notification.error({ message: "Could not add item to cart. Please try again.", placement: "bottomRight", });
        }
    };

    const handleOpenDetailModal = (dish) => {
        setSelectedDishForModal(dish);
        setIsDetailModalOpen(true);
    };

    const handleCloseDetailModal = () => {
        setIsDetailModalOpen(false);
        setSelectedDishForModal(null);
    };

    const rowVerticalSpacing = isMobile ? theme.spacing(1) : theme.spacing(1.5);
    const middleHorizontalGap = isMobile ? theme.spacing(1) : theme.spacing(1.5);
    const halfMiddleHorizontalGap = `calc(${middleHorizontalGap} / 2)`;

    return (
        <PageContainer maxWidth="lg">
            <Typography
                variant={isMobile ? "h6" : "h5"}
                component="h1"
                gutterBottom
                sx={{ color: '#D3212D', textAlign: 'center', mb: 2 }}
            >
                Our Menu
            </Typography>

            <FilterBar>
                <TextField
                    placeholder="Search..."
                    variant="outlined"
                    size="small"
                    fullWidth={isMobile}
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch color="#D3212D" size="0.9em" />
                            </InputAdornment>
                        ),
                        sx: { borderRadius: '6px', fontSize: '0.8rem' }
                    }}
                    sx={{ flexGrow: isMobile ? 0 : 1, minWidth: isMobile ? '100%' : '180px' }}
                />
                <Tabs
                    value={categoryFilter}
                    onChange={handleCategoryChange}
                    indicatorColor="primary"
                    textColor="primary"
                    variant={isMobile ? "fullWidth" : "standard"}
                    sx={{
                        minWidth: isMobile ? '100%' : '160px',
                        '& .MuiTab-root': {
                            color: '#D3212D',
                            borderRadius: '6px',
                            margin: theme.spacing(0, 0.125),
                            fontSize: '0.7rem',
                            minHeight: '32px',
                            padding: theme.spacing(0.25, 0.75),
                        },
                        '& .Mui-selected': {
                            backgroundColor: 'rgba(211, 33, 45, 0.08)',
                        },
                    }}
                >
                    <Tab label="All" value="" />
                    <Tab label="Chicken" value="Chicken" />
                    <Tab label="Water" value="Water" />
                </Tabs>
                <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 130 }}>
                    <InputLabel sx={{ color: '#D3212D', fontSize: '0.8rem' }}>Sort Price</InputLabel>
                    <Select
                        value={sortOrder}
                        label="Sort Price"
                        onChange={handleSortChange}
                        sx={{ borderRadius: '6px', fontSize: '0.8rem', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(211, 33, 45, 0.4)' } }}
                        IconComponent={(props) => (sortOrder === 'desc' ? <FaSortAmountDown {...props} style={{ color: '#D3212D', marginRight: '4px', fontSize: '0.9rem' }} /> : <FaSortAmountUp {...props} style={{ color: '#D3212D', marginRight: '4px', fontSize: '0.9rem' }} />)}
                    >
                        <MenuItem value="" sx={{ fontSize: '0.8rem' }}>Default</MenuItem>
                        <MenuItem value="asc" sx={{ fontSize: '0.8rem' }}>Low-High</MenuItem>
                        <MenuItem value="desc" sx={{ fontSize: '0.8rem' }}>High-Low</MenuItem>
                    </Select>
                </FormControl>
            </FilterBar>

            {initialLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress sx={{ color: '#D3212D' }} size={35} />
                </Box>
            ) : dishes.length > 0 ? (
                <Grid
                    container
                    justifyContent="flex-start"
                >
                    {dishes.map((dish, index) => (
                        <Grid
                            item
                            xs={6}
                            key={dish.dish_id}
                            sx={{
                                paddingLeft: index % 2 === 0 ? 0 : halfMiddleHorizontalGap,
                                paddingRight: index % 2 === 0 ? halfMiddleHorizontalGap : 0,
                                marginBottom: rowVerticalSpacing,
                            }}
                        >
                            <DishCardStyled>
                                <DishImage
                                    image={getImageUrl(dish.image_name)}
                                    title={dish.dish_name}
                                />
                                <CardContent sx={{ flexGrow: 1, p: 0.75, pt: 0.25 }}>
                                    <DishName>
                                        {dish.dish_name}
                                    </DishName>
                                    <DishPrice>
                                        {dish.price?.toLocaleString('vi-VN')}đ
                                    </DishPrice>
                                </CardContent>
                                <CardActions sx={{
                                    p: 0.75,
                                    pt: 0,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: theme.spacing(1)
                                }}>
                                    <DetailButton onClick={() => handleOpenDetailModal(dish)}>
                                        Detail
                                    </DetailButton>
                                    <AddToCartButton onClick={() => handleAddToCart(dish.dish_id, dish.dish_name)} startIcon={<FaShoppingCart size="0.8em" />}>
                                        Add
                                    </AddToCartButton>
                                </CardActions>
                            </DishCardStyled>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Typography variant="body2" align="center" sx={{ color: theme.palette.text.secondary, mt: 3 }}>
                    No dishes found.
                </Typography>
            )}

            {hasMore && !initialLoading && dishes.length > 0 && (
                <LoadMoreButtonContainer>
                    <Button
                        variant="contained"
                        onClick={handleLoadMore}
                        disabled={loading}
                        sx={{
                            backgroundColor: '#D3212D',
                            color: 'white',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            '&:hover': { backgroundColor: '#b71c1c' },
                            padding: theme.spacing(0.5, 1.5),
                        }}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </LoadMoreButtonContainer>
            )}

            {selectedDishForModal && (
                <Dialog
                    open={isDetailModalOpen}
                    onClose={handleCloseDetailModal}
                    maxWidth="sm"
                    fullWidth
                    PaperProps={{ sx: { borderRadius: '12px' } }}
                >
                    <DialogTitle sx={{ m: 0, p: 2, color: '#D3212D', fontWeight: 'bold' }}>
                        {selectedDishForModal.dish_name}
                        <IconButton
                            aria-label="close"
                            onClick={handleCloseDetailModal}
                            sx={{
                                position: 'absolute',
                                right: 8,
                                top: 8,
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <ModalImage
                            src={getImageUrl(selectedDishForModal.image_name)}
                            alt={selectedDishForModal.dish_name}
                        />
                        <Typography gutterBottom variant="body1" component="div" sx={{ fontWeight: '500', mt: 1, color: theme.palette.text.secondary }}>
                            Description:
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                            {selectedDishForModal.description || 'No description available for this dish.'}
                        </Typography>
                        <Typography variant="h6" sx={{ color: '#D3212D', fontWeight: 'bold', mt: 2, textAlign: 'right' }}>
                            Price: {selectedDishForModal.price?.toLocaleString('vi-VN')}đ
                        </Typography>
                    </DialogContent>
                </Dialog>
            )}
        </PageContainer>
    );
};

export default GuestMain;