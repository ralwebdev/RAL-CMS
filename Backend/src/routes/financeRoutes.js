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

// Apply protection to all finance routes, but authorization is route-specific
router.use(protect);

// Vendor routes
router.route('/vendors')
  .get(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), getVendors)
  .post(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), createVendor);
router.route('/vendors/:id')
  .put(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), updateVendor);

// Invoice routes
router.route('/invoices')
  .get(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner', 'counselor'), getInvoices)
  .post(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), createInvoice);
router.route('/invoices/:id')
  .put(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), updateInvoice);

// Expense routes
router.route('/expenses')
  .get(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), getExpenses)
  .post(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), createExpense);
router.route('/expenses/:id')
  .put(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), updateExpense);

// Payment routes
router.route('/payments')
  .get(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner', 'counselor'), getPayments)
  .post(authorize('admin', 'accounts_manager', 'accounts_executive', 'owner'), createPayment);

export default router;
