const mongoose = require("mongoose");

const userIDPanSchema =mongoose.Schema({  
    "userid":{ type: Number},
    "type":{ type: String},
    "client_id":{ type: String},
    "pan_number":{ type: String},
    "full_name":{ type: String},
    "category":{ type: String}
},
   {
       timestamps: true,
       versionKey: false
   })
   
   module.exports = mongoose.model("useridspans", userIDPanSchema)