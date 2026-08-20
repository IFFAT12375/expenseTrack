import { useEffect, useState } from 'react';
import { api } from '../api';

export default function SettlementForm({ groupId = '', members = [], onSuccess, onClose }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId);
  const [selectedMembers, setSelectedMembers] = useState(members);
  const [form, setForm] = useState({ from: members[0]?._id || '', to: members[1]?._id || '', amount: '' });
  const [error, setError] = useState('');
  useEffect(() => { api('/api/groups').then(setGroups).catch(() => setError('Unable to load groups.')); }, []);
  async function selectGroup(value) { setSelectedGroupId(value); const group = await api(`/api/groups/${value}`); setSelectedMembers(group.members); setForm((current) => ({ ...current, from: group.members[0]?._id || '', to: group.members[1]?._id || '' })); }
  async function submit(event) {
    event.preventDefault();
    if (!selectedGroupId) return setError('Choose a group.');
    if (form.from === form.to || Number(form.amount) <= 0) return setError('Choose two different members and enter a positive amount.');
    try { await api('/api/settlements', { method: 'POST', body: JSON.stringify({ ...form, groupId: selectedGroupId, amount: Number(form.amount) }) }); window.dispatchEvent(new Event('expenseTrack:data-changed')); onSuccess(); }
    catch (requestError) { setError(requestError.message); }
  }
  return <form className="form-stack" onSubmit={submit}>
    <label>Group<select value={selectedGroupId} onChange={(event) => selectGroup(event.target.value)} required><option value="">Choose a group</option>{groups.map((group) => <option key={group._id} value={group._id}>{group.name}</option>)}</select></label>
    <label>Who paid<select value={form.from} onChange={(event) => setForm({ ...form, from: event.target.value })}>{selectedMembers.map((member) => <option key={member._id} value={member._id}>{member.fullName}</option>)}</select></label>
    <label>Paid to<select value={form.to} onChange={(event) => setForm({ ...form, to: event.target.value })}>{selectedMembers.map((member) => <option key={member._id} value={member._id}>{member.fullName}</option>)}</select></label>
    <label>Amount ($)<input type="number" min="0.01" step="0.01" required value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} /></label>
    {error && <p className="form-error">{error}</p>}
    <div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Record</button></div>
  </form>;
}
