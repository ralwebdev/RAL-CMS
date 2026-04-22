import express from 'express';
import {
  getVendors,
  createVendor,
  updateVendor,
  getInvoices,
  createInvoice,
  updateInvoice,
  getExpenses,
  createExpense,
  updateExpense,
  getPayments,
  createPayment,
} from '../controllers/financeController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protection and role-based authorization to all finance routes
router.use(protect);
router.use(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'));

// Vendor routes
router.route('/vendors')
  .get(getVendors)
  .post(createVendor);
router.route('/vendors/:id')
  .put(updateVendor);

// Invoice routes
router.route('/invoices')
  .get(getInvoices)
  .post(createInvoice);
router.route('/invoices/:id')
  .put(updateInvoice);

// Expense routes
router.route('/expenses')
  .get(getExpenses)
  .post(createExpense);
router.route('/expenses/:id')
  .put(updateExpense);

// Payment routes
router.route('/payments')
  .get(getPayments)
  .post(createPayment);

export default router;
