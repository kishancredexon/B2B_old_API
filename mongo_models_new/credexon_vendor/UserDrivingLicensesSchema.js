const mongoose = require("mongoose");
const { ObjectID } = require("mongodb");

const userDrivingLicensesSchema = mongoose.Schema(
  {
    userid: { type: ObjectID },
    type: { type: String },
    client_id: { type: String },
    license_number: { type: String },
    state: { type: String },
    name: { type: String },
    permanent_address: { type: String },
    permanent_zip: { type: String },
    temporary_address: { type: String },
    temporary_zip: { type: String },
    citizenship: { type: String },
    ola_name: { type: String },
    ola_code: { type: String },
    gender: { type: String },
    father_or_husband_name: { type: String },
    dob: { type: String },
    doe: { type: String },
    transport_doe: { type: String },
    doi: { type: String },
    transport_doi: { type: String },
    profile_image: { type: String },
    has_image: { type: String },
    blood_group: { type: String },
    vehicle_classes: { type: Array },
    less_info: { type: String },
    additional_check: { type: Array },
    initial_doi: { type: String },
    current_status: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

userDrivingLicensesSchema.index({ userid: 1 });

// Add a virtual field for `id`
userDrivingLicensesSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserDrivingLicensesModel = (connection) => {
  return connection.model("user_driving_licenses", userDrivingLicensesSchema);
};

module.exports = createUserDrivingLicensesModel;
