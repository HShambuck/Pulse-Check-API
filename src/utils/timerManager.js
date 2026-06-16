export const timers = {};

function startMonitorTimer(id, db, timeout) {
  // cleartimeout if it already exist in timers
  if (timers[id]) clearTimeout(timers[id]);

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

  // 3. Store timer reference
  timers[id] = timer;
}

export default startMonitorTimer;
