const mongoose = require("mongoose");

const masterUsersSchema = mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String },
    phone: { type: String },
    password: { type: String, required: true },
    profilename: { type: String, default: null },
    profilepic: { type: String, default: null },
    usertype: { type: Number }, //0=admin 1=subadmin 2 =user
    apikey: { type: String },
    dbname: { type: String },
    deposit_api: { type: String, default: null },
    wallet_check_api: { type: String, default: null },
    apikeyofvendor: { type: String, default: null },
    balance_api: { type: String, default: null },
    logo_url: { type: String, default: null },
    status: { type: Number, default: 1 },
    cricket: { type: Number },
    football: { type: Number },
    player_accumulator: { type: Number },
    player_contest: { type: Number },
    background_color: { type: String, default: null },
    feature_box_bg: { type: String, default: null },
    background_light: { type: String, default: null },
    border_color: { type: String, default: null },
    circle_color: { type: String, default: null },
    contest_block_bg: { type: String, default: null },
    faq_border: { type: String, default: null },
    font_secondary: { type: String, default: null },
    light_secondary_color: { type: String, default: null },
    primary_color: { type: String, default: null },
    progress_color: { type: String, default: null },
    secondary_color: { type: String, default: null },
    dark_text: { type: String, default: null },
    secondary_dark_color: { type: String, default: null },
    table_header: { type: String, default: null },
    input_bg: { type: String, default: null },
    font_primary: { type: String, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true }, // Include virtuals in JSON responses
    toObject: { virtuals: true }, // Include virtuals in object responses
  }
);

// Add a virtual field for `id`
masterUsersSchema.virtual("id").get(function () {
  return this._id.toHexString(); // Convert _id (ObjectId) to a string
});

const createMasterUsersModel = (connection) => {
  return connection.model("masterusers", masterUsersSchema);
};

module.exports = createMasterUsersModel;
