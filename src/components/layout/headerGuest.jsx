import React, { useContext, useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Avatar,
    Box,
    Menu,
    MenuItem,
    Typography,
    Container,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { FaShoppingCart } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { GuestAuthContext } from '../context/guest.context';

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: '#FFF8F0',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    height: '56px',
    display: 'flex',
    justifyContent: 'center',
}));

const LogoImg = styled('img')({
    height: '40px',
    objectFit: 'contain',
});

const IconContainer = styled(Box)({
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
});

const StyledIconButton = styled(IconButton)({
    color: '#D3212D',
    '&:hover': {
        color: '#b71c1c',
    },
});

const HeaderGuest = () => {
    const navigate = useNavigate();
    const [anchorEl, setAnchorEl] = useState(null);
    const { guestAuth } = useContext(GuestAuthContext);

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
    };

    const handleLogoClick = () => {
        navigate('/guest');
    };

    return (
        <StyledAppBar position="static">
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: 'space-between', minHeight: '56px' }}>
                    {/* Logo on the far left */}
                    <LogoImg
                        src="/logo_project2.png"
                        alt="Project Logo"
                        onClick={handleLogoClick}
                        style={{ cursor: 'pointer' }}
                    />

                    {/* Icons on the right */}
                    <IconContainer>
                        <StyledIconButton aria-label="shopping cart">
                            <FaShoppingCart />
                        </StyledIconButton>

                        <StyledIconButton
                            onClick={handleProfileClick}
                            aria-controls="profile-menu"
                            aria-haspopup="true"
                        >
                            <Avatar
                                alt="User Avatar"
                                src="/avatar_user.png"
                                sx={{ width: 32, height: 32 }}
                            />
                        </StyledIconButton>


                        <Menu
                            id="profile-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={Boolean(anchorEl)}
                            onClose={handleProfileClose}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                            transformOrigin={{
                                vertical: 'top',
                                horizontal: 'right',
                            }}

                            PaperProps={{
                                sx: {
                                    mt: 1.5,
                                    backgroundColor: '#FFF8F0',
                                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                    '&:before': {
                                        content: '""',
                                        display: 'block',
                                        position: 'absolute',
                                        top: 0,
                                        right: 14,
                                        width: 10,
                                        height: 10,
                                        bgcolor: '#FFF8F0',
                                        transform: 'translateY(-50%) rotate(45deg)',
                                        zIndex: 0,
                                    },
                                },
                            }}
                        >
                            <MenuItem onClick={handleProfileClose}>
                                <Typography>{guestAuth?.guest?.guest_name || 'Guest User'}</Typography>
                            </MenuItem>
                            <MenuItem onClick={handleProfileClose}>
                                <Typography>{guestAuth?.guest?.table_name || 'Guest Table'}</Typography>
                            </MenuItem>
                        </Menu>
                    </IconContainer>
                </Toolbar>
            </Container>
        </StyledAppBar>
    );
};

export default HeaderGuest;