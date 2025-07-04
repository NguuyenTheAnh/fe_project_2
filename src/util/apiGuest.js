import axiosInstance from "./axios.customize"; // Ensure this path is correct

export const getGuestMenuApi = async (queryData) => {
    return axiosInstance.get("/v1/guest-auth/menu", { params: queryData });
};
export const loginGuestApi = async (guest_name, table_id) => {
    const data = { guest_name, table_id };
    return axiosInstance.post("/v1/guest-auth/login", data);
};

export const getGuestCartApi = async () => {
    return axiosInstance.get("/v1/guest-auth/cart");
};

export const addDishToGuestCartApi = async (dish_id) => {
    return axiosInstance.post("/v1/guest-auth/cart", { dish_id });
};

export const updateGuestCartItemApi = async (dish_id, quantity) => {
    return axiosInstance.patch("/v1/guest-auth/cart", { dish_id, quantity });
};

export const removeGuestCartItemApi = async (dish_id) => {
    return axiosInstance.delete(`/v1/guest-auth/cart/${dish_id}`);
};

export const orderGuestApi = async () => {
    return axiosInstance.post("/v1/guest-auth/order");
};

export const deleteRefreshTokenApi = async () => {
    return axiosInstance.get('/v1/guest-auth/cookie/delete');
}