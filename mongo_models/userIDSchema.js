// const mongoose = require("mongoose");

// let aadhaarObj={  
//     "userid":{ type: Number},
//     "type":{ type: String},
//     "client_id":{ type: String},
//     "full_name":{ type: String},
//     "aadhaar_number":{ type: String},
//     "dob":{ type: String},
//     "gender":{ type: String},
//     "address":{ type: Object},
//     "face_status":{ type: String},
//     "face_score":{ type: String},
//     "zip":{ type: String},
//     "profile_image":{ type: String},
//     "has_image":{ type: String},
//     "email_hash":{ type: String},
//     "mobile_hash":{ type: String},
//     "raw_xml":{ type: String},
//     "zip_data":{ type: String},
//     "care_of":{ type: String},
//     "share_code":{ type: String},
//     "mobile_verified":{ type: String},
//     "reference_id":{ type: String},
//     "aadhaar_pdf":{ type: String},
//     "status":{ type: String},
//     "uniqueness_id":{ type: String}
// }

// let dLicenseObj= {  
//     "userid":{ type: Number},
//     "type":{ type: String},
//     "client_id":{ type: String},
//     "license_number":{ type: String},
//     "state":{ type: String},
//     "name":{ type: String},
//     "permanent_address":{ type: String},
//     "permanent_zip":{ type: String},
//     "temporary_address":{ type: String},
//     "temporary_zip":{ type: String},
//     "citizenship":{ type: String},
//     "ola_name":{ type: String},
//     "ola_code":{ type: String},
//     "gender":{ type: String},
//     "father_or_husband_name":{ type: String},
//     "dob":{ type: String},
//     "doe":{ type: String},
//     "transport_doe":{ type: String},
//     "doi":{ type: String},
//     "transport_doi":{ type: String},
//     "profile_image":{ type: String},
//     "has_image":{ type: String},
//     "blood_group":{ type: String},
//     "vehicle_classes":{ type: Array},
//     "less_info":{ type: String},
//     "additional_check":{ type: Array},
//     "initial_doi":{ type: String},
//     "current_status":{ type: String}
// }

// let panObj= {  
//     "userid":{ type: Number},
//     "type":{ type: String},
//     "client_id":{ type: String},
//     "pan_number":{ type: String},
//     "full_name":{ type: String},
//     "category":{ type: String}
// }

// module.exports=userIDSchema=(type)=>{
//     let sUserIDSchema=null;
//     if(type==="aadhar"){
//         sUserIDSchema=aadhaarObj;
//     }else 
//     if(type==="dlicense"){
//         sUserIDSchema=dLicenseObj;
//     }else 
//     if(type==="pan"){
//         sUserIDSchema=panObj;
//     }

//     let schemaObj= mongoose.Schema(sUserIDSchema,
//     {
//         timestamps: true,
//         versionKey: false
//     });
//    return mongoose.model("userids"+type, schemaObj)
// };


