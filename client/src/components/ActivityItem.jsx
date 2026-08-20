import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../api";
import Modal from "./Modal";
import "../activity.css";

export default function ActivityItem({ item }) {
  const { user } = useAuth();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsError, setDetailsError] = useState("");
  const expense = item.kind === "expense" || item.description;
  const currentUserId = String(user?.id || user?._id || "");
  const paidById = String(item.paidBy?._id || item.paidBy || "");
  const category = item.category || "general";
  const splits = item.splits || [];
  const inferredSplitType = splits.length > 1 && splits.every((split) => Math.abs(Number(split.amount || 0) - Number(splits[0].amount || 0)) < 0.01) ? "equal" : "exact";
  const splitType = item.splitType || inferredSplitType;
  const amountOwedToUser = splits
    .filter(
      (split) => String(split.userId?._id || split.userId || "") !== paidById,
    )
    .reduce((total, split) => total + Number(split.amount || 0), 0);
  const userShare = splits
    .filter(
      (split) =>
        String(split.userId?._id || split.userId || "") === currentUserId,
    )
    .reduce((total, split) => total + Number(split.amount || 0), 0);
  const paymentStatus =
    paidById === currentUserId
      ? amountOwedToUser > 0
        ? `You are owed $${amountOwedToUser.toFixed(2)}`
        : "You paid"
      : userShare > 0
        ? `You owed $${userShare.toFixed(2)}`
        : "You didn't owe";
  const activityDate = new Date(item.date || item.createdAt).toLocaleDateString(
    "en-US",
    { month: "long", day: "numeric", year: "numeric" },
  );
  const payerLabel =
    paidById === currentUserId
      ? "You paid"
      : `${item.paidBy?.fullName || "Member"} paid`;

  async function openDetails() {
    if (!expense) return;
    setDetailsOpen(true);
    setDetailsError("");
    try {
      const groupId = String(item.groupId?._id || item.groupId || "");
      const group = await api(`/api/groups/${groupId}`);
      const splitByUser = new Map(
        splits.map((split) => [
          String(split.userId?._id || split.userId || ""),
          Number(split.amount || 0),
        ]),
      );
      setDetails({
        group,
        members: group.members.map((member) => ({
          ...member,
          amount: splitByUser.get(String(member._id)) || 0,
        })),
      });
    } catch (error) {
      setDetailsError(error.message);
    }
  }

  return (
    <>
      <article
        className={`activity${expense ? " activity-clickable" : ""}`}
        onClick={openDetails}
        onKeyDown={(event) => event.key === "Enter" && openDetails()}
        role={expense ? "button" : undefined}
        tabIndex={expense ? 0 : undefined}
      >
        <span className="activity-dot">{expense ? "$" : "="}</span>
        <div>
          <strong className="activity-group">{item.groupId?.name}</strong> -{" "}
          <span>
            {expense
              ? item.description
              : `${item.from?.fullName || "Member"} settled with ${item.to?.fullName || "member"}`}
          </span>
          <div className="activity-meta">
            <p>
              {expense
                ? `${payerLabel} · ${activityDate} · ${paymentStatus}`
                : "Settlement recorded"}
            </p>
            {!expense && <span>• {activityDate}</span>}
          </div>
        </div>
        <b>${Number(item.amount).toFixed(2)}</b>
      </article>
      <Modal
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title={
          details
            ? `${details.group.name} · ${item.description}`
            : "Expense details"
        }
      >
        {detailsError && <p className="form-error">{detailsError}</p>}
        {!details && !detailsError && (
          <p className="muted">Loading member shares...</p>
        )}
        {details && (
          <div className="expense-breakdown">
            <p className="muted">
              {details.group.members.length} members · $
              {Number(item.amount).toFixed(2)} total · Split: {splitType === "equal" ? "Equal" : "Exact"}
            </p>
            {details.members.map((member) => {
              const isPayer = String(member._id) === paidById;
              const owesPayer = !isPayer && paidById === currentUserId;
              return (
                <div className="breakdown-row" key={member._id}>
                  <div>
                    <strong>
                      {String(member._id) === currentUserId
                        ? "You"
                        : member.fullName}
                    </strong>
                    <small>
                      {isPayer
                        ? "Paid this expense"
                        : owesPayer && member.amount > 0
                          ? "Owes you"
                          : member.amount > 0
                            ? `Share paid to ${item.paidBy?.fullName || "payer"}`
                            : "No share"}
                    </small>
                  </div>
                  <b>${member.amount.toFixed(2)}</b>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
}
