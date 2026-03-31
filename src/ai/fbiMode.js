const db = require("../database/db");
const { calculateRisk } = require("./riskEngine");

function buildFbiSummary(query) {
  const q = `%${query}%`;
  const tickets = db.prepare(`
    SELECT *
    FROM tickets
    WHERE author_id LIKE ?
       OR accused_id LIKE ?
       OR author_tag LIKE ?
       OR accused_name LIKE ?
  `).all(q, q, q, q);

  const events = db.prepare(`
    SELECT *
    FROM ticket_events
    WHERE payload_json LIKE ?
       OR actor_tag LIKE ?
    ORDER BY created_at DESC
    LIMIT 200
  `).all(q, q);

  const risk = calculateRisk(tickets);

  return {
    query,
    totalTickets: tickets.length,
    totalEvents: events.length,
    risk,
    latestEvents: events.slice(0, 20)
  };
}

module.exports = { buildFbiSummary };
