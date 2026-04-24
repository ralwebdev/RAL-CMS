import FinanceVendor from '../models/FinanceVendor.js';
import FinanceInvoice from '../models/FinanceInvoice.js';
import FinanceExpense from '../models/FinanceExpense.js';
import FinancePayment from '../models/FinancePayment.js';
import PiTiMapping from '../models/PiTiMapping.js';

// @desc    Get all vendors
// @route   GET /api/finance/vendors
// @access  Private/Admin,Accounts
export const getVendors = async (req, res) => {
  try {
    const vendors = await FinanceVendor.find({});
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a vendor
// @route   POST /api/finance/vendors
// @access  Private/Admin,Accounts
export const createVendor = async (req, res) => {
  try {
    const vendor = new FinanceVendor(req.body);
    const createdVendor = await vendor.save();
    res.status(201).json(createdVendor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a vendor
// @route   PUT /api/finance/vendors/:id
// @access  Private/Admin,Accounts
export const updateVendor = async (req, res) => {
  try {
    const vendor = await FinanceVendor.findById(req.params.id);
    if (vendor) {
      Object.assign(vendor, req.body);
      const updatedVendor = await vendor.save();
      res.json(updatedVendor);
    } else {
      res.status(404).json({ message: 'Vendor not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all invoices
// @route   GET /api/finance/invoices
// @access  Private/Admin,Accounts
export const getInvoices = async (req, res) => {
  try {
    const query = {};
    if (req.query.invoiceType) {
      query.invoiceType = req.query.invoiceType;
    }
    const invoices = await FinanceInvoice.find(query).populate('studentId', 'name email phone');
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an invoice
// @route   POST /api/finance/invoices
// @access  Private/Admin,Accounts
export const createInvoice = async (req, res) => {
  try {
    const data = { ...req.body };
    
    if (!data.invoiceNo) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const typeKey = data.invoiceType === 'PI' ? 'PI' : 'INV';
      const count = await FinanceInvoice.countDocuments({
        invoiceNo: new RegExp(`^${typeKey}-${monthKey}`)
      });
      data.invoiceNo = `${typeKey}-${monthKey}-${String(count + 1).padStart(4, '0')}`;
    }

    // Map frontend 'total' to 'totalAmount' if necessary
    if (!data.totalAmount && data.total) {
      data.totalAmount = data.total;
    }

    // Final safety check for required totalAmount
    if (!data.totalAmount) {
      data.totalAmount = (data.subtotal || 0) + (data.cgst || 0) + (data.sgst || 0) + (data.igst || 0);
    }
    
    data.totalAmount = Math.round(data.totalAmount * 100) / 100;

    const invoice = new FinanceInvoice({
      ...data,
      createdBy: req.user._id,
    });
    const createdInvoice = await invoice.save();
    res.status(201).json(createdInvoice);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an invoice
// @route   PUT /api/finance/invoices/:id
// @access  Private/Admin,Accounts
export const updateInvoice = async (req, res) => {
  try {
    const invoice = await FinanceInvoice.findById(req.params.id);
    if (invoice) {
      Object.assign(invoice, req.body);
      const updatedInvoice = await invoice.save();
      res.json(updatedInvoice);
    } else {
      res.status(404).json({ message: 'Invoice not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all expenses
// @route   GET /api/finance/expenses
// @access  Private/Admin,Accounts
export const getExpenses = async (req, res) => {
  try {
    const expenses = await FinanceExpense.find({}).populate('requestedBy', 'name');
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/finance/expenses
// @access  Private/Admin,Accounts
export const createExpense = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.expenseNo) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const count = await FinanceExpense.countDocuments({
        expenseNo: new RegExp(`^EXP-${monthKey}`)
      });
      data.expenseNo = `EXP-${monthKey}-${String(count + 1).padStart(4, '0')}`;
    }

    if (!data.total) {
      data.total = (data.amount || 0) + (data.gst || 0);
    }

    data.total = Math.round(data.total * 100) / 100;

    const expense = new FinanceExpense({
      ...data,
      requestedBy: req.user._id,
      submittedBy: req.user.name,
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve/Update an expense
// @route   PUT /api/finance/expenses/:id
// @access  Private/Admin,Accounts
export const updateExpense = async (req, res) => {
  try {
    const expense = await FinanceExpense.findById(req.params.id);
    if (expense) {
      if (req.body.status === 'Approved') {
        expense.approvedBy = req.user._id;
      }
      Object.assign(expense, req.body);
      const updatedExpense = await expense.save();
      res.json(updatedExpense);
    } else {
      res.status(404).json({ message: 'Expense not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all payments
// @route   GET /api/finance/payments
// @access  Private/Admin,Accounts
export const getPayments = async (req, res) => {
  try {
    const payments = await FinancePayment.find({});
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a payment
// @route   POST /api/finance/payments
// @access  Private/Admin,Accounts
export const createPayment = async (req, res) => {
  try {
    const data = { ...req.body };

    if (!data.receiptNo) {
      const now = new Date();
      const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
      const count = await FinancePayment.countDocuments({
        receiptNo: new RegExp(`^RCP-${monthKey}`)
      });
      data.receiptNo = `RCP-${monthKey}-${String(count + 1).padStart(4, '0')}`;
    }

    const payment = new FinancePayment({
      ...data,
      recordedBy: req.user._id,
    });
    const createdPayment = await payment.save();

    // If linked to an invoice, update invoice amountPaid and status
    if (payment.invoiceId) {
      const invoice = await FinanceInvoice.findById(payment.invoiceId);
      if (invoice) {
        invoice.amountPaid += payment.amount;
        if (invoice.amountPaid >= invoice.totalAmount) {
          invoice.status = 'Paid';
        } else if (invoice.amountPaid > 0) {
          invoice.status = 'Partial';
        }
        await invoice.save();
      }
    }

    res.status(201).json(createdPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Convert PI to TI
// @route   POST /api/finance/convert-pi-to-ti
// @access  Private/Admin,Accounts
export const convertPiToTi = async (req, res) => {
  try {
    const { piId, amount, notes } = req.body;
    const pi = await FinanceInvoice.findById(piId);
    if (!pi) return res.status(404).json({ message: 'Proforma Invoice not found' });
    if (pi.invoiceType !== 'PI') return res.status(400).json({ message: 'Only PI can be converted' });

    // Create TI
    const now = new Date();
    const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
    const count = await FinanceInvoice.countDocuments({
      invoiceNo: new RegExp(`^INV-${monthKey}`)
    });
    const tiNo = `INV-${monthKey}-${String(count + 1).padStart(4, '0')}`;

    const tiData = {
      ...pi.toObject(),
      _id: undefined,
      invoiceNo: tiNo,
      invoiceType: 'TI',
      linkedPiId: pi._id,
      totalAmount: amount || pi.totalAmount,
      amountPaid: 0,
      status: 'Sent',
      issueDate: now,
      dueDate: new Date(now.getTime() + 7 * 86400000), // 7 days due by default for TI
      createdBy: req.user._id,
      notes: notes || `Converted from ${pi.invoiceNo}`,
    };

    const ti = new FinanceInvoice(tiData);
    const createdTi = await ti.save();

    // Record mapping
    const mapping = new PiTiMapping({
      piId: pi._id,
      piNo: pi.invoiceNo,
      tiId: createdTi._id,
      tiNo: createdTi.invoiceNo,
      studentId: pi.customerId,
      studentName: pi.customerName,
      linkedAmount: createdTi.totalAmount,
      convertedBy: req.user._id,
      mode: 'convert',
    });
    await mapping.save();

    res.status(201).json({ ti: createdTi, mapping });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get PI-TI mappings
// @route   GET /api/finance/pi-ti-mappings
// @access  Private/Admin,Accounts
export const getPiTiMappings = async (req, res) => {
  try {
    const mappings = await PiTiMapping.find({}).sort({ createdAt: -1 });
    res.json(mappings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
