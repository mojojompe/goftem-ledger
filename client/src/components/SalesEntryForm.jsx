import React, { useState } from 'react';

const SalesEntryForm = ({ onAddRecord }) => {
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        buyerName: '',
        item: '',
        price: '',
        paymentStatus: 'pending',
        deliveryStatus: 'pending',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.buyerName || !formData.item || !formData.price || !formData.date) return;

        await onAddRecord({
            ...formData,
            price: Number(formData.price),
        });

        // Reset form after submit except date
        setFormData(prev => ({
            ...prev,
            buyerName: '',
            item: '',
            price: '',
            paymentStatus: 'pending',
            deliveryStatus: 'pending',
        }));
    };

    return (
        <div className="card mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Add New Sale</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Buyer Name</label>
                    <input
                        type="text"
                        name="buyerName"
                        value={formData.buyerName}
                        onChange={handleChange}
                        placeholder="Enter buyer name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Item Purchased</label>
                    <input
                        type="text"
                        name="item"
                        value={formData.item}
                        onChange={handleChange}
                        placeholder="Enter item name"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (₦)</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
                    <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white bg-none"
                    >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Status</label>
                    <select
                        name="deliveryStatus"
                        value={formData.deliveryStatus}
                        onChange={handleChange}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 border p-2 text-gray-800 bg-white bg-none"
                    >
                        <option value="pending">Pending</option>
                        <option value="delivered">Delivered</option>
                    </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                    <button type="submit" className="btn btn-primary w-full md:w-auto px-8 py-3">
                        Add Record
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SalesEntryForm;
