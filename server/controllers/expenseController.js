import Expense from "../models/Expense.js";
import Group from "../models/Group.js";
const memberOf = async (groupId, userId) =>
  Group.findOne({ _id: groupId, members: userId });
function validatePayload(body, members) {
  const amount = Number(body.amount);
  if (
    !body.description ||
    !Number.isFinite(amount) ||
    amount <= 0 ||
    !Array.isArray(body.splits) ||
    !body.splits.length
  )
    return "Description, positive amount, and splits are required";
  if (body.splitType && !["equal", "exact"].includes(body.splitType))
    return "Split type must be equal or exact";
  const ids = new Set(members.map(String));
  if (
    body.splits.some(
      (split) => !ids.has(String(split.userId)) || Number(split.amount) < 0,
    )
  )
    return "Splits contain an invalid member or amount";
  const sum = body.splits.reduce(
    (total, split) => total + Number(split.amount),
    0,
  );
  if (Math.abs(sum - amount) > 0.01)
    return "Splits must add up to the total amount";
  return null;
}
export async function list(req, res) {
  if (!(await memberOf(req.params.groupId, req.user._id)))
    return res.status(404).json({ message: "Group not found" });
  res.json(
    await Expense.find({ groupId: req.params.groupId })
      .populate("paidBy", "fullName username")
      .populate("groupId", "name")
      .populate("splits.userId", "fullName username")
      .sort("-date"),
  );
}
export async function create(req, res) {
  const group = await Group.findOne({
    _id: req.body.groupId,
    members: req.user._id,
  });
  if (!group) return res.status(404).json({ message: "Group not found" });
  const requestedUsers = [
    req.body.paidBy,
    ...(req.body.splits || []).map((split) => split.userId),
  ];
  const validUsers = requestedUsers.every((id) =>
    /^[a-f\d]{24}$/i.test(String(id)),
  );
  if (!validUsers)
    return res
      .status(400)
      .json({ message: "Expense users must be valid accounts" });
  const newMembers = requestedUsers.filter(
    (id) => !group.members.some((memberId) => String(memberId) === String(id)),
  );
  if (newMembers.length) {
    group.members.push(...newMembers);
    await group.save();
  }
  const error = validatePayload(req.body, group.members);
  if (error) return res.status(400).json({ message: error });
  const expense = await Expense.create({
    ...req.body,
    amount: Number(req.body.amount),
    splits: req.body.splits.map((s) => ({
      userId: s.userId,
      amount: Number(s.amount),
    })),
  });
  res
    .status(201)
    .json(await expense.populate("paidBy splits.userId", "fullName username"));
}
export async function update(req, res) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  const group = await Group.findOne({
    _id: expense.groupId,
    members: req.user._id,
  });
  if (!group) return res.status(403).json({ message: "Group access denied" });
  const payload = { ...expense.toObject(), ...req.body };
  const error = validatePayload(payload, group.members);
  if (error) return res.status(400).json({ message: error });
  Object.assign(expense, {
    description: payload.description,
    amount: payload.amount,
    paidBy: payload.paidBy,
    date: payload.date,
    splits: payload.splits,
    splitType: payload.splitType,
    category: payload.category,
  });
  await expense.save();
  res.json(await expense.populate("paidBy splits.userId", "fullName username"));
}
export async function remove(req, res) {
  const expense = await Expense.findById(req.params.id);
  if (!expense) return res.status(404).json({ message: "Expense not found" });
  if (!(await memberOf(expense.groupId, req.user._id)))
    return res.status(403).json({ message: "Group access denied" });
  await expense.deleteOne();
  res.json({ message: "Expense deleted" });
}
export async function listAll(req, res) {
  res.json(
    await Expense.find()
      .populate("paidBy", "fullName username")
      .populate("splits.userId", "fullName username")
      .populate("groupId", "name")
      .sort("-date"),
  );
}
