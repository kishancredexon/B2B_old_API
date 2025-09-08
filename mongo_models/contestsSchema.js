const mongoose = require("mongoose");

const { keyGen } = require("../helper/common");

// Define a map to store compiled models
const compiledModels = {};

const sContestsSchema = (reqdb) => {
    // Check if the model for the given reqdb has already been compiled
    if (compiledModels[reqdb]) {
        // If yes, return the compiled model
        return compiledModels[reqdb];
    }

    // Define the contestsSchema
    let contestsSchema = mongoose.Schema({
        contest_id: { type: String },
        title: { type: String },
        subtitle: { type: String },
        contestlogo: { type: String },
        status: { type: Number, default: 1 },
        dis_val: { type: Number, default: 0 },
        dis_type: { type: String },
        max_dis_val: { type: Number },
        favcontest: { type: Number, default: 0 },
        isprivate: { type: Number, default: 0 },
        sortodr: { type: Number, default: 2 },
        order: { type: Number, default: 0 },
    },
        {
            timestamps: true,
            versionKey: false
        });

    // Generate a unique model name based on reqdb
    let dbkey = keyGen(reqdb);
    let modelName = "contests" + dbkey;

    // Compile the model
    let ContestModel = mongoose.model(modelName, contestsSchema);

    // Store the compiled model in the map
    compiledModels[reqdb] = ContestModel;

    // Return the compiled model
    return ContestModel;
};

module.exports = sContestsSchema;