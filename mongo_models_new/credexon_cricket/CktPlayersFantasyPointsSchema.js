const mongoose = require("mongoose")

const cktPlayersFantasyPointsSchema = new mongoose.Schema({
    "season_id": { type: Number },//
    "league_id": { type: Number },
    "match_id": { type: Number },
    "team_id": { type: Number },
    "pid": { type: Number },
    "wicket": { type: Number, default: 0 },
    "catch": { type: Number, default: 0 },
    "catchthree": { type: Number, default: 0 },//new
    "catchfive": { type: Number, default: 0 },//new
    "run": { type: Number, default: 0 },
    "six": { type: Number, default: 0 },
    "four": { type: Number, default: 0 },
    "thirty": { type: Number, default: 0 },//new
    "fifty": { type: Number, default: 0 },
    "hundred": { type: Number, default: 0 },
    "duck": { type: Number, default: 0 },
    "mdnover": { type: Number, default: 0 },
    "stumped": { type: Number, default: 0 },
    "cap": { type: Number, default: 0 },
    "vcap": { type: Number, default: 0 },
    "playing": { type: Number, default: 0 },
    "fourwhb": { type: Number, default: 0 },
    "threewhb": { type: Number, default: 0 },//new
    "fivewhb": { type: Number, default: 0 },
    "runout": { type: Number, default: 0 },
    "thrower": { type: Number, default: 0 },
    "catcher": { type: Number, default: 0 },
    "srone": { type: Number, default: 0 },
    "srtwo": { type: Number, default: 0 },
    "srthree": { type: Number, default: 0 },
    "srfour": { type: Number, default: 0 },//new
    "srfive": { type: Number, default: 0 },//new
    "srsix": { type: Number, default: 0 },//new
    "erone": { type: Number, default: 0 },
    "ertwo": { type: Number, default: 0 },
    "erthree": { type: Number, default: 0 },
    "erfour": { type: Number, default: 0 },
    "erfive": { type: Number, default: 0 },
    "ersix": { type: Number, default: 0 },
    "erseven": { type: Number, default: 0 },//new
    "srmball": { type: Number, default: 0 },
    "ermover": { type: Number, default: 0 },
    "onefifty": { type: Number, default: 0 },//new
    "twohundred": { type: Number, default: 0 },//new
    "lbwbns": { type: Number, default: 0 },//new
    "directhit": { type: Number, default: 0 },//new
    "playing11": { type: Number, default: 0 },//new
    "runs_conceded": { type: Number, default: 0 },//new
    "tenwhb": { type: Number, default: 0 },//new
    "tp": { type: Number, default: 0 }

},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktPlayersFantasyPointsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktPlayersFantasyPointsModel = (connection) => {
    return connection.model("ckt_players_fantasy_points", cktPlayersFantasyPointsSchema);
};

module.exports = createCktPlayersFantasyPointsModel;
