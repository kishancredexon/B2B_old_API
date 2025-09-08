const mongoose = require("mongoose");

const cktCommentarySchema =mongoose.Schema({  
     "cid":{ type: Number},
     "match_id": { type: Number},
     "innings":{type:Object},
     "match":{type:Object},
     "inning":{type:Object},
     "commentaries":{type:Object},
     "teams":{type:Object},
     "players":{type:Object},
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
cktCommentarySchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createCktCommentaryModel = (connection) => {
    return connection.model("ckt_commentary", cktCommentarySchema);
};

module.exports = createCktCommentaryModel;
