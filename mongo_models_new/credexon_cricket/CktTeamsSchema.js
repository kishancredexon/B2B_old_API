const mongoose = require("mongoose");

const cktTeamsSchema = mongoose.Schema({
    "cid": { type: Number },
    "squad_type": { type: String },
    "team_id": { type: Number },
    "title": { type: String },
    "gmdate": { type: Date },
    "players": { type: Array },
    "team": { type: Object }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktTeamsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktTeamsModel = (connection) => {
    return connection.model("ckt_teams", cktTeamsSchema);
};

module.exports = createCktTeamsModel;