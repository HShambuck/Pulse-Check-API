import express from "express";
import db from "../db.js";
import { timers, startMonitorTimer } from "../utils/timerManager.js";

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
    // 1. Save device info to DB
    const insertMonitor = db.prepare(`
        INSERT INTO monitors(id, timeout, alert_email, status) VALUES(?, ?, ?, ?)
    `);
    // Setting device status as active
    insertMonitor.run(id, timeout, alert_email, "ACTIVE");

    // 2. Start a countdown timer
    startMonitorTimer(id, db, timeout);

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

router.post("/:id/heartbeat", (req, res) => {
  const { id } = req.params;

  try {
    //1. Find monitor device in db
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
      startMonitorTimer(id, db, monitor.timeout);

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

router.post("/:id/pause", (req, res) => {
  const { id } = req.params;

  try {
    // 1. check if monitor exist
    const monitor = db
      .prepare(
        `
    SELECT * FROM monitors WHERE id = ?
  `,
      )
      .get(id);

    if (!monitor) return res.status(404).json({ error: "Monitor not found" });

    // 2. Update db state
    db.prepare(`UPDATE monitors SET status = ? WHERE id = ?`).run("PAUSED", id);

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
    res.sendCode(500);
  }
});

export default router;
