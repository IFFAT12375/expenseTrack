import Notification from '../models/Notification.js';

export async function notifyGroupMembers(group, { actorId, type, message }) {
  const recipients = group.members.filter((memberId) => String(memberId) !== String(actorId));
  if (!recipients.length) return;
  await Notification.insertMany(recipients.map((recipient) => ({ recipient, groupId: group._id, type, message })));
}
