import express from "express";
import db from "./db.js";
import monitorRoutes from './routes/monitorRoutes.js'

const app = express();
const PORT = 8383;

// Middleware
app.use(express.json())

// Routes
app.use('/monitors', monitorRoutes)

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
