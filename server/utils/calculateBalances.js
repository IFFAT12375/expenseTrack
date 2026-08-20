export default function calculateBalances(expenses = [], settlements = []) {
  const balances = {};
  const idOf = (value) => String(value?._id || value || '');
  const add = (creditorValue, debtorValue, amount) => {
    const creditor = idOf(creditorValue);
    const debtor = idOf(debtorValue);
    if (!creditor || !debtor || creditor === debtor || !amount) return;
    const key = `${creditor}_${debtor}`;
    const reverse = `${debtor}_${creditor}`;
    if (Object.prototype.hasOwnProperty.call(balances, reverse)) balances[reverse] -= amount;
    else balances[key] = (balances[key] || 0) + amount;
  };

  expenses.forEach((expense) => {
    expense.splits.forEach((split) => add(expense.paidBy, split.userId, Number(split.amount)));
  });
  settlements.forEach((settlement) => add(settlement.to, settlement.from, -Number(settlement.amount)));
  Object.keys(balances).forEach((key) => {
    const amount = Math.round(balances[key] * 100) / 100;
    const [creditor, debtor] = key.split('_');
    if (amount > 0) balances[key] = amount;
    else if (amount < 0) { delete balances[key]; balances[`${debtor}_${creditor}`] = Math.abs(amount); }
    else delete balances[key];
  });
  return balances;
}
