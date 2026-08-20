import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import BalanceRow from "../components/BalanceRow";
import ActivityItem from "../components/ActivityItem";
import SettlementForm from "../components/SettlementForm";
import Modal from "../components/Modal";

function Summary({ data }) {
  const netPositive = data.net >= 0;
  return (
    <div className="stats balance-summary">
      <div>
        <p>You are owed</p>
        <strong className="positive">${data.totalOwed.toFixed(2)}</strong>
      </div>
      <div>
        <p>You owe</p>
        <strong className="negative">${data.totalOwe.toFixed(2)}</strong>
      </div>
      <div>
        <p>Net balance</p>
        <strong className={netPositive ? "positive" : "negative"}>
          {netPositive ? "+" : "-"}${Math.abs(data.net).toFixed(2)}
        </strong>
      </div>
    </div>
  );
}

export default function BalancesPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [selected, setSelected] = useState("all");
  const [settlements, setSettlements] = useState([]);
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");

  async function load() {
    const result = await api("/api/balances");
    setData(result);
    if (
      selected !== "all" &&
      !result.groups.some((entry) => entry.group._id === selected)
    )
      setSelected("all");
  }
  async function loadSettlements(groupId) {
    if (groupId) setSettlements(await api(`/api/settlements/${groupId}`));
    else setSettlements([]);
  }
  useEffect(() => {
    load().catch((error) => setMessage(error.message));
  }, []);
  useEffect(() => {
    loadSettlements(selected === "all" ? "" : selected).catch((error) =>
      setMessage(error.message),
    );
  }, [selected]);
  async function leaveGroup(groupId) {
    try {
      await api(`/api/groups/${groupId}/leave`, { method: "POST" });
      setMessage("You left the group.");
      await load();
    } catch (error) {
      setMessage(error.message);
    }
  }
  if (!data)
    return (
      <div className="page">
        <p>{message || "Loading balances..."}</p>
      </div>
    );
  const selectedGroup =
    selected === "all"
      ? null
      : data.groups.find((entry) => entry.group._id === selected);
  const view = selectedGroup || data;
  const personBalances = view.balances || [];

  return (
    <div className="page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">Settle the room</p>
          <h1>Balances</h1>
        </div>
        <button className="primary-button" onClick={() => setOpen(true)}>
          + Record settlement
        </button>
      </div>
      <div className="tabs">
        <button
          className={selected === "all" ? "active" : ""}
          onClick={() => setSelected("all")}
        >
          All
        </button>
        {data.groups.map((entry) => (
          <button
            className={selected === entry.group._id ? "active" : ""}
            key={entry.group._id}
            onClick={() => setSelected(entry.group._id)}
          >
            {entry.group.name}
          </button>
        ))}
      </div>
      <Summary data={view} />
      {selectedGroup && (
        <div className="balance-group-heading">
          <div>
            <h2>{selectedGroup.group.name}</h2>
            <p className="muted">
              Created by {selectedGroup.group.createdBy?.fullName || "you"}
            </p>
            {(selectedGroup.totalOwed > 0 || selectedGroup.totalOwe > 0) && (
              <p className="form-error">
                Settle your $
                {Math.max(
                  selectedGroup.totalOwed,
                  selectedGroup.totalOwe,
                ).toFixed(2)}{" "}
                outstanding balance before leaving.
              </p>
            )}
          </div>
          <button
            className="secondary-button"
            disabled={selectedGroup.totalOwed > 0 || selectedGroup.totalOwe > 0}
            onClick={() => leaveGroup(selectedGroup.group._id)}
          >
            Leave group
          </button>
        </div>
      )}
      <div className="detail-grid">
        <section>
          <div className="section-heading">
            <h2>
              {selected === "all" ? "Outstanding balances" : "Who owes whom"}
            </h2>
          </div>
          <div className="balance-list">
            {personBalances.map((balance, index) => (
              <BalanceRow
                key={`${balance.from._id}-${balance.to._id}-${index}`}
                balance={balance}
                currentUserId={user?.id || user?._id}
              />
            ))}
            {!personBalances.length && (
              <div className="empty-state">Everyone is settled up.</div>
            )}
          </div>
        </section>
        {selected !== "all" && (
          <section>
            <div className="section-heading">
              <h2>Settlement records</h2>
            </div>
            <div className="activity-list">
              {settlements.map((settlement) => (
                <ActivityItem key={settlement._id} item={settlement} />
              ))}
              {!settlements.length && (
                <div className="empty-state">
                  No settlements recorded for this group.
                </div>
              )}
            </div>
          </section>
        )}
      </div>
      {message && <p className="form-error">{message}</p>}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Record settlement"
      >
        <SettlementForm
          groupId={selected === "all" ? "" : selected}
          onClose={() => setOpen(false)}
          onSuccess={async () => {
            setOpen(false);
            await load();
            if (selected !== "all") await loadSettlements(selected);
          }}
        />
      </Modal>
    </div>
  );
}
