import Session from '../models/Session.js';

export const bookSession = async (req, res) => {
  const { tutorId, subject, topic, duration, scheduledAt, fee, doubtDescription } = req.body;
  try {
    const session = await Session.create({
      student: req.user.id,
      tutor: tutorId,
      subject,
      topic,
      duration,
      scheduledAt,
      fee,
      doubtDescription
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserSessions = async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user.id } : { tutor: req.user.id };
    const sessions = await Session.find(filter)
      .populate('student', 'name email')
      .populate('tutor', 'name email hourlyRate')
      .sort({ scheduledAt: -1 });
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};