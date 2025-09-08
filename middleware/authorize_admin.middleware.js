require("dotenv").config();

const jwt = require("jsonwebtoken");
const { secret } = require("../config.json");
const { connectWithMasterDb } = require("../config/mongodb_connections");
const createMasterUsersModel = require("../mongo_models_new/credexon_master/MasterUsersSchema");
const { ObjectId } = require("bson");

module.exports = async (req, res, next) => {
  var authHeader = req.headers.authorization;

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

      const masterDbConnection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(masterDbConnection);

      const data = await MasterUsersSchema.findOne({ _id: ObjectId(result.sub) }).lean();

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
      dataF["userId"] = result.usertype
      dataF["dbName"] = data.dbname;

      req.user = dataF;
      next();
    });
  } else {
    return res.status(401).send({
      message: "Unauthorized please login again!",
      status: false,
      status_code: 403,
    });
  }
};
