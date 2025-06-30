import React, { useContext, useEffect } from 'react';
import { Box } from '@mui/material';
import { Outlet, useNavigate, useSearchParams } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import { Spin } from 'antd';
import { GuestAuthContext } from './components/context/guest.context';
import axiosInstance from './util/axios.customize'; // Sử dụng instance từ axios.customize.js
import HeaderGuest from './components/layout/headerGuest';
import FooterGuest from './components/layout/footerGuest';

const MainContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#FFF8F0',
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: theme.spacing(2),
    backgroundColor: '#FFFFFF',
}));

const Guest = () => {
    const { setGuestAuth, guestAppLoading, setGuestAppLoading } = useContext(GuestAuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const tableId = searchParams.get('table_id') || '';

    useEffect(() => {
        const fetchGuestAccount = async () => {

            const accessTokenGuest = localStorage.getItem('access_token_guest');
            if (!accessTokenGuest) {
                setGuestAuth({
                    isGuestAuthenticated: false,
                    guest: {
                        guest_id: '',
                        guest_name: '',
                        table_id: '',
                        cart_id: '',
                        table_name: '',
                    },
                });
                setGuestAppLoading(false);
                navigate(`/login-guest?table_id=${tableId}`);
                return;
            }

            setGuestAppLoading(true);
            try {
                const res = await axiosInstance.get('/v1/guest-auth/profile');
                if (res && res.statusCode === 200) {
                    setGuestAuth({
                        isGuestAuthenticated: true,
                        guest: {
                            guest_id: res?.data?.guest_id ?? '',
                            guest_name: res?.data?.guest_name ?? '',
                            table_id: res?.data?.table_id ?? '',
                            cart_id: res?.data?.cart_id ?? '',
                            table_name: res?.data?.table?.table_name ?? '',
                        },
                    });
                } else {
                    throw new Error('Invalid response');
                }
            } catch (error) {
                console.error('Error fetching guest profile:', error);
                setGuestAuth({
                    isGuestAuthenticated: false,
                    guest: {
                        guest_id: '',
                        guest_name: '',
                        table_id: '',
                        cart_id: '',
                        table_name: '',
                    },
                });
                localStorage.removeItem('access_token_guest');
                navigate(`/login-guest?table_id=${tableId}`);
            } finally {
                setGuestAppLoading(false);
            }
        };

        fetchGuestAccount();
    }, [navigate, setGuestAuth, setGuestAppLoading, tableId]);

    return (
        <div>
            {guestAppLoading ? (
                <div
                    style={{
                        position: 'fixed',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <Spin />
                </div>
            ) : (
                <MainContainer>
                    <HeaderGuest />
                    <ContentWrapper>
                        <Outlet />
                    </ContentWrapper>
                    <FooterGuest />
                </MainContainer>
            )}
        </div>
    );
};

export default Guest;