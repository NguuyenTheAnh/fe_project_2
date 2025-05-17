import { createContext, useState } from 'react';

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
});

export const GuestAuthWrapper = (props) => {
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

    return (
        <GuestAuthContext.Provider value={{
            guestAuth, setGuestAuth, guestAppLoading, setGuestAppLoading
        }}>
            {props.children}
        </GuestAuthContext.Provider>
    );
}