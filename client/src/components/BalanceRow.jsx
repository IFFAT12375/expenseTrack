export default function BalanceRow({ balance, currentUserId }) {
  const from = balance.from?.fullName || "Member";
  const to = balance.to?.fullName || "Member";
  const isOwed = String(balance.from?._id) === String(currentUserId);
  const amount = Number(balance.amount).toFixed(2);

  return <div className="balance-row">
    <div>
      <strong>{isOwed ? `You are owed $${amount} by ${to}` : `You owe $${amount} to ${from}`}</strong>
      <p>{isOwed ? `${to} owes you` : "Outstanding group balance"}</p>
    </div>
    <b className={isOwed ? "positive" : "negative"}>${amount}</b>
  </div>;
}
