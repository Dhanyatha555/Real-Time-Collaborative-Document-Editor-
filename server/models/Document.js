const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Document", trim: true },
    content: { type: String, default: "" },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

// true if the user is the owner or one of the collaborators
documentSchema.methods.canAccess = function (userId) {
  const id = String(userId);
  return (
    String(this.owner) === id ||
    this.collaborators.some((c) => String(c) === id)
  );
};

module.exports = mongoose.model("Document", documentSchema);
