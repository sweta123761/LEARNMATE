import { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    API.get('/sessions/my-sessions').then(({ data }) => { if (active) setSessions(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.response?.data?.message || 'Your sessions could not be loaded. Please try again.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const title = user?.role === 'tutor' ? 'Your upcoming sessions' : 'Your learning sessions';
  return <div className="dashboard-page"><section className="dashboard-hero"><div><p className="eyebrow"><span className="eyebrow-spark">✳</span> YOUR LEARNING, IN ONE PLACE</p><h1>{title}<span className="title-period">.</span></h1><p className="page-lede">Keep track of the conversations that move you forward.</p></div><Link className="button button-primary" to="/">Ask a question <span aria-hidden="true">→</span></Link></section>
    <section className="sessions-panel"><div className="sessions-heading"><div><h2>Session overview</h2><p>{loading ? 'Gathering your sessions…' : `${sessions.length} ${sessions.length === 1 ? 'session' : 'sessions'} on your list`}</p></div><span className="sessions-badge">{sessions.length.toString().padStart(2, '0')}</span></div>
      {error && <div className="form-alert" role="alert"><span>!</span>{error}</div>}
      {loading ? <div className="session-loading"><span className="spinner spinner-dark"/> Loading your sessions…</div> : !error && sessions.length === 0 ? <div className="empty-sessions"><div className="empty-illustration" aria-hidden="true"><span>✳</span><span>↗</span></div><h3>A fresh page.</h3><p>Your booked sessions will show up here. Find a tutor whenever you’re ready for a little extra help.</p><Link className="button button-primary" to="/">Find a tutor <span aria-hidden="true">→</span></Link></div> : !error && <div className="session-list">{sessions.map((session) => { const other = user?.role === 'tutor' ? session.student : session.tutor; const date = new Date(session.scheduledAt); return <article className="session-row" key={session._id}><div className="session-date"><strong>{Number.isNaN(date.getTime()) ? '—' : date.toLocaleDateString('en', { day: '2-digit' })}</strong><span>{Number.isNaN(date.getTime()) ? 'TBD' : date.toLocaleDateString('en', { month: 'short' })}</span></div><div className="session-main"><h3>{session.topic || session.subject || 'Learning session'}</h3><p>{session.subject || 'Study session'}{other?.name ? ` · with ${other.name}` : ''}</p></div><div className="session-time">{Number.isNaN(date.getTime()) ? 'Time to be confirmed' : date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}<span>{session.duration || 30} minutes</span></div><span className={`status-pill status-${session.status || 'pending'}`}>{session.status || 'booked'}</span></article>; })}</div>}
    </section><div className="bottom-tip"><span>✳</span><p><strong>Keep the momentum</strong> — Every session is one more step toward understanding.</p></div>
  </div>;
}
