import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const register = async (req, res) => {
  const { name, email, password, role, subjects, hourlyRate, bio, weeklyAvailability, timeZone } = req.body || {};
  const cleanName = typeof name === 'string' ? name.trim() : '';
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const cleanRole = role || 'student';
  if (cleanName.length < 2 || cleanName.length > 80) return res.status(400).json({ message: 'Name must be between 2 and 80 characters' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) return res.status(400).json({ message: 'Enter a valid email address' });
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) return res.status(400).json({ message: 'Password must be between 8 and 128 characters' });
  if (!['student', 'tutor'].includes(cleanRole)) return res.status(400).json({ message: 'Choose a valid account type' });
  let tutorProfile = {};
  if (cleanRole === 'tutor') {
    const cleanSubjects = Array.isArray(subjects) ? [...new Set(subjects.filter((item) => typeof item === 'string').map((item) => item.trim()).filter(Boolean))].slice(0, 20) : [];
    const cleanAvailability = Array.isArray(weeklyAvailability) ? weeklyAvailability.slice(0, 20) : [];
    const validTime = (value) => typeof value === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    const validAvailability = cleanAvailability.every((slot) => slot && Number.isInteger(Number(slot.dayOfWeek)) && Number(slot.dayOfWeek) >= 0 && Number(slot.dayOfWeek) <= 6 && validTime(slot.startTime) && validTime(slot.endTime) && slot.startTime < slot.endTime);
    const cleanRate = Number(hourlyRate);
    if (!cleanSubjects.length) return res.status(400).json({ message: 'Add at least one subject you can teach' });
    if (!Number.isFinite(cleanRate) || cleanRate < 0 || cleanRate > 10000) return res.status(400).json({ message: 'Enter a valid hourly fee' });
    if (!cleanAvailability.length || !validAvailability) return res.status(400).json({ message: 'Add at least one valid weekly availability window' });
    let cleanTimeZone = typeof timeZone === 'string' ? timeZone : 'UTC';
    try { new Intl.DateTimeFormat('en', { timeZone: cleanTimeZone }); } catch { cleanTimeZone = 'UTC'; }
    tutorProfile = {
      subjects: cleanSubjects,
      hourlyRate: cleanRate,
      bio: typeof bio === 'string' ? bio.trim().slice(0, 500) : '',
      weeklyAvailability: cleanAvailability.map((slot) => ({ dayOfWeek: Number(slot.dayOfWeek), startTime: slot.startTime, endTime: slot.endTime })),
      timeZone: cleanTimeZone,
    };
  }
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured on this server' });
  try {
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: cleanName, email: cleanEmail, password: hashedPassword, role: cleanRole,
      ...tutorProfile
    });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ message: 'An account with this email already exists' });
    res.status(500).json({ message: 'Unable to create your account right now' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body || {};
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!cleanEmail || typeof password !== 'string' || !password) return res.status(400).json({ message: 'Email and password are required' });
  if (!process.env.JWT_SECRET) return res.status(503).json({ message: 'Authentication is not configured on this server' });
  try {
    const user = await User.findOne({ email: cleanEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: 'Unable to log in right now' });
  }
};
