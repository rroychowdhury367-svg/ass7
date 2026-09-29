import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, PlusSquare, CheckCircle, LogOut, Lock, User } from 'lucide-react';
import './App.css';

const INITIAL_TASKS = [
  {
    id: 1,
    header: 'Submit React Assignment 7',
    description: 'Implement Auth system with Task Manager',
    priority: 'High',
    category: 'Academic',
    raisedDateTime: new Date().toLocaleString(),
    dueDate: '2026-08-28',
    status: 'Raised',
  },
];

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('jwt_token') || sessionStorage.getItem('jwt_token');
  return token ? children : <Navigate to="/login" replace />;
}

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="navbar">
      <div className="nav-brand">TaskTracker</div>
      <div className="nav-links">
        <Link to="/"><LayoutDashboard size={18} /> Dashboard</Link>
        <Link to="/tasks"><CheckSquare size={18} /> Tasks</Link>
        <Link to="/add-task"><PlusSquare size={18} /> Add Task</Link>
        <Link to="/completed"><CheckCircle size={18} /> Completed</Link>
      </div>
      <div className="nav-user">
        <span>Welcome, <strong>{user?.username || 'User'}</strong></span>
        <button onClick={() => { onLogout(); navigate('/login'); }} className="logout-btn">
          <LogOut size={16} /> Logout
        </button>
      </div>
    </nav>
  );
}

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 10) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;

    if (score <= 2) return { score, label: 'Weak', color: '#e53e3e' };
    if (score <= 4) return { score, label: 'Medium', color: '#dd6b20' };
    return { score, label: 'Strong', color: '#38a169' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!password) newErrors.password = 'Password is required';
    else if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const mockJwtToken = `header.${btoa(JSON.stringify({ sub: username, exp: Date.now() + 86400000 }))}.signature`;
    
    if (rememberMe) {
      localStorage.setItem('jwt_token', mockJwtToken);
      localStorage.setItem('user', JSON.stringify({ username }));
    } else {
      sessionStorage.setItem('jwt_token', mockJwtToken);
      sessionStorage.setItem('user', JSON.stringify({ username }));
    }

    onLogin({ username });
    navigate('/');
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Sign In</h2>
        <p className="subtitle">Enter your credentials to access Task Manager</p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <div className="input-icon-box">
              <User size={18} />
              <input type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            {errors.username && <span className="error-text">{errors.username}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <div className="input-icon-box">
              <Lock size={18} />
              <input type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {errors.password && <span className="error-text">{errors.password}</span>}

            {password && (
              <div className="strength-meter">
                <div className="strength-bar-bg">
                  <div className="strength-bar-fill" style={{ width: `${(strength.score / 5) * 100}%`, backgroundColor: strength.color }}></div>
                </div>
                <span style={{ color: strength.color }}>Strength: {strength.label}</span>
              </div>
            )}
          </div>

          <div className="checkbox-group">
            <label>
              <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
              Remember User
            </label>
          </div>

          <button type="submit" className="login-btn">Login</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ tasks }) {
  const total = tasks.length;
  const raised = tasks.filter((t) => t.status === 'Raised').length;
  const pending = tasks.filter((t) => t.status === 'Pending').length;
  const closed = tasks.filter((t) => t.status === 'Closed').length;

  return (
    <div className="page-container">
      <h2>Dashboard Overview</h2>
      <div className="metrics-grid">
        <div className="metric-card"><h3>Total Tasks</h3><p className="count">{total}</p></div>
        <div className="metric-card raised"><h3>Raised</h3><p className="count">{raised}</p></div>
        <div className="metric-card pending"><h3>Pending</h3><p className="count">{pending}</p></div>
        <div className="metric-card closed"><h3>Closed</h3><p className="count">{closed}</p></div>
      </div>
    </div>
  );
}

function Tasks({ tasks, onDeleteTask, onToggleStatus }) {
  return (
    <div className="page-container">
      <h2>All Tasks</h2>
      <div className="task-grid">
        {tasks.map((task) => (
          <div key={task.id} className="task-card">
            <h4>{task.header}</h4>
            <p>{task.description}</p>
            <p><strong>Status:</strong> {task.status}</p>
            <div className="card-actions">
              <Link to={`/tasks/${task.id}`} className="btn-secondary">Details</Link>
              <button onClick={() => onToggleStatus(task.id)} className="btn-status">Change Status</button>
              <button onClick={() => onDeleteTask(task.id)} className="btn-danger">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddTask({ onAddTask }) {
  const [header, setHeader] = useState('');
  const [description, setDescription] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddTask({
      id: Date.now(),
      header,
      description,
      priority: 'Medium',
      category: 'Academic',
      raisedDateTime: new Date().toLocaleString(),
      dueDate: '2026-08-28',
      status: 'Raised',
    });
    navigate('/tasks');
  };

  return (
    <div className="page-container">
      <h2>Add New Task</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input type="text" required value={header} onChange={(e) => setHeader(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <button type="submit" className="login-btn">Create Task</button>
      </form>
    </div>
  );
}

function TaskDetails({ tasks }) {
  const { id } = useParams();
  const task = tasks.find((t) => t.id === Number(id));
  if (!task) return <div className="page-container"><h2>Task not found</h2></div>;
  return (
    <div className="page-container">
      <h2>{task.header}</h2>
      <p>{task.description}</p>
    </div>
  );
}

function CompletedTasks({ tasks }) {
  const completed = tasks.filter((t) => t.status === 'Closed');
  return (
    <div className="page-container">
      <h2>Completed Tasks ({completed.length})</h2>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  useEffect(() => {
    const savedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  return (
    <div className="app">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/login" element={<Login onLogin={(u) => setUser(u)} />} />
        <Route path="/" element={<ProtectedRoute><Dashboard tasks={tasks} /></ProtectedRoute>} />
        <Route path="/tasks" element={<ProtectedRoute><Tasks tasks={tasks} onDeleteTask={(id) => setTasks(tasks.filter(t => t.id !== id))} onToggleStatus={(id) => setTasks(tasks.map(t => t.id === id ? {...t, status: t.status === 'Raised' ? 'Closed' : 'Raised'} : t))} /></ProtectedRoute>} />
        <Route path="/add-task" element={<ProtectedRoute><AddTask onAddTask={(nt) => setTasks([nt, ...tasks])} /></ProtectedRoute>} />
        <Route path="/tasks/:id" element={<ProtectedRoute><TaskDetails tasks={tasks} /></ProtectedRoute>} />
        <Route path="/completed" element={<ProtectedRoute><CompletedTasks tasks={tasks} /></ProtectedRoute>} />
      </Routes>
    </div>
  );
}