import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tutor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  topic: { type: String, required: true },
  duration: { type: Number, enum: [30, 60], required: true },
  scheduledAt: { type: Date, required: true },
  fee: { type: Number, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  doubtDescription: { type: String },
  review: {
    rating: { type: Number },
    comment: { type: String }
  }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);