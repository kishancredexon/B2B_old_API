const mongoose = require("mongoose");

const { keyGen } = require("../helper/common");
const sCmsSchema = (reqdb) => {
   let cmsSchema= mongoose.Schema({
    "title": { type: String },
    "slug": { type: String },
    "content": { type: String },
    "image": { type: String }, 
    "status": { type: Number },
},
    {
        timestamps: true,
        versionKey: false
    })

    let dbkey = keyGen(reqdb);
    return mongoose.model("cms"+dbkey, cmsSchema)
};
module.exports = sCmsSchema
