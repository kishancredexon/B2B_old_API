const mongoose = require("mongoose");

const contactUsSchema = mongoose.Schema({
    name: { type: String },
    email: { type: String },
    phone: { type: Number },
    subject: { type: String },
    message: { type: String }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    })


// Add a virtual field for `id`
contactUsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createContactUsModel = (connection) => {
    return connection.model("contact_us", contactUsSchema);
};

module.exports = createContactUsModel
