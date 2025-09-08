const mongoose = require("mongoose");

const userAadharsSchema = mongoose.Schema({
    "userid": { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },//Todo: Changed to mongoDb id
    "type": { type: String },
    "client_id": { type: String },
    "full_name": { type: String },
    "aadhaar_number": { type: String },
    "dob": { type: String },
    "gender": { type: String },
    "address": { type: Object },
    "face_status": { type: String },
    "face_score": { type: String },
    "zip": { type: String },
    "profile_image": { type: String },
    "has_image": { type: String },
    "email_hash": { type: String },
    "mobile_hash": { type: String },
    "raw_xml": { type: String },
    "zip_data": { type: String },
    "care_of": { type: String },
    "share_code": { type: String },
    "mobile_verified": { type: String },
    "reference_id": { type: String },
    "aadhaar_pdf": { type: String },
    "status": { type: String },
    "uniqueness_id": { type: String }
},
    {
        timestamps: true,
        versionKey: false,
        toJSON: { virtuals: true }, // Include virtuals in JSON responses
        toObject: { virtuals: true }, // Include virtuals in object responses
    });

// Add a virtual field for `id`
userAadharsSchema.virtual("id").get(function () {
    return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserAadharsModel = (connection) => {
    return connection.model("user_aadhars", userAadharsSchema);
};

module.exports = createUserAadharsModel;
