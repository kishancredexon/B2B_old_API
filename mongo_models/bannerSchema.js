const mongoose = require("mongoose");
const { keyGen } = require("../helper/common");

const sBannerSchema = (reqdb) => {
    const bannerSchema = new mongoose.Schema({
        "type": { type: String },
        "image": { type: String },
        "sequence": { type: Number },
        "status": { type: Number },
        "device": { type: String },
        "banner_link": { type: String }
    }, {
        timestamps: true,
        versionKey: false
    });

    let dbkey = keyGen(reqdb);
    console.log("dbkey3333===>>",dbkey);
    const modelName = "banners" + dbkey;

    // Check if the model already exists before creating a new one
    if (mongoose.models[modelName]) {
        return mongoose.model(modelName);
    } else {
        return mongoose.model(modelName, bannerSchema);
    }
};

module.exports = sBannerSchema;
