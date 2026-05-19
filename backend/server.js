require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

// 1. Import all the Route files
const userRoutes = require("./routes/userRoutes");
const moduleRoutes = require("./routes/moduleRoutes");
const progressRoutes = require("./routes/progressRoutes");
const quizRoutes = require("./routes/quizRoutes");
const adminRoutes = require("./routes/adminRoutes");

// 2. Connect to MongoDB Atlas
connectDB();

const app = express();

// 3. Global Middleware
app.use(cors()); // Allows React to talk to this API
app.use(express.json()); // Tells the server to understand JSON data sent in the req.body

// 4. Mount the Routes (Plug the doorways into the main building)
app.use("/api/users", userRoutes);
app.use("/api/modules", moduleRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/admin", adminRoutes);

// A simple test route just to see if the server is alive
app.get("/", (req, res) => {
  res.send("Hackstack Portal API is running!");
});

// 5. Start the Engine
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is successfully running on port ${PORT}`);
});
