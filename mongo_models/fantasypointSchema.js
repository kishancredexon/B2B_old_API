const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sFantasypointSchema = (reqdb) => {
    const dbkey = keyGen(reqdb);
    const modelName = `fantasypoints${dbkey}`;

    // Check if the model already exists
    if (mongoose.models[modelName]) {
        return mongoose.models[modelName];
    }

    const fantasypointSchema = new mongoose.Schema({
        game_id: { type: Number, required: true },
        type: { type: String, required: true },
        points: { type: Object }
    }, {
        timestamps: true,
        versionKey: false
    });

    return mongoose.model(modelName, fantasypointSchema);
};

module.exports = sFantasypointSchema;
