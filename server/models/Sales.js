const mongoose = require('mongoose');

const salesSchema = mongoose.Schema(
    {
        date: {
            type: String,
            required: true,
        },
        buyerName: {
            type: String,
            required: true,
        },
        item: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        paymentStatus: {
            type: String,
            enum: ['pending', 'paid'],
            default: 'pending',
        },
        deliveryStatus: {
            type: String,
            enum: ['pending', 'delivered'],
            default: 'pending',
        },
    },
    {
        timestamps: true,
    }
);

const Sales = mongoose.model('Sales', salesSchema);

module.exports = Sales;
