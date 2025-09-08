const mongoose = require("mongoose");
const fs = require("fs");

const ReportFilesSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    filePath: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    format: { type: String, enum: ["csv", "xlsx"], required: true },
    status: { type: String, enum: ["pending", "completed", "failed"], default: "pending" },
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
ReportFilesSchema.post("remove", function (doc) {
  if (fs.existsSync(doc.filePath)) {
    fs.unlinkSync(doc.filePath); // Delete file from local storage
    console.log(`Deleted file: ${doc.filePath}`);
  }
});

const createReportFilesSchemaModel = (connection) => {
  return connection.model("report_files", ReportFilesSchema);
};

module.exports = createReportFilesSchemaModel;
