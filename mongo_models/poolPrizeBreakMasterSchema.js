const mongoose = require("mongoose");
const { ObjectID } = require("mongodb")
const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sPoolPrizeBreakMasterSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the poolPrizeBreakMasterSchema
    let poolPrizeBreakMasterSchema = mongoose.Schema({
        poolmaster_id: { type: ObjectID},
        pmin: { type: Number},
        pmax: { type: Number},
        pamount: { type: Number},
    },
        {
            timestamps: true,
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "poolprizebreakmasters" + dbkey;

    // Compile the model
    let PoolmasterModel = mongoose.model(modelName, poolPrizeBreakMasterSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = PoolmasterModel;

    // Return the compiled model
    return PoolmasterModel;
};

module.exports = sPoolPrizeBreakMasterSchema;
