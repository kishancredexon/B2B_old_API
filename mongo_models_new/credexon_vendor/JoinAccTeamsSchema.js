const mongoose = require("mongoose");
const { ObjectId } = require("mongodb");

const joinAccTeamsSchema = mongoose.Schema({
    league_id: { type: Number },
    userid: { type: ObjectId },
    team_id: { type: Number },
    sharecnt: { type: Number },
    pamount: { type: Number, default: 0 },
    platformfee: { type: Number, default: 0 },
    totalpnt: { type: Number, default: 0 },
    winamt: { type: Number, default: 0 },
    gametype: { type: String },//ckt,fb
    gamekey: { type: String }//[tmcont=4 winners, pzpool= 1 winners]
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});

// Add a virtual field for `id`
joinAccTeamsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createJoinAccTeamsModel = (connection) => {
    return connection.model("join_acc_teams", joinAccTeamsSchema);
};

module.exports = createJoinAccTeamsModel;
