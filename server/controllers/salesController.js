const Sales = require('../models/Sales');

// @desc    Get all sales records
// @route   GET /api/sales
// @access  Public
const getSales = async (req, res) => {
    try {
        const sales = await Sales.find({}).sort({ date: -1, createdAt: -1 });
        res.json(sales);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new sales record
// @route   POST /api/sales
// @access  Public
const createSale = async (req, res) => {
    const { date, buyerName, item, price, paymentStatus, deliveryStatus } = req.body;

    try {
        const sale = new Sales({
            date,
            buyerName,
            item,
            price,
            paymentStatus,
            deliveryStatus,
        });

        const createdSale = await sale.save();
        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// @desc    Update a sales record
// @route   PUT /api/sales/:id
// @access  Public
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

// @desc    Delete a sales record
// @route   DELETE /api/sales/:id
// @access  Public
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

module.exports = {
    getSales,
    createSale,
    updateSale,
    deleteSale,
};
