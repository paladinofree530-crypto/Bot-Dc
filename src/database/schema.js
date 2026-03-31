const db = require("./db");

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tickets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_code TEXT UNIQUE,
      channel_id TEXT UNIQUE,
      guild_id TEXT,
      author_id TEXT,
      author_tag TEXT,
      category TEXT DEFAULT 'outros',
      status TEXT DEFAULT 'open',
      workflow_status TEXT DEFAULT 'aberto',
      status_message_id TEXT,
      priority TEXT DEFAULT 'media',
      routed_to TEXT,
      accused_id TEXT,
      accused_name TEXT,
      ai_summary TEXT,
      open_reason TEXT,
      opened_at TEXT,
      closed_at TEXT,
      closed_by TEXT,
      close_reason TEXT,
      close_type TEXT DEFAULT 'normal',
      deleted_by TEXT,
      deleted_at TEXT,
      assumed_by TEXT,
      escalation_count INTEGER DEFAULT 0,
      sensitivity_flag TEXT DEFAULT 'normal',
      first_response_at TEXT,
      resolved_at TEXT,
      sla_deadline_at TEXT,
      verdict_status TEXT DEFAULT 'pending'
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      message_id TEXT UNIQUE,
      author_id TEXT,
      author_tag TEXT,
      content TEXT,
      timestamp TEXT,
      edited_at TEXT,
      deleted_at TEXT,
      attachments_json TEXT,
      links_json TEXT,
      embeds_json TEXT,
      message_type TEXT DEFAULT 'text'
    );

    CREATE TABLE IF NOT EXISTS ticket_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      event_type TEXT NOT NULL,
      actor_id TEXT,
      actor_tag TEXT,
      payload_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_blacklist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      reason TEXT,
      added_by TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_cooldowns (
      user_id TEXT PRIMARY KEY,
      last_opened_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disciplinary_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT UNIQUE NOT NULL,
      user_name TEXT,
      total_reports INTEGER DEFAULT 0,
      critical_reports INTEGER DEFAULT 0,
      last_report_at TEXT,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS judgments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ticket_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'open',
      opened_by TEXT,
      decided_by TEXT,
      decision TEXT,
      punishment TEXT,
      notes TEXT,
      created_at TEXT NOT NULL,
      decided_at TEXT
    );
  `);
}

module.exports = { initSchema };
