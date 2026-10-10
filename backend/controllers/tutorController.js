import User from '../models/User.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const subjectGroups = [
  ['math', 'mathematics', 'algebra', 'calculus', 'geometry', 'statistics'],
  ['computer science', 'programming', 'coding', 'software', 'algorithms', 'data structures'],
  ['english', 'writing', 'grammar', 'literature'],
  ['physics'], ['chemistry'], ['biology'], ['history'], ['economics'],
];

export const getTutors = async (req, res) => {
  try {
    const subject = typeof req.query.subject === 'string' ? req.query.subject.trim() : '';
    const filter = { role: 'tutor' };
    if (subject) {
      const normalized = subject.toLowerCase();
      const aliases = subjectGroups.find((group) => group.some((term) => normalized.includes(term) || term.includes(normalized)));
      const terms = new Set([subject, ...(aliases || [])]);
      filter.subjects = { $in: [...terms].map((term) => new RegExp(escapeRegex(term), 'i')) };
    }

    const tutors = await User.find(filter).select('-password').sort({ rating: -1, name: 1 });
    res.json(tutors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
