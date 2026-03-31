const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(process.cwd(), "tickets.sqlite"));
db.pragma("journal_mode = WAL");

module.exports = db;
