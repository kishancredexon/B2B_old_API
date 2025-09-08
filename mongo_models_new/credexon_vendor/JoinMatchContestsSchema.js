const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const joinMatchContestsSchema = mongoose.Schema(
  {
    match_id: { type: Number },
    userid: { type: ObjectId },
    poolid: { type: ObjectId },
    uteamid: { type: ObjectId },
    pamount: { type: Number, default: 0 },
    totalpnt: { type: Number, default: 0 },
    winamt: { type: Number, default: 0 },
    is_cancel: { type: Number, default: 0 },
    gametype: { type: String }, // ckt, fb
    createdAt: { type: Date },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

joinMatchContestsSchema.index({ userid: 1 });

// Add a virtual field for `id`
joinMatchContestsSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createJoinMatchContestsModel = (connection) => {
  return connection.model("join_match_contests", joinMatchContestsSchema);
};

module.exports = createJoinMatchContestsModel;
