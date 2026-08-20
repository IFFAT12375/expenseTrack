import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import ExpenseForm from '../components/ExpenseForm';
import SettlementForm from '../components/SettlementForm';
import InviteMemberForm from '../components/InviteMemberForm';
import ActivityItem from '../components/ActivityItem';
import BalanceRow from '../components/BalanceRow';
import Modal from '../components/Modal';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [group, setGroup] = useState(null);
  const [users, setUsers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [open, setOpen] = useState(false);
  const [settlementOpen, setSettlementOpen] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [error, setError] = useState('');
  async function load() { try { const [groupData, expenseData, balanceData, allUsers] = await Promise.all([api(`/api/groups/${id}`), api(`/api/expenses/${id}`), api(`/api/groups/${id}/balances`), api('/api/groups/users')]); setGroup(groupData); setUsers([...groupData.members, ...allUsers.filter((candidate) => !groupData.members.some((member) => member._id === candidate._id))]); setExpenses(expenseData); setBalances(balanceData.balances); } catch (requestError) { setError(requestError.message); } }
  useEffect(() => { load(); }, [id]);
  if (!group) return <div className="page">{error || 'Loading group...'}</div>;
  return <div className="page"><div className="page-heading"><div><p className="eyebrow">Group detail</p><h1>{group.name}</h1><p className="muted">{group.members.length} members</p></div><div className="form-actions"><button className="secondary-button" onClick={() => setInviteOpen(true)}>+ Add member</button><button className="secondary-button" onClick={() => setSettlementOpen(true)}>Record settlement</button><button className="primary-button" onClick={() => setOpen(true)}>+ Add expense</button></div></div><div className="detail-grid"><section><div className="section-heading"><h2>Members</h2></div><div className="member-list">{group.members.map((member) => <span key={member._id}>{member.fullName}<small>@{member.username}</small></span>)}</div><div className="section-heading"><h2>Expenses</h2></div><div className="activity-list">{expenses.map((item) => <ActivityItem key={item._id} item={item} />)}{!expenses.length && <p className="muted">No expenses yet.</p>}</div></section><section><div className="section-heading"><h2>Balance sheet</h2><a href={`/balances?group=${id}`}>Details</a></div><div className="balance-list">{balances.map((balance, index) => <BalanceRow key={index} balance={balance} currentUserId={user.id} />)}{!balances.length && <p className="muted">Everyone is settled up.</p>}</div></section></div><Modal isOpen={inviteOpen} onClose={() => setInviteOpen(false)} title="Add a member"><InviteMemberForm groupId={id} onClose={() => setInviteOpen(false)} onSuccess={() => { setInviteOpen(false); load(); }} /></Modal><Modal isOpen={open} onClose={() => setOpen(false)} title="Add expense"><ExpenseForm groupId={id} members={users} onClose={() => setOpen(false)} onSuccess={() => { setOpen(false); load(); }} /></Modal><Modal isOpen={settlementOpen} onClose={() => setSettlementOpen(false)} title="Record settlement"><SettlementForm groupId={id} members={users} onClose={() => setSettlementOpen(false)} onSuccess={() => { setSettlementOpen(false); load(); }} /></Modal></div>;
}
