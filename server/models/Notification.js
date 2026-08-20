import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Group' },
  type: { type: String, enum: ['expense', 'expense-updated', 'expense-deleted', 'settlement', 'group-invite', 'group-created', 'group-left'], required: true },
  message: { type: String, required: true, trim: true },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Notification', notificationSchema);
