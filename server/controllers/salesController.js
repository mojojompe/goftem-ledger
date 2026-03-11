const Sales = require('../models/Sales');

const getSales = async (req, res) => {
    try {
        const sales = await Sales.find({}).sort({ date: -1, createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createSale = async (req, res) => {
    const { date, buyerName, items, paymentStatus, deliveryStatus } = req.body;
    try {
        const sale = new Sales({ date, buyerName, items, paymentStatus, deliveryStatus });
        const createdSale = await sale.save();
        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateSale = async (req, res) => {
    const { paymentStatus, deliveryStatus } = req.body;
    try {
        const sale = await Sales.findById(req.params.id);
        if (sale) {
            sale.paymentStatus = paymentStatus !== undefined ? paymentStatus : sale.paymentStatus;
            sale.deliveryStatus = deliveryStatus !== undefined ? deliveryStatus : sale.deliveryStatus;
            const updatedSale = await sale.save();
            res.json(updatedSale);
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteSale = async (req, res) => {
    try {
        const sale = await Sales.findById(req.params.id);
        if (sale) {
            await Sales.deleteOne({ _id: req.params.id });
            res.json({ message: 'Sale removed' });
        } else {
            res.status(404).json({ message: 'Sale not found' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getSales, createSale, updateSale, deleteSale };
