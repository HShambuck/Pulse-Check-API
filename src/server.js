import express from "express";
import db from "./db.js";

const app = express();
const PORT = 8383;

const timers = {};

app.post("/monitor", (req, res) => {
  const { id, timeout, alert_email } = req.body;

  // Validation
  if(!id || !timeout || !alert_email) {
    return res.status(400).json({
        error: "Missing required fields: id, timeout and alert_email"
    })
  }

  try {
    // 1. Save to DB
    const insertMonitor = db.prepare(`
        INSERT INTO monitors(id, timeout, alert_email, status) VALUES(?, ?, ?, ?)
    `);
    insertMonitor.run(id, timeout, alert_email, "ACTIVE");

    // 2. Start timer 
    const timer = setTimeout(() => {
        // Send an alert after timeout  
        console.log({
            ALERT: `Device ${id} is down!`,
            time: new Date().toISOString()
        })

        // update DB
        db.prepare(`
            UPDATE monitors SET status = ? WHERE id = ?
        `).run("DOWN", id)

        //cleanup memory
        delete timers[id]
    }, timeout * 1000)

    // 3. Store timer reference
    timers[id] = timer;

    // send response
    return res.status(201).json({
        message: "Monitor successfully created",
        id
    })

  } catch (error) {
    console.log(error.message);
    res.sendStatus(503);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
