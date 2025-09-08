const mongoose = require("mongoose");
const { ObjectID } = require("mongodb")
const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sPoolPrizebreakSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the poolPrizebreakSchema
    let poolPrizebreakSchema = mongoose.Schema({
        pool_id: { type: ObjectID},
        pmin: { type: Number},
        pmax: { type: Number},
        pamount: { type: Number},
        ppbmaster_id: { type: ObjectID}
    },
        {
            timestamps: true,
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "poolprizebreaks" + dbkey;

    // Compile the model
    let PoolmasterModel = mongoose.model(modelName, poolPrizebreakSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = PoolmasterModel;

    // Return the compiled model
    return PoolmasterModel;
};

module.exports = sPoolPrizebreakSchema;

