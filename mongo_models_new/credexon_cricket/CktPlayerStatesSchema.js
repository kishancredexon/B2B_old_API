const mongoose = require("mongoose")

const cktPlayerStatesSchema = mongoose.Schema({
    pid: { type: Number },
    batting: { type: Object },
    bowling: { type: Object },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktPlayerStatesSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktPlayerStatesModel = (connection) => {
    return connection.model("ckt_player_states", cktPlayerStatesSchema);
};

module.exports = createCktPlayerStatesModel;
