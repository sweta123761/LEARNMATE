import { useContext, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import API from '../api';
import { AuthContext } from '../context/AuthContext';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const handleSubmit = async (event) => {
    event.preventDefault(); setError(''); setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email: form.email.trim().toLowerCase(), password: form.password });
      login({ token: data.token, ...data.user });
      navigate(location.state?.from?.pathname || '/', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || (err.code === 'ERR_NETWORK' ? 'Could not reach LearnMate. Check your connection and try again.' : 'We couldn’t log you in. Please check your details and try again.'));
    } finally { setLoading(false); }
  };

  return <section className="auth-layout"><div className="auth-aside"><div className="aside-orbit orbit-one"/><div className="aside-orbit orbit-two"/><p className="eyebrow eyebrow-light"><span className="eyebrow-spark">✳</span> YOUR NEXT BREAKTHROUGH</p><h1>Learning clicks<br/>when you have<br/><em>the right help.</em></h1><p className="aside-copy">Get unstuck with a little guidance, then keep going with confidence.</p><div className="aside-note"><span className="note-icon">✦</span><span><strong>Small questions. Big progress.</strong><br/>Your learning journey starts here.</span></div></div>
    <div className="auth-panel"><div className="auth-form-wrap"><p className="eyebrow">WELCOME BACK</p><h2>Good to see you.</h2><p className="auth-intro">Log in to pick up where you left off.</p>
      {error && <div className="form-alert" role="alert"><span>!</span>{error}</div>}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label htmlFor="login-email">Email address</label><input id="login-email" type="email" autoComplete="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        <label htmlFor="login-password">Password</label><input id="login-password" type="password" autoComplete="current-password" placeholder="Your password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        <button className="button button-primary button-full" type="submit" disabled={loading}>{loading ? <><span className="spinner"/> Signing you in…</> : <>Log in <span aria-hidden="true">→</span></>}</button>
      </form>
      <p className="auth-switch">New to LearnMate? <Link to="/register">Create an account <span aria-hidden="true">↗</span></Link></p>
      <p className="auth-legal">By continuing, you agree to learn with curiosity and kindness.</p>
    </div></div></section>;
}
