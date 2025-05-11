import axios from './axios.customize';

const createUserApi = (email, password, role) => {
    const URL_API = "/api/v1/auth/register";
    const data = {
        role, email, password
    }

    return axios.post(URL_API, data)
}

const loginApi = (username, password) => {
    const URL_API = "/api/v1/auth/login";
    const data = {
        username, password
    }

    return axios.post(URL_API, data)
}

const logoutApi = () => {
    const URL_API = "/api/v1/auth/logout";
    return axios.post(URL_API)
}

const refreshTokenApi = () => {
    const URL_API = "/api/v1/auth/refresh";
    return axios.get(URL_API)
}

const getUserApi = () => {
    const URL_API = "/api/v1/auth/  ";
    return axios.get(URL_API)
}

export {
    createUserApi,
    loginApi,
    getUserApi,
    logoutApi,
    refreshTokenApi
}