export function addMonitor(db, id, timeout, alert_email) {
        const insertMonitor = db.prepare(`
        INSERT INTO monitors(id, timeout, alert_email, status) VALUES(?, ?, ?, ?)
    `);
    // Setting device status as active
    insertMonitor.run(id, timeout, alert_email, "ACTIVE");
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
    db.prepare(`UPDATE monitors SET status = ? WHERE id = ?`).run(state, id);
}
