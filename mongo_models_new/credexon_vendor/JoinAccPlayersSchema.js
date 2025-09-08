const { ObjectId } = require("bson");
const mongoose = require("mongoose");

const joinAccPlayersSchema = mongoose.Schema(
  {
    match_id: { type: Number },
    userid: { type: ObjectId },
    pid: { type: Number },
    sharecnt: { type: Number },
    gkamount: { type: Number, default: 0 },
    totalpnt: { type: Number, default: 0 },
    winamt: { type: Number, default: 0 },
    platformfee: { type: Number, default: 0 },
    gametype: { type: String }, //ckt,fb
    is_cancel: { type: Number, default: 0 },
    gamekey: { type: String }, //[plyacc]
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

joinAccPlayersSchema.index({ userid: 1 });

// Add a virtual field for `id`
joinAccPlayersSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createJoinAccPlayersModel = (connection) => {
  return connection.model("join_acc_players", joinAccPlayersSchema);
};

module.exports = createJoinAccPlayersModel;
