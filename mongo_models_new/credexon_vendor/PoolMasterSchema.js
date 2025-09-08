const mongoose = require("mongoose");

const poolMasterSchema = mongoose.Schema({
    poolmaster_id: { type: String },
    contest_id: { type: mongoose.Schema.Types.ObjectId },
    joinfee: { type: Number, default: 0.00 },
    match_id: { type: Number, default: 0 },
    totalwinamt: { type: Number, default: 0.00 },
    winners: { type: Number, default: 0 },
    maxteams: { type: Number, default: 0 },
    uptojoin: { type: Number, default: 6 },
    c: { type: Number, default: 0 },
    m: { type: Number, default: 0 },
    s: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    favpool: { type: Number, default: 0 },
    name: { type: String },
    isChecked: { type: Number, default: 0 },
    type: { type: String }, // [s= series, m= matches]
    countrytype: { type: String }, // [+91, +1]
    gtype: { type: String }, // ["ckt", "fb"]
    usable_bonus_percentage: { type: Number }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
poolMasterSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPoolMasterModel = (connection) => {
    return connection.model("pool_masters", poolMasterSchema);
};

module.exports = createPoolMasterModel;
