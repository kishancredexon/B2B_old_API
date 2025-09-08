const mongoose = require("mongoose")

const cktSeriesTeamSchema = mongoose.Schema({
    cid: { type: Number },
    team_id: { type: Number },
    played: { type: Number },
    win: { type: Number },
    loss: { type: Number },
    draw: { type: Number },
    nr: { type: String },
    overfor: { type: String },
    runfor: { type: String },
    overagainst: { type: String },
    runagainst: { type: String },
    netrr: { type: String },
    points: { type: Number },
    lastfivematch: { type: String },
    lastfivematchresult: { type: String },
    quality: { type: Boolean },
    team: { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktSeriesTeamSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktSeriesTeamModel = (connection) => {
    return connection.model("ckt_series_team", cktSeriesTeamSchema);
};

module.exports = createCktSeriesTeamModel;
