import mongoose from 'mongoose';

const AdmissionSchema = new mongoose.Schema({
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead', required: true },
  studentName: { type: String, required: true },
  courseSelected: { type: String, required: true },
  admissionDate: { type: String, required: true },
  totalFee: { type: Number, required: true },
  feePaid: { type: Number, required: true },
  scholarshipAmount: { type: Number, default: 0 },
  paymentMethod: { type: String },
  batchAssigned: { type: String },
  counselorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'Confirmed' }
}, { timestamps: true });

export default mongoose.model('Admission', AdmissionSchema);
