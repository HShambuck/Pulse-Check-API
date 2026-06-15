import {DatabaseSync} from 'node:sqlite'
const db = new DatabaseSync('monitors.db')

db.exec(`
    CREATE TABLE IF NOT EXISTS monitors (
        id TEXT PRIMARY KEY,
        timeout INTEGER,
        alert_email TEXT,
        status TEXT,
        created_at TEXT,
        updated_at TEXT
    )
`)

export default db;