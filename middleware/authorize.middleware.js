require("dotenv").config();

const jwt = require("jsonwebtoken");
const response = require("./../middleware/response");
const { secret } = require("../config.json");

let sdb = require("../models");
const dbname = require("../helper/dbname.json");
const { getDBName } = require("../helper/common");
const { connectWithVendorDb, connectWithMasterDb } = require("../config/mongodb_connections");
const createUsersModel = require("../mongo_models_new/credexon_vendor/UsersSchema");
const { ObjectId } = require("bson");
const createMasterUsersModel = require("../mongo_models_new/credexon_master/MasterUsersSchema");

module.exports = async (req, res, next) => {
  var authHeader =(req.auth===1)?req:req.headers.authorization;
  console.log("authHeader2===>>", authHeader);
  var current_timezone = req.headers.current_timezone;

  if (authHeader) {
    authHeader = authHeader.replace("Bearer ", "");
    jwt.verify(authHeader, secret, async (err, result) => {
      if (err) {
        return res.status(400).send({
          data: {},
          message: "Unauthorized please login again!",
          status: false,
          status_code: 403,
        });
      }

      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);
      const vendorDetail = await MasterUsersSchema.findOne({"apikey":result.apikey},{"dbname":1,"usertype":1});
      let dbName=vendorDetail.dbname;
      let userType=vendorDetail.usertype;
      console.log("MgdbName--->>",dbName,userType);
      
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);
      
      UsersSchema.findOne({"_id":ObjectId(result.sub)}).then((data) => {
        if (!data)
          return res.status(401).json({
            data: {},
            message: "Unauthorized please login again!",
            status: false,
            status_code: 403,
          });
        let dataF = data;
        dataF["timezone"] = result.timezone;
        dataF["apikey"] = result.apikey;
        dataF["dbName"] = dbName;
        dataF["userType"] = userType;

        req.user = dataF;
        next();
      });
    });
  } else {
    return res.status(401).send({
      message: "Unauthorized please login again!",
      status: false,
      status_code: 403,
    });
  }
};
