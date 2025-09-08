const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sPoolmasterSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the poolmasterSchema
    let poolmasterSchema = mongoose.Schema({
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
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "poolmasters" + dbkey;

    // Compile the model
    let PoolmasterModel = mongoose.model(modelName, poolmasterSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = PoolmasterModel;

    // Return the compiled model
    return PoolmasterModel;
};

module.exports = sPoolmasterSchema;
