import axios from './axios.customize';

const getDishApi = (queryData) => {
    const URL_API = "/v1/dish";
    return axios.get(URL_API, {
        params: queryData
    })
}

const deleteDishApi = (dishId) => {
    const URL_API = `/v1/dish/${dishId}`;
    return axios.delete(URL_API)
}

const createDishApi = (data) => {
    console.log("data", data);

    const URL_API = "/v1/dish";
    return axios.post(URL_API, data)
}

const uploadDishImageApi = (data) => {
    const URL_API = `/v1/file/upload`;
    return axios.post(
        URL_API,
        data,
        {
            headers: { 'Content-Type': 'multipart/form-data' },
        }
    );
}

const updateDishApi = (dishId, data) => {
    const URL_API = `/v1/dish/${dishId}`;
    return axios.patch(URL_API, data);
}

export {
    getDishApi,
    deleteDishApi,
    createDishApi,
    uploadDishImageApi,
    updateDishApi
}