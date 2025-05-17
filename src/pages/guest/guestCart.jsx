import React, { useState, useEffect, useContext } from 'react'; // Added useContext
import {
    Container,
    Box,
    Typography,
    Button,
    IconButton,
    List,
    ListItem,
    Avatar,
    Paper,
    Grid,
    CircularProgress, // Added for loading state
    Alert, // Added for error state
    useTheme,
    useMediaQuery,
    Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GuestAuthContext } from '../../components/context/guest.context'; // Import context
import { getGuestCartApi, updateGuestCartItemApi, removeGuestCartItemApi } from '../../util/apiGuest'; // Import API functions
import { notification } from 'antd';
const IMAGE_BASE_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8080'}/images/`;

const getImageUrl = (imageName) => {
    if (!imageName || imageName.startsWith('placeholder-')) {
        return 'https://via.placeholder.com/80x80?text=No+Image';
    }
    return `${IMAGE_BASE_URL}${imageName}`;
};

const PageContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    backgroundColor: '#FFFFFF',
    minHeight: 'calc(100vh - 90px)',
}));

const CartHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderBottom: `2px solid ${theme.palette.divider}`,
}));

const CartTitle = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1.8rem',
    color: '#D3212D',
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    }
}));

const CartItemList = styled(List)(({ theme }) => ({
    padding: 0,
    marginBottom: theme.spacing(3),
}));
const CartItemStyled = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    borderRadius: '8px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
}));

const ItemThumbnail = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    borderRadius: '8px',
    marginRight: theme.spacing(1.5),
    [theme.breakpoints.down('sm')]: {
        width: 60,
        height: 60,
    }
}));

const ItemName = styled(Typography)(({ theme }) => ({
    fontWeight: '600',
    fontSize: '1rem',
    color: theme.palette.text.primary,
    flexGrow: 1,
    wordBreak: 'break-word',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
    }
}));

const ItemPrice = styled(Typography)(({ theme }) => ({
    fontWeight: '500',
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
}));

const ItemTotalPrice = styled(Typography)(({ theme }) => ({
    fontWeight: '600',
    fontSize: '1rem',
    color: '#D3212D',
    minWidth: '90px',
    textAlign: 'right',
    [theme.breakpoints.down('sm')]: {
        fontSize: '0.9rem',
        minWidth: '70px',
    }
}));

const QuantityControlBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.75),
    border: `1px solid ${theme.palette.grey[300]}`,
    borderRadius: '4px',
    padding: theme.spacing(0.375, 0.75),
}));

const QuantityButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.5),
    color: '#D3212D',
    '&:hover': {
        backgroundColor: 'rgba(211, 33, 45, 0.08)',
    }
}));

const QuantityText = styled(Typography)(({ theme }) => ({
    fontSize: '1rem',
    fontWeight: '500',
    padding: theme.spacing(0, 0.5),
    minWidth: '25px',
    textAlign: 'center',
}));

const RemoveItemButton = styled(IconButton)(({ theme }) => ({
    padding: theme.spacing(0.75),
    color: theme.palette.error.light,
    '&:hover': {
        backgroundColor: 'rgba(244, 67, 54, 0.08)',
        color: theme.palette.error.main,
    }
}));

const SummaryPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    backgroundColor: '#FFF8F0',
}));

const TotalPriceText = styled(Typography)(({ theme }) => ({
    fontWeight: 'bold',
    fontSize: '1.25rem',
    color: theme.palette.text.primary,
}));

const CheckoutButtonStyled = styled(Button)(({ theme }) => ({
    backgroundColor: '#D3212D',
    color: 'white',
    borderRadius: '4px',
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: theme.spacing(1.5, 2.5),
    width: '100%',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    marginTop: theme.spacing(2),
    '&:hover': {
        backgroundColor: '#b71c1c',
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
}));

const EmptyCartBox = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(5, 2),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    minHeight: '400px',
    border: `2px dashed ${theme.palette.grey[300]}`,
    borderRadius: '8px',
}));

