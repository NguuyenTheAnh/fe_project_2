import React from 'react';
import { Box, Grid, Typography, Container } from '@mui/material';
import { styled } from '@mui/material/styles';

const PageContainer = styled(Container)(({ theme }) => ({
    minHeight: 'calc(100vh - 56px - 56px)', // Adjust 56px based on your actual header/footer heights
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing(3, 2), // Vertical and horizontal padding
    backgroundColor: '#FFFFFF', // White background
    overflow: 'hidden', // Prevent scrollbars from slight overflows
}));

const ContentGrid = styled(Grid)(({ theme }) => ({
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
}));

const ImageContainer = styled(Grid)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(2),
    // Mobile view: Image at the top
    [theme.breakpoints.down('md')]: {
        order: 1,
        marginBottom: theme.spacing(3),
    },
    // Desktop view: Image on the left
    [theme.breakpoints.up('md')]: {
        order: 1,
        justifyContent: 'flex-end', // Pushes image towards the center if column is wide
        paddingRight: theme.spacing(3), // Space between image and text column
    },
}));

const StyledImage = styled('img')(({ theme }) => ({
    maxWidth: '100%',
    maxHeight: '60vh', // Max height for the image
    height: 'auto',
    objectFit: 'contain',
    [theme.breakpoints.down('sm')]: {
        maxHeight: '40vh', // Smaller image on very small screens
    }
}));

const TextContainer = styled(Grid)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'flex-start', // Align text to the left on desktop
    padding: theme.spacing(2),
    // Mobile view: Text below image
    [theme.breakpoints.down('md')]: {
        order: 2,
        alignItems: 'center', // Center text on mobile
        textAlign: 'center',
    },
    // Desktop view: Text on the right
    [theme.breakpoints.up('md')]: {
        order: 2,
        paddingLeft: theme.spacing(3), // Space between image and text column
    },
}));

const MainText = styled(Typography)(({ theme }) => ({
    color: '#D3212D', // Primary theme color
    fontWeight: 700, // Bold
    fontSize: '2.8rem', // Base font size
    lineHeight: 1.2,
    [theme.breakpoints.down('lg')]: {
        fontSize: '2.5rem',
    },
    [theme.breakpoints.down('md')]: {
        fontSize: '2rem', // Font size for tablets and large mobiles
    },
    [theme.breakpoints.down('sm')]: {
        fontSize: '1.75rem', // Font size for small mobiles
    },
}));

const HomePage = () => {
    return (
        <PageContainer maxWidth="lg"> {/* Adjust maxWidth as needed */}
            <ContentGrid container>
                {/* Image Column/Section */}
                <ImageContainer item xs={12} md={6}>
                    <StyledImage
                        src="/home-removebg.png"
                        alt="Restaurant Management Illustration"
                    />
                </ImageContainer>

                {/* Text Column/Section */}
                <TextContainer item xs={12} md={6}>
                    <MainText variant="h2" component="h1"> {/* Use appropriate semantic tags */}
                        Convenient Management<br></br>Chicken Restaurant
                    </MainText>
                    {/* You can add more descriptive subtext here if needed */}
                    {/* <Typography variant="h6" color="text.secondary" sx={{ mt: 2 }}>
                        Streamline your operations with ease.
                    </Typography> */}
                </TextContainer>
            </ContentGrid>
        </PageContainer>
    );
};

export default HomePage;