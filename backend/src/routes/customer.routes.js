const express = require('express');
const router = express.Router();
const CustomerController = require('../controllers/customer.controller');
const authenticate = require('../middlewares/auth');

// CRUD
router.post('/', authenticate, CustomerController.createCustomer);
router.get('/', authenticate, CustomerController.getCustomers);
router.get('/:id', authenticate, CustomerController.getCustomerById);
router.patch('/:id', authenticate, CustomerController.updateCustomer);
router.delete('/:id', authenticate, CustomerController.deleteCustomer);

// Bulk import
router.post('/bulk', authenticate, CustomerController.bulkCreateCustomers);

// Customer's tickets
router.get('/:id/tickets', authenticate, CustomerController.getCustomerTickets);

module.exports = router;
