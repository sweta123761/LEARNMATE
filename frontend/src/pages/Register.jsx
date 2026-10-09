import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', subjects: '', hourlyRate: '', bio: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const payload = { ...form, name: form.name.trim(), email: form.email.trim().toLowerCase() };
      if (form.role === 'tutor') {
        payload.subjects = form.subjects.split(',').map((subject) => subject.trim()).filter(Boolean);
        payload.hourlyRate = Number(form.hourlyRate) || 0;
      } else {
        delete payload.subjects; delete payload.hourlyRate; delete payload.bio;
      }
      const { data } = await API.post('/auth/register', payload);
      login({ token: data.token, ...data.user }); navigate('/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || (err.code === 'ERR_NETWORK' ? 'Could not reach LearnMate. Check your connection and try again.' : 'We couldn’t create your account. Please try again.'));
    } finally { setLoading(false); }
  };

  return <section className="auth-layout"><div className="auth-aside register-aside"><div className="aside-orbit orbit-one"/><div className="aside-orbit orbit-two"/><p className="eyebrow eyebrow-light"><span className="eyebrow-spark">✳</span> A BETTER WAY TO LEARN</p><h1>Curiosity is a<br/>great place to<br/><em>start.</em></h1><p className="aside-copy">Get answers, find your people, and make progress that feels like yours.</p><div className="aside-note"><span className="note-icon">✦</span><span><strong>One account, more possibility.</strong><br/>Learn or share what you know.</span></div></div>
    <div className="auth-panel"><div className="auth-form-wrap"><p className="eyebrow">GET STARTED</p><h2>Make room to grow.</h2><p className="auth-intro">Create your free LearnMate account.</p>
      {error && <div className="form-alert" role="alert"><span>!</span>{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="register-name">Your name</label><input id="register-name" name="name" type="text" autoComplete="name" placeholder="What should we call you?" value={form.name} onChange={update} minLength="2" maxLength="80" required />
        <label htmlFor="register-email">Email address</label><input id="register-email" name="email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={update} required />
        <label htmlFor="register-password">Create a password</label><input id="register-password" name="password" type="password" autoComplete="new-password" placeholder="At least 8 characters" value={form.password} onChange={update} minLength="8" required />
        <label htmlFor="register-role">I’m here to</label><select id="register-role" name="role" value={form.role} onChange={update}><option value="student">Learn something new</option><option value="tutor">Teach and mentor</option></select>
        {form.role === 'tutor' && <><label htmlFor="register-subjects">What can you teach?</label><input id="register-subjects" name="subjects" type="text" placeholder="Math, Physics, Writing" value={form.subjects} onChange={update} required /><label htmlFor="register-rate">Hourly rate (USD)</label><input id="register-rate" name="hourlyRate" type="number" min="0" max="10000" step="1" placeholder="25" value={form.hourlyRate} onChange={update} required /><label htmlFor="register-bio">A little about you</label><textarea id="register-bio" name="bio" rows="3" maxLength="500" placeholder="Your teaching experience and style…" value={form.bio} onChange={update} required /> </>}
        <button className="button button-primary button-full" type="submit" disabled={loading}>{loading ? <><span className="spinner"/> Creating your account…</> : <>Create account <span aria-hidden="true">→</span></>}</button>
      </form>
      <p className="auth-switch">Already have an account? <Link to="/login">Log in <span aria-hidden="true">↗</span></Link></p>
      <p className="auth-legal">By continuing, you agree to learn with curiosity and kindness.</p>
    </div></div></section>;
}
