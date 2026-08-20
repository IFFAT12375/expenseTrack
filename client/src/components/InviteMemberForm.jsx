import { useState } from 'react';
import { api } from '../api';

export default function InviteMemberForm({ groupId, onSuccess, onClose }) {
  const [identifier, setIdentifier] = useState('');
  const [error, setError] = useState('');
  async function submit(event) { event.preventDefault(); if (!identifier.trim()) return setError('Enter a username or email.'); try { await api(`/api/groups/${groupId}/invite`, { method: 'POST', body: JSON.stringify({ identifier: identifier.trim() }) }); onSuccess(); } catch (requestError) { setError(requestError.message); } }
  return <form className="form-stack" onSubmit={submit}><label>Username or email<input autoFocus value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="username or email" /></label>{error && <p className="form-error">{error}</p>}<div className="form-actions"><button type="button" className="secondary-button" onClick={onClose}>Cancel</button><button className="primary-button">Add member</button></div></form>;
}
