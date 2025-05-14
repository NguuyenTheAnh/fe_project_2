import React, { useContext, useState } from "react";
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Menu,
    MenuItem,
    Avatar,
    Box,
    Button,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    useTheme,
    useMediaQuery
} from "@mui/material";
import { styled } from "@mui/system";
import { FaBars, FaHome, FaTable, FaUtensils, FaShoppingCart, FaMoneyBill, FaUserCog } from "react-icons/fa";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { AuthContext } from "../context/auth.context";
import { Dashboard } from '@mui/icons-material';
import { logoutApi } from "../../util/api";

// Styled components
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: "#FFF8F0",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)"
}));

const Logo = styled("img")({
    height: "45px",
    cursor: "pointer",
    marginRight: "20px"
});

const NavButton = styled(Button)(({ active }) => ({
    color: active ? "#F26649" : "#D3212D",
    margin: "0 5px",
    textTransform: "none",
    "&:hover": {
        color: "#F26649",
        textDecoration: "underline"
    }
}));

const Header = () => {
    const [activeItem, setActiveItem] = useState("");
    const [anchorEl, setAnchorEl] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const { auth } = useContext(AuthContext);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const navigate = useNavigate(); // Initialize useNavigate
    const isManager = (auth.account.role === "Manager") ? true : false; // Assuming manager role for demo purpose

    const handleProfileClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleProfileClose = () => {
        setAnchorEl(null);
    };

    const handleClickProfileSettings = () => {
        handleProfileClose();
        navigate("/profile-settings");
    };

    const handleMobileMenuToggle = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Define the navigation items with corresponding paths
    const navigationItems = [
        { text: "Home", icon: <FaHome />, path: '/' },
        { text: "Dashboard", icon: <Dashboard />, path: '/dashboard' },
    ];

    if (isManager) {
        navigationItems.push({ text: "Account Management", icon: <FaUserCog />, path: '/managements' });
    }

    // Handle navigation click
    const handleNavClick = (text, path) => {
        setActiveItem(text);
        navigate(path);
    };

    const renderMobileMenu = () => (
        <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={handleMobileMenuToggle}
            PaperProps={{
                sx: { backgroundColor: "#FFF8F0", width: 250 }
            }}
        >
            <Box sx={{ p: 2 }}>
                <Logo
                    src="/logo_project2.png"
                    alt="Restaurant Logo"
                    onError={(e) => {
                        e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
                    }}
                />
            </Box>
            <List>
                {navigationItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => handleNavClick(item.text, item.path)}
                        sx={{
                            "&:hover": { backgroundColor: "#FFE4D6" }
                        }}
                    >
                        <ListItemIcon sx={{ color: "#D3212D" }}>{item.icon}</ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
        </Drawer>
    );

    return (
        <>
            <StyledAppBar position="static">
                <Container maxWidth="xl">
                    <Toolbar disableGutters>
                        {isMobile ? (
                            <IconButton
                                size="large"
                                edge="start"
                                color="inherit"
                                aria-label="menu"
                                onClick={handleMobileMenuToggle}
                                sx={{ color: "#333" }}
                            >
                                <FaBars />
                            </IconButton>
                        ) : null}

                        <Logo
                            src="/logo_project2.png"
                            alt="Restaurant Logo"
                            onError={(e) => {
                                e.target.src = "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4";
                            }}
                        />

                        {!isMobile && (
                            <Box sx={{ flexGrow: 1, display: "flex" }}>
                                {navigationItems.map((item) => (
                                    <NavButton
                                        key={item.text}
                                        startIcon={item.icon}
                                        active={activeItem === item.text}
                                        onClick={() => handleNavClick(item.text, item.path)}
                                    >
                                        {item.text}
                                    </NavButton>
                                ))}
                            </Box>
                        )}

                        <Box sx={{ flexGrow: 0, display: "flex", alignItems: "center" }}>
                            <Typography variant="body1" sx={{ mr: 1, color: "#D3212D" }}>
                                Welcome {auth?.account?.email}
                            </Typography>
                            <IconButton onClick={handleProfileClick} sx={{ p: 0 }}>
                                <Avatar
                                    alt="User Profile"
                                    src="/avatar_user.png"
                                />
                            </IconButton>
                            <Menu
                                anchorEl={anchorEl}
                                open={Boolean(anchorEl)}
                                onClose={handleProfileClose}
                                PaperProps={{
                                    sx: { backgroundColor: "#FFF8F0", boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)" }
                                }}
                            >
                                <MenuItem
                                    onClick={
                                        handleClickProfileSettings
                                    }
                                >Profile Settings
                                </MenuItem>
                                <MenuItem onClick={handleProfileClose}>
                                    <Typography
                                        color="#D3212D"
                                        onClick={async () => {
                                            await logoutApi();
                                            localStorage.removeItem("access_token");
                                            navigate("/login");
                                        }}
                                    >Logout
                                    </Typography>
                                </MenuItem>
                            </Menu>
                        </Box>
                    </Toolbar>
                </Container>
            </StyledAppBar>
            {renderMobileMenu()}
        </>
    );
};

export default Header;
