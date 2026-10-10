import { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

const errorMessage = (err, fallback) => err.response?.data?.message || (err.code === 'ERR_NETWORK' ? 'The server is taking a break. Check your connection and try again.' : fallback);
const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const localDateTimeMin = () => new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
const availabilityText = (tutor) => {
  const slots = tutor.weeklyAvailability || [];
  if (!slots.length) return 'Availability not listed';
  return slots.map((slot) => `${weekdayNames[slot.dayOfWeek]} ${slot.startTime}-${slot.endTime}`).join(', ');
};

export default function AskAI() {
  const { user } = useContext(AuthContext);
  const [doubt, setDoubt] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [tutors, setTutors] = useState([]);
  const [showingAllTutors, setShowingAllTutors] = useState(false);
  const [loading, setLoading] = useState(false);
  const [bookingId, setBookingId] = useState('');
  const [bookingTutor, setBookingTutor] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [notice, setNotice] = useState(null);

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setLoading(true);
    setNotice(null);
    setAnalysis(null);
    setTutors([]);
    setShowingAllTutors(false);

    let result;
    try {
      const response = await API.post('/ai/analyze', { doubt: doubt.trim() });
      result = response.data;
      setAnalysis(result);
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'We could not analyze that question. Please try again.') });
      setLoading(false);
      return;
    }

    try {
      const matched = await API.get('/tutors', { params: { subject: result.subject } });
      if (matched.data.length > 0) {
        setTutors(matched.data);
      } else {
        const allTutors = await API.get('/tutors');
        setTutors(allTutors.data);
        setShowingAllTutors(allTutors.data.length > 0);
      }
    } catch {
      setNotice({ type: 'error', text: 'Your answer is ready, but tutor profiles could not be loaded. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const bookTutor = async (event, tutor) => {
    event.preventDefault();
    if (!scheduledAt) return;
    setBookingId(tutor._id);
    setNotice(null);
    try {
      await API.post('/sessions/book', {
        tutorId: tutor._id,
        subject: analysis.subject,
        topic: analysis.topic,
        duration: Number(duration),
        scheduledAt: new Date(scheduledAt).toISOString(),
        doubtDescription: doubt.trim(),
      });
      setNotice({ type: 'success', text: `Your session with ${tutor.name} is booked. Find the details in My sessions.` });
      setBookingTutor('');
    } catch (err) {
      setNotice({ type: 'error', text: errorMessage(err, 'We could not book that session. Please try again.') });
    } finally {
      setBookingId('');
    }
  };

  return <div className="learning-page">
    <section className="welcome-row"><div><p className="eyebrow"><span className="eyebrow-spark">&#10033;</span> YOUR PERSONAL STUDY SPACE</p><h1>Hey, {user?.name?.split(' ')[0] || 'there'}.<br/><span>What are we figuring out?</span></h1><p className="page-lede">Ask a question. Get a clear starting point. Find a tutor when you need one.</p></div><div className="welcome-art" aria-hidden="true"><span className="art-sun">&#10033;</span><span className="art-loop">&#8599;</span><span className="art-caption">STAY<br/>CURIOUS</span></div></section>
    <section className="question-card"><div className="card-heading"><span className="step-number">01</span><div><h2>Start with your question</h2><p>Share what is confusing you. The more detail, the better the guidance.</p></div></div>
      <form onSubmit={handleAnalyze} className="question-form"><label className="sr-only" htmlFor="doubt">Your question</label><textarea id="doubt" rows="5" maxLength="2000" placeholder="For example: I understand what a derivative is, but I do not get why the chain rule works..." value={doubt} onChange={(e) => setDoubt(e.target.value)} required/><div className="question-controls"><span className="character-count">{doubt.length}/2000</span><button className="button button-primary" type="submit" disabled={loading || !doubt.trim()}>{loading ? <><span className="spinner"/> Thinking it through...</> : <>Help me understand <span aria-hidden="true">&#8594;</span></>}</button></div></form>
      <div className="privacy-note"><span>&#10022;</span> Your question is used to prepare this learning session.</div>
    </section>
    {notice && <div className={`notice notice-${notice.type}`} role={notice.type === 'error' ? 'alert' : 'status'}>{notice.text}{notice.type === 'success' && <> <Link to="/dashboard">View sessions &#8594;</Link></>}</div>}
    {analysis && <section className="results-grid" aria-live="polite"><article className="answer-card"><div className="result-overline"><span className="result-icon">&#10033;</span> YOUR STARTING POINT</div><div className="topic-tags"><span>{analysis.subject}</span><span>{analysis.difficulty} level</span></div><h2>{analysis.topic}</h2><p className="answer-text">{analysis.initialExplanation}</p><div className="answer-foot"><span className="answer-bulb">&#10023;</span><span>Use this as a starting point. Keep asking questions as you learn.</span></div></article>
      <section className="tutors-card"><div className="tutor-heading"><div><p className="eyebrow">LEARN TOGETHER</p><h2>Need a human touch?</h2></div><span className="tutor-count">{tutors.length.toString().padStart(2, '0')}</span></div><p className="tutor-subtitle">{showingAllTutors ? `No exact ${analysis.subject} match yet - browse all tutors.` : `Tutors who can help with ${analysis.subject}.`}</p>
        {tutors.length === 0 ? <div className="empty-tutors"><span>&#9788;</span><p>No tutor profiles yet.</p><small>Be the first to share your knowledge and help a learner.</small><Link className="button button-outline button-book tutor-join" to="/register">Join as a tutor &#8599;</Link></div> : <div className="tutor-list">{tutors.map((tutor) => <article className="tutor-item" key={tutor._id}><div className="tutor-avatar">{tutor.name?.charAt(0).toUpperCase()}</div><div className="tutor-info"><h3>{tutor.name}</h3><p>{tutor.bio || `Ready to help with ${analysis.subject}`}</p><span className="tutor-rate">${Number(tutor.hourlyRate || 0)}/hr {tutor.reviewCount ? `· ${Number(tutor.rating).toFixed(1)} ★ (${tutor.reviewCount} reviews)` : '· New tutor'}</span><p className="tutor-availability">{availabilityText(tutor)} {tutor.timeZone ? `(${tutor.timeZone})` : ''}</p></div><button className="button button-outline button-book" type="button" onClick={() => { setBookingTutor(bookingTutor === tutor._id ? '' : tutor._id); setScheduledAt(''); setDuration(30); setNotice(null); }} disabled={Boolean(bookingId)}>{bookingId === tutor._id ? 'Booking...' : bookingTutor === tutor._id ? 'Close' : 'Book session'}</button>{bookingTutor === tutor._id && <form className="booking-form" onSubmit={(event) => bookTutor(event, tutor)}><label>Start time <input type="datetime-local" min={localDateTimeMin()} value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} required /></label><label>Length <select value={duration} onChange={(event) => setDuration(Number(event.target.value))}><option value="30">30 minutes</option><option value="60">60 minutes</option></select></label><span className="booking-total">Total: ${((Number(tutor.hourlyRate) || 0) * Number(duration) / 60).toFixed(2)}</span><button className="button button-primary button-book-submit" type="submit" disabled={Boolean(bookingId)}>{bookingId === tutor._id ? 'Booking...' : 'Confirm booking'}</button></form>}</article>)}</div>}
      </section></section>}
    <div className="bottom-tip"><span>&#10033;</span><p><strong>Learning tip</strong> - Explaining what you already understand is a great way to find the next question.</p></div>
  </div>;
}
