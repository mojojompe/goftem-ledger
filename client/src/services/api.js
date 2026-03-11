import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '';
const API_URL = `${BASE_URL}/api/sales`;

// Get all sales (supports pagination, date filters, and analytics)
const getSales = async (params = {}) => {
    // Example params: { page: 1, limit: 50, startDate: '2023-01-01', endDate: '2023-01-31', includeAnalytics: true }
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            urlParams.append(key, value);
        }
    });
    
    const url = `${API_URL}${urlParams.toString() ? `?${urlParams.toString()}` : ''}`;
    const response = await axios.get(url);
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
