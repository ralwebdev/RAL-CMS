import mongoose from 'mongoose';

const AllianceApprovalSchema = new mongoose.Schema({
  requestId: {
    type: String, // referenced source record id (e.g. expense id)
    required: true
  },
  requestType: {
    type: String,
    enum: [
      "Expense Bill", "Task Completion", "Task Extension", 
      "Travel Reimbursement", "Visit Claim", "Custom Request", 
      "Proposal Approval", "Invoice Dispatch"
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  submittedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  submittedRole: {
    type: String,
    required: true
  },
  currentApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  currentApproverRole: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ["Pending", "Approved", "Rejected", "Hold", "Overridden", "Resubmitted"],
    default: "Pending"
  },
  priority: {
    type: String,
    enum: ["Low", "Medium", "High", "Urgent"],
    default: "Medium"
  },
  amount: {
    type: Number
  },
  notes: {
    type: String
  },
  meta: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  nextReviewDate: {
    type: Date
  }
}, {
  timestamps: true
});

const AllianceApprovalLogSchema = new mongoose.Schema({
  approvalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AllianceApproval',
    required: true
  },
  action: {
    type: String,
    enum: ["Approve", "Reject", "Hold", "Override", "Submit", "Resubmit"],
    required: true
  },
  fromStatus: {
    type: String,
    required: true
  },
  toStatus: {
    type: String,
    required: true
  },
  actedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actedRole: {
    type: String,
    required: true
  },
  comment: {
    type: String
  }
}, {
  timestamps: true
});

AllianceApprovalSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

AllianceApprovalSchema.set('toJSON', {
  virtuals: true,
});

AllianceApprovalLogSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

AllianceApprovalLogSchema.set('toJSON', {
  virtuals: true,
});

export const AllianceApproval = mongoose.model('AllianceApproval', AllianceApprovalSchema);
export const AllianceApprovalLog = mongoose.model('AllianceApprovalLog', AllianceApprovalLogSchema);
