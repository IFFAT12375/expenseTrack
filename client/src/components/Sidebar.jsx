import { NavLink } from 'react-router-dom';
export default function Sidebar() { return <aside className="sidebar"><p className="eyebrow">Workspace</p><NavLink to="/dashboard">Overview</NavLink><NavLink to="/groups">Groups</NavLink><NavLink to="/expenses">Expenses</NavLink><NavLink to="/balances">Balances</NavLink></aside>; }
