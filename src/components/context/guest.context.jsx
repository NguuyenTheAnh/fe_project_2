import React, { createContext, useState, useContext, useEffect } from 'react';
import { getGuestCartApi } from '../../util/apiGuest'; // Import the API function

export const GuestAuthContext = createContext({
    isGuestAuthenticated: false,
    guest: {
        guest_id: "",
        guest_name: "",
        table_id: "",
        cart_id: "",
        table_name: ""
    },
    guestAppLoading: true,
    setGuestAuth: () => { },
    setGuestAppLoading: () => { },
    cartItemCount: 0,
    cartTotalAmount: 0,
    // setCartItemCount: () => {}, // Will be replaced by setCartData
    setCartData: () => { }, // New function to set count and total
    fetchAndUpdateCartData: async () => { }, // Function to fetch and update cart
});

export const GuestAuthWrapper = ({ children }) => {
    const [guestAuth, setGuestAuth] = useState({
        isGuestAuthenticated: false,
        guest: {
            guest_id: "",
            guest_name: "",
            table_id: "",
            cart_id: "",
            table_name: ""
        },
    });
    const [guestAppLoading, setGuestAppLoading] = useState(true);
    const [cartItemCount, setCartItemCount] = useState(0);
    const [cartTotalAmount, setCartTotalAmount] = useState(0);

    const setCartData = ({ count, total }) => {
        setCartItemCount(count);
        setCartTotalAmount(total);
    };

    const fetchAndUpdateCartData = async () => {
        if (guestAuth.isGuestAuthenticated) {
            try {
                const res = await getGuestCartApi();
                if (res && res.data && res.statusCode === 200) {
                    const itemCount = res.data.length;
                    // Assuming total_cart is available and consistent in the response
                    // If the cart is empty, res.data might be an empty array.
                    const totalAmount = res.data.length > 0 ? res.data[0].cart.total_cart : 0;
                    setCartData({ count: itemCount, total: totalAmount });
                } else {
                    // If cart is empty or error, reset cart data
                    setCartData({ count: 0, total: 0 });
                }
            } catch (error) {
                console.error("Failed to fetch guest cart data in context:", error);
                setCartData({ count: 0, total: 0 }); // Reset on error
            }
        } else {
            setCartData({ count: 0, total: 0 }); // Reset if not authenticated
        }
    };

    // Fetch cart data when guest authenticates
    useEffect(() => {
        if (guestAuth.isGuestAuthenticated) {
            fetchAndUpdateCartData();
        }
    }, [guestAuth.isGuestAuthenticated]);


    return (
        <GuestAuthContext.Provider value={{
            guestAuth,
            setGuestAuth,
            guestAppLoading,
            setGuestAppLoading,
            cartItemCount,
            cartTotalAmount,
            setCartData,
            fetchAndUpdateCartData, // Provide this function
        }}>
            {children}
        </GuestAuthContext.Provider>
    );
};

export const useGuestAuth = () => {
    return useContext(GuestAuthContext);
};