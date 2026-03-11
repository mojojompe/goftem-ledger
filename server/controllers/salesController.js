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
        // If whole sale entered as paid, mark all items as paid too
        const resolvedItems = (items || []).map(i => ({
            ...i,
            paymentStatus: paymentStatus === 'paid' ? 'paid' : (i.paymentStatus || 'pending'),
        }));

        const sale = new Sales({ date, buyerName, items: resolvedItems, paymentStatus, deliveryStatus });
        const createdSale = await sale.save();
        res.status(201).json(createdSale);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const updateSale = async (req, res) => {
    const { paymentStatus, deliveryStatus, items, itemIndex } = req.body;
    try {
        const sale = await Sales.findById(req.params.id);
        if (!sale) return res.status(404).json({ message: 'Sale not found' });

        // Update a single item's payment status
        if (itemIndex !== undefined && sale.items.length > 0) {
            sale.items[itemIndex].paymentStatus = paymentStatus;

            // Derive overall paymentStatus from all items
            const allPaid = sale.items.every(i => i.paymentStatus === 'paid');
            sale.paymentStatus = allPaid ? 'paid' : 'pending';
        } else {
            // Whole-sale update (legacy / delivery status)
            if (paymentStatus !== undefined) {
                sale.paymentStatus = paymentStatus;
                // Also mark all items as paid/pending
                if (sale.items.length > 0) {
                    sale.items = sale.items.map(i => ({ ...i.toObject(), paymentStatus }));
                }
            }
            if (deliveryStatus !== undefined) sale.deliveryStatus = deliveryStatus;
        }

        const updatedSale = await sale.save();
        res.json(updatedSale);
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
