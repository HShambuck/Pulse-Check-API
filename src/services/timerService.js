import { updateMonitor } from "./monitorService.js";

export const timers = {};

export function startMonitorTimer(db, id, timeout) {
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
    updateMonitor(db, id, "DOWN")

    //cleanup memory
    delete timers[id];
  }, timeout * 1000);

  // 3. Store the timer reference in memory
  timers[id] = timer;
}
