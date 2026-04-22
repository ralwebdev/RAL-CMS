import AllianceInstitution from '../models/AllianceInstitution.js';
import AllianceContact from '../models/AllianceContact.js';
import AllianceVisit from '../models/AllianceVisit.js';
import AllianceTask from '../models/AllianceTask.js';
import AllianceProposal from '../models/AllianceProposal.js';
import AllianceEvent from '../models/AllianceEvent.js';
import AllianceExpense from '../models/AllianceExpense.js';

// @desc    Get all alliance institutions (Scoped by RBAC)
// @route   GET /api/alliances/institutions
// @access  Private
export const getInstitutions = async (req, res) => {
  try {
    let query = {};
    
    // RBAC Scoping
    if (req.user.role === 'alliance_executive') {
      query.assignedExecutiveId = req.user._id;
    }
    // alliance_manager, admin, owner see all

    const institutions = await AllianceInstitution.find(query)
      .populate('assignedExecutiveId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(institutions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an institution
// @route   POST /api/alliances/institutions
// @access  Private
export const createInstitution = async (req, res) => {
  try {
    // Generate sequential institutionId
    const count = await AllianceInstitution.countDocuments();
    const seq = (count + 1).toString().padStart(4, '0');
    const institutionId = `INS-${seq}`;

    const institution = new AllianceInstitution({
      ...req.body,
      institutionId,
      // Ensure assignedExecutiveId is mapped correctly
      assignedExecutiveId: req.body.assignedExecutiveId || req.user._id
    });
    
    const createdInstitution = await institution.save();
    res.status(201).json(createdInstitution);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an institution
// @route   PUT /api/alliances/institutions/:id
// @access  Private
export const updateInstitution = async (req, res) => {
  try {
    const institution = await AllianceInstitution.findById(req.params.id);
    if (institution) {
      // Basic RBAC check for update if executive
      if (req.user.role === 'alliance_executive' && institution.assignedExecutiveId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this record' });
      }

      Object.assign(institution, req.body);
      const updatedInstitution = await institution.save();
      res.json(updatedInstitution);
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an institution
// @route   DELETE /api/alliances/institutions/:id
// @access  Private/Admin,Owner,Manager
export const deleteInstitution = async (req, res) => {
  try {
    const institution = await AllianceInstitution.findById(req.params.id);
    if (institution) {
      await institution.deleteOne();
      res.json({ message: 'Institution removed' });
    } else {
      res.status(404).json({ message: 'Institution not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all visits
// @route   GET /api/alliances/visits
// @access  Private
export const getVisits = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'alliance_executive') {
      query.executiveId = req.user._id;
    }
    const visits = await AllianceVisit.find(query)
      .populate('institutionId', 'name')
      .populate('executiveId', 'name')
      .sort({ visitDate: -1 });
    res.json(visits);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a visit
// @route   POST /api/alliances/visits
// @access  Private
export const createVisit = async (req, res) => {
  try {
    const visit = new AllianceVisit({
      ...req.body,
      executiveId: req.user._id // Always recorded as the current user
    });
    const createdVisit = await visit.save();
    res.status(201).json(createdVisit);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a visit
// @route   PUT /api/alliances/visits/:id
// @access  Private
export const updateVisit = async (req, res) => {
  try {
    const visit = await AllianceVisit.findById(req.params.id);
    if (visit) {
      if (req.user.role === 'alliance_executive' && visit.executiveId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this visit' });
      }
      Object.assign(visit, req.body);
      const updatedVisit = await visit.save();
      res.json(updatedVisit);
    } else {
      res.status(404).json({ message: 'Visit not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get proposals
// @route   GET /api/alliances/proposals
// @access  Private
export const getProposals = async (req, res) => {
  try {
    // Proposals are usually viewed by institution, but for RBAC we might need to join or scope
    // For now, allow viewing all if manager, or join with institution for executive
    let query = {};
    if (req.user.role === 'alliance_executive') {
      const myInstitutions = await AllianceInstitution.find({ assignedExecutiveId: req.user._id }).select('_id');
      const instIds = myInstitutions.map(i => i._id);
      query.institutionId = { $in: instIds };
    }
    
    const proposals = await AllianceProposal.find(query)
      .populate('institutionId', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a proposal
// @route   POST /api/alliances/proposals
// @access  Private
export const createProposal = async (req, res) => {
  try {
    const proposal = new AllianceProposal(req.body);
    const createdProposal = await proposal.save();
    res.status(201).json(createdProposal);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a proposal
// @route   PUT /api/alliances/proposals/:id
// @access  Private
export const updateProposal = async (req, res) => {
  try {
    const proposal = await AllianceProposal.findById(req.params.id);
    if (proposal) {
      Object.assign(proposal, req.body);
      const updatedProposal = await proposal.save();
      res.json(updatedProposal);
    } else {
      res.status(404).json({ message: 'Proposal not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get tasks
// @route   GET /api/alliances/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'alliance_executive') {
      query.assignedTo = req.user._id;
    }
    const tasks = await AllianceTask.find(query)
      .populate('institutionId', 'name')
      .populate('assignedTo', 'name')
      .sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a task
// @route   POST /api/alliances/tasks
// @access  Private
export const createTask = async (req, res) => {
  try {
    const task = new AllianceTask({
      ...req.body,
      assignedTo: req.body.assignedTo || req.user._id
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a task
// @route   PUT /api/alliances/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  try {
    const task = await AllianceTask.findById(req.params.id);
    if (task) {
      if (req.user.role === 'alliance_executive' && task.assignedTo.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      Object.assign(task, req.body);
      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get events
// @route   GET /api/alliances/events
// @access  Private
export const getEvents = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'alliance_executive') {
      const myInstitutions = await AllianceInstitution.find({ assignedExecutiveId: req.user._id }).select('_id');
      const instIds = myInstitutions.map(i => i._id);
      query.institutionId = { $in: instIds };
    }
    const events = await AllianceEvent.find(query)
      .populate('institutionId', 'name')
      .sort({ eventDate: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an event
// @route   POST /api/alliances/events
// @access  Private
export const createEvent = async (req, res) => {
  try {
    const event = new AllianceEvent(req.body);
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get expenses
// @route   GET /api/alliances/expenses
// @access  Private
export const getExpenses = async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'alliance_executive') {
      query.executiveId = req.user._id;
    }
    const expenses = await AllianceExpense.find(query)
      .populate('institutionId', 'name')
      .populate('executiveId', 'name')
      .sort({ expenseDate: -1 });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/alliances/expenses
// @access  Private
export const createExpense = async (req, res) => {
  try {
    const expense = new AllianceExpense({
      ...req.body,
      executiveId: req.user._id
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update an expense status
// @route   PUT /api/alliances/expenses/:id
// @access  Private
export const updateExpense = async (req, res) => {
  try {
    const expense = await AllianceExpense.findById(req.params.id);
    if (expense) {
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
