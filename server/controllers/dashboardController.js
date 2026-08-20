import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import calculateBalances from '../utils/calculateBalances.js';

function totalsForUser(raw, userId) {
  let totalOwe = 0;
  let totalOwed = 0;
  Object.entries(raw).forEach(([key, amount]) => {
    const [creditor, debtor] = key.split('_');
    if (debtor === String(userId)) totalOwe += amount;
    if (creditor === String(userId)) totalOwed += amount;
  });
  return { totalOwe: Math.round(totalOwe * 100) / 100, totalOwed: Math.round(totalOwed * 100) / 100 };
}

export async function dashboard(req, res) {
  const groups = await Group.find({ members: req.user._id }).populate('members', 'fullName username email').populate('createdBy', 'fullName username email');
  const groupIds = groups.map((group) => group._id);
  const [expenses, settlements] = await Promise.all([
    Expense.find({ groupId: { $in: groupIds } }).populate('paidBy', 'fullName username').populate('groupId', 'name').sort('-date'),
    Settlement.find({ groupId: { $in: groupIds } }).populate('from to', 'fullName username').populate('groupId', 'name').sort('-date'),
  ]);
  const dashboardGroups = groups.map((group) => {
    const groupBalances = calculateBalances(expenses.filter((expense) => String(expense.groupId?._id || expense.groupId) === String(group._id)), settlements.filter((settlement) => String(settlement.groupId?._id || settlement.groupId) === String(group._id)));
    return { ...group.toObject(), ...totalsForUser(groupBalances, req.user._id) };
  });
  // Keep group debts separate.  Offsetting balances across unrelated groups can
  // make the dashboard totals differ from the Balances page's All tab.
  const totals = dashboardGroups.reduce(
    (summary, group) => ({
      totalOwe: summary.totalOwe + group.totalOwe,
      totalOwed: summary.totalOwed + group.totalOwed,
    }),
    { totalOwe: 0, totalOwed: 0 },
  );
  totals.totalOwe = Math.round(totals.totalOwe * 100) / 100;
  totals.totalOwed = Math.round(totals.totalOwed * 100) / 100;
  const activity = [...expenses.map((expense) => ({ ...expense.toObject(), kind: 'expense' })), ...settlements.map((settlement) => ({ ...settlement.toObject(), kind: 'settlement' }))].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10);
  res.json({ groups: dashboardGroups, ...totals, activity });
}
