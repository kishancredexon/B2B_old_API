const mongoose = require("mongoose");

const cktLeaguesPubSchema = mongoose.Schema({
    "cid": { type: Number },
    "status": { type: String },
    "date_start": { type: Date },
    "date_end": { type: Date },
    "is_active": { type: Number, default: 0 },
    "is_publish": { type: Number, default: 0 }
}, {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
});


const createCktLeaguesPubModel = (connection) => {
    return connection.model("ckt_leagues_publishes", cktLeaguesPubSchema);
};

module.exports = createCktLeaguesPubModel;
