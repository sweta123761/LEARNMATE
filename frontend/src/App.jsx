import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import AskAI from './pages/AskAI';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';

export default function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: '15px', padding: '1rem', background: '#eee' }}>
        <Link to="/">Ask AI</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>
      <Routes>
        <Route path="/" element={<AskAI />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}