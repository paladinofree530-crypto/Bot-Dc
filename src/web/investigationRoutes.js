const express = require("express");
const db = require("../database/db");
const { calculateRisk } = require("../ai/riskEngine");

const router = express.Router();

router.get("/investigate/:query", (req, res) => {
  const q = req.params.query;

  const tickets = db.prepare(`
    SELECT *
    FROM tickets
    WHERE author_id LIKE ?
       OR accused_id LIKE ?
       OR author_tag LIKE ?
       OR accused_name LIKE ?
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);

  const events = db.prepare(`
    SELECT *
    FROM ticket_events
    WHERE payload_json LIKE ?
       OR actor_tag LIKE ?
    ORDER BY created_at DESC
    LIMIT 200
  `).all(`%${q}%`, `%${q}%`);

  const stats = {
    total: tickets.length,
    denuncias: tickets.filter(t => t.category === "denuncia").length,
    criticos: tickets.filter(t => t.priority === "critica").length
  };

  const risk = calculateRisk(tickets);

  res.json({ query: q, stats, risk, tickets, events });
});

router.get("/heatmap", (_req, res) => {
  const rows = db.prepare(`
    SELECT accused_id, accused_name, COUNT(*) as total
    FROM tickets
    WHERE accused_id IS NOT NULL
    GROUP BY accused_id, accused_name
    ORDER BY total DESC
    LIMIT 10
  `).all();

  res.json(rows);
});

router.get("/network/:query", (req, res) => {
  const q = req.params.query;
  const tickets = db.prepare(`
    SELECT *
    FROM tickets
    WHERE author_id LIKE ?
       OR accused_id LIKE ?
       OR author_tag LIKE ?
       OR accused_name LIKE ?
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);

  const relations = [];
  for (const t of tickets) {
    if (t.author_id && t.accused_id) {
      relations.push({ from: t.author_id, to: t.accused_id, type: "denuncia" });
    }
  }

  const map = {};
  relations.forEach(r => {
    const key = `${r.from}->${r.to}`;
    map[key] = (map[key] || 0) + 1;
  });

  const graph = Object.entries(map).map(([k, v]) => {
    const [from, to] = k.split("->");
    return { from, to, weight: v };
  });

  res.json({
    nodes: [...new Set(graph.flatMap(g => [g.from, g.to]))],
    edges: graph
  });
});

router.get("/report/:query", (req, res) => {
  const q = req.params.query;
  const data = db.prepare(`
    SELECT *
    FROM tickets
    WHERE author_id LIKE ?
       OR accused_id LIKE ?
       OR author_tag LIKE ?
       OR accused_name LIKE ?
  `).all(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);

  res.json({
    generatedAt: new Date().toISOString(),
    total: data.length,
    data
  });
});

module.exports = router;
