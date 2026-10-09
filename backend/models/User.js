import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'tutor'], default: 'student' },
  // Tutor Specific Fields
  subjects: [{ type: String }],
  hourlyRate: { type: Number, default: 0 },
  bio: { type: String, default: '' },
  rating: { type: Number, default: 5.0 },
  availability: [{ type: String }] // e.g. ["Monday 10:00 AM - 12:00 PM"]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
