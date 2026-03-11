const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
}, { _id: false });

const salesSchema = mongoose.Schema(
    {
        date: { type: String, required: true },
        buyerName: { type: String, required: true },

        // Multi-item support (new entries use this)
        items: { type: [itemSchema], default: [] },

        // Legacy single-item fields (kept for backward compat with old records)
        item: { type: String },
        price: { type: Number },

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
    { timestamps: true }
);

// Virtual: always get total price regardless of old/new format
salesSchema.virtual('totalPrice').get(function () {
    if (this.items && this.items.length > 0) {
        return this.items.reduce((sum, i) => sum + i.price, 0);
    }
    return this.price || 0;
});

salesSchema.set('toJSON', { virtuals: true });
salesSchema.set('toObject', { virtuals: true });

const Sales = mongoose.model('Sales', salesSchema);
module.exports = Sales;
