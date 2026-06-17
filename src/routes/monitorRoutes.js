import express from "express";
import db from "../db.js";
import { timers, startMonitorTimer } from "../services/timerService.js";
import { addMonitor, getMonitor, getAllMonitors, updateMonitor } from "../services/monitorService.js";
import { transitionMonitorState } from "../services/monitorLifecycleService.js";

const router = express.Router();

// Developer Option - Get All Monitors
router.get("/", (req, res) => {
  try {
    const monitors = getAllMonitors(db);
    return res.status(200).json(monitors);
  } catch (error) {
    console.log(error.message);
    return res.sendStatus(500);
  }
});

// Create Monitor Route Logic
router.post("/", (req, res) => {
  const { id, timeout, alert_email } = req.body;

  // Validation
  if (!id || !timeout || !alert_email) {
    return res.status(400).json({
      error: "Missing required fields: id, timeout and alert_email",
    });
  }

  try {
    // 1. Save device info to DB
    addMonitor(db, id, timeout, alert_email);

    // 2. Start a countdown timer
    startMonitorTimer(db, id, timeout);

    // send response
    return res.status(201).json({
      message: "Monitor successfully created",
      id,
    });
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

// Heartbeat Route Logic
router.post("/:id/heartbeat", (req, res) => {
  const { id } = req.params;

  try {
    //1. Find monitor device in db
    const {status, timeout} = getMonitor(db, id)

    // is there an active timer?
    if (status === "ACTIVE") {
      // create new setTimeout
      startMonitorTimer(db, id, timeout);

      //4. Respond
      return res.status(200).json({
        message: "Heartbeat received",
        id,
      });
    } else {
      return res.status(200).json({
        message: "Heartbeat ignored | monitor is inactive",
      });
    }
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

// Pause Route Logic
router.post("/:id/pause", (req, res) => {
  const { id } = req.params;

  try {
    // 1. check if monitor exist
    const monitor = getMonitor(db, id)

    if (monitor.status === "DOWN") {
      return res.status(400).json({
        error: "Cannot pause a DOWN monitor. Restart it first.",
      });
    }

    // 2. Update db state
    updateMonitor(db, id, "PAUSED")

    if (timers[id]) {
      clearTimeout(timers[id]);
      delete timers[id];
    }

    return res.status(200).json({
      message: "Monitor paused",
      id,
    });
  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

// Developer Choice Routes
// Resume Route Logic
router.post("/:id/resume", (req, res) => {
  const { id } = req.params

  try {
    // resume
    transitionMonitorState(db, id, "PAUSED")

    return res.status(200).json({
      message: "Monitor resumed",
      id,
    });
  } catch (error) {
    console.log(error.message)
    res.sendStatus(500)
  }
})

// Restart Route Logic
router.post("/:id/restart", (req, res) => {
  const { id } = req.params;

  try {
    // restart
    transitionMonitorState(db, id, "DOWN")

    return res.status(200).json({
      message: "Monitor restarted",
      id,
    });

  } catch (error) {
    console.log(error.message);
    res.sendStatus(500);
  }
});

export default router;
