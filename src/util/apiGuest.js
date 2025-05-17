import axios from './axios.customize';

const loginGuestApi = (guest_name, table_id) => {
    const URL_API = "/api/v1/guest-auth/login";
    return axios.post(URL_API, {
        guest_name,
        table_id
    })
}

const getGuestMenuApi = (queryData) => {
    const URL_API = "/api/v1/guest-auth/menu";
    return axios.get(URL_API, {
        params: queryData
    })
}

export {
    loginGuestApi,
    getGuestMenuApi
}