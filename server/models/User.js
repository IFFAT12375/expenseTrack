import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  pin: { type: Number, required: true, select: false },
  username: { type: String, required: true, unique: true, trim: true },
  movements: { type: [Number], default: [] },
  interestRate: { type: Number, default: 1 },
  type: { type: String, default: 'basic' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
