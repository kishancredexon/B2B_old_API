const mongoose = require("mongoose");

const userIDAadharSchema =mongoose.Schema({  
    "userid":{ type: Number},
    "type":{ type: String},
    "client_id":{ type: String},
    "full_name":{ type: String},
    "aadhaar_number":{ type: String},
    "dob":{ type: String},
    "gender":{ type: String},
    "address":{ type: Object},
    "face_status":{ type: String},
    "face_score":{ type: String},
    "zip":{ type: String},
    "profile_image":{ type: String},
    "has_image":{ type: String},
    "email_hash":{ type: String},
    "mobile_hash":{ type: String},
    "raw_xml":{ type: String},
    "zip_data":{ type: String},
    "care_of":{ type: String},
    "share_code":{ type: String},
    "mobile_verified":{ type: String},
    "reference_id":{ type: String},
    "aadhaar_pdf":{ type: String},
    "status":{ type: String},
    "uniqueness_id":{ type: String}
},
   {
       timestamps: true,
       versionKey: false
   })
   
   module.exports = mongoose.model("useridsaadhars", userIDAadharSchema)