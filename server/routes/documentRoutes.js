const express = require("express");
const mongoose = require("mongoose");
const Document = require("../models/Document");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();
router.use(auth);

// Runs for every route that has :id - loads the document and checks access
router.param("id", async (req, res, next, id) => {
  try {
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "Invalid document id" });
    }
    const doc = await Document.findById(id);
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    if (!doc.canAccess(req.user._id)) {
      return res.status(403).json({ message: "You do not have access" });
    }
    req.document = doc;
    next();
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

const isOwner = (doc, user) => String(doc.owner) === String(user._id);

// GET /api/documents - documents owned by or shared with the user
router.get("/", async (req, res) => {
  try {
    const docs = await Document.find({
      $or: [{ owner: req.user._id }, { collaborators: req.user._id }],
    })
      .select("title owner collaborators updatedAt")
      .populate("owner", "name")
      .sort({ updatedAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/documents - create a new document
router.post("/", async (req, res) => {
  try {
    const title = (req.body.title || "").trim() || "Untitled Document";
    const doc = await Document.create({ title, owner: req.user._id });
    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/documents/:id - open one document
router.get("/:id", async (req, res) => {
  try {
    const doc = req.document;
    await doc.populate("collaborators", "name email");
    res.json({
      _id: doc._id,
      title: doc.title,
      content: doc.content,
      collaborators: doc.collaborators,
      isOwner: isOwner(doc, req.user),
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/documents/:id/share - owner adds a collaborator by email
router.post("/:id/share", async (req, res) => {
  try {
    const doc = req.document;
    if (!isOwner(doc, req.user)) {
      return res.status(403).json({ message: "Only the owner can share" });
    }
    const email = (req.body.email || "").toLowerCase().trim();
    const person = await User.findOne({ email });
    if (!person) {
      return res.status(404).json({ message: "No user found with that email" });
    }
    if (String(person._id) === String(doc.owner)) {
      return res.status(400).json({ message: "You already own this document" });
    }
    doc.collaborators.addToSet(person._id);
    await doc.save();
    await doc.populate("collaborators", "name email");
    res.json({ collaborators: doc.collaborators });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/documents/:id - only the owner can delete
router.delete("/:id", async (req, res) => {
  try {
    if (!isOwner(req.document, req.user)) {
      return res.status(403).json({ message: "Only the owner can delete" });
    }
    await req.document.deleteOne();
    res.json({ message: "Document deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
