const mongoose = require("mongoose");

const userPanSchema = mongoose.Schema(
  {
    userid: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    type: { type: String },
    client_id: { type: String },
    pan_number: { type: String },
    full_name: { type: String },
    category: { type: String },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

userPanSchema.index({ userid: 1 });

// Add a virtual field for `id`
userPanSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createUserPanModel = (connection) => {
  return connection.model("user_pans", userPanSchema);
};

module.exports = createUserPanModel;
