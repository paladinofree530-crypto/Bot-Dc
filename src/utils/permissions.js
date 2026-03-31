async function allowRole(channel, roleId) {
  if (!roleId) return;
  await channel.permissionOverwrites.edit(roleId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true,
    EmbedLinks: true
  }).catch(() => null);
}

async function allowUser(channel, userId) {
  if (!userId) return;
  await channel.permissionOverwrites.edit(userId, {
    ViewChannel: true,
    SendMessages: true,
    ReadMessageHistory: true,
    AttachFiles: true,
    EmbedLinks: true
  }).catch(() => null);
}

async function denyUser(channel, userId) {
  if (!userId) return;
  await channel.permissionOverwrites.edit(userId, {
    ViewChannel: false,
    SendMessages: false,
    ReadMessageHistory: false
  }).catch(() => null);
}

module.exports = { allowRole, allowUser, denyUser };
