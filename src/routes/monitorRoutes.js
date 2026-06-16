import express from "express";
import db from "../db.js";
import startMonitorTimer, {timers} from "../utils/timerManager.js";

const router = express.Router();

router.post("/", (req, res) => {
  const { id, timeout, alert_email } = req.body;

  // Validation
  if (!id || !timeout || !alert_email) {
    return res.status(400).json({
      error: "Missing required fields: id, timeout and alert_email",
    });
  }

  try {
    // 1. Save to DB
    const insertMonitor = db.prepare(`
        INSERT INTO monitors(id, timeout, alert_email, status) VALUES(?, ?, ?, ?)
    `);
    insertMonitor.run(id, timeout, alert_email, "ACTIVE");

    // 2. Start timer
    startMonitorTimer(id, db, timeout)

    // send response
    return res.status(201).json({
      message: "Monitor successfully created",
      id,
    });
  } catch (error) {
    console.log(error.message);
    res.sendStatus(503);
  }
});

router.post("/:id/heartbeat", (req, res) => {
  const { id } = req.params;

  try {
    //fetch monitor from db
    const monitor = db
      .prepare(
        `
      SELECT * FROM monitors WHERE id = ?   
    `,
      )
      .get(id);

    if (!monitor) return res.status(404).json({ error: "Monitor not found" });

    // is there an active timer?
    if (monitor.status === "ACTIVE") {
      // create new setTimeout
      startMonitorTimer(id, db, monitor.timeout)

      // Return ok 
      return res.status(200).json({
        message: "Heartbeat received",
        id,
      });
    } else {
      return res.status(200).json({
        message: "Heartbeat ignored | monitor is inactive"
      })
    }
  } catch (error) {
    console.log(error.message);
    res.sendStatus(503);
  }
});

router.post("/:id/pause", (req, res) => {});

export default router;
