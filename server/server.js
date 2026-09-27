const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");

const { PORT, CLIENT_URL } = require("./config/config");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const documentRoutes = require("./routes/documentRoutes");
const registerSocketHandlers = require("./socket/socketHandler");

const app = express();
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Collaborative Document Editor API is running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/documents", documentRoutes);

// Express and Socket.IO share the same HTTP server (same port)
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CLIENT_URL, methods: ["GET", "POST"] },
});
registerSocketHandlers(io);

connectDB().then(() => {
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});
