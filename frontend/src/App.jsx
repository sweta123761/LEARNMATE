import { useContext } from 'react';
import { BrowserRouter, Link, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import AskAI from './pages/AskAI';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthContext } from './context/AuthContext';

function ProtectedRoute({ children }) {
  const { user, ready } = useContext(AuthContext);
  const location = useLocation();
  if (!ready) return <div className="page-loader" role="status">Preparing your learning space…</div>;
  return user ? children : <Navigate to="/login" replace state={{ from: location }} />;
}

function Navigation() {
  const { user, logout } = useContext(AuthContext);
  return <header className="topbar"><Link className="brand" to="/"><span className="brand-mark">L</span><span>learnmate<span className="brand-dot">.</span></span></Link>
    <nav className="nav-links" aria-label="Main navigation">
      {user ? <><Link to="/">AI tutor</Link><Link to="/dashboard">My sessions</Link><span className="nav-user">{user.name?.split(' ')[0]}</span><button className="button button-quiet nav-action" onClick={logout}>Sign out</button></> : <><Link to="/login">Log in</Link><Link className="button button-small" to="/register">Get started <span aria-hidden="true">↗</span></Link></>}
    </nav>
  </header>;
}

function AppRoutes() {
  const { user } = useContext(AuthContext);
  return <><Navigation /><main className="app-main"><Routes>
    <Route path="/" element={<ProtectedRoute><AskAI /></ProtectedRoute>} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
    <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes></main><footer className="site-footer"><span>Learn at your own pace.</span><span>Made for curious minds <span className="footer-star">✳</span></span></footer></>;
}

export default function App() { return <BrowserRouter><AppRoutes /></BrowserRouter>; }
