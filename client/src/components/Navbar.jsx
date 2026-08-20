import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import './notifications.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);
  async function loadNotifications() { try { setNotifications(await api('/api/notifications')); } catch { setNotifications([]); } }
  useEffect(() => { loadNotifications(); const timer = setInterval(loadNotifications, 30000); return () => clearInterval(timer); }, []);
  async function markRead(notification) { if (!notification.read) { await api(`/api/notifications/${notification._id}/read`, { method: 'PATCH' }); setNotifications((items) => items.map((item) => item._id === notification._id ? { ...item, read: true } : item)); } }
  async function clearNotifications() { await api('/api/notifications', { method: 'DELETE' }); setNotifications([]); }
  const unread = notifications.filter((notification) => !notification.read).length;
  return <header className="topbar"><Link className="brand" to="/dashboard">expense<span>track</span></Link><div className="top-actions"><div className="notification-wrap"><button className="notification-button" onClick={() => setOpen(!open)} aria-label="Notifications">Notifications {unread > 0 && <b>{unread}</b>}</button>{open && <div className="notification-panel"><div className="notification-heading"><strong>Notifications</strong>{notifications.length > 0 && <button onClick={clearNotifications}>Clear</button>}</div>{notifications.map((notification) => <button className={`notification-item${notification.read ? '' : ' unread'}`} key={notification._id} onClick={() => markRead(notification)}><span>{notification.message}</span><small>{new Date(notification.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</small></button>)}{!notifications.length && <p className="muted">You are all caught up.</p>}</div>}</div><span>{user?.fullName}</span><button className="ghost-button" onClick={logout}>Log out</button></div></header>;
}
