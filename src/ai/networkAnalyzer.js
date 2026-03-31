const db = require("../database/db");

function buildNetwork(query) {
  const q = `%${query}%`;
  const tickets = db.prepare(`
    SELECT *
    FROM tickets
    WHERE author_id LIKE ?
       OR accused_id LIKE ?
       OR author_tag LIKE ?
       OR accused_name LIKE ?
  `).all(q, q, q, q);

  const relations = [];
  for (const t of tickets) {
    if (t.author_id && t.accused_id) {
      relations.push({ from: t.author_id, to: t.accused_id, type: "denuncia" });
    }
  }

  const map = {};
  for (const rel of relations) {
    const key = `${rel.from}->${rel.to}`;
    map[key] = (map[key] || 0) + 1;
  }

  const edges = Object.entries(map).map(([key, weight]) => {
    const [from, to] = key.split("->");
    return { from, to, weight };
  });

  const nodes = [...new Set(edges.flatMap((e) => [e.from, e.to]))];
  return { nodes, edges };
}

module.exports = { buildNetwork };
