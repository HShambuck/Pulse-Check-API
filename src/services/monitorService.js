export function addMonitor(db, id, timeout, alert_email) {
    const now = new Date().toISOString();

    const insertMonitor = db.prepare(`
        INSERT INTO monitors(id, timeout, alert_email, status, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?)
    `);
    // Setting device status as active
    insertMonitor.run(id, timeout, alert_email, "ACTIVE", now, now);
}

export function getMonitor(db, id) {
    const monitor = db.prepare(
        `SELECT * FROM monitors WHERE id = ?`
    ).get(id);

    if (!monitor) {
        throw new Error("MONITOR_NOT_FOUND");
    }

    return monitor
}

export function getAllMonitors(db) {
    return db.prepare(`
    SELECT * FROM monitors
  `).all();
}

export function updateMonitor(db, id, state) {
    const now = new Date().toISOString();

    db.prepare(`UPDATE monitors SET status = ?, updated_at = ? WHERE id = ?`).run(state, now, id);
}
