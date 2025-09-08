const mongoose = require("mongoose");
const fs = require("fs");

const TransactionsFilesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    format: { type: String, enum: ["csv", "xlsx"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
    transactionCount: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now, expires: "5d" }, // Auto-delete after 5 days
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-delete files from local storage when MongoDB removes the document
TransactionsFilesSchema.post("remove", function (doc) {
  if (fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath); // Delete file from local storage
    console.log(`Deleted file: ${doc.filePath}`);
  }
});

const createTransactionsFilesModel = (connection) => {
  return connection.model("transactions_files", TransactionsFilesSchema);
};

module.exports = createTransactionsFilesModel;
