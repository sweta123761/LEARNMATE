import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [reviewingId, setReviewingId] = useState('');
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/sessions/my-sessions').then(({ data }) => { if (active) setSessions(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Your sessions could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const applySessionUpdate = (updated) => setSessions((current) => current.map((session) => session._id === updated._id ? { ...session, ...updated } : session));
  const updateStatus = async (session, status) => {
    setActionMessage('');
    try {
      const { data } = await API.patch(`/sessions/${session._id}/status`, { status });
      applySessionUpdate(data);
      setActionMessage(status === 'completed' ? 'Session marked complete. The student can now leave a review.' : 'Session cancelled.');
    } catch (err) { setActionMessage(err.response?.data?.message || 'Could not update the session. Please try again.'); }
  };
  const submitReview = async (event, session) => {
    event.preventDefault();
    setActionMessage('');
    try {
      const { data } = await API.post(`/sessions/${session._id}/review`, { rating: Number(rating), comment });
      applySessionUpdate(data);
      setReviewingId(''); setComment(''); setRating(5);
      setActionMessage('Thanks for sharing your feedback.');
    } catch (err) { setActionMessage(err.response?.data?.message || 'Could not save the review. Please try again.'); }
  };

  const title = user?.role === 'tutor' ? 'Your tutoring history' : 'Your learning history';
  return <div className="dashboard-page"><section className="dashboard-hero"><div><p className="eyebrow"><span className="eyebrow-spark">&#10033;</span> YOUR LEARNING, IN ONE PLACE</p><h1>{title}<span className="title-period">.</span></h1><p className="page-lede">Bookings, completed sessions, and feedback all in one place.</p></div><Link className="button button-primary" to="/">Ask a question <span aria-hidden="true">&#8594;</span></Link></section>
    <section className="sessions-panel"><div className="sessions-heading"><div><h2>Session history</h2><p>{loading ? 'Gathering your sessions...' : `${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} on your list`}</p></div><span className="sessions-badge">{sessions.length.toString().padStart(2, '0')}</span></div>
      {error && <div className="form-alert" role="alert"><span>!</span>{error}</div>}
      {actionMessage && <div className="notice notice-success" role="status">{actionMessage}</div>}
      {loading ? <div className="session-loading"><span className="spinner spinner-dark"/> Loading your sessions...</div> : !error && sessions.length === 0 ? <div className="empty-sessions"><div className="empty-illustration" aria-hidden="true"><span>&#10033;</span><span>&#8599;</span></div><h3>A fresh page.</h3><p>Your bookings and learning history will show up here. Find a tutor whenever you are ready for extra help.</p><Link className="button button-primary" to="/">Find a tutor <span aria-hidden="true">&#8594;</span></Link></div> : !error && <div className="session-list">{sessions.map((session) => {
        const isTutor = user?.role === 'tutor';
        const other = isTutor ? session.student : session.tutor;
        const date = new Date(session.scheduledAt);
        const ended = !Number.isNaN(date.getTime()) && date.getTime() + Number(session.duration || 30) * 60000 <= Date.now();
        const canCancel = session.status === 'scheduled' && !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
        return <article className="session-card" key={session._id}>
          <div className="session-row"><div className="session-date"><strong>{Number.isNaN(date.getTime()) ? '--' : date.toLocaleDateString('en', { day: '2-digit' })}</strong><span>{Number.isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString('en', { month: 'short' })}</span></div><div className="session-main"><h3>{session.topic || session.subject || 'Learning session'}</h3><p>{session.subject || 'Study session'}{other?.name ? ` · ${isTutor ? 'student' : 'with'} ${other.name}` : ''}</p></div><div className="session-time">{Number.isNaN(date.getTime()) ? 'Time to be confirmed' : date.toLocaleString([], { hour: 'numeric', minute: '2-digit' })}<span>{session.duration || 30} minutes · ${Number(session.fee || 0).toFixed(2)}</span></div><span className={`status-pill status-${session.status || 'scheduled'}`}>{session.status || 'scheduled'}</span></div>
          {session.review?.rating && <div className="saved-review"><span className="review-stars">{'★'.repeat(session.review.rating)}{'☆'.repeat(5 - session.review.rating)}</span><span>{session.review.comment || 'No written comment.'}</span></div>}
          <div className="session-actions">{isTutor && session.status === 'scheduled' && ended && <button className="button button-outline session-action" type="button" onClick={() => updateStatus(session, 'completed')}>Mark complete</button>}{canCancel && <button className="session-cancel" type="button" onClick={() => updateStatus(session, 'cancelled')}>Cancel session</button>}{!isTutor && session.status === 'completed' && !session.review?.rating && <button className="button button-outline session-action" type="button" onClick={() => { setReviewingId(reviewingId === session._id ? '' : session._id); setRating(5); setComment(''); }}>Leave a review</button>}</div>
          {reviewingId === session._id && <form className="review-form" onSubmit={(event) => submitReview(event, session)}><label>Rating <select value={rating} onChange={(event) => setRating(Number(event.target.value))}><option value="5">5 - Excellent</option><option value="4">4 - Great</option><option value="3">3 - Good</option><option value="2">2 - Fair</option><option value="1">1 - Poor</option></select></label><label>Comment <textarea value={comment} onChange={(event) => setComment(event.target.value)} maxLength="500" rows="2" placeholder="What was helpful about this session?" /></label><button className="button button-primary session-action" type="submit">Submit review</button></form>}
        </article>;
      })}</div>}
    </section><div className="bottom-tip"><span>&#10033;</span><p><strong>Keep the momentum</strong> - Every session is one more step toward understanding.</p></div>
  </div>;
}
