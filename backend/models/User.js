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
  reviewCount: { type: Number, default: 0 },
  timeZone: { type: String, default: 'UTC' },
  weeklyAvailability: [{
    dayOfWeek: { type: Number, min: 0, max: 6, required: true },
    startTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ },
    endTime: { type: String, required: true, match: /^([01]\d|2[0-3]):[0-5]\d$/ }
  }],
  availability: [{ type: String }]
}, { timestamps: true });

export default mongoose.model('User', userSchema);
