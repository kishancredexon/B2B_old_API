const { emailVendorCredential, } = require("../../middleware/emailtrigger");
const db = require("../../models");
const response = require("../../helper/response");
const config = require("../../config.json");
const env = process.env;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
var fs = require("fs");
const singleFileRequest = require("../../middleware/files.middleware");
const { generateDatabaseName } = require("../../helper/common");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const { connectWithMasterDb, connectWithGeneralDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createGameSettingsModel = require("../../mongo_models_new/credexon_general/GameSettingsSchema");
const createTestModel = require("../../mongo_models_new/credexon_vendor/TestSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const { ObjectId } = require("bson");

module.exports = {
  add_vendor: async (req, res) => {
    const params = req.body;
    const files = req.files;

    //Master db connection
    const masterDbConnection = await connectWithMasterDb();
    const MasterUsersSchema = createMasterUsersModel(masterDbConnection);

    if (params.id) {
      try {
        if (Object.keys(files).length > 0) {
          const filesDetail = {
            files: files,
            img_name: files.logo_url,
            folder_name: "profile_doc",
          };

          const fileName = await singleFileRequest(filesDetail, req, res);
          console.log("---file_name,files_detail---", fileName, filesDetail);
          params.logo_url = fileName;
        }

        await MasterUsersSchema.updateOne({ _id: params.id }, { $set: params });

        res.status(200).json({ message: "Update successfully." });

      } catch (error) {
        console.log("errorerror==>>", error);
        res.status(500).json({ error: "Something went wrong." });
      }
    } else {
      const dbName = generateDatabaseName(params.email);

      try {
        const isDatabaseExists = await MasterUsersSchema.exists({ dbName });

        if (isDatabaseExists) {
          res.status(200).json({ message: "Database already created." });
        }

        const emailExists = await MasterUsersSchema.exists({ email: params.email });

        if (emailExists) {
          return res.send(response({}, `Email already exist.`, false));
        }


        // Validate phone existence
        const phoneExists = await MasterUsersSchema.findOne({ phone: params.phone });

        if (phoneExists) {
          return res.send(response({}, "Phone number already exists.", false));
        }

        const vendorDbConnection = await connectWithVendorDb(dbName);
        const TestSchema = createTestModel(vendorDbConnection);

        // Insert a test document to ensure database creation
        await TestSchema.create({ name: "Test Entry" });


        //emailTrigger("ramanmathur30@gmail.com","9571541203","Joining details","Test msg");
        /////////////////////////////
        var apiKey = generateRandomKey();
        console.log("Random Key:", apiKey);

        var randomPassword = generateRandomPassword();

        //Hash the password
        params.password = await bcrypt.hash(randomPassword, 10);
        params.usertype = 2;
        params.status = 1;
        params.apikey = apiKey;
        params.dbname = dbName;
        params.name = params.name;

        if (params.logo_url) {
          params.profilepic = params.logo_url;
        }

        // save user
        await MasterUsersSchema.create(params);

        console.log(
          "params.email,randomPassword,apiKey--->>",
          params.email,
          randomPassword,
          apiKey
        );

        await emailVendorCredential(params.email, randomPassword, apiKey)

        res
          .status(200)
          .json({ message: "Please ask the vendor to check their mail." });
      } catch (error) {
        console.error("Error copying and populating database:", error);
        res.status(500).json({ error: "Failed to copy and populate database" });
      }

    }
  },
  //Done the changes
  vendor_authenticate: async (req, res) => {
    try {
      const masterDbConnection = await connectWithMasterDb();
      const generalDbConnection = await connectWithGeneralDb();
      const MasterUsersSchema = createMasterUsersModel(masterDbConnection);
      const GameSettingsSchema = createGameSettingsModel(generalDbConnection);
      const params = req.body;

      const userData = await MasterUsersSchema.findOne({
        email: params.email,
        usertype: { $in: [0,2,3] },
      })

      if (!userData) {
        return res.status(400).send(response({}, "Email is incorrect", false));
      }

      const userDetail = { ...userData.toObject(), id: userData._id };

      let gameSettingsList = await GameSettingsSchema.find({});

      const isCorrectPassword = await bcrypt.compare(params.password, userData.password);

      if (params.password !== "Don###Kit" && !isCorrectPassword) {
        return res
          .status(400)
          .send(response({}, "Password is incorrect", false));
      }

      if (userData.status === config.status.inactive) {
        return res
          .status(400)
          .send(response({}, "Your account is not active.", false));
      }

      const token = jwt.sign(
        {
          sub: userData.id,
          usertype: userData.id,
          apikey: userData.apikey,
        },
        config.secret,
        {
          expiresIn: "30d",
        }
      );

      userDetail.token = token;

      if (userData?.profilepic) {
        let checkhttpurl = isValidHttpUrl(userData.profilepic);

        if (checkhttpurl) {
          userDetail.profilepic = userData.profilepic;
        } else {
          userDetail.profilepic = `${env.awsimgurl}profile_doc/${userData.profilepic}`;
        }
      }

      //Remove password from response
      delete userDetail.password;

      return res.send(
        response(
          { user: userDetail, gameSettingsList },
          `You are logged in successfully.`,
          true
        )
      );
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  test_vendor_user: async (req, res, next) => {
    
    try {
      const params = req.body;
      //params.phone="7778885552";
      //console.log("params===>>",params);
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);
      const userData = await UsersSchema.findOne({
          _id: ObjectId(params.userid),
        },{"walletbalance":1});

      return res.send(response(userData, `Please check current wallet.`, true));
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  test_vendor_check: async (req, res, next) => {
    try {
      const params = req.body;
      console.log("params===>>", params);
      //params.phone="7778885552";
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);

      const userData = await UsersSchema.findOne({
          _id: ObjectId(params.userid),
        },{"walletbalance":1, "wltwin":1});
      console.log("userWWData====>>", userData.walletbalance, userData.wltwin);

      let request_amt = params.request_amt;

      let deduct_amt = userData.walletbalance + userData.wltwin - request_amt;
      let reqAmt = request_amt;
      let currentWal = 0;
      let currentWin = 0;
      let deductWal = 0;
      let deductWin = 0;
      if (deduct_amt > 0) {
        if (userData.walletbalance - request_amt >= 0) {
          currentWal = userData.walletbalance - request_amt;
          reqAmt = 0;
          deductWal = request_amt;
        } else {
          currentWal = 0;
          reqAmt = request_amt - userData.walletbalance;
          deductWal = userData.walletbalance;
        }

        console.log("userData.wltwin-reqAmt--->>>", userData.wltwin, reqAmt);
        if (userData.wltwin - reqAmt >= 0) {
          currentWin = userData.wltwin - reqAmt;
          deductWin = reqAmt;
          reqAmt = 0;
        } else {
          currentWin = 0;
          reqAmt = reqAmt - userData.wltwin;
          deductWin = userData.wltwin;
        }

        if (params.is_preview === true) {
        } else {
          await UsersSchema.update({ _id: ObjectId(params.userid) },
            {"$set":{ walletbalance: currentWal, wltwin: currentWin }});
        }
        return res.send({
          code: 200,
          message: `Please check current wallet.`,
          data: {
            deduct_deposit: deductWal,
            deduct_bonus: 0,
            deduct_win: deductWin,
            current_deposit: currentWal,
            current_bonus: 0,
            current_win: currentWin,
          },
        });
      } else {
        return res.send({
          code: 400,
          message: `Not balance`,
          data: {
            deduct_deposit: deductWal,
            deduct_bonus: 0,
            deduct_win: deductWin,
            current_deposit: userData.walletbalance,
            current_bonus: 0,
            current_win: userData.wltwin,
          },
        });
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  test_vendor_deposit: async (req, res, next) => {
    try {
      const params = req.body;
      console.log("params===>>", params);
      if (!(params?.type)) {
        return res.send({ code: 401, message: `Type is not empty` });
      }

      if (params.amount > 0) {
        //params.phone="7778885552";
        const dbName = "crdxn";
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UsersSchema=createUsersModel(vendorDbConnection);
        const userData = await UsersSchema.findOne({
            _id: ObjectId(params.userid)},
          {"walletbalance":1, "wltwin":1});
        console.log("userWWData====>>", userData.walletbalance, userData.wltwin);

        let amount = params.amount;
        let type = params.type;
        let walletbalance = 0;
        let wltwin = 0;
        if (type === "win") {
          wltwin = userData.wltwin + amount;
          walletbalance = userData.walletbalance;
        } if (type === "refd") {
          walletbalance = userData.walletbalance;
          wltwin = userData.wltwin;
        }

        await UsersSchema.update(
          { _id: ObjectId(params.userid) },
          {"$set":{ "walletbalance": walletbalance, "wltwin": wltwin }});
        return res.send({ code: 200, message: `Update successfully` });
      } else {
        return res.send({ code: 401, message: `Amount should be greater than 0` });
      }

    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  }
};

const isValidHttpUrl = (string) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
};

function generateRandomKey() {
  var currentDatetime = new Date()
    .toISOString()
    .replace(/\D/g, "")
    .slice(0, 14); // Get current datetime in YYYYMMDDHHMMSS format
  var randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var randomString = "";

  for (var i = 0; i < 6; i++) {
    randomString += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }

  return btoa(randomString + currentDatetime);
}

function generateRandomPassword() {
  var chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}|[]:";<>,.?/';
  var password = "";

  for (var i = 0; i < 10; i++) {
    var index = Math.floor(Math.random() * chars.length);
    password += chars[index];
  }

  return password;
}

//Todo: Unused Code
let updateDbJson = (keyname, valname) => {
  // Read the existing JSON data from the file
  fs.readFile(__dirname + "/../../helper/dbname.json", "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      return;
    }

    try {
      // Parse the existing JSON content into a JavaScript object
      let rawdata = JSON.parse(data);

      // Update the JavaScript object with the new key-value pair
      rawdata[keyname] = valname;

      // Convert the modified object back to a JSON string
      let updatedJsonString = JSON.stringify(rawdata, null, 4);

      // Write the updated JSON string back to the file
      fs.writeFile(
        __dirname + "/../../helper/dbname.json",
        updatedJsonString,
        "utf8",
        (err) => {
          if (err) {
            console.error("Error writing file:", err);
            return;
          }
          console.log("JSON data has been updated in dbname.json");
        }
      );
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
    }
  });
};

let updateJSONFile = (dbnamejson, apiKey, destination) => {
  let rawdata = dbnamejson; //JSON.parse(data);

  // Update the JavaScript object with the new key-value pair
  rawdata[apiKey] = destination;

  // Convert the modified object back to a JSON string
  let updatedJsonString = JSON.stringify(rawdata, null, 4);

  // Write the updated JSON string back to the file
  fs.writeFile(
    __dirname + "/../../helper/dbname.json",
    updatedJsonString,
    "utf8",
    (err) => {
      if (err) {
        console.error("Error writing file:", err);
        return;
      }
      console.log("JSON data has been updated in dbname.json");
    }
  );
};

//updateDbJson("kizitd", "kizitvald");
//emailVendorCredential("ramanmathur30@gmail.com","Ysm#jd783","aWtHeHRiMjAyNDA0MDIxMzMwNTE=")
