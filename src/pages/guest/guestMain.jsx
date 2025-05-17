import React, { useState, useEffect, useCallback } from 'react';
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
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaSearch, FaSortAmountUp, FaSortAmountDown } from 'react-icons/fa';
import { getGuestMenuApi } from '../../util/apiGuest';
import { notification } from 'antd';

const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(1.5), // Further reduced top padding
    paddingBottom: theme.spacing(1.5), // Further reduced bottom padding
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 90px)', // Adjust if header/footer height changes
}));

const FilterBar = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1), // Further reduced gap
    marginBottom: theme.spacing(1.5), // Further reduced margin
    padding: theme.spacing(1), // Further reduced padding
    backgroundColor: '#FFFFFF',
    borderRadius: '10px', // Slightly smaller radius
    boxShadow: '0 1px 6px rgba(0,0,0,0.05)', // Softer shadow
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
    borderRadius: '8px', // Further reduced border radius
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)', // Even softer shadow
    transition: 'transform 0.15s ease-in-out, box-shadow 0.15s ease-in-out',
    '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
}));

const DishImage = styled(CardMedia)({
    paddingTop: '55%', // Further reduced image height (e.g., ~16:9 or more landscape)
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
    fontWeight: '600', // Slightly less bold
    fontSize: '0.75rem', // Further reduced font size
    color: '#D3212D',
    marginBottom: theme.spacing(0.25), // Minimal margin
}));

const DetailButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#D3212D',
    color: 'white',
    borderRadius: '4px', // Further reduced border radius
    textTransform: 'none',
    fontSize: '0.65rem', // Further reduced font size
    padding: theme.spacing(0.375, 0.75), // Further reduced padding
    minWidth: 'auto', // Allow button to be smaller
    '&:hover': {
        backgroundColor: '#b71c1c',
    },
}));

const LoadMoreButtonContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(2), // Adjusted margin
}));

const GuestMain = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [dishes, setDishes] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortOrder, setSortOrder] = useState('');

    const imageBaseUrl = `${import.meta.env.VITE_BACKEND_URL}/images/`;

    const getImageUrl = (imageName) => {
        if (!imageName) return 'https://via.placeholder.com/150x82?text=No+Image'; // Even smaller placeholder
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
                limit: 10, // Fetch even more items if cards are very small
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
                notification.error({ message: 'Error fetching menu', description: response?.message || 'Could not load items.' });
                if (reset || page === 1) setDishes([]);
                setHasMore(false);
            }
        } catch (error) {
            console.error('Error fetching dishes:', error);
            notification.error({ message: 'Error', description: 'Failed to load menu. Please try again.' });
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

    return (
        <PageContainer maxWidth="lg">
            <Typography
                variant={isMobile ? "h6" : "h5"} // Smaller heading for mobile
                component="h1"
                gutterBottom
                sx={{ color: '#D3212D', textAlign: 'center', mb: 2 }}
            >
                Our Menu
            </Typography>

            <FilterBar>
                <TextField
                    placeholder="Search..." // Shorter placeholder
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
                        sx: { borderRadius: '6px', fontSize: '0.8rem' } // Smaller font in search
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
                        minWidth: isMobile ? '100%' : '160px', // Adjusted minWidth
                        '& .MuiTab-root': {
                            color: '#D3212D',
                            borderRadius: '6px', // Smaller radius
                            margin: theme.spacing(0, 0.125), // Minimal margin
                            fontSize: '0.7rem', // Smaller tab font
                            minHeight: '32px', // Reduced tab height
                            padding: theme.spacing(0.25, 0.75), // Reduced tab padding
                        },
                        '& .Mui-selected': {
                            backgroundColor: 'rgba(211, 33, 45, 0.08)', // Lighter selection
                        },
                    }}
                >
                    <Tab label="All" value="" />
                    <Tab label="Chicken" value="Chicken" />
                    <Tab label="Water" value="Water" />
                </Tabs>
                <FormControl size="small" sx={{ minWidth: isMobile ? '100%' : 130 }}> {/* Adjusted minWidth */}
                    <InputLabel sx={{ color: '#D3212D', fontSize: '0.8rem' }}>Sort Price</InputLabel> {/* Shorter, smaller label */}
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
                    spacing={isMobile ? 1 : 1.5}
                    justifyContent="space-between" // Added this line
                >
                    {dishes.map((dish) => (
                        <Grid item xs={isMobile ? 6 : 5} key={dish.dish_id}> {/* Changed xs from 6 to isMobile ? 6 : 5 */}
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
                                <CardActions sx={{ p: 0.75, pt: 0, justifyContent: 'center' }}>
                                    <DetailButton fullWidth>
                                        Detail
                                    </DetailButton>
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
                            borderRadius: '6px', // Smaller radius
                            fontSize: '0.7rem', // Smaller font
                            '&:hover': { backgroundColor: '#b71c1c' },
                            padding: theme.spacing(0.5, 1.5), // Reduced padding
                        }}
                        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
                    >
                        {loading ? 'Loading...' : 'Load More'}
                    </Button>
                </LoadMoreButtonContainer>
            )}
        </PageContainer>
    );
};

export default GuestMain;