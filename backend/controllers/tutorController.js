import User from '../models/User.js';

export const getTutors = async (req, res) => {
  try {
    const { subject } = req.query;
    const filter = { role: 'tutor' };
    if (subject) filter.subjects = { $in: [new RegExp(subject, 'i')] };

    const tutors = await User.find(filter).select('-password');
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};