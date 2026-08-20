import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function Navbar() { const { user, logout } = useAuth(); return <header className="topbar"><Link className="brand" to="/dashboard">expense<span>track</span></Link><div className="top-actions"><span>{user?.fullName}</span><button className="ghost-button" onClick={logout}>Log out</button></div></header>; }
