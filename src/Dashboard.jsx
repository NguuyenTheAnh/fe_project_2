import React from 'react';
import { Box, CssBaseline, styled } from '@mui/material';
import { Outlet } from 'react-router-dom';
import Sidebar from './components/layout/sidebar'; // Adjust path if necessary
import Header from './components/layout/header'; // Assuming you still want the Header

const drawerWidth = 280; // Should match sidebar.jsx

const MainContent = styled(Box)(({ theme }) => ({
    flexGrow: 1,
    backgroundColor: theme.palette.background.default, // Or your preferred content background
    padding: theme.spacing(3),
    marginLeft: `${drawerWidth}px`, // Account for the sidebar width
    width: `calc(100% - ${drawerWidth}px)`, // Ensure content takes remaining width
    minHeight: 'calc(100vh - 64px)', // Adjust 64px if your Header height is different
    marginTop: '64px', // Height of the Header
    boxSizing: 'border-box',
}));

const Root = styled(Box)({
    display: 'flex',
    minHeight: '100vh',
});

const Dashboard = () => {
    return (
        <>
            <Sidebar />
            <MainContent component="main">
                <Outlet /> {/* Child routes will render here */}
            </MainContent>
        </>
    );
};

export default Dashboard;