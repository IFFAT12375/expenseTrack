import Notification from '../models/Notification.js';

export async function list(req, res) {
  res.json(await Notification.find({ recipient: req.user._id }).populate('groupId', 'name').sort('-createdAt').limit(30));
}

export async function markRead(req, res) {
  const notification = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user._id }, { read: true }, { new: true });
  if (!notification) return res.status(404).json({ message: 'Notification not found' });
  res.json(notification);
}

export async function clear(req, res) {
  await Notification.deleteMany({ recipient: req.user._id });
  res.json({ message: 'Notifications cleared' });
}
