const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");

const poolSchema = mongoose.Schema({
    poolmaster_id: { type: ObjectId },
    match_id: { type: Number },
    league_id: { type: Number },
    contest_id: { type: ObjectId },
    type: { type: String }, // [s= series, m= matches]
    joinfee: { type: Number, default: 0.00 },
    totalwinamt: { type: Number, default: 0.00 },
    winamt: { type: Number, default: 0.00 },
    winners: { type: Number, default: 0 },
    maxteams: { type: Number, default: 0 },
    c: { type: Number, default: 0 },
    m: { type: Number, default: 0 },
    s: { type: Number, default: 0 },
    status: { type: Number, default: 0 }, // by default 0 => inactive 1 => active 2 => delete
    favpool: { type: Number, default: 0 },
    createdby: { type: ObjectId },
    isprivate: { type: Number, default: 0 },
    iscpy: { type: Number, default: 0 },
    ispoolfull: { type: Number, default: 0 },
    iscancel: { type: Number, default: 0 },
    countrytype: { type: String }, // [+91, +1]
    gtype: { type: String }, // ["ckt", "fb"]
    uptojoin: { type: Number, default: 6 },
    joineduser: { type: Number, default: 0 },
    privatename: { type: String },
    isChecked: { type: Number },
    start_date: { type: String },
    end_date: { type: String },
    usable_bonus_percentage: { type: Number },
    order_by: { type: Number, default: 2 },
    cpyid: { type: ObjectId },
    isflexible : { type: Number, default: 1 }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
poolSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createPoolModel = (connection) => {
    return connection.model("pools", poolSchema);
};

module.exports = createPoolModel;
