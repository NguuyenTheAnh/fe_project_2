import axios from './axios.customize';

const getTableApi = (queryData) => {
    const URL_API = "/api/v1/table";
    return axios.get(URL_API, {
        params: queryData
    })
}

const deleteTableApi = (tableId) => {
    const URL_API = `/api/v1/table/${tableId}`;
    return axios.delete(URL_API)
}

const createTableApi = (data) => {
    const URL_API = "/api/v1/table";
    return axios.post(URL_API, data)
}

const updateTableApi = (tableId, data) => {
    const URL_API = `/api/v1/table/${tableId}`;
    return axios.patch(URL_API, data);
}


export {
    getTableApi,
    deleteTableApi,
    createTableApi,
    updateTableApi
}