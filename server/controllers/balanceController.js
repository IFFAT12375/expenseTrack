import Group from '../models/Group.js';
import Expense from '../models/Expense.js';
import Settlement from '../models/Settlement.js';
import calculateBalances from '../utils/calculateBalances.js';

function rowsFromBalances(raw, members) {
  return Object.entries(raw).map(([key, amount]) => {
    const [fromId, toId] = key.split('_');
    return { from: members.find((member) => String(member._id) === fromId), to: members.find((member) => String(member._id) === toId), amount };
  }).filter((row) => row.from && row.to && row.amount > 0);
}

function totalsForUser(rows, userId) {
  const owed = rows.filter((row) => String(row.from._id) === String(userId)).reduce((sum, row) => sum + row.amount, 0);
  const owe = rows.filter((row) => String(row.to._id) === String(userId)).reduce((sum, row) => sum + row.amount, 0);
  return { totalOwed: Math.round(owed * 100) / 100, totalOwe: Math.round(owe * 100) / 100, net: Math.round((owed - owe) * 100) / 100 };
}

export async function overall(req, res) {
  const groups = await Group.find({ members: req.user._id }).populate('members', 'fullName username email').populate('createdBy', 'fullName username email');
  const groupIds = groups.map((group) => group._id);
  const [expenses, settlements] = await Promise.all([Expense.find({ groupId: { $in: groupIds } }), Settlement.find({ groupId: { $in: groupIds } })]);
  const groupResults = groups.map((group) => {
    const groupExpenses = expenses.filter((expense) => String(expense.groupId) === String(group._id));
    const groupSettlements = settlements.filter((settlement) => String(settlement.groupId) === String(group._id));
    const balances = rowsFromBalances(calculateBalances(groupExpenses, groupSettlements), group.members);
    return { group, ...totalsForUser(balances, req.user._id), balances };
  });
  const allBalances = groupResults.flatMap((result) => result.balances);
  // The All tab is a personal balance summary, so only include rows that
  // involve the signed-in user. Group tabs continue to show every member row.
  const personalBalances = allBalances.filter(
    (row) => String(row.from._id) === String(req.user._id) || String(row.to._id) === String(req.user._id),
  );
  res.json({ ...totalsForUser(allBalances, req.user._id), balances: personalBalances, groups: groupResults });
}
