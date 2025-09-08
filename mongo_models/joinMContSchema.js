const { ObjectId } = require("mongodb");
const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sJoinMContSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the joinMContSchema
    let joinMContSchema = mongoose.Schema({
        match_id: { type: Number },
        userid: { type: Number },
        poolid: { type: ObjectId },
        uteamid: { type: ObjectId },
        //gamekey: { type: Number },
        pamount: { type: Number, default: 0 },
        totalpnt: { type: Number, default: 0 },
        winamt: { type: Number, default: 0 },
        gametype: { type: String }, // ckt, fb
        createdAt: { type: Date }
    },
        {
            timestamps: true,
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "joinmconts" + dbkey;

    // Compile the model
    let PoolModel = mongoose.model(modelName, joinMContSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = PoolModel;

    // Return the compiled model
    return PoolModel;
};

module.exports = sJoinMContSchema;
