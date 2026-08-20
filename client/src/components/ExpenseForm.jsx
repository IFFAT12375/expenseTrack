import { useEffect, useState } from "react";
import { api } from "../api";
import SplitForm from "./SplitForm";

export default function ExpenseForm({
  groupId,
  members = [],
  onSuccess,
  onClose,
}) {
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(groupId || "");
  const [selectedMembers, setSelectedMembers] = useState(members);
  const [form, setForm] = useState({
    description: "",
    amount: "",
    paidBy: members[0]?._id || "",
    date: new Date().toISOString().slice(0, 10),
    splitType: "equal",
    splits: [],
  });
  const [error, setError] = useState("");
  const update = (key, value) =>
    setForm((current) => ({ ...current, [key]: value }));
  async function selectGroup(value) {
    setSelectedGroupId(value);
    const group = await api(`/api/groups/${value}`);
    setSelectedMembers(group.members);
    setForm((current) => ({
      ...current,
      paidBy: group.members[0]?._id || "",
      splits: [],
    }));
  }
  useEffect(() => {
    api("/api/groups")
      .then(setGroups)
      .catch(() => setError("Unable to load groups."));
  }, []);

  async function submit(event) {
    event.preventDefault();
    const amount = Number(form.amount);
    let splits;
    if (form.splitType === "equal") {
      const cents = Math.round(amount * 100);
      const base = Math.floor(cents / selectedMembers.length);
      const remainder = cents % selectedMembers.length;
      splits = selectedMembers.map((member, index) => ({
        userId: member._id,
        amount: (base + (index < remainder ? 1 : 0)) / 100,
      }));
    } else
      splits = form.splits.map((split) => ({
        ...split,
        amount: Number(split.amount),
      }));
    if (!selectedGroupId || !selectedMembers.length)
      return setError("Choose a group before adding an expense.");
    if (
      !form.description ||
      amount <= 0 ||
      Math.abs(
        splits.reduce((total, split) => total + split.amount, 0) - amount,
      ) > 0.01
    )
      return setError(
        "Add a description and make sure the split matches the amount.",
      );
    try {
      await api("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          groupId: selectedGroupId,
          amount,
          splits,
        }),
      });
      window.dispatchEvent(new Event("expenseTrack:data-changed"));
      window.dispatchEvent(new Event("expenseTrack:notifications-changed"));
      onSuccess();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label>
        Group
        <select
          value={selectedGroupId}
          onChange={(event) => selectGroup(event.target.value)}
          required
        >
          <option value="">Choose a group</option>
          {groups.map((group) => (
            <option key={group._id} value={group._id}>
              {group.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Description
        <input
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          required
        />
      </label>
      <label>
        Total amount ($)
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(event) => update("amount", event.target.value)}
          required
        />
      </label>
      <label>
        Paid by
        <select
          value={form.paidBy}
          onChange={(event) => update("paidBy", event.target.value)}
        >
          {selectedMembers.map((member) => (
            <option key={member._id} value={member._id}>
              {member.fullName}
            </option>
          ))}
        </select>
      </label>
      <label>
        Date
        <input
          type="date"
          value={form.date}
          onChange={(event) => update("date", event.target.value)}
        />
      </label>
      <label>
        Split type
        <select
          value={form.splitType}
          onChange={(event) => update("splitType", event.target.value)}
        >
          <option value="equal">Equal</option>
          <option value="exact">Exact</option>
        </select>
      </label>
      <SplitForm
        members={selectedMembers}
        totalAmount={form.amount}
        splitType={form.splitType}
        splits={form.splits}
        onChange={(splits) => update("splits", splits)}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>
          Cancel
        </button>
        <button className="primary-button">Add expense</button>
      </div>
    </form>
  );
}
