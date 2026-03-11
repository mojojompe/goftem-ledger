const Sales = require('../models/Sales');
const { startOfDay, endOfDay, parseISO } = require('date-fns');

// --- Helper Functions for Analytics ---
const getTopItems = async (matchQuery) => {
    // Aggregation pipeline to find top-selling items
    return await Sales.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.name",
                totalQuantity: { $sum: { $ifNull: ["$items.quantity", 1] } },
                totalRevenue: { $sum: { $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }] } }
            }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 }
    ]);
};

const getRevenueOverTime = async (matchQuery) => {
    // Group paid revenue by day
    return await Sales.aggregate([
        { $match: { ...matchQuery, paymentStatus: 'paid' } },
        { $unwind: { path: "$items", preserveNullAndEmptyArrays: true } },
        {
            $group: {
                _id: "$date",
                revenue: {
                    $sum: {
                        $cond: [
                            { $and: [{ $ne: ["$items", undefined] }, { $eq: ["$items.paymentStatus", "paid"] }] },
                            { $multiply: ["$items.price", { $ifNull: ["$items.quantity", 1] }] },
                            { $cond: [{ $eq: ["$paymentStatus", "paid"] }, "$price", 0] } // fallback for legacy
                        ]
                    }
                }
            }
        },
        { $sort: { _id: 1 } },
        {
            $project: {
                date: "$_id",
                revenue: 1,
                _id: 0
            }
        }
    ]);
};


// GET /api/sales - with Pagination, Date Filtering, and optionally Analytics
const getSales = async (req, res) => {
    try {
        const { page = 1, limit = 50, startDate, endDate, includeAnalytics = 'false' } = req.query;

        // 1. Build the match query for filtering
        let matchQuery = {};
        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: startOfDay(parseISO(startDate)),
                $lte: endOfDay(parseISO(endDate))
            };
        }

        // 2. Pagination variables
        const parsedPage = parseInt(page);
        const parsedLimit = parseInt(limit);
        const skip = (parsedPage - 1) * parsedLimit;

        // 3. Fetch data
        const salesPromise = Sales.find(matchQuery)
            .sort({ date: -1, createdAt: -1 })
            .skip(skip)
            .limit(parsedLimit);

        const countPromise = Sales.countDocuments(matchQuery);

        const [sales, totalSales] = await Promise.all([salesPromise, countPromise]);

        const totalPages = Math.ceil(totalSales / parsedLimit);

        // 4. Fetch Analytics if requested (usually only requested on page 1 or explicitly)
        let analytics = null;
        if (includeAnalytics === 'true') {
            const [topItems, revenueOverTime] = await Promise.all([
                getTopItems(matchQuery),
                getRevenueOverTime(matchQuery)
            ]);
            analytics = {
                topItems: topItems.map(item => ({ name: item._id, quantity: item.totalQuantity, revenue: item.totalRevenue })),
                revenueTimeline: revenueOverTime
            };
        }

        res.json({
            sales,
            pagination: {
                totalRecords: totalSales,
                totalPages,
                currentPage: parsedPage,
                limit: parsedLimit,
                hasNextPage: parsedPage < totalPages,
            },
            ...(analytics && { analytics })
        });
    } catch (error) {
        console.error("Error in getSales:", error);
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
