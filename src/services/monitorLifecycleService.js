import { getMonitor, updateMonitor } from "./monitorService.js";
import { startMonitorTimer } from "./timerService.js";

export function transitionMonitorState(db, id, newState) {
    // fetch monitor from db
    const {status, timeout} = getMonitor(db, id);

    // Validate state
    if (newState === "DOWN" && status !== newState) {
      throw new Error("Only DOWN monitors can be restarted");
    }

    if (newState === "PAUSED" && status !== newState) {
      throw new Error("Only PAUSED monitors can be resumed");
    }

    // update db state
    updateMonitor(db, id, "ACTIVE");

    // restart timer
    startMonitorTimer(db, id, timeout);
}