const ContinueShoppingButton = styled(Button)(({ theme }) => ({
    color: '#D3212D',
    borderColor: 'rgba(211, 33, 45, 0.5)',
    textTransform: 'none',
    marginTop: theme.spacing(2),
    '&:hover': {
        backgroundColor: 'rgba(211, 33, 45, 0.04)',
        borderColor: '#D3212D',
    },
}));

const GuestCart = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const navigate = useNavigate();
    const { cartTotalAmount, fetchAndUpdateCartData } = useContext(GuestAuthContext);

    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchCart = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getGuestCartApi();
            if (res && res.data && res.statusCode === 200) {
                const transformedItems = res.data.map(item => ({
                    id: item.dish_id, // Use dish_id as the unique key for items
                    cart_id: item.cart_id, // Keep cart_id if needed for other operations
                    name: item.dish.dish_name,
                    image_name: item.dish.image_name,
                    price: parseFloat(item.dish.price),
                    quantity: item.quantity,
                    category: item.dish.category,
                }));
                setCartItems(transformedItems);
                // Context update is now handled by fetchAndUpdateCartData in context itself
                // or can be called here if more direct control is needed after this specific fetch
                await fetchAndUpdateCartData(); // Ensure context is also updated
            } else {
                setCartItems([]); // Set to empty if no data or error
                await fetchAndUpdateCartData(); // Update context to reflect empty cart
            }
        } catch (err) {
            console.error("Failed to fetch cart items:", err);
            setError("Could not load your cart. Please try again later.");
            setCartItems([]);
            await fetchAndUpdateCartData(); // Update context to reflect empty/error state
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []); // Fetch cart on component mount

    const handleQuantityChange = async (dishId, newQuantity) => {
        if (newQuantity < 1) { // Prevent quantity from going below 1, effectively removing if 0
            handleRemoveItem(dishId);
            return;
        }
        // Optimistic update
        const oldCartItems = [...cartItems];
        try {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.id === dishId ? { ...item, quantity: newQuantity } : item
                )
            );
            await updateGuestCartItemApi(dishId, newQuantity);
            await fetchAndUpdateCartData(); // Re-sync with backend and update context
            // No need to call fetchCart() again if fetchAndUpdateCartData() handles it
        } catch (err) {
            notification.error({ message: "Failed to update quantity", placement: "bottomRight", });
            // Rollback optimistic update if API call fails
            setCartItems(oldCartItems);
            console.error("Failed to update cart item quantity:", err);
        }
    };

    const handleRemoveItem = async (dishId) => {
        // Optimistic update
        const oldCartItems = [...cartItems];
        try {
            setCartItems(prevItems => prevItems.filter(item => item.id !== dishId));
            await removeGuestCartItemApi(dishId);
            await fetchAndUpdateCartData(); // Re-sync and update context
            notification.success({ message: "Item removed from cart", placement: "bottomRight", });
        } catch (err) {
            notification.error({ message: "Failed to remove item", placement: "bottomRight", });
            // Rollback optimistic update if API call fails
            setCartItems(oldCartItems);
            console.error("Failed to remove cart item:", err);
        }
    };

    const handleCheckout = () => {
        console.log('Proceed to checkout with items:', cartItems);
        // Navigate to an actual checkout page or implement order placement
        notification.info({ message: "Checkout process not yet implemented.", placement: "bottomRight", })
    };

    const calculateItemTotal = (item) => item.price * item.quantity;

    // This local calculation is fine for display, but total from context is source of truth for badge
    const calculateDisplayTotal = () => {
        return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
    };

    if (loading) {
        return (
            <PageContainer maxWidth="lg" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 150px)' }}>
                <CircularProgress sx={{ color: '#D3212D' }} />
            </PageContainer>
        );
    }

    if (error) {
        return (
            <PageContainer maxWidth="lg" sx={{ textAlign: 'center' }}>
                <Alert severity="error" sx={{ mt: 3 }}>{error}</Alert>
                <Button variant="outlined" onClick={fetchCart} sx={{ mt: 2 }}>Try Again</Button>
            </PageContainer>
        );
    }

    return (
        <PageContainer maxWidth="lg">
            <CartHeader>
                <CartTitle>Your Cart</CartTitle>
                <Button
                    variant="outlined"
                    startIcon={<FaArrowLeft />}
                    onClick={() => navigate('/guest')}
                    sx={{
                        color: '#D3212D',
                        borderColor: 'rgba(211, 33, 45, 0.5)',
                        textTransform: 'none',
                        '&:hover': {
                            backgroundColor: 'rgba(211, 33, 45, 0.04)',
                            borderColor: '#D3212D',
                        },
                    }}
                >
                    Continue Ordering
                </Button>
            </CartHeader>

            {cartItems.length === 0 ? (
                <EmptyCartBox>
                    <FaShoppingCart size={isMobile ? 50 : 70} style={{ marginBottom: theme.spacing(3), color: theme.palette.grey[400] }} />
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: '500' }}>
                        Your cart is currently empty.
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        Add some delicious dishes from our menu to get started!
                    </Typography>
                    <ContinueShoppingButton
                        variant="outlined"
                        onClick={() => navigate('/guest')}
                    >
                        Browse Menu
                    </ContinueShoppingButton>
                </EmptyCartBox>
            ) : (
                <Grid container spacing={isMobile ? 2 : 4}>
                    <Grid item xs={12} md={8}>
                        <CartItemList>
                            {cartItems.map((item) => (
                                <CartItemStyled key={item.id} elevation={1}>
                                    <ItemThumbnail
                                        variant="rounded"
                                        src={getImageUrl(item.image_name)}
                                        alt={item.name}
                                    />
                                    <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                        <ItemName>{item.name}</ItemName>
                                        <ItemPrice>
                                            Unit Price: {item.price.toLocaleString('vi-VN')}đ
                                        </ItemPrice>
                                        <QuantityControlBox sx={{ mt: 0.5 }}>
                                            <QuantityButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                                                <FaMinus size="0.7em" />
                                            </QuantityButton>
                                            <QuantityText>{item.quantity}</QuantityText>
                                            <QuantityButton size="small" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                                                <FaPlus size="0.7em" />
                                            </QuantityButton>
                                        </QuantityControlBox>
                                    </Box>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', height: '100%' }}>
                                        <ItemTotalPrice>
                                            {calculateItemTotal(item).toLocaleString('vi-VN')}đ
                                        </ItemTotalPrice>
                                        <RemoveItemButton onClick={() => handleRemoveItem(item.id)} size="medium" title="Remove item">
                                            <FaTrash size="1em" />
                                        </RemoveItemButton>
                                    </Box>
                                </CartItemStyled>
                            ))}
                        </CartItemList>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <SummaryPaper elevation={2}>
                            <Typography variant="h5" gutterBottom sx={{ fontWeight: '600', color: '#D3212D', mb: 2 }}>
                                Order Summary
                            </Typography>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="body1" sx={{ fontWeight: '500' }}>Subtotal:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                    {/* Use cartTotalAmount from context for consistency with badge */}
                                    {cartTotalAmount.toLocaleString('vi-VN')}đ
                                </Typography>
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="body1" sx={{ fontWeight: '500' }}>Voucher:</Typography>
                                <Typography variant="body1" sx={{ fontWeight: '500' }}>
                                    Unavailable
                                </Typography>
                            </Box>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Total:</Typography>
                                <TotalPriceText>
                                    {cartTotalAmount.toLocaleString('vi-VN')}đ
                                </TotalPriceText>
                            </Box>
                            <CheckoutButtonStyled onClick={handleCheckout}>
                                Proceed to Checkout
                            </CheckoutButtonStyled>
                        </SummaryPaper>
                    </Grid>
                </Grid>
            )}
        </PageContainer>
    );
};

export default GuestCart;