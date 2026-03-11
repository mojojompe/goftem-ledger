const express = require('express');
const router = express.Router();
const { getSales, createSale, updateSale, deleteSale } = require('../controllers/salesController');

router.route('/').get(getSales).post(createSale);
router.route('/:id').put(updateSale).delete(deleteSale);

module.exports = router;
