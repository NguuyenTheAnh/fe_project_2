import React from 'react';
import {
    Box,
    Typography,
    Container,
    IconButton,
    Link,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaFacebookF, FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const StyledFooter = styled(Box)(({ theme }) => ({
    backgroundColor: '#FFF8F0',
    padding: theme.spacing(2, 0),
    width: '100%',
}));

const FooterContent = styled(Container)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing(2),
}));

const FooterLinks = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(3),
    marginBottom: theme.spacing(1),
}));

const FooterItem = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    cursor: 'pointer',
}));

const FooterGuest = () => {
    const navigate = useNavigate();
    return (
        <StyledFooter>
            <FooterContent maxWidth="lg">
                <FooterLinks>
                    <FooterItem onClick={() => window.open('https://facebook.com', '_blank')}>
                        <IconButton color="primary" sx={{ color: '#D3212D' }}>
                            <FaFacebookF />
                        </IconButton>
                        <Typography variant="caption" color="textSecondary">
                            Facebook
                        </Typography>
                    </FooterItem>

                    <FooterItem onClick={() => window.open('https://instagram.com', '_blank')}>
                        <IconButton color="primary" sx={{ color: '#D3212D' }}>
                            <FaInstagram />
                        </IconButton>
                        <Typography variant="caption" color="textSecondary">
                            Instagram
                        </Typography>
                    </FooterItem>

                    <FooterItem onClick={() => window.open('https://tiktok.com', '_blank')}>
                        <IconButton color="primary" sx={{ color: '#D3212D' }}>
                            <FaTiktok />
                        </IconButton>
                        <Typography variant="caption" color="textSecondary">
                            TikTok
                        </Typography>
                    </FooterItem>
                </FooterLinks>

                <Typography variant="body2" color="textSecondary" align="center">
                    © 2025 Chicken Restaurant. All rights reserved.
                </Typography>

                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                    <Link color="textSecondary" underline="hover" variant="caption">
                        Terms of Service
                    </Link>
                    <Typography variant="caption" color="textSecondary">|</Typography>
                    <Link color="textSecondary" underline="hover" variant="caption">
                        Privacy Policy
                    </Link>
                </Box>
            </FooterContent>
        </StyledFooter>
    );
};

export default FooterGuest;