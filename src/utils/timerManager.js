export const timers = {};

export function startMonitorTimer(id, db, timeout) {
  // 2. heartbeat logic: Stop old countdown
  if (timers[id]) clearTimeout(timers[id]);

  // 3. Start fresh timer
  const timer = setTimeout(() => {
    // Send an alert after timeout
    console.log({
      ALERT: `Device ${id} is down!`,
      time: new Date().toISOString(),
    });

    // update DB
    db.prepare(
      `
            UPDATE monitors SET status = ? WHERE id = ?
        `,
    ).run("DOWN", id);

    //cleanup memory
    delete timers[id];
  }, timeout * 1000);

  // 3. Store the timer reference in memory
  timers[id] = timer;
}
