import React from "react";
import {
    Box,
    Button,
    Typography,
    Container,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { useNavigate, useSearchParams } from 'react-router-dom';
import { deleteRefreshTokenApi } from "../util/apiGuest";

// Styled components
const StyledContainer = styled(Container)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF8F0", // Theme background color
    padding: theme.spacing(3),
    textAlign: 'center',
}));

const Logo = styled("img")(({ theme }) => ({
    width: 200, // Adjusted size for this page
    height: 200,
    marginBottom: theme.spacing(4),
    objectFit: "contain",
}));

const WishMessage = styled(Typography)(({ theme }) => ({
    color: "#D3212D", // Theme primary color
    fontWeight: 'bold',
    fontSize: '2rem',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.5rem',
    }
}));

const SubMessage = styled(Typography)(({ theme }) => ({
    color: theme.palette.text.secondary,
    fontSize: '1.1rem',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.down('sm')]: {
        fontSize: '1rem',
    }
}));

const OrderMoreButton = styled(Button)(({ theme }) => ({
    backgroundColor: '#D3212D', // Theme primary button color
    color: 'white',
    borderRadius: '8px', // Consistent border radius
    textTransform: 'none',
    fontSize: '1rem',
    fontWeight: '600',
    padding: theme.spacing(1.5, 4),
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    '&:hover': {
        backgroundColor: '#b71c1c', // Darker shade on hover
        boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    },
}));

// Main component
const WishPage = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table_id');

    const handleOrderMore = () => {
        // Remove tokens
        localStorage.removeItem('access_token_guest');
        deleteRefreshTokenApi();

        // Navigate to guest page with table_id
        if (tableId) {
            navigate(`/guest?table_id=${tableId}`);
        } else {
            // Fallback if table_id is somehow missing, though it should be there
            navigate('/guest');
        }
    };

    return (
        <StyledContainer maxWidth="xl">
            <Logo
                src="/logo_project2.png" // Ensure this path is correct
                alt="Restaurant Logo"
            />
            <WishMessage variant="h4">
                Thank You for Your Order!
            </WishMessage>
            <SubMessage variant="h6">
                Wishing you a delightful meal.
            </SubMessage>
            <OrderMoreButton
                variant="contained"
                onClick={handleOrderMore}
            >
                Order More
            </OrderMoreButton>
        </StyledContainer>
    );
};
export default WishPage;
