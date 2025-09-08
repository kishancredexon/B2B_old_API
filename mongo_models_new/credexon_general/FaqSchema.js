const mongoose = require("mongoose");

const faqSchema = mongoose.Schema({
    "category_name": { type: String },
    "question": { type: String },
    "answer": { type: String },
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })


// Add a virtual field for `id`
faqSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createFaqModel = (connection) => {
    return connection.model("faqs", faqSchema);
};

module.exports = createFaqModel
