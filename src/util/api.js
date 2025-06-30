import axios from './axios.customize';

const createUserApi = (email, password, role) => {
    const URL_API = "/v1/auth/register";
    const data = {
        role, email, password
    }
    return axios.post(URL_API, data);
}

const loginApi = (username, password) => {
    const URL_API = "/v1/auth/login";
    const data = {
        username, password
    }
    return axios.post(URL_API, data);
}

const logoutApi = () => {
    const URL_API = "/v1/auth/logout";
    return axios.post(URL_API);
}

const refreshTokenApi = () => {
    const URL_API = "/v1/auth/refresh";
    return axios.get(URL_API);
}

const getUserApi = () => {
    const URL_API = "/v1/auth/profile";
    return axios.get(URL_API);
}

const updateAccountApi = (accountId, data) => {
    const URL_API = `/v1/account/${accountId}`;
    return axios.patch(URL_API, data);
}

const deleteAccountApi = (accountId) => {
    const URL_API = `/v1/account/${accountId}`;
    return axios.delete(URL_API);
}

const getAccountApi = (params) => {
    const URL_API = "/v1/account";
    return axios.get(URL_API, { params });
}

const getAccountByIdApi = (accountId) => {
    const URL_API = `/v1/account/${accountId}`;
    return axios.get(URL_API);
}

// Order APIs
const getOrderApi = (params) => {
    const URL_API = "/v1/order";
    return axios.get(URL_API, { params });
}

const getOrderByIdApi = (orderId) => {
    const URL_API = `/v1/order/${orderId}`;
    return axios.get(URL_API);
}

const createOrderApi = (data) => {
    const URL_API = "/v1/order";
    return axios.post(URL_API, data);
}

const updateOrderApi = (orderId, data) => {
    const URL_API = `/v1/order/${orderId}`;
    return axios.patch(URL_API, data);
}

const deleteOrderApi = (orderId) => {
    const URL_API = `/v1/order/${orderId}`;
    return axios.delete(URL_API);
}

// Guest APIs (example, might be in apiGuest.js)
const getGuestsApi = (params) => {
    const URL_API = "/v1/guest";
    return axios.get(URL_API, { params });
}

// Table APIs (example, might be in apiTable.js or here if centralized)
const getTablesApi = (params) => {
    const URL_API = "/v1/table";
    return axios.get(URL_API, { params });
}

// Staff/Account APIs (example)
const getStaffApi = (params) => {
    const URL_API = "/v1/account";
    return axios.get(URL_API, { params });
}

// Transaction APIs
const getTransactionsApi = (params) => { // Added params for potential future filtering/pagination
    const URL_API = "/v1/transaction";
    return axios.get(URL_API, { params });
}

const getTransactionByIdApi = (transactionId) => {
    const URL_API = `/v1/transaction/${transactionId}`;
    return axios.get(URL_API);
}

const createTransactionApi = (data) => {
    const URL_API = "/v1/transaction";
    return axios.post(URL_API, data);
}

const updateTransactionApi = (transactionId, data) => {
    const URL_API = `/v1/transaction/${transactionId}`;
    return axios.patch(URL_API, data);
}

const deleteTransactionApi = (transactionId) => { // Optional, if needed
    const URL_API = `/v1/transaction/${transactionId}`;
    return axios.delete(URL_API);
}


export {
    createUserApi,
    loginApi,
    getUserApi,
    logoutApi,
    refreshTokenApi,
    updateAccountApi,
    getAccountApi,
    getAccountByIdApi,
    deleteAccountApi,
    // Orders
    getOrderApi,
    getOrderByIdApi,
    createOrderApi,
    updateOrderApi,
    deleteOrderApi,
    // Related data
    getGuestsApi,
    getTablesApi,
    getStaffApi,
    // Transactions
    getTransactionsApi,
    getTransactionByIdApi,
    createTransactionApi,
    updateTransactionApi,
    deleteTransactionApi,
};
