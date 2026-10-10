import Session from '../models/Session.js';
import User from '../models/User.js';

const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));

const localSlotFor = (date, timeZone) => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: timeZone || 'UTC', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  const days = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dayOfWeek: days[values.weekday], minuteOfDay: Number(values.hour) * 60 + Number(values.minute) };
};

export const bookSession = async (req, res) => {
  const { tutorId, subject, topic, duration, scheduledAt, doubtDescription } = req.body || {};
  try {
    if (req.user.role !== 'student') return res.status(403).json({ message: 'Only student accounts can book tutor sessions' });
    if (![30, 60].includes(Number(duration))) return res.status(400).json({ message: 'Choose a 30 or 60 minute session' });
    if (typeof subject !== 'string' || !subject.trim() || typeof topic !== 'string' || !topic.trim()) return res.status(400).json({ message: 'Subject and topic are required' });
    const start = new Date(scheduledAt);
    if (!scheduledAt || Number.isNaN(start.getTime()) || start.getTime() < Date.now() + 5 * 60 * 1000) return res.status(400).json({ message: 'Choose a start time at least five minutes from now' });
    const tutor = await User.findOne({ _id: tutorId, role: 'tutor' }).select('hourlyRate weeklyAvailability timeZone');
    if (!tutor) return res.status(404).json({ message: 'Tutor profile not found' });
    if (String(tutor._id) === req.user.id) return res.status(400).json({ message: 'You cannot book a session with yourself' });
    if (!tutor.weeklyAvailability?.length) return res.status(409).json({ message: 'This tutor has not added availability yet' });

    const slotTime = localSlotFor(start, tutor.timeZone);
    const endMinute = slotTime.minuteOfDay + Number(duration);
    const isAvailable = tutor.weeklyAvailability.some((slot) => slot.dayOfWeek === slotTime.dayOfWeek && minutes(slot.startTime) <= slotTime.minuteOfDay && endMinute <= minutes(slot.endTime));
    if (!isAvailable) return res.status(409).json({ message: `That time is outside this tutor's listed availability (${tutor.timeZone || 'UTC'}). Choose a time within one of their weekly windows.` });

    const requestedEnd = new Date(start.getTime() + Number(duration) * 60000);
    const existing = await Session.find({ tutor: tutor._id, status: 'scheduled', scheduledAt: { $lt: requestedEnd } }).select('scheduledAt duration');
    const overlaps = existing.some((session) => {
      const existingStart = new Date(session.scheduledAt).getTime();
      const existingEnd = existingStart + Number(session.duration) * 60000;
      return existingStart < requestedEnd.getTime() && existingEnd > start.getTime();
    });
    if (overlaps) return res.status(409).json({ message: 'The tutor already has a session during that time. Choose another slot.' });

    const fee = Math.round(Number(tutor.hourlyRate || 0) * Number(duration) / 60 * 100) / 100;
    const session = await Session.create({
      student: req.user.id,
      tutor: tutor._id,
      subject: subject.trim().slice(0, 100),
      topic: topic.trim().slice(0, 150),
      duration: Number(duration),
      scheduledAt: start,
      fee,
      doubtDescription: typeof doubtDescription === 'string' ? doubtDescription.trim().slice(0, 2000) : '',
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: 'Unable to book this session right now' });
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

export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body || {};
    if (!['completed', 'cancelled'].includes(status)) return res.status(400).json({ message: 'Choose a valid session status' });
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    const isStudent = String(session.student) === req.user.id;
    const isTutor = String(session.tutor) === req.user.id;
    if (!isStudent && !isTutor) return res.status(403).json({ message: 'You do not have access to this session' });
    if (session.status !== 'scheduled') return res.status(409).json({ message: 'Only scheduled sessions can be updated' });
    if (status === 'completed') {
      if (!isTutor || new Date(session.scheduledAt).getTime() + session.duration * 60000 > Date.now()) {
        return res.status(403).json({ message: 'Only the tutor can mark a session complete after its scheduled end' });
      }
    }
    if (status === 'cancelled' && new Date(session.scheduledAt).getTime() <= Date.now()) {
      return res.status(409).json({ message: 'A session that has started cannot be cancelled' });
    }
    session.status = status;
    await session.save();
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Unable to update this session right now' });
  }
};

export const reviewSession = async (req, res) => {
  try {
    const rating = Number(req.body?.rating);
    const comment = typeof req.body?.comment === 'string' ? req.body.comment.trim().slice(0, 500) : '';
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ message: 'Choose a rating from 1 to 5' });
    const session = await Session.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session not found' });
    if (String(session.student) !== req.user.id) return res.status(403).json({ message: 'Only the student can review this session' });
    if (session.status !== 'completed') return res.status(409).json({ message: 'You can review a session after it is completed' });
    if (session.review?.rating) return res.status(409).json({ message: 'This session already has a review' });

    session.review = { rating, comment };
    await session.save();
    const [summary] = await Session.aggregate([
      { $match: { tutor: session.tutor, 'review.rating': { $gte: 1, $lte: 5 } } },
      { $group: { _id: '$tutor', rating: { $avg: '$review.rating' }, count: { $sum: 1 } } },
    ]);
    if (summary) await User.findByIdAndUpdate(session.tutor, { rating: Math.round(summary.rating * 10) / 10, reviewCount: summary.count });
    res.json(session);
  } catch {
    res.status(500).json({ message: 'Unable to save this review right now' });
  }
};
