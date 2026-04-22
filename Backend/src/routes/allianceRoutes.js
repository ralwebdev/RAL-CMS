import express from 'express';
import { 
  getInstitutions, createInstitution, updateInstitution, deleteInstitution,
  getVisits, createVisit, updateVisit,
  getProposals, createProposal, updateProposal,
  getTasks, createTask, updateTask,
  getEvents, createEvent,
  getExpenses, createExpense, updateExpense,
  getApprovals, submitApproval, actOnApproval, getApprovalLogs
} from '../controllers/allianceController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes are protected and restricted to specific roles
router.use(protect);
router.use(authorize('alliance_manager', 'alliance_executive', 'admin', 'owner'));

router.route('/institutions')
  .get(getInstitutions)
  .post(createInstitution);

router.route('/institutions/:id')
  .put(updateInstitution)
  .delete(authorize('alliance_manager', 'admin', 'owner'), deleteInstitution); // Restrict delete to managers/admins

router.route('/visits')
  .get(getVisits)
  .post(createVisit);

router.route('/visits/:id')
  .put(updateVisit);

router.route('/proposals')
  .get(getProposals)
  .post(createProposal);

router.route('/proposals/:id')
  .put(updateProposal);

router.route('/tasks')
  .get(getTasks)
  .post(createTask);

router.route('/tasks/:id')
  .put(updateTask);

router.route('/events')
  .get(getEvents)
  .post(createEvent);

router.route('/expenses')
  .get(getExpenses)
  .post(createExpense);

router.route('/expenses/:id')
  .put(updateExpense);

router.route('/approvals')
  .get(getApprovals)
  .post(submitApproval);

router.route('/approvals/logs')
  .get(getApprovalLogs);

router.route('/approvals/:id')
  .put(actOnApproval);

export default router;
