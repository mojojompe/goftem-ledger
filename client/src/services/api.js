import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/sales`;

// Get all sales
const getSales = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};

// Create a new sale
const createSale = async (saleData) => {
    const response = await axios.post(API_URL, saleData);
    return response.data;
};

// Update sale payment status
const updatePaymentStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}`, { paymentStatus: status });
    return response.data;
};

// Update sale delivery status
const updateDeliveryStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/${id}`, { deliveryStatus: status });
    return response.data;
};

// Update a specific item's payment status within a sale
const updateItemPaymentStatus = async (saleId, itemIndex, status) => {
    const response = await axios.put(`${API_URL}/${saleId}`, {
        paymentStatus: status,
        itemIndex,
    });
    return response.data;
};

// Delete a sale
const deleteSale = async (id) => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
};

export const salesService = {
    getSales,
    createSale,
    updatePaymentStatus,
    updateDeliveryStatus,
    updateItemPaymentStatus,
    deleteSale,
};
