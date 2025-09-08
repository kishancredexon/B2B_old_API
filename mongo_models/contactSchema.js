const mongoose = require("mongoose");

const { keyGen } = require("../helper/common");
const sContactSchema = (reqdb) => {
   let contactSchema= mongoose.Schema({
    name: {type: String},
    email:{type: String},
    phone:{type:Number},
    subject:{type:String},
    message:{type:String}
},
    {
        timestamps: true,
        versionKey: false
    })

    let dbkey = keyGen(reqdb);
    return mongoose.model("contactus"+dbkey, contactSchema)
};
module.exports = sContactSchema
