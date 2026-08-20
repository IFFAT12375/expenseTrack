import mongoose from 'mongoose';

const splitSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  description: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 0.01 },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  splits: { type: [splitSchema], required: true },
  splitType: { type: String, enum: ['equal', 'exact'], default: 'exact' },
  category: { type: String, default: 'general', trim: true }
}, { timestamps: true });

export default mongoose.model('Expense', expenseSchema);
