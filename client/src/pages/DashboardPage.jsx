import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import GroupCard from "../components/GroupCard";
import ActivityItem from "../components/ActivityItem";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";
export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [expenseOpen, setExpenseOpen] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    api("/api/dashboard")
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);
  async function chooseGroup(groupId) {
    try {
      const group = await api(`/api/groups/${groupId}`);
      setSelectedGroup(group);
    } catch (requestError) {
      setError(requestError.message);
    }
  }
  if (!data)
    return (
      <div className="page">
        <p>{error || "Loading your dashboard..."}</p>
      </div>
    );
  const net = data.totalOwed - data.totalOwe;
  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">
            Good to see you, {user?.fullName?.split(" ")[0]}
          </p>
          <h1>Overview</h1>
        </div>
        <button className="primary-button" onClick={() => setExpenseOpen(true)}>
          + Add expense
        </button>
      </div>
      <div className="stats">
        <div>
          <p>You owe</p>
          <strong className="negative">${data.totalOwe.toFixed(2)}</strong>
        </div>
        <div>
          <p>Owed to you</p>
          <strong className="positive">${data.totalOwed.toFixed(2)}</strong>
        </div>
        <div>
          <p>Net balance</p>
          <strong className={net >= 0 ? "positive" : "negative"}>
            ${Math.abs(net).toFixed(2)}
          </strong>
        </div>
      </div>
      <section>
        <div className="section-heading">
          <h2>Your groups</h2>
          <a href="/groups">View all</a>
        </div>
        <div className="group-grid">
          {data.groups.map((group) => (
            <GroupCard key={group._id} group={group} />
          ))}
        </div>
      </section>
      <section>
        <div className="section-heading">
          <h2>Recent activity</h2>
        </div>
        <div className="activity-list">
          {data.activity.map((item) => (
            <ActivityItem key={`${item.kind}-${item._id}`} item={item} />
          ))}
        </div>
      </section>
      <Modal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title={
          selectedGroup
            ? `Add expense to ${selectedGroup.name}`
            : "Choose a group"
        }
      >
        {selectedGroup ? (
          <ExpenseForm
            groupId={selectedGroup._id}
            members={selectedGroup.members}
            onClose={() => {
              setSelectedGroup(null);
              setExpenseOpen(false);
            }}
            onSuccess={() => {
              setSelectedGroup(null);
              setExpenseOpen(false);
              api("/api/dashboard").then(setData);
            }}
          />
        ) : (
          <div className="group-picker">
            {data.groups.map((group) => (
              <button
                className="group-picker-option"
                key={group._id}
                onClick={() => chooseGroup(group._id)}
              >
                <span className="group-mark">{group.name[0]}</span>
                <span>
                  <strong>{group.name}</strong>
                  <small>{group.members.length} members</small>
                </span>
                <span>-&gt;</span>
              </button>
            ))}
            {!data.groups.length && (
              <p className="muted">Create a group before adding an expense.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
