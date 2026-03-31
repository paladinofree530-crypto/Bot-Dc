async function notifyRoleMembers(guild, roleId, messageText) {
  if (!guild || !roleId || !messageText) return { sent: 0, failed: 0 };

  const role = guild.roles.cache.get(roleId) || await guild.roles.fetch(roleId).catch(() => null);
  if (!role) return { sent: 0, failed: 0 };

  let sent = 0;
  let failed = 0;

  const members = [...role.members.values()];
  for (const member of members) {
    try {
      await member.send(messageText);
      sent++;
    } catch {
      failed++;
    }
  }

  return { sent, failed };
}

module.exports = { notifyRoleMembers };
