const mongoose = require("mongoose")

const cktTeamFantasyPointsSchema =new mongoose.Schema({
    "season_id": { type: Number },
    "league_id": { type: Number },
    "match_id": { type: Number },
    "team_id":{ type: Number},
    "plycnt": { type: Number,default:0 },
    "tp":{ type: Number,default:0},
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktTeamFantasyPointsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktTeamFantasyPointsModel = (connection) => {
    return connection.model("ckt_team_fantasy_points", cktTeamFantasyPointsSchema);
};

module.exports = createCktTeamFantasyPointsModel;
