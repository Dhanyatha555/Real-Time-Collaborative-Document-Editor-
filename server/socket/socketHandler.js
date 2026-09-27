const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Document = require("../models/Document");
const { JWT_SECRET } = require("../config/config");

module.exports = function registerSocketHandlers(io) {
  // 1. Every socket must send a valid JWT while connecting
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth && socket.handshake.auth.token;
      if (!token) return next(new Error("Authentication required"));
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await User.findById(decoded.id).select("name");
      if (!user) return next(new Error("User not found"));
      socket.data.user = { _id: String(user._id), name: user.name };
      next();
    } catch (err) {
      next(new Error("Invalid token"));
    }
  });

  // Tell everybody in a document room who is currently online
  async function sendActiveUsers(documentId) {
    const sockets = await io.in(documentId).fetchSockets();
    const unique = new Map();
    sockets.forEach((s) => unique.set(s.data.user._id, s.data.user.name));
    const users = Array.from(unique, ([id, name]) => ({ id, name }));
    io.to(documentId).emit("active-users", users);
  }

  io.on("connection", (socket) => {
    // 2. Join the room of one document (only if the user has access)
    socket.on("join-document", async (documentId) => {
      try {
        if (!mongoose.isValidObjectId(documentId)) {
          return socket.emit("error-message", "Invalid document id");
        }
        const doc = await Document.findById(documentId);
        if (!doc || !doc.canAccess(socket.data.user._id)) {
          return socket.emit("error-message", "Access denied");
        }
        socket.join(documentId);
        socket.data.documentId = documentId;
        socket.emit("joined");
        await sendActiveUsers(documentId);
      } catch (err) {
        socket.emit("error-message", "Could not join the document");
      }
    });

    // 3. Forward every edit to the other users in the same room
    socket.on("send-changes", (data = {}) => {
      const { documentId, title, content } = data;
      if (!socket.rooms.has(documentId)) return;
      socket.to(documentId).emit("receive-changes", { title, content });
    });

    // 4. Save the latest text in MongoDB
    socket.on("save-document", async (data = {}) => {
      try {
        const { documentId, title, content } = data;
        if (!socket.rooms.has(documentId)) return;
        await Document.findByIdAndUpdate(documentId, {
          title: (title || "").trim() || "Untitled Document",
          content: content || "",
        });
        socket.emit("document-saved");
      } catch (err) {
        socket.emit("error-message", "Could not save the document");
      }
    });

    // 5. Update the online-users list when someone leaves
    socket.on("disconnect", () => {
      if (socket.data.documentId) {
        sendActiveUsers(socket.data.documentId).catch(() => {});
      }
    });
  });
};
