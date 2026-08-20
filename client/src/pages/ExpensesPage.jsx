import { useEffect, useState } from "react";
import { api } from "../api";
import { useGroups } from "../context/GroupContext";
import ActivityItem from "../components/ActivityItem";
import ExpenseForm from "../components/ExpenseForm";
import Modal from "../components/Modal";

export default function ExpensesPage() {
const {
  groups,
  fetchGroups,
  fetchAllExpenses,
} = useGroups();
  const [selected, setSelected] = useState("all");
  const [expenses, setExpenses] = useState([]);
  const [expenseOpen, setExpenseOpen] = useState(false);

  async function loadExpenses(groupId) {
    if (groupId === "all") {
      const data = await fetchAllExpenses();
      setExpenses(data || []);
      return;
    }

    if (groupId) setExpenses(await api(`/api/expenses/${groupId}`));
  }

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    loadExpenses(selected).catch(() => setExpenses([]));
  }, [selected]);

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Shared spending</p>
          <h1>Expenses</h1>
        </div>
        <button className="primary-button" onClick={() => setExpenseOpen(true)}>
          + Add expense
        </button>
      </div>
      <div className="tabs">
          {/* All tab */}
        <button
          className={selected === "all" ? "active" : ""}
          onClick={() => setSelected("all")}
        >
          All
        </button>

          {/* Group tabs */}
        {groups.map((group) => (
          <button
            className={selected === group._id ? "active" : ""}
            key={group._id}
            onClick={() => setSelected(group._id)}
          >
            {group.name}
          </button>
        ))}
      </div>
      <div className="activity-list">
        {expenses.map((item) => (
          <ActivityItem key={item._id} item={item}/>
        ))}
        {!expenses.length && (
          <div className="empty-state">
            No expenses recorded for this group.
          </div>
        )}
      </div>
      <Modal
        isOpen={expenseOpen}
        onClose={() => setExpenseOpen(false)}
        title="Add expense"
      >
        <ExpenseForm
          onClose={() => setExpenseOpen(false)}
          onSuccess={() => {
            setExpenseOpen(false);
            loadExpenses(selected);
          }}
        />
      </Modal>
    </div>
  );
}
