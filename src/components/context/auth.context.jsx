import { createContext, useState } from 'react';

export const AuthContext = createContext({
    isAuthenticated: false,
    account: {
        account_id: "",
        email: "",
        role: "",
        phone: "",
        name: ""
    },
    appLoading: true,
});

export const AuthWrapper = (props) => {
    const [auth, setAuth] = useState({
        isAuthenticated: false,
        account: {
            account_id: "",
            email: "",
            role: "",
            phone: "",
            name: ""
        },
    });

    const [appLoading, setAppLoading] = useState(true);

    return (
        <AuthContext.Provider value={{
            auth, setAuth, appLoading, setAppLoading
        }}>
            {props.children}
        </AuthContext.Provider>
    );
}