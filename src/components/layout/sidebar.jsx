import React, { useState, useContext } from 'react';
import {
    Drawer,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    TextField,
    InputAdornment,
    Box,
    Typography,
    styled,
    useTheme
} from '@mui/material';
import {
    FaHome,
    FaTable,
    FaUtensils,
    FaShoppingCart,
    FaMoneyBill,
    FaUserCog,
    FaSearch,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/auth.context'; // Assuming you have AuthContext

const drawerWidth = 280;

const StyledDrawer = styled(Drawer)(({ theme }) => ({
    width: drawerWidth,
    flexShrink: 0,
    '& .MuiDrawer-paper': {
        width: drawerWidth,
        boxSizing: 'border-box',
        backgroundColor: '#FFF8F0', // Light background
        borderRight: '1px solid rgba(211, 33, 45, 0.2)', // Subtle border
        boxShadow: '2px 0px 5px rgba(0,0,0,0.05)',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
    },
}));

const LogoContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: 'center',
    borderBottom: `1px solid rgba(211, 33, 45, 0.1)`,
    marginBottom: theme.spacing(1),
    cursor: 'pointer'
}));

const LogoImg = styled('img')({
    height: '70px', // Adjust as needed
    objectFit: 'contain',
});

const SearchContainer = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 2, 1, 2),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme, active }) => ({
    margin: theme.spacing(0.5, 1),
    borderRadius: '8px',
    color: '#D3212D', // Main red color for text and icons
    '& .MuiListItemIcon-root': {
        color: '#D3212D',
        minWidth: '40px',
    },
    ...(active && {
        backgroundColor: 'rgba(211, 33, 45, 0.15)', // Stronger background for active
        fontWeight: 'bold',
        '& .MuiListItemText-primary': {
            fontWeight: '600',
        },
    }),
    '&:hover': {
        backgroundColor: 'rgba(242, 102, 73, 0.1)', // Soft highlight on hover (using F26649 with opacity)
        transform: 'translateX(2px)',
        transition: 'background-color 0.2s ease, transform 0.2s ease',
    },
}));

const SubMenuListItemButton = styled(StyledListItemButton)(({ theme }) => ({
    paddingLeft: theme.spacing(4), // Indent sub-menu items
}));

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { auth } = useContext(AuthContext); // Get auth context
    const [openSubmenus, setOpenSubmenus] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const theme = useTheme();

    // Determine if user is a manager - replace with your actual logic
    const isManager = auth?.account?.role === 'Manager'; // Example, adjust based on your auth structure

    const handleSubmenuClick = (itemText) => {
        setOpenSubmenus(prev => ({ ...prev, [itemText]: !prev[itemText] }));
    };

    const handleClickLogo = () => {
        navigate('/'); // Navigate to home or main page 
    };

    const handleNavigate = (path) => {
        navigate(path);
    };

    const menuItems = [
        { text: 'Dashboard', icon: <FaHome />, path: '/dashboard/' },
        { text: 'Tables', icon: <FaTable />, path: '/dashboard/tables' },
        { text: 'Dishes', icon: <FaUtensils />, path: '/dashboard/dishes' },
        { text: 'Orders', icon: <FaShoppingCart />, path: '/dashboard/orders' },
        { text: 'Payments', icon: <FaMoneyBill />, path: '/dashboard/payments' },
    ];

    const filteredMenuItems = menuItems.filter(item =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.subItems && item.subItems.some(sub => sub.text.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <StyledDrawer variant="permanent" anchor="left">
            <LogoContainer>
                <LogoImg
                    src="/logo_project2.png" // Ensure this path is correct
                    alt="Company Logo"
                    onError={(e) => { e.target.style.display = 'none'; /* Hide if logo fails */ }}
                    onClick={handleClickLogo}
                />
            </LogoContainer>
            <SearchContainer>
                <TextField
                    fullWidth
                    variant="outlined"
                    placeholder="Search..."
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch style={{ color: '#D3212D' }} />
                            </InputAdornment>
                        ),
                        sx: {
                            borderRadius: '8px',
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#F26649',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                borderColor: '#D3212D',
                            },
                        }
                    }}
                />
            </SearchContainer>
            <List sx={{ overflowY: 'auto', flexGrow: 1, padding: theme.spacing(0, 1) }}>
                {filteredMenuItems.map((item) => (
                    <React.Fragment key={item.text}>
                        <StyledListItemButton
                            onClick={() => item.subItems ? handleSubmenuClick(item.text) : handleNavigate(item.path)}
                            active={!item.subItems && location.pathname === item.path}
                        >
                            <ListItemIcon>{item.icon}</ListItemIcon>
                            <ListItemText primary={item.text} />
                            {item.subItems && (openSubmenus[item.text] ? <FaChevronUp /> : <FaChevronDown />)}
                        </StyledListItemButton>
                        {item.subItems && (
                            <Collapse in={openSubmenus[item.text]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {item.subItems.filter(sub => sub.text.toLowerCase().includes(searchTerm.toLowerCase())).map((subItem) => (
                                        <SubMenuListItemButton
                                            key={subItem.text}
                                            onClick={() => handleNavigate(subItem.path)}
                                            active={location.pathname === subItem.path}
                                        >
                                            <ListItemText primary={subItem.text} sx={{ pl: 2 }} />
                                        </SubMenuListItemButton>
                                    ))}
                                </List>
                            </Collapse>
                        )}
                    </React.Fragment>
                ))}
            </List>
            {/* Optional Footer or User Info Section */}
            {/* <Box sx={{ p: 2, mt: 'auto', borderTop: `1px solid rgba(211, 33, 45, 0.1)` }}>
                <Typography variant="caption" color="textSecondary" align="center">
                    © 2023 RestaurantName
                </Typography>
            </Box> */}
        </StyledDrawer>
    );
};

export default Sidebar;