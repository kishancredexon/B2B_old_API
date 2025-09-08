const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sPoolSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the poolSchema
    let poolSchema = mongoose.Schema({
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
        createdby: { type: Number },
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
        cpyid: { type: ObjectId }
    },
        {
            timestamps: true,
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "pool" + dbkey;

    // Compile the model
    let PoolModel = mongoose.model(modelName, poolSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = PoolModel;

    // Return the compiled model
    return PoolModel;
};

module.exports = sPoolSchema;
