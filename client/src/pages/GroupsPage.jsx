import { useEffect, useState } from "react";
import { useGroups } from "../context/GroupContext";
import GroupCard from "../components/GroupCard";
import Modal from "../components/Modal";
export default function GroupsPage() {
  const {
    groups,
    users,
    fetchGroups,
    fetchUsers,
    createGroup,
    loading,
    error,
  } = useGroups();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [memberIds, setMemberIds] = useState([]);
  const [identifier, setIdentifier] = useState("");
  const [formError, setFormError] = useState("");
  useEffect(() => {
    fetchGroups();
    fetchUsers();
  }, []);
  function toggleMember(id) {
    setMemberIds((current) =>
      current.includes(id)
        ? current.filter((memberId) => memberId !== id)
        : [...current, id],
    );
  }
  async function submit(e) {
    e.preventDefault();
    try {
      await createGroup(name, memberIds, identifier.trim() || undefined);
      setName("");
      setMemberIds([]);
      setIdentifier("");
      setOpen(false);
    } catch (submitError) {
      setFormError(submitError.message);
    }
  }
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Your circles</p>
          <h1>Groups</h1>
        </div>
        <button className="primary-button" onClick={() => setOpen(true)}>
          + New group
        </button>
      </div>
      {error && <p className="form-error">{error}</p>}
      {loading ? (
        <p>Loading groups...</p>
      ) : (
        <div className="group-grid" style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 1010 }}>
          {groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
          {!groups.length && (
            <div className="empty-state">
              Create your first group to start tracking shared spending.
            </div>
          )}
        </div>
      )}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Create a group"
      >
        <form className="form-stack" onSubmit={submit}>
          <label>
            Group name
            <input
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </label>
          <div className="user-picker">
            <p>Select members</p>
            {users.map((user) => (
              <label className="user-option" key={user._id}>
                <input
                  type="checkbox"
                  checked={memberIds.includes(user._id)}
                  onChange={() => toggleMember(user._id)}
                />
                <span>
                  {user.fullName}
                  <small>
                    {user.username} · {user.email}
                  </small>
                </span>
              </label>
            ))}
          </div>
          <label>
            Invite by username or email
            <input
              placeholder="username or email"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
          {formError && <p className="form-error">{formError}</p>}
          <button className="primary-button">Create group</button>
        </form>
      </Modal>
    </div>
  );
}
