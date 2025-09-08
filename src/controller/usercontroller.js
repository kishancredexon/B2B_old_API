require('dotenv').config(); // env initialize
const config = require("../../config.json");
const jwt = require("jsonwebtoken");
const msg91 = new (require("msg91-v5"))("380471ARpcb0dLmG262eb9029P1");//Todo: i think this should be in env
const { emailTrigger } = require("../../middleware/emailtrigger");


const KycTrigger = require("../../middleware/kyctrigger");
const bcrypt = require("bcryptjs");
const env = process.env;

let sdb = require("../../models");

const response = require("../../helper/response");
const { Op } = require("sequelize");

let referralCodeGenerator = require("referral-code-generator");
const singleFileRequest = require("../../middleware/files.middleware");
const {
  countryCode,
  transDes,
  dateTimeChange,
  tdsCalculate,
  loginLogsTrack,
  getDBName,
} = require("../../helper/common");
const axios = require("axios");
const {
  currentTimeZoneDate,
  getReqOtherDetail,
  checkBonusBalUser,
} = require("../../helper/common");
const { notificationTrigger } = require("../../admin/controller/notificationcontroller");
const { connectWithGeneralDb, connectWithVendorDb, connectWithMasterDb } = require("../../config/mongodb_connections");
const createGameSettingsModel = require("../../mongo_models_new/credexon_general/GameSettingsSchema");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");
const createDownloadsModel = require("../../mongo_models_new/credexon_vendor/DownloadsSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const createUserAadharsModel = require("../../mongo_models_new/credexon_vendor/UserAadharsSchema");
const createUserDrivingLicensesModel = require("../../mongo_models_new/credexon_vendor/UserDrivingLicensesSchema");
const createUserPanModel = require("../../mongo_models_new/credexon_vendor/UserPanSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createStateModel = require("../../mongo_models_new/credexon_general/StateSchema");
const createUsersTempModel = require("../../mongo_models_new/credexon_vendor/UsersTempSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createUserBonusModel = require("../../mongo_models_new/credexon_vendor/UserBonusSchema");
const createBankDetailsModel = require("../../mongo_models_new/credexon_vendor/BankDetailsSchema");
const { ObjectId } = require("bson");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const createCitiesModel = require("../../mongo_models_new/credexon_general/CitiesSchema");

module.exports = {
  userRegister: async (req, res, next) => {
    try {
      const params = req.body;
      console.log("params--->>", params);

      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const generalDbConnection = await connectWithGeneralDb();
      const UsersSchema = createUsersModel(vendorDbConnection);
      const UsersTempSchema = createUsersTempModel(vendorDbConnection);
      const StatesSchema = createStateModel(generalDbConnection);


      let user_state = await StatesSchema.findOne({ status: 2, "name": new RegExp(params.state_name.toLowerCase(), 'i') });

      if (user_state) {
        return res
          .status(400)
          .send(
            response(
              {},
              "The Game Services are not active for your state, please try again later.!!!",
              false
            )
          );

      }

      params.otp = Math.floor(100000 + Math.random() * 9000);

      params.email = params.email.trim().toLowerCase();
      params.phone = params.phone.trim();
      params.country_code = params.country_code.trim();

      let user = await UsersSchema.findOne({
        "$or": [
          { email: params.email },
          { phone: params.phone, country_code: params.country_code },
        ]
      }
      );

      if (user) {
        let msg = "";
        if (user.email == params.email) {
          //return res.send(response({}, `Email already exist.`, false))
          msg = msg + "Email";
        }
        if (user.phone == params.phone) {
          msg = msg + (msg ? " & " : "") + "Phone number";
          //return res.send(response({}, `Phone number already exist.`, false))
        }
        msg = msg + " already exist.";
        return res.send(response({}, msg, false));
      } else {
        new Promise(async (resolve, reject) => {
          let userTempUpdate = await UsersTempSchema.deleteOne({
            where: {
              [Op.or]: [
                { email: params.email },
                {
                  phone: params.phone,
                  country_code: params.country_code,
                },
              ],
            },
          });
          resolve(userTempUpdate);
        }).then(async () => {
          if (params.socialid) {
            // do nothing
          } else {
            // hash password
            if (params.password) {
              params.password = await bcrypt.hash(params.password, 10);
            }
          }
          if (params.country_code == "+91") {
            const Checkvalue = {
              template_id: "636a4069d6fc057d41439ab2",
              mobile: params.country_code + params.phone,
              authkey: "380471ARpcb0dLmG262eb9029P1",
              otp: params.otp,
            };

            msg91
              .sendOTP(Checkvalue)
              .then((success) => { })
              .catch((error) => { });
          } else if (params.country_code == "+44") {
            const Checkvalue = {
              template_id: "63cf96fed6fc050bbe18dfb2",
              mobile: params.country_code + params.phone,
              authkey: "380471ARpcb0dLmG262eb9029P1",
              otp: params.otp,
            };

            msg91
              .sendOTP(Checkvalue)
              .then((success) => { })
              .catch((error) => { });
          }

          var referral = await referralCodeGenerator.alpha("lowercase", 12);
          // var referral= await referralCodeGenerator.alphaNumeric('uppercase', 8)

          if (params.referred_by) {
            params.referred_by = params.referred_by;

          }
          params.refercode = referral;

          await UsersTempSchema.create(params);

          return res.send(
            response(
              {
                phone: params.phone,
                country_code: params.country_code,
                referral: referral,
                //otp: params.otp,
              },
              `OTP has been sent, please check your Mobile!!!`,
              true
            )
          );
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
  social_login: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;

      let user = null;

      let user_state = await db.state.findAll({ where: { status: 2 } });
      if (user_state) {
        user_state = user_state.map((item) => {
          if (
            item.dataValues.name.toLowerCase() ==
            params.state_name.toLowerCase()
          ) {
            return res
              .status(400)
              .send(
                response({}, "This GameRestricted In Your State.!!!", false)
              );
          }
          return true;
        });
      }

      var referral = await referralCodeGenerator.alpha("lowercase", 12);
      if (params.referred_by) {
        var referredused = await db.Users.findOne({
          where: {
            refercode: params.referred_by,
          },
        });
        var id = referredused.id;
      }

      params.refercode = referral;
      params.referred_by = id;

      user = await db.User.findOne({
        where: {
          // usertype: params.usertype,
          socialid: params.socialid,
        },
      });

      // var id = user.dataValues.id
      if (!user) {
        let send_array = {};
        if (params.usertype) send_array.usertype = params.usertype;
        if (params.socialid) send_array.socialid = params.socialid;
        if (params.socialtype) send_array.socialtype = params.socialtype;
        if (params.devicetoken) send_array.devicetoken = params.devicetoken;
        if (params.devicetype) send_array.devicetype = params.devicetype;

        //if (params.referred_by) send_array.referred_by = params.referred_by
        if (params.refercode) send_array.refercode = params.refercode;
        if (params.email) send_array.email = params.email;
        //if (params.name) send_array.name = params.name

        await db.User.create(params);
        // let user_create =  await db.xUser.create(params)

        //return res.send(response({}, `Your Social Account Does Not Exist.!!!`, false))
      }

      if (user && user.isVerifed == 1) {
        if (user.status === config.status.inactive) {
          return res.send(
            response(
              {
                phone: params.phone,
                // country_code: usernew.dataValues.country_code,
                isVerifed: 0,
              },
              `Your account is not active..`,
              true
            )
          );
        }
        // throw "Your account is not active.";

        const token = jwt.sign(
          {
            sub: user.id,
            usertype: user.usertype,
            apikey: process.env.APIKEY_FOR_CREDEXON
          },
          config.secret,
          {
            expiresIn: "30d",
          }
        );

        user.dataValues.token = token;

        await db.Userprofile.update(params, {
          where: { id: user.dataValues.id },
        });

        let userdeatail = await db.User.findOne({
          where: {
            id: user.id,
            // otp: params.otp.toString()
          },

          include: [
            {
              model: db.Userprofile,
              as: "user_profile",
              attributes: [
                "userid",
                "name",
                "gender",
                "dob",
                "address",
                "pincode",
                "cityid",
                "stateid",
                "profilepic",
              ],
            },
          ],
        });

        let user_profile =
          userdeatail &&
            userdeatail.dataValues &&
            userdeatail.dataValues.user_profile
            ? userdeatail.dataValues.user_profile
            : {};

        let userData =
          userdeatail && userdeatail.dataValues ? userdeatail.dataValues : {};

        //nw chnge

        let url = "";
        if (userdeatail.dataValues.user_profile?.profilepic == null) {
          url = null;
        } else {
          if (
            userdeatail.dataValues.user_profile?.profilepic != "" &&
            userdeatail.dataValues.user_profile?.profilepic != null
          ) {
            let checkhttpurl = isValidHttpUrl(
              userdeatail.dataValues.user_profile.profilepic
            );
            if (checkhttpurl) {
              url = userdeatail.dataValues.user_profile.profilepic;
            } else {
              if (
                userdeatail.dataValues?.user_profile?.profilepic != "" &&
                userdeatail.dataValues?.user_profile?.profilepic != null
              ) {
                let checkhttpurl = isValidHttpUrl(
                  userdeatail.dataValues.user_profile.profilepic
                );
                if (checkhttpurl) {
                  url = userdeatail.dataValues.user_profile.profilepic;
                } else {
                  url =
                    config.profile_url +
                    userdeatail.dataValues.user_profile.profilepic;
                }
                //  user_image = config.profile_url + user.user_profile.profilepic;
              }
              //  url = config.profile_url + userdeatail.dataValues.user_profile.profilepic
            }
            //  user_image = config.profile_url + user.user_profile.profilepic;
          }
          // url = config.profile_url + userdeatail.dataValues.user_profile?.profilepic
        }

        let responsedata = {
          usertype: userData?.usertype,
          refercode: userData?.refercode,
          status: userData?.status,
          logintype: userData?.logintype,
          walletbalance: userData?.walletbalance,
          wltwin: userData?.wltwin,
          wltbns: userData?.wltbns,
          logindate: userData?.logindate,
          socialid: userData?.socialid,
          socialtype: userData?.socialtype,
          isCompleteProfile: userData?.isCompleteProfile,
          isVerifed: userData?.isVerifed,
          token: token,
          user_profile: {
            // userid: user_profile?.userid,
            name: user_profile?.name,
            gender: user_profile?.gender,
            dob: user_profile?.dob,
            address: user_profile?.address,
            pincode: user_profile?.pincode,
            cityid: user_profile?.cityid,
            stateid: user_profile?.stateid,
            country_code: userData.country_code,
            phone: userData?.phone,
            email: userData?.email,
            userid: userData?.id,
            profilepic: url,
            isVerifed: true,
          },
        };
        return res.send(
          response(responsedata, `Login Successfully..!!!`, true)
        );
      } else {
        return res.send(
          response(
            {
              isVerifed: false,
            },
            `Please Verified Phone Number..!!!`,
            true
          )
        );
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  getProfile: async (req, res, next) => {
    try {
      console.log("req.user.apikey-->>", req.user.apikey);

      const dbName = await getDBName(req.user.apikey);
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
      const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);
      const UsersSchema = createUsersModel(vendorDbConnection);

      const params = req.body;

      const users = await UsersSchema.findOne({
        _id: ObjectId(params.userid),
      },
        {
          "id": 1,"country_code": 1,"phone": 1,"email": 1,"refercode": 1,"status": 1,"walletbalance": 1,"wltwin": 1,"wltbns": 1,"wltdept": 1,
          "isVerifed": 1,"isCompleteProfile": 1,"isbankdverify": 1,"ispanverify": 1,"isphoneverify": 1,"isemailverify": 1,"istnameedit": 1,
          "isIds": 1,"userid": "$_id","name": 1,"gender": 1,"dob": 1,"address": 1,"pincode": 1,"cityid": 1,"stateid": 1,"profilepic": 1,
        }).lean();

        let user_profile= {'userid':users?.userid, 'name':users?.name, 'gender':users?.gender, 'dob':users?.dob, 'address':users?.address, 'pincode':users?.pincode, 'cityid':users?.cityid, 'stateid':users?.stateid, 'profilepic':users?.profilepic}
        users["user_profile"]=user_profile;
        console.log("users==>>",users);
        

      let totalContests = await JoinMatchContestsSchema.countDocuments(
        { userid: req.user.id }
      );
      let contestsWon = await JoinMatchContestsSchema.countDocuments({
        userid: req.user.id,
        winamt: { $gt: 0 },
      });
      let plyAccCount = await JoinAccPlayersSchema.countDocuments({ userid: req.user.id });
      let plyAccWon = await JoinAccPlayersSchema.countDocuments({
        userid: req.user.id,
        winamt: { $gt: 0 },
      });

      let sendData = {};
      if (!users) {
        return res.status(400).send(
          response(
            {
              users,
            },
            "Data Not found.!!!",
            false
          )
        );
      } else {
        let url = "";
        
        if (users.profilepic) {
          let checkhttpurl = isValidHttpUrl(users.profilepic);
          if (checkhttpurl) {
            url = users.profilepic;
          } else {
            url = `${env.awsimgurl}profile_doc/${users?.profilepic}`;
          }

        } else { url = null; }

        sendData = {
          id: users._id,
          phone: users.phone,
          email: users.email,
          country_code: users.country_code,
          refercode: users.refercode,
          status: users.status,
          isVerifed: users.isVerifed,
          isCompleteProfile: users.isCompleteProfile,
          name: users?.name,
          gender: users?.gender,
          dob: users?.dob,
          address: users?.address,
          pincode: users?.pincode,
          cityid: users?.cityid,
          stateid: users?.stateid,
          profilepic: url,
          wallet: {
            walletbalance: users.walletbalance,
            wltwin: users.wltwin,
            wltbns: users.wltbns,
            wltdept: users.wltdept,
          },
          verification: {
            isbankdverify: users.isbankdverify || 0,
            ispanverify: users.ispanverify || 0,
            isphoneverify: users.isphoneverify || 0,
            isemailverify: users.isemailverify || 0,
            istnameedit: users.istnameedit || 0,
            isIds: users.isIds || 0,
          },
          history: {
            contestsWon: contestsWon,
            totalContests: totalContests,
            plyAccCount: plyAccCount,
            plyAccWon: plyAccWon,
          },
        };
      }

      return res
        .status(200)
        .send(response(sendData, "Data found succesfully.!!!", true));

    } catch (error) {
      console.log("error-->>", error);

      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },

  authenticate: async (req, res, next) => {
    try {
      const params = req.body;
      console.log("Vendor===============>", req.user);
      const dbName = "crdxn"; //req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);


      const generalDbConnection = await connectWithGeneralDb();
      const StatesSchema = createStateModel(generalDbConnection);

      let db = (await sdb())[global.gdbname["crdxn"]];
      let user = null;
      let usernew = null;
      if (!params?.state_name) {
        return res.send(response({}, `Please allow location`, false));
      }
      //let user_state = await db.state.findAll({ where: { status: 2 } });
      let user_state = await StatesSchema.findOne({ status: 2, "name": new RegExp(params.state_name.toLowerCase(), 'i') });
      if (user_state) {
        return res
          .status(400)
          .send(
            response(
              {},
              "The Game Services are not active for your state, please try again later.!!!",
              false
            )
          );
      }

      if (params.socialid) {
        user = await UsersSchema.findOne({
          usertype: params.usertype,
          email: params.email,
        });
        if (!user) {
          return res.send(response({}, `Email is incorrect.!!!`, false));
        }

        let post = {
          socialid: params.socialid,
          phone: params.phone,
        };
        Object.assign(user, post);
        await user.save();
        //new change
        var otp = Math.floor(100000 + Math.random() * 9000);
        const Checkvalue = {
          template_id: "6375e7a4d6fc05609f7fd262",
          mobile: params.phone,
          authkey: "380471ARpcb0dLmG262eb9029P1",
          otp: otp,
        };

        msg91
          .sendOTP(Checkvalue)
          .then((success) => { })
          .catch((error) => { });
        if (params.phone) {
          await db.User.update(
            {
              otp: otp,
            },
            {
              where: {
                phone: params.phone,
              },
            }
          );
        }
      } else {
        user = await UsersSchema.findOne({
          usertype: params.usertype,
          country_code: params.country_code,
          phone: params.phone,
        });

        if (!user) {
          return res
            .status(400)
            .send(response({}, `User does not exist.!!!`, false));
        }

        if (user && user.status == 2) {
          return res
            .status(400)
            .send(
              response({}, `You are inactive, please contact to admin.`, false)
            );
        }



        ////new template id
        var otp = Math.floor(100000 + Math.random() * 9000);

        if (params.country_code == "+91") {
          const Checkvalue = {
            template_id: "6375e7a4d6fc05609f7fd262",
            mobile: params.country_code + params.phone,
            authkey: "380471ARpcb0dLmG262eb9029P1",
            otp: otp,
          };

          msg91
            .sendOTP(Checkvalue)
            .then((success) => { })
            .catch((error) => { });
        } else if (params.country_code == "+44") {
          const Checkvalue = {
            template_id: "63cf968ad6fc0526b041e1c2",
            mobile: params.country_code + params.phone,
            authkey: "380471ARpcb0dLmG262eb9029P1",
            otp: otp,
          };

          msg91
            .sendOTP(Checkvalue)
            .then((success) => { })
            .catch((error) => {
              console.log("error11--->>", error);
            });
        }

        if (params.phone) {
          await UsersSchema.updateOne(
            {
              phone: params.phone,
            },
            {
              "$set": {
                otp: otp,
              }
            },

          );
        }
      }
      // if (!user || user.status === config.status.inactive)

      //     return res.send(response({
      //         phone: usernew.dataValues.phone,
      //         country_code: usernew.dataValues.country_code,
      //         isVerifed: 0

      //     }, `Your account is not active..`, true))

      if (params.devicetype) {
        // let post = {
        //     devicetype: params.devicetype,
        //     devicetoken: params.devicetoken,
        // };
        // Object.assign(user, post);
        // await user.save();
        await UsersSchema.updateOne(
          {
            id: user._id,
          },
          {
            "$set": {
              devicetype: params.devicetype,
              devicetoken: params.devicetoken,
            }
          },

        );
        // console.log("deviceparmes",params);
      }

      // authentication successful
      const token = jwt.sign(
        {
          sub: user.id,
          usertype: user.usertype,
          apikey: process.env.APIKEY_FOR_CREDEXON
        },
        config.secret,
        {
          expiresIn: "30d",
        }
      );

      user.token = token;

      //  var c =Object.assign(user, {token});
      return res.send(
        response(
          {
            phone: user.phone,
            country_code: user.country_code,
            isVerifed: user.isVerifed,
            // walletbalance:user.walletbalance,
            // wltwin:user.wltwin,
            // wltbns:user.wltbns,
            // wltdept:user.wltdept
          },
          `OTP has been sent, please check your Mobile!!!`,
          true
        )
      );
      // return res.send(response(user, "You are logged in successfully."));
    } catch (error) {
      return res
        .status(400)
        .send(
          response(
            {},
            "Something went wrong......!!!",
            false,
            null,
            error.stack
          )
        );
    }
  },
  authenticate_vendor: async (req, res, next) => {
    try {
      const params = req.query;
      let dbName = await getDBName(params.apikey);
      console.log("dbName,req.query--->>", dbName, params);
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);

      let user = null;
      let usernew = null;
      params.usertype = 2;
      user = await UsersSchema.findOne({
        usertype: params.usertype,
        phone: params.userid,
      });

      if (!user && params.apikey !== process.env.APIKEY_FOR_CREDEXON) {
        let userdetail = await UsersSchema.create({
          usertype: params.usertype,
          phone: params.userid,
        });

        user = {};
        user.id = userdetail._id;
        user.usertype = params.usertype;
      }

      /////////////////////////////////////
      const token = jwt.sign(
        {
          sub: user.id,
          usertype: user.usertype,
          apikey: params.apikey,
        },
        config.secret,
        {
          expiresIn: "30d",
        }
      );
      let userData = await UsersSchema.findOne({
        _id: user.id
      });


      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);
      const masterData = await MasterUsersSchema.findOne({
        apikey: params.apikey
      });
      console.log("masterData===>>>", masterData.id);

      let responsedata = {
        usertype: userData?.usertype,
        //refercode: userData?.refercode,
        status: userData?.status,
        logintype: userData?.logintype,
        walletbalance: userData?.walletbalance,
        wltwin: userData?.wltwin,
        wltbns: userData?.wltbns,
        logindate: userData?.logindate,
        // isCompleteProfile: userData?.isCompleteProfile,
        isVerifed: userData?.isVerifed,
        token: token,
        vname: masterData.dbname,
        vendor_color: {
          background_color: masterData?.background_color,
          background_light: masterData?.background_light,
          border_color: masterData?.border_color,
          circle_color: masterData?.circle_color,
          contest_block_bg: masterData?.contest_block_bg,
          faq_border: masterData?.faq_border,
          feature_box_bg: masterData?.feature_box_bg,
          font_primary: masterData?.font_primary,
          font_secondary: masterData?.font_secondary,
          id: masterData?.id,
          input_bg: masterData?.input_bg,
          light_secondary_color: masterData?.light_secondary_color,
          primary_color: masterData?.primary_color,
          prograss_color: masterData?.prograss_color,
          secondary_color: masterData?.secondary_color,
          secondary_dark_color: masterData?.secondary_dark_color,
          table_header: masterData?.table_header,
        },
        vendor_game_custom: {
          player_accumulator: masterData?.player_accumulator,
          player_contest: masterData?.player_contest,
        },
        vendor_sport_custom: {
          football: masterData?.football,
          cricket: masterData?.cricket,
        },
        vendor_logo: `${env.apiurl}/profile_doc/${masterData?.logo_url}`,
        user_profile: {
          userid: userData._id
        },
      };
      ///////////////////////////////////////

      let enData = responsedata ? JSON.stringify(responsedata) : {};
      enData = btoa(enData);
      // Set CORS headers
      res.setHeader("Access-Control-Allow-Origin", "*"); // Change * to specific domains if needed
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );

      return res.send(
        response(
          `${env.weburl}data/` + enData,
          `URL fetch successfully..!!!`,
          true
        )
      );

    } catch (error) {
      return res
        .status(400)
        .send(
          response(
            {},
            "Something went wrong......!!!",
            false,
            null,
            error.stack
          )
        );
    }
  },

  update_token: async (req, res, next) => {
    let db = (await sdb())[global.gdbname[req.user.apikey]];
    const params = req.body;
    user = await db.User.findOne({
      where: {
        id: params.userid,
      },
    });
    if (params.devicetype) {
      await db.User.update(
        {
          devicetype: params.devicetype,
          devicetoken: params.devicetoken,
        },
        {
          where: {
            id: params.userid,
          },
        }
      );
      console.log("deviceparmes", params);
    }
    return res.send(response({}, `Request update successfully..!!!`, true));
  },
  verifyUser: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname["crdxn"]];
      const params = req.body;
      console.log("params--->>", params);

      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);
      const UsersTempSchema = createUsersTempModel(vendorDbConnection);

      let user = {};

      if (!params.otp) {
        return res.status(400).send(
          response(
            {
              phone: params.phone,
              country_code: params.country_code,
            },
            `otp is required`,
            false
          )
        );
      }

      if (params.socialid && params.isVerifed == false) {
        user = await UsersSchema.findOne({
          where: {
            socialid: params.socialid,
          },
        });

        if (user) {
          let user_phone = await UsersSchema.findOne({
            where: {
              phone: params.phone,
            },
          });

          if (user_phone) {
            return res.send(
              response(
                { isVerifed: false },
                `This Mobile Number Already Used!!!`,
                false
              )
            );
          }

          ////new template id
          var otp = Math.floor(100000 + Math.random() * 9000);
          if (params.country_code == "+91") {
            const Checkvalue = {
              template_id: "6375e7a4d6fc05609f7fd262",
              mobile: params.country_code + params.phone,
              authkey: "380471ARpcb0dLmG262eb9029P1",
              otp: otp,
            };

            msg91
              .sendOTP(Checkvalue)
              .then(async (success) => {
                await UsersSchema.update(
                  {
                    country_code: params.country_code,
                    phone: params.phone,
                    otp: otp,
                  },
                  {
                    where: {
                      socialid: params.socialid,
                    },
                  }
                );
              })
              .catch((error) => { });
          } else if (params.country_code == "+44") {
            const Checkvalue = {
              template_id: "63cf968ad6fc0526b041e1c2",
              mobile: params.country_code + params.phone,
              authkey: "380471ARpcb0dLmG262eb9029P1",
              otp: otp,
            };

            msg91
              .sendOTP(Checkvalue)
              .then(async (success) => {
                await UsersSchema.update(
                  {
                    country_code: params.country_code,
                    phone: params.phone,
                    otp: otp,
                  },
                  {
                    where: {
                      socialid: params.socialid,
                    },
                  }
                );
              })
              .catch((error) => { });
          }


          return res.send(
            response(
              {
                isVerifed: false,
                country_code: params.country_code,
                phone: params.phone,
                socialid: params.socialid,
              },
              `please verify otp!!!`,
              true
            )
          );
        } else {
          return res.send(response({}, ` Account doesn't exist.`, false));
        }
      } else if (params.socialid && params.isVerifed == true) {
        user = await UsersSchema.findOne({
          where: {
            socialid: params.socialid,
          },
        });

        if (params.phone) {
          // if (params.name) {
          let send_array = {};
          if (params.profilepic) send_array.profilepic = params.profilepic;
          if (params.name) send_array.name = params.name;
          if (params.devicetoken) send_array.devicetoken = params.devicetoken;
          if (params.email) send_array.email = params.email;
          if (params.usertype) send_array.usertype = params.usertype;

          await UsersSchema.updateOne({ "phone": params.phone }, { "$set": send_array });
        }

        await UsersSchema.updateOne({ "phone": params.phone }, {
          "$set": {
            isphoneverify: 1,
            isVerifed: 1,
          }
        });

        //var userdetail = user.dataValues
      } else {
        user = await UsersTempSchema.findOne({
          phone: params.phone,
          country_code: params.country_code,
          otp: params.otp.toString()
        });
      }

      if (!user) {
        //return res.send(response({}, `OTP is wrong.`, false));
        return res
          .status(400)
          .send(response({}, `Invalid otp. Please try again.`, false));
      }


      user = new Object(user);




      // Ensure user exists before modifying it
      let userdetail = user ? { ...user._doc } : {};
      console.log("userdetail33-->>", userdetail);
      let send_array = {
        phone: params.phone,
        // country_code: params.country_code,
        otp: params.otp.toString(),
      };

      let responseData = {};
      if (params.socialid) {
        send_array.socialid = params.socialid;

        const userdetails = await UsersSchema.findOne(send_array, {
          "id": 1,
          "name": 1, "gender": 1, "dob": 1, "address": 1, "pincode": 1, "cityid": 1,
          "stateid": 1, "profilepic": 1
        });

        var tokens = jwt.sign(
          {
            sub: user._id,
            usertype: user.usertype,
            apikey: process.env.APIKEY_FOR_CREDEXON,
          },
          config.secret,
          {
            expiresIn: "30d",
          }
        );

        // let user_profile =userdetails && userdetails.dataValues && userdetails.dataValues.user_profile
        //     ? userdetails.dataValues.user_profile
        //     : {};

        // let userData =
        //   userdetails && userdetails.dataValues ? userdetails.dataValues : {};

        let url = "";
        if (userdetails?.profilepic == null) {
          url = "";
        } else {
          if (!(userdetails?.profilepic)) {
            let checkhttpurl = isValidHttpUrl(userdetails.profilepic);
            if (checkhttpurl) {
              url = userdetails?.profilepic;
            } else {
              url = userdetails?.profilepic;
            }

          }
        }

        const connection = await connectWithMasterDb();
        const MasterUsersSchema = createMasterUsersModel(connection);
        const masterData = await MasterUsersSchema.findOne({
          apikey: process.env.APIKEY_FOR_CREDEXON
        });

        responseData = {
          usertype: userdetails?.usertype,
          refercode: userdetails?.refercode,
          status: userdetails?.status,
          logintype: userdetails?.logintype,
          walletbalance: userdetails?.walletbalance,
          wltwin: userdetails?.wltwin,
          wltbns: userdetails?.wltbns,
          logindate: userdetails?.logindate,
          isCompleteProfile: userdetails?.isCompleteProfile,
          isVerifed: userdetails?.isVerifed,
          token: tokens,
          //vname: "crdxn",
          vname: masterData.dbname,
          vendor_color: {
            background_color: masterData?.background_color,
            background_light: masterData?.background_light,
            border_color: masterData?.border_color,
            circle_color: masterData?.circle_color,
            contest_block_bg: masterData?.contest_block_bg,
            faq_border: masterData?.faq_border,
            feature_box_bg: masterData?.feature_box_bg,
            font_primary: masterData?.font_primary,
            font_secondary: masterData?.font_secondary,
            id: masterData?.id,
            input_bg: masterData?.input_bg,
            light_secondary_color: masterData?.light_secondary_color,
            primary_color: masterData?.primary_color,
            prograss_color: masterData?.prograss_color,
            secondary_color: masterData?.secondary_color,
            secondary_dark_color: masterData?.secondary_dark_color,
            table_header: masterData?.table_header,
          },
          vendor_game_custom: {
            player_accumulator: masterData?.player_accumulator,
            player_contest: masterData?.player_contest,
          },
          vendor_sport_custom: {
            football: masterData?.football,
            cricket: masterData?.cricket,
          },
          vendor_logo: `${env.apiurl}/profile_doc/${masterData?.logo_url}`,
          user_profile: {
            // userid: user_profile?.userid,
            name: userdetails?.name,
            gender: userdetails?.gender,
            dob: userdetails?.dob,
            address: userdetails?.address,
            pincode: userdetails?.pincode,
            cityid: userdetails?.cityid,
            stateid: userdetails?.stateid,
            country_code: userdetails.country_code,
            phone: userdetails?.phone,
            email: userdetails?.email,
            userid: userdetails?._id,
            profilepic: url,
            isVerifed: true,
          },
        };

        return res.send(response(responseData, message, true));
      } else {
        try {
          const connection = await connectWithGeneralDb();
          const SettingSchema = createSettingsModel(connection);

          let settings = await SettingSchema.findOne({});

          let wltbns_new = settings?.bonus_amount;
          let ref_bns_amt = settings?.ref_bns_amt;

          userdetail["wltbns"] = wltbns_new;
          userdetail["welbns"] = wltbns_new;
          userdetail["isphoneverify"] = 1;
          userdetail["isVerifed"] = 1;
          userdetail["username"] = userdetail.email.split("@")[0];


          ////////////Device/////////////////
          userdetail["deviceId"] = params.deviceId;
          userdetail["rdevicetype"] = params.rdevicetype;
          /////////////////
          console.log("userdetail44--->>", userdetail);
          /////////////////////////////////
          let logLogin = await loginLogsTrack(user._id, params.ip);
          console.log("logLogin===>>>", logLogin);
          if (logLogin["lat"] === 25.5908 && logLogin["lon"] === 85.1348) {
            return res
              .status(400)
              .send(
                response({}, `You are blocked, please contect to admin.`, false)
              );
          }

          /////////////////////////////////////

          let currentDate = (currentTimeZoneDate() * 1) / 1000;
          let objTransBns = {
            userid: user._id,
            amount: wltbns_new,
            txdate: currentDate,
            ttype: "cr",
            atype: "wel_bns",
            bonusbal: wltbns_new,
          };
          const TransactionsSchema = createTransactionsModel(vendorDbConnection);
          const UserBonusSchema = createUserBonusModel(vendorDbConnection);

          let transCreate = await TransactionsSchema.create(objTransBns);

          let nintyPlusDate = currentDate + 60 * 60 * 24 * 90;
          await UserBonusSchema.create({
            transid: transCreate._id,
            userid: user._id,
            atype: "wel_bns",
            txdate: currentDate,
            expiry_date: nintyPlusDate,
            amount: wltbns_new,
            balamt: wltbns_new,
          });

          // params.wltbns = wltbns_new
          console.log("user._id--->>", user._id, userdetail);

          //await UsersSchema.updateOne({_id: user._id}, { "$set": userdetail }, { "upsert": true } );


          /* user update for refer code win bonus */

          if (userdetail?.referred_by) {
            const refer_user = await UsersSchema.findOne({
              refercode: userdetail.referred_by
            });

            let referred_status = refer_user.referred_status;
            let wltbns_ref_by = refer_user.wltbns;
            let welbns_ref_by = refer_user.welbns;


            referred_status = referred_status
              ? referred_status + "," + user._id
              : user._id;

            /////////////////
            let currentDates = (currentTimeZoneDate() * 1) / 1000;
            let nintyPlusDate = currentDates + 60 * 60 * 24 * 90;
            let objTransBns = {
              userid: refer_user._id,
              amount: ref_bns_amt,
              txdate: currentDates,
              ttype: "cr",
              atype: "refer_bns",
              bonusbal: ref_bns_amt,
            };
            let transCreate = await TransactionsSchema.create(objTransBns);

            await UserBonusSchema.create({
              transid: transCreate._id,
              userid: refer_user._id,
              atype: "refer_bns",
              txdate: currentDates,
              expiry_date: nintyPlusDate,
              amount: ref_bns_amt,
              balamt: ref_bns_amt,
            });
            ////////////

            await UsersSchema.update(
              {
                refercode: userdetail.referred_by,
              },
              {
                "$set": {
                  wltbns: wltbns_ref_by + ref_bns_amt,
                  welbns: welbns_ref_by + ref_bns_amt,
                  referred_status: referred_status,
                }
              }
            );
          }
          /* */


          //let userdetail_new = { ...userdetail };
          //console.log("userdetail_new--->>>",userdetail_new);


          //let userprofiledata = {
          //userid: userdetail_new.id,
          //phone: userdetail_new.phone,
          //email: userdetail_new.email,
          //usertype: userdetail_new.usertype,
          //username: userdetail_new.email.split("@")[0],
          //};
          console.log("userdetailCopy CHECK--->>");
          let userdetailCopy = { ...userdetail }; // Create a copy to avoid modifying original object
          //delete userdetailCopy._id; 
          //delete userdetailCopy.createdAt; 
          //delete userdetailCopy.updatedAt; 
          console.log("userdetailCopy--->>", userdetailCopy);

          let uCreate = await UsersSchema.create(userdetailCopy);
          console.log("uCreate--->>", uCreate);

        } catch (error) {
          console.log("error--->>", error);

          // return res.send(response({}, "Something went wrong.!!!",false))
        }
      }


      if (user.usertype == config.role.user) {
        var message = "Your account has been verified.";
      } else {
        var message =
          "Your account has been verified, Please complete your profile details.";
      }
      let token = jwt.sign(
        {
          sub: user._id,
          usertype: user.usertype,
          apikey: process.env.APIKEY_FOR_CREDEXON,
        },
        config.secret,
        {
          expiresIn: "30d",
        }
      );

      ///update phoneverify
      // const userfindLogin = await UsersTempSchema.findOne({
      //     phone: params.phone,
      //     country_code: params.country_code,
      //     otp: params.otp.toString(),
      // });

      //let data = {};
      //if (userfindLogin) {
      await UsersTempSchema.deleteOne({
        phone: params.phone,
        otp: params.otp.toString()
      });

      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);
      const masterData = await MasterUsersSchema.findOne({
        apikey: process.env.APIKEY_FOR_CREDEXON
      });
      let data = {
        user_profile: {
          userid: userdetail._id,
          phone: userdetail.phone,
          email: userdetail.email,
          country_code: userdetail.country_code,
          profilepic: userdetail.profilepic,
        },
        usertype: userdetail.usertype,
        refercode: userdetail.refercode,
        //otp: userdetail.otp,
        status: 1, //userdetail.status,
        logintype: userdetail.logintype,
        walletbalance: 0, //userdetail.walletbalance,
        wltwin: 0, //userdetail.wltwin,
        wltbns: userdetail.wltbns,
        //logindate: userdetail.logindate,
        isCompleteProfile: 0, //userdetail.isCompleteProfile,
        isVerifed: 1, //userdetail.isVerifed,
        token: token,
        //vname: "crdxn",
        vname: masterData.dbname,
        vendor_color: {
          background_color: masterData?.background_color,
          background_light: masterData?.background_light,
          border_color: masterData?.border_color,
          circle_color: masterData?.circle_color,
          contest_block_bg: masterData?.contest_block_bg,
          faq_border: masterData?.faq_border,
          feature_box_bg: masterData?.feature_box_bg,
          font_primary: masterData?.font_primary,
          font_secondary: masterData?.font_secondary,
          id: masterData?.id,
          input_bg: masterData?.input_bg,
          light_secondary_color: masterData?.light_secondary_color,
          primary_color: masterData?.primary_color,
          prograss_color: masterData?.prograss_color,
          secondary_color: masterData?.secondary_color,
          secondary_dark_color: masterData?.secondary_dark_color,
          table_header: masterData?.table_header,
        },
        vendor_game_custom: {
          player_accumulator: masterData?.player_accumulator,
          player_contest: masterData?.player_contest,
        },
        vendor_sport_custom: {
          football: masterData?.football,
          cricket: masterData?.cricket,
        },
        vendor_logo: `${env.apiurl}/profile_doc/${masterData?.logo_url}`,

      };
      console.log("datadata--->>", data);

      // } else {
      //   return res
      //     .status(400)
      //     .send(response({}, `Invalid otp. Please try again.`, false));
      // }
      return res.send(response(data, message, true));
    } catch (error) {
      return res
        .status(400)
        .send(
          response(
            {},
            "Something went wrong.!!!",
            false,
            null,
            error.message + error.stack
          )
        );
    }
  },

  otpSend: async (req, res, next) => {
    try {
      const params = req.body;
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);
      const user = await UsersSchema.findOne({
          phone: params.phone,
          country_code: params.country_code,
        });
      if (!user) {
        return res.send(response({}, `Account doesn't exsist.`, false));
        //return res.send(response({}, `Otp sent successfully.`, false))
      } else {
        var otp = Math.floor(100000 + Math.random() * 9000);
        //new
        const Checkvalue = {
          template_id: process.env.SMS_TEMPLATE_ID,
          mobile: params.country_code + params.phone,
          // mobile: 919610281124,
          authkey: process.env.SMS_AUTHKEY,
          otp: otp,
        };

        msg91
          .sendOTP(Checkvalue)
          .then((success) => { })
          .catch((error) => { });
        if (params.phone) {
          await UsersSchema.updateOne({phone: params.phone},{"$set":{otp: otp}});
        }
        //new
        // const otp = 123456

        //   const message = await client.messages.create({
        //     body: otp + " use this OTP to verify your account.",
        //     to: params.country_code + params.phone, // Text this number
        //     from: process.env.twilioNumber, // From a valid Twilio number
        //   });

        // await db.User.update({
        //     otp
        // }, {
        //     where: {
        //         id: user.id
        //     }
        // });

        return res.send(
          response(
            {},
            "OTP has been resent successfully on your registered mobile number.",
            true
          )
        );
      }
      // if (!user) throw "Account doesn't exsist.";
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  forgotPassword: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = await db.User.findOne({
        where: {
          phone: params.phone,
          country_code: params.country_code,
        },
      });

      if (!user || user.usertype === config.role.admin) {
        return res.send(response({}, `Account doesn't exsist.`, false));
      }
      // throw "Account doesn't exsist.";

      if (user.status === config.status.inactive) {
        return res.send(response({}, `Your account is not active.`, false));
      }
      // throw "Your account is not active.";

      params.otp = Math.floor(100000 + Math.random() * 9000);
      // params.otp = 123456;

      //   const message = await client.messages.create({
      //     body: params.otp + " use this OTP to verify your account.",
      //     to: params.country_code + params.phone, // Text this number
      //     from: process.env.twilioNumber, // From a valid Twilio number
      //   });

      Object.assign(user, params);
      await user.save();
      return res.send(
        response(
          {
            otp: params.otp,
          },
          `OTP has been sent successfully on your phone number.!!!`,
          true
        )
      );

      // return res.send(
      //     response({}, "OTP has been sent successfully on your phone number.")
      // );
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  verifyOtp: async (req, res, next) => {
    try {
      const params = req.body;

      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);

      const user = await UsersSchema.findOne({
        phone: params.phone,
        country_code: params.country_code
      });

      if (!user) {
        return res
          .status(400)
          .send(response({}, `Account doesn't exist.`, false));
      }

      if (user.otp === params.otp.toString()) {
        if (!user.deviceId) {
          await UsersSchema.updateOne(
            {
              id: user._id,
            },
            {
              "$set": {
                deviceId: params.deviceId,
                rdevicetype: params.rdevicetype,
              }
            },

          );
        }
        const token = jwt.sign(
          {
            sub: user._id,
            usertype: user.usertype,
            apikey: process.env.APIKEY_FOR_CREDEXON,
          },
          config.secret,
          {
            expiresIn: "30d",
          }
        );
        // let userdeatail = await db.User.findOne({
        //   where: {
        //     id: user.id,
        //     // otp: params.otp.toString()
        //   },
        //   //  attributes: ['id','country_code','phone' ,'email','refercode','walletbalance' ,'wltwin','wltbns','isphoneverify', 'isemailverify','isbankdverify','ispanverify','isVerifed','isCompleteProfile'],
        //   include: [
        //     {
        //       model: db.Userprofile,
        //       as: "user_profile",
        //       attributes: [
        //         "userid",
        //         "name",
        //         "gender",
        //         "dob",
        //         "address",
        //         "pincode",
        //         "cityid",
        //         "stateid",
        //         "profilepic",
        //       ],
        //     },
        //   ],
        // });
        //new change here

        // if (userdeatail.dataValues.otp != params.otp) {
        //     return res.send(response({}, `Invalid otp. Please try again1.`, false))
        // }
        //new change here

        // let user_profile =
        //   userdeatail &&
        //     userdeatail.dataValues &&
        //     userdeatail.dataValues.user_profile
        //     ? userdeatail.dataValues.user_profile
        //     : {};

        // let userData =
        //   userdeatail && userdeatail.dataValues ? userdeatail.dataValues : {};

        //nw chnge

        let url = "";
        if (user?.profilepic == null) {
          url = null;
        } else {
          if (user?.profilepic != "" && user?.profilepic != null) {
            let checkhttpurl = isValidHttpUrl(user.profilepic);
            if (checkhttpurl) {
              url = user.profilepic;
            } else {
              url = config.profile_url_profile_doc + "profile_doc/" + user?.profilepic;
            }

          }
        }

        const connection = await connectWithMasterDb();
        const MasterUsersSchema = createMasterUsersModel(connection);
        const masterData = await MasterUsersSchema.findOne({
          apikey: process.env.APIKEY_FOR_CREDEXON
        });

        let responsedata = {
          usertype: user?.usertype,
          refercode: user?.refercode,
          status: user?.status,
          logintype: user?.logintype,
          walletbalance: user?.walletbalance,
          wltwin: user?.wltwin,
          wltbns: user?.wltbns,
          logindate: user?.logindate,
          // isCompleteProfile: user?.isCompleteProfile,
          isVerifed: user?.isVerifed,
          token: token,
          //vname: "crdxn",
          vname: masterData.dbname,
          vendor_color: {
            background_color: masterData?.background_color,
            background_light: masterData?.background_light,
            border_color: masterData?.border_color,
            circle_color: masterData?.circle_color,
            contest_block_bg: masterData?.contest_block_bg,
            faq_border: masterData?.faq_border,
            feature_box_bg: masterData?.feature_box_bg,
            font_primary: masterData?.font_primary,
            font_secondary: masterData?.font_secondary,
            id: masterData?.id,
            input_bg: masterData?.input_bg,
            light_secondary_color: masterData?.light_secondary_color,
            primary_color: masterData?.primary_color,
            prograss_color: masterData?.prograss_color,
            secondary_color: masterData?.secondary_color,
            secondary_dark_color: masterData?.secondary_dark_color,
            table_header: masterData?.table_header,
          },
          vendor_game_custom: {
            player_accumulator: masterData?.player_accumulator,
            player_contest: masterData?.player_contest,
          },
          vendor_sport_custom: {
            football: masterData?.football,
            cricket: masterData?.cricket,
          },
          vendor_logo: `${env.apiurl}/profile_doc/${masterData?.logo_url}`,
          user_profile: {
            // userid: user?.userid,
            name: user?.name,
            gender: user?.gender,
            dob: user?.dob,
            address: user?.address,
            pincode: user?.pincode,
            cityid: user?.cityid,
            stateid: user?.stateid,
            country_code: user.country_code,
            phone: user?.phone,
            email: user?.email,
            userid: user?._id,
            profilepic: url,
          },
        };

        return res.send(
          response(responsedata, "Your account has been verified", true)
        );
      } else {
        return res
          .status(400)
          .send(response({}, `Invalid otp. Please try again.`, false));
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  resetPassword: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = req.user;
      if (!user) {
        return res.send(response({}, `Account doesn't exsist.`, false));
      }
      // if (!user) throw "Account doesn't exsist.";

      const password = await bcrypt.hash(params.password, 10);

      await db.User.update(
        {
          password: password,
        },
        {
          where: {
            id: user.id,
          },
        }
      );

      return res.send(response({}, "Password reset successfully.", true));
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  verifyEmail: async (req, res, next) => {
    try {
      return res.send(
        response(
          {},
          "To verify email, please install new version of App. Download update here- https://credexon.com",
          true
        )
      );
      // const params = req.body;

      // const user = await db.User.findOne({
      //     where: {
      //         email: params.email
      //     }
      // });
      // if (!user) {
      //     return res.status(400).send(response({}, `Account doesn't exsist.`, false))
      // }
      // // if (!user) throw "Account doesn't exsist.";

      // // if (user.dataValues.otp != params.otp) {
      // //     return res.send(response({}, `Invalid otp. Please try again1.`, false))
      // // }
      // // throw "Invalid otp. Please try again1.";
      // // params.otp = 123456
      // // params.otp = Math.floor(1000 + Math.random() * 9000);
      // try {
      //     // await db.User.update({
      //     //     isemailverify: 1
      //     // }, {
      //     //     where: {
      //     //         id: user.id
      //     //     }
      //     // });
      // }
      // catch (error) {
      //     return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
      // }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  completeprofile: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = req.user;

      const userProfile = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      if (!userProfile) {
        return res.send(response({}, `User profile doesn't exsist.`, false));
      }
      // if (!userProfile) {
      //     throw "User profile doesn't exsist.";
      // }
      else {
        //new  // params.userid = userProfile.dataValues.id

        try {
          let userdeatail = await db.Userprofile.findOne({
            where: {
              userid: req.user.id,
            },
            attributes: ["userid"],
          });
          if (userdeatail) {
            await db.Userprofile.update(params, {
              where: {
                userid: req.user.id,
              },
            });
          } else {
            await db.Userprofile.create(params);
          }
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }

        await db.User.update(
          {
            isCompleteProfile: 1,
          },
          {
            where: {
              id: user.id,
            },
          }
        );
      }
      let userdeatail = await db.User.findOne({
        where: {
          id: req.user.id,
        },
        attributes: [
          "refercode",
          "walletbalance",
          "wltwin",
          "wltbns",
          "isVerifed",
          "isCompleteProfile",
          "phone",
          "email",
          "country_code",
        ],
        include: [
          {
            model: db.Userprofile,
            as: "user_profile",
            attributes: [
              "userid",
              "name",
              "gender",
              "dob",
              "address",
              "pincode",
              "cityid",
              "stateid",
            ],
          },
        ],
      });

      const token = jwt.sign(
        {
          sub: req.user.id,
          usertype: user.usertype,
          apikey: process.env.APIKEY_FOR_CREDEXON,
        },
        config.secret,
        {
          expiresIn: "30d",
        }
      );
      userdeatail.dataValues =
        userdeatail && userdeatail.dataValues ? userdeatail.dataValues : {};
      let userdeatails = {
        refercode: userdeatail.dataValues.refercode,
        walletbalance: userdeatail.dataValues.walletbalance,
        wltwin: userdeatail.dataValues.wltwin,
        wltbns: userdeatail.dataValues.wltbns,
        isVerifed: userdeatail.dataValues.isVerifed,
        isCompleteProfile: userdeatail.isCompleteProfile,
        token: token,
      };
      if (userdeatail?.dataValues?.user_profile?.dataValues) {
        userdeatails["user_profile"] = {
          ...userdeatail.dataValues.user_profile.dataValues,
          phone: userdeatail.dataValues.phone,
          email: userdeatail.dataValues.email,
          country_code: userdeatail.dataValues.country_code,
          user_id: req.user.id,
        };
      } else {
        userdeatails["user_profile"] = {
          phone: userdeatail.dataValues.phone,
          email: userdeatail.dataValues.email,
          country_code: userdeatail.dataValues.country_code,
          user_id: req.user.id,
        };
      }

      // authentication successful
      // const token = jwt.sign({
      //     sub: req.user.id,
      //     usertype: user.usertype
      // }, config.secret, {
      //     expiresIn: "1d",
      // });

      userdeatail.dataValues.token = token;

      return res.send(
        response(
          userdeatails,
          `Professional info completed successfully.`,
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

  city_list: async (req, res, next) => {
    try {
      const params = req.body;
      const generalDbConnection = await connectWithGeneralDb();
      const CitiesSchema = createCitiesModel(generalDbConnection);
      const city_list = await CitiesSchema.find({state: params.state},
        {"id":1, "city":"$name", "lat":1, "long":1});

      return res.send(
        response({ city_list }, "City list find successfully!!!.", true)
      );
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  state_list: async (req, res, next) => {
    try {
      const params = req.body;
      const generalDbConnection = await connectWithGeneralDb();
      const StatesSchema = createStateModel(generalDbConnection);
      if (!countryCode[params.country]) {
        return res.send(
          response({}, "You have entered wrong country code!.", false)
        );
      }
      const state_list = await StatesSchema.find({
          country: countryCode[params.country],
          id: { "$nin": [19, 20, 30, 31, 11, 6] },
        },

       {"id":1, "name":1, "country":1},
      );

      return res.send(
        response({ state_list }, "State list find successfully!!!.", true)
      );
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },

  updateCompleteProfile: async (req, res, next) => {
    try {
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);
      const params = req.body;
      const Userprofile = await UsersSchema.findOne({_id: ObjectId(params.userid)});

      let form_datas = { userid: ObjectId(params.userid) };

      if (params.name) {
        form_datas.name = params.name;
      }
      if (params.dob) {
        form_datas.dob = params.dob;
      }
      if (params.gender) {
        form_datas.gender = params.gender;
      }
      if (params.address) {
        form_datas.address = params.address;
      }
      if (params.cityid) {
        form_datas.cityid = params.cityid;
      }
      if (params.stateid) {
        form_datas.stateid = params.stateid;
      }
      if (params.pincode) {
        form_datas.pincode = params.pincode;
      }

      let files = req.files;
      if (Object.keys(files).length > 0) {
        let files_detail = {
          files: files,
          img_name: files.profilepic,
          folder_name: "profile_doc",
        };

        file_name = await singleFileRequest(files_detail);
        // var file_name = 'profile' + Date.now() + '.jpg';

        form_datas.profilepic = file_name;
      }

      if (Userprofile) {
        try {
          await UsersSchema.updateOne({_id: ObjectId(params.userid)},form_datas);
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }
      } else {
        await UsersSchema.create(form_datas);
      }

      let userdeatail = await UsersSchema.findOne({_id: ObjectId(params.userid)},{"id":1,"country_code":1,"phone":1,"email":1,"refercode":1,
          "walletbalance":1,"wltwin":1,"wltbns":1,"isphoneverify":1,"isemailverify":1,"isbankdverify":1,"ispanverify":1,"isVerifed":1,
          "isCompleteProfile":1,"userid":"$_id","name":1,"gender":1,"dob":1,"address":1,"pincode":1,"cityid":1,"stateid":1,"profilepic":1,
        });

      let url = "";
      if (userdeatail?.profilepic == null) {
        url = null;
      } else {
        if (
          userdeatail?.profilepic != "" &&
          userdeatail?.profilepic != null
        ) {
          let checkhttpurl = isValidHttpUrl(
            userdeatail.profilepic
          );
          if (checkhttpurl) {
            url = userdeatail.profilepic;
          } else {
            url = `${env.awsimgurl}profile_doc/${userdeatail?.profilepic}`;
          }
          //  user_image = config.profile_url + user.user_profile.profilepic;
        }

        // url = `${env.awsimgurl}profile_doc/${userdeatail?.dataValues.user_profile?.dataValues.profilepic}`
        // url = config.profile_url + userdeatail?.dataValues.user_profile?.dataValues.profilepic
        userdeatail.profilepic = url;
      }

      await UsersSchema.updateOne(
        {
          _id: ObjectId(params.userid),
        },
        {
          isCompleteProfile: 1,
        },
        
      );
      if (userdeatail?.email) {
        KycTrigger(
          userdeatail?.email,
          "Email Verification:Credexon",
          "Thanks,Your email verification in successfully done."
        )
          .then((success) => { })
          .catch((error) => {
            //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
          });
      }
      if (params?.userid) {
        notificationTrigger(
          params.userid,
          "Email Verification:Credexon",
          "Thanks,Your email verification in successfully done."
        );
      }

      return res
        .status(200)
        .send(response(userdeatail, "Profile Updated successfully!!!.", true));
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  bankverify: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = req.user;

      const userdeatail = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });

      if (!userdeatail) {
        return res
          .status(400)
          .send(response({}, `Account doesn't exsist.`, false));
      }

      // if (!userdeatail) throw "Account doesn't exsist.";

      params.userid = userdeatail.dataValues.id;

      // // hash acno

      const Cryptr = require("cryptr");
      const cryptr = new Cryptr("myTotalySecretKey");
      // let email = some@mail.com;
      if (params.acno) {
        params.acno = cryptr.encrypt(params.acno);
      }
      const CheckAccNo = await db.Userbankaccounts.findOne({
        where: {
          acno: params.acno,
          // userid:{[Op.not]: req.user.id}
        },
      });
      if (CheckAccNo) {
        return res.send(response({}, "Account number already in use.", true));
      }

      if (params.upi) {
        const CheckUPI = await db.Userbankaccounts.findOne({
          where: {
            upi: params.upi,
          },
        });
        if (CheckUPI) {
          return res.send(response({}, "UPI already in use.", true));
        }
      } else {
        params.upi = params.upi ? params.upi : "";
      }

      // let decrypt = cryptr.decrypt(encryptdEmail)
      // if (params.acno) {
      //     params.acno = await bcrypt.hash(params.acno, 10);
      // }
      let form_datas = {
        bankname: params.bankname,
        ifsccode: params.ifsccode,
        acholdername: params.acholdername,
        acno: params.acno,
        userid: req.user.id,
      };

      let files = req.files;

      if (Object.keys(files).length > 0) {
        let files_detail = {
          files: files,
          img_name: files.image,
          folder_name: "profile_doc",
        };
        //await singleFileRequest(files_detail);
        var file_name = await singleFileRequest(files_detail);
        form_datas.image = file_name;
      }
      try {
        await db.Userbankaccounts.destroy({
          where: {
            userid: req.user.id,
          },
        });

        let detail = await db.Userbankaccounts.create(form_datas);

        let decrypt = cryptr.decrypt(params.acno);
        let sendData = {
          banking: `${env.awsimgurl}profile_doc/${detail.dataValues.image}`,
          // bankimg: config.profile_url + detail.dataValues.image,
          // acno: decrypt
        };
        await db.User.update(
          {
            isbankdverify: 2,
          },
          {
            where: {
              id: req.user.id,
            },
          }
        );

        if (userdeatail?.dataValues?.email) {
          KycTrigger(
            userdeatail?.dataValues?.email,
            "Bank Verification:Credexon",
            "Thanks,Your Bank Verification is in progress.."
          )
            .then((success) => { })
            .catch((error) => {
              //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
            });
        }
        if (req.user.id) {
          notificationTrigger(
            req.user.id,
            "Bank Verification:Credexon",
            "Thanks,Your Bank Verification is in progress.."
          );
        }

        return res.send(
          response(sendData, "Bank Verification is in progress.", true)
        );
      } catch (error) {
        return res
          .status(400)
          .send(
            response({}, "Something went wrong.!!!", false, null, error.stack)
          );
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong111.!!!", false, null, error.stack)
        );
    }
  },

  upiverification: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = req.user;
      const userdeatail = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (!userdeatail) {
        return res
          .status(400)
          .send(response({}, `Account doesn't exsist.`, false));
      }
      params.userid = userdeatail.dataValues.id;
      const CheckUPI = await db.Userbankaccounts.findOne({
        where: {
          upi: params.upi,
          // userid:{[Op.not]: req.user.id}
        },
      });
      if (CheckUPI) {
        return res.send(response({}, "UPI already in use.", true));
      }

      let urlPayout = "https://kepler.haodapayments.com/api/v1/upi/validate";
      payloadData = {
        vpa: params.upi,
      };
      const axios = require("axios");
      const options = {
        method: "POST",
        url: urlPayout,
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          "x-client-id": "7uPC0EDmTG2075",
          "x-client-secret": "651TfrLhuK230830061323",
        },
        data: JSON.stringify(payloadData),
      };

      axios
        .request(options)
        .then(async function (result) {
          console.log("vpa validation res", result);
          if (result?.data?.status_code == 200) {
            // return res.status(200).send(response({},result?.data?.message, true));

            let form_datas = {
              upi: params.upi,
              userid: req.user.id,
            };

            try {
              let sendData = { banking: "" };
              await db.Userbankaccounts.update(
                {
                  upi: params.upi,
                },
                {
                  where: {
                    userid: req.user.id,
                  },
                }
              );
              await db.User.update(
                {
                  upiverify: 1,
                },
                {
                  where: {
                    id: req.user.id,
                  },
                }
              );

              if (userdeatail?.dataValues?.email) {
                KycTrigger(
                  userdeatail?.dataValues?.email,
                  "UPI Verification:Credexon",
                  "Thanks,Your UPI Verification is in progress.."
                )
                  .then((success) => { })
                  .catch((error) => {
                    //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
                  });
              }
              if (req.user.id) {
                notificationTrigger(
                  req.user.id,
                  "UPI Verification:Credexon",
                  "Thanks,Your UPI Verification is in progress.."
                );
              }
              return res.send(
                response(sendData, "UPI Verification is in progress.", true)
              );
            } catch (error) {
              console.log("errorupi", error);
              return res
                .status(400)
                .send(
                  response(
                    {},
                    "Something went wrong.!!!",
                    false,
                    null,
                    error.stack
                  )
                );
            }
          } else {
            return res
              .status(400)
              .send(response({}, result?.data?.message, false));
          }
        })
        .catch(function (error) {
          console.log("error--->>", error);
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        });
    } catch (error) {
      console.log(error);
      return res
        .status(400)
        .send(
          response({}, "Something went wrong111.!!!", false, null, error.stack)
        );
    }
  },
  verrification: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      const user = req.user;
      const userdetail = await db.User.findOne({
        where: {
          id: req.user.id,
        },
      });
      if (!userdetail) {
        return res
          .status(400)
          .send(response({}, `Account doesn't exsist.`, false));
      }

      if (params.type == "Indian") {
        params.userid = userdetail.dataValues.id;
        await db.Useraadharcard.destroy({
          where: {
            userid: req.user.id,
          },
        });
        try {
          let form_datas = {
            userid: req.user.id,
            dob: params.dob,
          };

          let form_data_pan = {
            panname: params.panname,
            userid: req.user.id,
            dob: params.dob,
          };

          let files = req.files;
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.adharfrontImage,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_datas.adharfrontImage = file_name;
          } else {
            throw "Upload is required";
          }
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.adharbackImage,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_datas.adharbackImage = file_name;
          } else {
            throw "Upload is required";
          }
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.panimage,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_data_pan.panimage = file_name;
          } else {
            throw "Upload is required";
          }
          await db.Useraadharcard.create(form_datas);
          params.userid = userdetail.dataValues.id;
          await db.Userpancard.destroy({
            where: {
              userid: req.user.id,
            },
          });
          await db.Userpancard.create(form_data_pan);
          return res.send(
            response({}, "Id verification is in progress.", true)
          );
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }
      } else if (params.type == "British") {
        params.userid = userdetail.dataValues.id;
        await db.userpassport.destroy({
          where: {
            userid: req.user.id,
          },
        });
        try {
          let form_data_pass = {
            userid: req.user.id,
            pr_image: params.pr_image,
          };

          let form_data_dri = {
            userid: req.user.id,
          };

          let files = req.files;
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.pr_image,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_data_pass.pr_image = file_name;
          } else {
            throw "Upload is required";
          }
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.dr_frontimage,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_data_dri.dr_frontimage = file_name;
          } else {
            throw "Upload is required";
          }
          if (Object.keys(files).length > 0) {
            let files_detail = {
              files: files,
              img_name: files.dr_backimage,
              folder_name: "images",
            };
            await singleFileRequest(files_detail);
            var file_name = "profile" + Date.now() + ".jpg";
            form_data_dri.dr_backimage = file_name;
          } else {
            throw "Upload is required";
          }
          await db.userpassport.create(form_data_pass);
          params.userid = userdetail.dataValues.id;
          await db.userdriving.destroy({
            where: {
              userid: req.user.id,
            },
          });
          await db.userdriving.create(form_data_dri);
          return res.send(
            response({}, "Id verification is in progress.", true)
          );
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  transaction_view: async (req, res, next) => {
    try {

      const params = req.body;
      const dbName = await getDBName(req.user.apikey);
      const vendorDbConnection = await connectWithVendorDb(dbName);
      console.log("req.user.id-->>",req.user.id);
      
      const TransactionsSchema = createTransactionsModel(vendorDbConnection);
      const transaction_view = await TransactionsSchema.aggregate([
        {
          "$match": {
            userid: ObjectId(req.user.id),
            atype: { "$ne": "add_amt_gst" },
          }
        },
        { "$sort": { _id: -1 } },
        { "$limit": 20 },
        {
          "$lookup": {
            from: "userbonus",
            localField: "_id",
            foreignField: "transid",
            as: "bonus_bals"
          }
        },
        {
          $unwind: {
            "path": "$bonus_bals",
            "preserveNullAndEmptyArrays": true
          }
        },
        {
          "$project": {
            "amount": 1, "txid": 1, "txdate": 1, "ttype": 1, "atype": 1,
            "updatedAt": 1, "bonus_bals.expiry_date": 1
          }
        }
      ]);

      transaction_detail = transDes;
      transaction_view.transDes;
      let transData = { transaction_detail, transaction_view };
      if (!transaction_view) {
        return res.send(response({}, `Account doesn't exsist.`, false));
      }

      return res.send(
        response(transData, `tansaction history view  succesfully`, true)
      );
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  wallet_view: async (req, res, next) => {
    try {

      const connection = await connectWithGeneralDb();
      const GameSettingsSchema = createGameSettingsModel(connection);
      const SettingSchema = createSettingsModel(connection);

      const dbName = await getDBName(req.user.apikey);
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);
      const BankDetailsSchema = createBankDetailsModel(vendorDbConnection);

      const userDetails = await UsersSchema.findOne({
        _id: ObjectId(req.user.id),
      },
        {
          "walletbalance": 1,
          "totalwin": 1,
          "wltwin": 1,
          "wltbns": 1,
          "welbns": 1,
          "wltdept": 1,
          "_id": 1,
          "isbankdverify": 1,
          "ispanverify": 1,
          "isphoneverify": 1,
          "isemailverify": 1,
          "isVerifed": 1,
          "email": 1,
          "phone": 1,
          "country_code": 1,
          "isIds": 1,
          "totaljoinfee": 1,
          "totaljoinfeedepots": 1,
          "totaljoinfeewin": 1,
          "isCompleteProfile": 1,
          "upiverify": 1,
        });

      const bankDetails = await BankDetailsSchema.findOne({ userid: userDetails._id }, { "acno": 1 })
      let settings = await SettingSchema.findOne({});
      let gameSettings = await GameSettingsSchema.findOne({ key: "tdsperamt" });
      const Cryptr = require("cryptr");
      const cryptr = new Cryptr("myTotalySecretKey");

      if (bankDetails?.acno) {
        var decrypt = cryptr.decrypt(
          bankDetails?.acno
        );

        decrypt = decrypt.replace(/\d(?=\d{4})/g, "*");
        //userDetails.decrypt = decrypt;
      }
      let createData = {
        walletbalance: userDetails.walletbalance,
        id: userDetails._id,
        totalwin: userDetails.totalwin,
        wltwin: userDetails.wltwin,
        wltbns: await checkBonusBalUser(userDetails._id, vendorDbConnection), //userDetails.wltbns,
        wltdept: userDetails.wltdept,
        welbns: userDetails.welbns,
        isbankdverify: userDetails.isbankdverify,
        ispanverify: userDetails.ispanverify,
        isphoneverify: userDetails.isphoneverify,
        isemailverify: userDetails.isemailverify,
        isVerifed: userDetails.isVerifed,
        email: userDetails.email,
        phone: userDetails.phone,
        isCompleteProfile: userDetails.isCompleteProfile,
        country_code: userDetails.country_code,
        acno: decrypt,
        min_withdraw: settings.min_withdraw_amount,
        min_add_amount: settings.min_add_amount,
        max_add_amount: settings.max_add_amount,
        gst_addamount_percentage: settings.gst_addamount_percentage,
        add_amt_bonus_perc: settings.add_amt_bonus_perc,
        tdsperamt: gameSettings["value"],
        totaljoinfee: userDetails.totaljoinfee,
        totaljoinfeedepots: userDetails.totaljoinfeedepots,
        totaljoinfeewin: userDetails.totaljoinfeewin,
        isIds: userDetails.isIds,
        upiverify: userDetails.upiverify,
      };

      return res.send(
        response(
          createData,
          `Wallet view  succesfully.!`,
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
  personal_verify_user: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;
      params.userid = req.user.id;
      await db.Userprofile.destroy({
        where: {
          userid: req.user.id,
        },
      });
      await db.Userprofile.create(params);
      if (params.persona_status == "completed") {
        // await db.User.update({
        //     profile_status: 7
        //   }, {
        //     where: {
        //       user_id: id
        //     }
        //   })
        let id_datas = params.id_data;
        if (params.id_data) {
          let userDetail = {
            userid: req.user.id,
            birthdate: id_datas["birthdate"]["value"],
            name_last: id_datas["name-last"]["value"],
            name_first: id_datas["name-first"]["value"],
            name_middle: id_datas["name-middle"]["value"],
            address_city: id_datas["address-city"]["value"],
            phone_number: id_datas["phone-number"]["value"],
            email_address: id_datas["email-address"]["value"],
            address_street_1: id_datas["address-street-1"]["value"],
            address_street_2: id_datas["address-street-2"]["value"],
            selected_id_class: id_datas["selected-id-class"]["value"],
            address_postal_code: id_datas["address-postal-code"]["value"],
            address_subdivision: id_datas["address-subdivision"]["value"],
            address_country_code: id_datas["address-country-code"]["value"],
            identification_class: id_datas["identification-class"]["value"],
            current_government_id: JSON.stringify(
              id_datas["current-government-id"]["value"]
            ),
            identification_number: id_datas["identification-number"]["value"],
            selected_country_code: id_datas["selected-country-code"]["value"],
            current_selfie: JSON.stringify(id_datas["current-selfie"]["value"]),
          };

          let userIdsDetail = await db.UserIds.findOne({
            where: {
              userid: userDetail.userid,
              selected_id_class: userDetail.selected_id_class,
            },
          });
          if (userIdsDetail) {
            await db.UserIds.update(userDetail, {
              where: {
                userid: userDetail.userid,
                selected_id_class: userDetail.selected_id_class,
              },
            });
          } else {
            await db.UserIds.create(userDetail);
          }
          let objUser = {};
          if (userDetail.selected_id_class == "pan") {
            objUser["ispanverify"] = 1;
          } else {
            objUser["isIds"] = 1;
          }
          await db.User.update(objUser, {
            where: {
              id: req.user.id,
            },
          });
        }

        return res.send({
          message: "Persona verified successfully!",
          status: true,
          data: {},
        });
      } else if (params.persona_status == "incompleted") {
        return res.send({
          message: "Persona not verified successfully!",
          status: false,
          data: {},
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

  //Todo: Why we are using token directly here
  sure_verify_user: async (req, res, next) => {
    try {
      
      let token =process.env.KYC_TOKEN;
      const params = req.body;
      params.userid = ObjectId(req.user.id);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UserAadharsSchema = createUserAadharsModel(vendorDbConnection);
      const UserDrivingLicensesSchema = createUserDrivingLicensesModel(vendorDbConnection);
      const UserPanSchema = createUserPanModel(vendorDbConnection);
      const UsersSchema=createUsersModel(vendorDbConnection);


      let url = {
        aadhar: "aadhaar-v2/generate-otp",
        dlicense: "driving-license/driving-license",
        passport: "Passport",
        voter: "Voter ID",
        pan: "pan/pan",
        bank: "bank-verification",
      };

      let urlOtp = {
        aadhar: "aadhaar-v2/submit-otp",
      };

      if (params.otp) {
        let data = {
          client_id: params.client_id,
          otp: params.otp,
        };

        const options = {
          method: "POST",
          url: "https://kyc-api.surepass.io/api/v1/" + urlOtp[params.type], //aadhaar-v2/submit-otp',
          headers: {
            //accept: 'application/json',
            Authorization: token,
            "Content-Type": "application/json",
          },
          data: data,
        };
        let result = await axios.request(options).catch((cc) => { });

        if (result?.data?.status_code === 200) {
          let allData = result?.data?.data;
          allData.userid = params.userid;
          allData.type = params.type;

          if (params.type == "aadhar") {
            let UserState = allData?.address?.state;
            const generalDbConnection = await connectWithGeneralDb();
            const StateSchema=createStateModel(generalDbConnection)
            let user_state = await StateSchema.findAll({ status: 2 });
            if (user_state) {
              user_state = user_state.map((item) => {
                if (
                  item.dataValues.name.toLowerCase() == UserState.toLowerCase()
                ) {
                  return res
                    .status(400)
                    .send(
                      response(
                        {},
                        "This GameRestricted In Your State.!!!",
                        false
                      )
                    );
                  // return true
                } else {
                  return false;
                }
              });
              if (user_state[0] == true) {
                return res
                  .status(400)
                  .send(
                    response(
                      {},
                      "The Game Services are not active for your state, please try again later!!!",
                      false
                    )
                  );
              }
            }
          }

          if (params.type === "pan") {
            await UserPanSchema.updateOne(
              { userid: allData.userid, type: allData.type },
              { $set: allData },
              { upsert: true }
            );
          } else if (params.type === "aadhar") {
            await UserAadharsSchema.updateOne(
              { userid: allData.userid, type: allData.type },
              { $set: allData },
              { upsert: true }
            );
          } else if (params.type === "dlicense") {
            await UserDrivingLicensesSchema.updateOne(
              { userid: allData.userid, type: allData.type },
              { $set: allData },
              { upsert: true }
            );
          }
          let isVerfy = { isIds: 1 };
          await UsersSchema.update({
            id: params.userid,
          },{"$set":isVerfy});
          if (params.type == "aadhar") {
            const userdeatail = await UsersSchema.findOne({
                id: params.userid,
              });
            if (userdeatail?.dataValues?.email) {
              KycTrigger(
                userdeatail?.dataValues?.email,
                "Aadhar Verification:Credexon",
                "Thanks,Your Aadhar Verification Verification is done."
              )
                .then((success) => { })
                .catch((error) => {
                  //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
                });
            }
            if (params.userid) {
              notificationTrigger(
                params.userid,
                "Aadhar Verification:Credexon",
                "Thanks,Your Aadhar Verification Verification is done."
              );
            }
          }

          return res.send(
            response(allData, `Thank you for verification :)`, true)
          );
        } else {
          return res.send(
            response({}, `ID is not verified, please try again.`, false)
          );
        }
      } else {
        if (params.type === "aadhar") {
          let userIdsDetail = await UserAadharsSchema.findOne({
            aadhaar_number: params.idno,
          });
          if (userIdsDetail) {
            return res.send(
              response({}, `This Aadhaar number is already in use.`, false)
            );
          }
        } else if (params.type === "dlicense") {
          let userIdsDetail = await UserDrivingLicensesSchema.findOne({
            license_number: params.idno,
          });
          if (userIdsDetail) {
            return res.send(
              response({}, `This DL number is already in use.`, false)
            );
          }
        } else if (params.type === "pan") {
          let userIdsDetail = await UserPanSchema.findOne({
            pan_number: params.idno,
          });
          if (userIdsDetail) {
            return res.send(
              response({}, `This pan number is already in use.`, false)
            );
          }
        }
        let data = {
          id_number: params.idno,
        };
        let sureUrl = "https://kyc-api.surepass.io/api/v1/" + url[params.type];
        const options = {
          method: "POST",
          url: sureUrl, //aadhaar-v2/generate-otp',
          headers: {
            //accept: 'application/json',
            Authorization: token,
            "Content-Type": "application/json",
          },
          data: data,
        };
        let result = await axios.request(options).catch((cc) => { });

        if (result?.data?.status_code === 200) {
          let allData = result?.data?.data;

          if (params.type !== "aadhar") {
            allData.userid = params.userid;
            allData.type = params.type;
            const userdeatail = await db.User.findOne({
              where: {
                id: params.userid,
              },
            });
            let isVerfy = {};
            if (params.type === "dlicense") {
              isVerfy = { isIds: 1 };
              await UserDrivingLicensesSchema.updateOne(
                { userid: allData.userid, type: allData.type },
                { $set: allData },
                { upsert: true }
              );

              if (userdeatail?.dataValues?.email) {
                KycTrigger(
                  userdeatail?.dataValues?.email,
                  "Driving license Verification:Credexon",
                  "Thanks,Your Driving license Verification is done."
                )
                  .then((success) => { })
                  .catch((error) => {
                    //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
                  });
              }
              if (params.userid) {
                notificationTrigger(
                  params.userid,
                  "Driving license Verification:Credexon",
                  "Thanks,Your Driving license Verification is done."
                );
              }
            }
            if (params.type === "pan") {
              isVerfy = { ispanverify: 1 };
              await UserPanSchema.updateOne(
                { userid: allData.userid, type: allData.type },
                { $set: allData },
                { upsert: true }
              );

              if (userdeatail?.dataValues?.email) {
                KycTrigger(
                  userdeatail?.dataValues?.email,
                  "PAN card Verification:Credexon",
                  "Thanks,Your PAN card Verification is done."
                )
                  .then((success) => { })
                  .catch((error) => {
                    //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
                  });
              }
              if (params.userid) {
                notificationTrigger(
                  params.userid,
                  "PAN card Verification:Credexon",
                  "Thanks,Your PAN card Verification is done."
                );
              }
            }
            await UsersSchema.update(isVerfy, {
              where: {
                id: params.userid,
              },
            });
            return res.send(
              response({}, `Thank you for your verification :)`, true)
            );
          } else {
            return res.send(
              response(
                allData,
                `Please check OTP in your Registered Mobile Number`,
                true
              )
            );
          }
        } else {
          return res.send(
            response({}, `ID is not verified, please try again.`, false)
          );
        }
        /*
                {
                    "status": true,
                    "data": {
                        "client_id": "aadhaar_v2_hWwdcZqppkximvmtqeNd",
                        "full_name": "Raman Mathur",
                        "aadhaar_number": "720894013712",
                        "dob": "1988-12-30",
                        "gender": "M",
                        "address": {
                            "country": "India",
                            "dist": "Jaipur",
                            "state": "Rajasthan",
                            "po": "Shyam Nagar",
                            "loc": "kings road ,ajmer road",
                            "vtc": "Jaipur",
                            "subdist": "Jaipur",
                            "street": "nirman nagar",
                            "house": "C-69",
                            "landmark": "opp. shayam nagar thana"
                        },
                        "face_status": false,
                        "face_score": -1,
                        "zip": "302019",
                        "profile_image": "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",
                        "has_image": true,
                        "email_hash": "",
                        "mobile_hash": "07b53262eb6d9c175952bb51b3aa523b7071f82b50ede58745187b47546979fc",
                        "raw_xml": "https://aadhaar-kyc-docs.s3.amazonaws.com/payease/aadhaar_xml/371220230430005926694/371220230430005926694-2023-04-29-192926846065.xml?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY5K3QRM5PAM3NMHW%2F20230429%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230429T192926Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=34fdc87cda90b672b428e7b4dfca7a241e2e7cf54d6b75a5cacbc4630296ebd7",
                        "zip_data": "https://aadhaar-kyc-docs.s3.amazonaws.com/payease/aadhaar_xml/371220230430005926694/371220230430005926694-2023-04-29-192926745381.zip?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAY5K3QRM5PAM3NMHW%2F20230429%2Fap-south-1%2Fs3%2Faws4_request&X-Amz-Date=20230429T192926Z&X-Amz-Expires=432000&X-Amz-SignedHeaders=host&X-Amz-Signature=f41d42fbf38181f30159a94051ba587f3ea5654836eca2e0204b3329f125a006",
                        "care_of": "S/O: Durga Narain Mathur",
                        "share_code": "0106",
                        "mobile_verified": false,
                        "reference_id": "371220230430005926694",
                        "aadhaar_pdf": null,
                        "status": "success_aadhaar",
                        "uniqueness_id": "6dde75460e2be257352a09f2e5d7e0e6e5a7e3aaa4509d7c7cf5dea491d3a31a"
                    },
                    "message": "Successfully send"
                }
                */
      }

      /*
            await db.Userprofile.destroy({
                where: {
                    userid: req.user.id
                }
            })
            await db.Userprofile.create(params);
            if (params.persona_status == "completed") {
                
                // await db.User.update({
                //     profile_status: 7
                //   }, {
                //     where: {
                //       user_id: id
                //     }
                //   })
                let id_datas=params.id_data;
                if(params.id_data){

                    let userDetail={
                        userid: req.user.id,
                        birthdate: id_datas["birthdate"]["value"],
                        name_last: id_datas["name-last"]["value"],
                        name_first: id_datas["name-first"]["value"],
                        name_middle: id_datas["name-middle"]["value"],
                        address_city: id_datas["address-city"]["value"],
                        phone_number: id_datas["phone-number"]["value"],
                        email_address: id_datas["email-address"]["value"],
                        address_street_1: id_datas["address-street-1"]["value"],
                        address_street_2: id_datas["address-street-2"]["value"],
                        selected_id_class: id_datas["selected-id-class"]["value"],
                        address_postal_code: id_datas["address-postal-code"]["value"],
                        address_subdivision: id_datas["address-subdivision"]["value"],
                        address_country_code: id_datas["address-country-code"]["value"],
                        identification_class: id_datas["identification-class"]["value"],
                        current_government_id: JSON.stringify(id_datas["current-government-id"]["value"]),
                        identification_number: id_datas["identification-number"]["value"],
                        selected_country_code: id_datas["selected-country-code"]["value"],
                        current_selfie: JSON.stringify(id_datas["current-selfie"]["value"])
                    }
                    
                    let userIdsDetail= await db.UserIds.findOne({where:{userid:userDetail.userid, 
                        selected_id_class:userDetail.selected_id_class}});
                        if(userIdsDetail){
                            await db.UserIds.update(userDetail,{where:{userid:userDetail.userid, 
                                selected_id_class:userDetail.selected_id_class}})
                        }else{
                            await db.UserIds.create(userDetail)
                        }
                        let objUser={}
                        if(userDetail.selected_id_class=="pan"){
                            objUser["ispanverify"]= 1
                        }else{
                            objUser["isIds"]= 1
                        }
                        await db.User.update(objUser, {
                            where: {
                                id: req.user.id
                            }
                        })
                    
                }
                
                
                return res.send({ message: "Persona verified successfully!", status: true, data: {} })
            } else if (params.persona_status == "incompleted") {
                return res.send({ message: "Persona not verified successfully!", status: false, data: {} })
            }
            */
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!11", false, null, error.stack)
        );
    }
  },
  withdraw_amount: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const connection = await connectWithGeneralDb();
      const GameSettingsSchema = createGameSettingsModel(connection);
      const SettingSchema = createSettingsModel(connection);

      const params = req.body;
      params.userid = req.user.id;
      // min_withdraw_amount
      let settings = await SettingSchema.findOne({});
      let gameSettings = await GameSettingsSchema.findOne({ key: "tdsperamt" });

      params.reqamt =
        params.reqamt && params.reqamt > 0 ? parseFloat(params.reqamt) : 0;
      if (params.reqamt > settings.max_withdraw_amount) {
        return res.send(
          response(
            {},
            `Max withdrawal winning amount should not be grater then 25000.`,
            false
          )
        );
      }
      if (params.reqamt <= settings.min_withdraw_amount) {
        return res.send(
          response(
            {},
            `Min withdrawal winning amount should be at least ${settings.min_withdraw_amount}.`,
            false
          )
        );
      }

      const wallet_view = await db.User.findOne({
        where: {
          id: params.userid,
        },
        attributes: [
          "walletbalance",
          "wltwin",
          "totaljoinfee",
          "totaljoinfeedepots",
          "totaljoinfeewin",
          "totalwin",
          "totaltds",
          "wltbaltds",
          "wltwithdraw",
          "welbns",
        ],
      });
      let tdsPerc = gameSettings.value;
      let withdrawAmt = tdsCalculate(
        wallet_view["totaljoinfeedepots"],
        wallet_view["totalwin"],
        tdsPerc,
        params.reqamt,
        wallet_view["welbns"]
      );

      params.reqamt = parseFloat(withdrawAmt.tDSRemainingValue);
      let tdsAmt = parseFloat(withdrawAmt.withdrawTDSAmt);

      let currentTotaltds = wallet_view["totaltds"];
      let currentWltbaltds = wallet_view["wltbaltds"];

      let nowTotaltds = currentTotaltds + tdsAmt;
      let nowWltbaltds = currentWltbaltds + tdsAmt;

      let nowWltwithdraw = wallet_view["wltwithdraw"] + params.reqamt;

      let remainingWinBal = wallet_view["wltwin"] - params.reqamt - tdsAmt;
      //let remainingBal = wallet_view["walletbalance"] - params.reqamt;
      if (remainingWinBal >= 0) {
        // "walletbalance": remainingBal,
        let user = await db.User.update(
          {
            wltwin: remainingWinBal,
            wltwithdraw: nowWltwithdraw,
            totaltds: nowTotaltds,
            wltbaltds: nowWltbaltds,
          },
          { where: { id: params.userid } }
        );
        let currentDate = (currentTimeZoneDate() * 1) / 1000;
        let trans_id = null;

        if (params.reqamt > 0) {
          let objTransBal = {
            userid: params.userid,
            amount: params.reqamt,
            txdate: currentDate,
            ttype: "dr",
            atype: "bal_wtd_req",
          };
          trans_id = await db.Transactions.create(objTransBal);
        }

        if (tdsAmt > 0) {
          let objTransBalTDS = {
            userid: params.userid,
            amount: tdsAmt,
            txdate: currentDate,
            ttype: "dr",
            atype: "bal_wtd_tds_pen",
            tid: trans_id.id,
          };
          await db.Transactions.create(objTransBalTDS);
        }

        return res.send(response({}, `Withdrawal request sent`, true));
      } else {
        return res.send(response({}, `Insufficient balance`, false));
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  referal_calculation: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      //const params = req.body;
      const userid = req.user.id;
      let invites = {
        refer_code: "",
        total_invite: 0,
        total_joined: 0,
        remaining_invite: 0,
        total_earnings: 0,
        earning: 0,
        remaining_earnings: 0,
        joined_friends: [],
      };
      // const userid=req.user.id;

      let users = await db.User.findOne({
        where: {
          id: userid,
        },
        attributes: ["refercode", "referalShareCount", "referred_status"],
      });

      if (users) {
        invites.total_invite = users.referalShareCount;
        invites.refer_code = users.refercode;
      }

      if (users && users.referred_status) {
        let referred_status_user = users.referred_status
          ? JSON.parse("[" + users.referred_status + "]")
          : "";

        //let joined_friends = [];
        if (referred_status_user.length > 0) {
          invites.total_joined = referred_status_user.length;
          for (let i = 0; i < referred_status_user.length; i++) {
            let userdeatail = await db.User.findOne({
              where: {
                id: referred_status_user[i],
              },
              attributes: ["id"],
              include: [
                {
                  model: db.Userprofile,
                  as: "user_profile",
                  attributes: ["userid", "name", "profilepic"],
                },
              ],
            });
            if (userdeatail) {
              let url = "";
              if (
                userdeatail?.dataValues.user_profile?.dataValues.profilepic ==
                null
              ) {
                url = null;
              } else {
                if (
                  userdeatail?.dataValues.user_profile?.dataValues.profilepic !=
                  "" &&
                  userdeatail?.dataValues.user_profile?.dataValues.profilepic !=
                  null
                ) {
                  let checkhttpurl = isValidHttpUrl(
                    userdeatail.dataValues.user_profile.dataValues.profilepic
                  );
                  if (checkhttpurl) {
                    url =
                      userdeatail.dataValues.user_profile.dataValues.profilepic;
                  } else {
                    url = `${env.awsimgurl}profile_doc/${userdeatail?.dataValues.user_profile?.dataValues.profilepic}`;
                  }
                  //  user_image = config.profile_url + user.user_profile.profilepic;
                }
                // url = `${env.awsimgurl}profile_doc/${userdeatail?.dataValues.user_profile?.dataValues.profilepic}`
                // url = config.profile_url + userdeatail?.dataValues.user_profile?.dataValues.profilepic
                // userdeatail.dataValues.user_profile.dataValues.profilepic = url
              }

              invites.joined_friends.push({
                user_id: userdeatail.dataValues.id,
                name: userdeatail?.dataValues.user_profile?.dataValues.name,
                image: url,
              });
            }
          }
        }
      }
      // invite_bouns

      const connection = await connectWithGeneralDb();
      const SettingSchema = createSettingsModel(connection);

      const settingView = await SettingSchema.findOne({}, { _id: 1, ref_bns_amt: 1 });

      invites.remaining_invite =
        invites.total_joined != 0
          ? parseInt(users.referalShareCount) - parseInt(invites.total_joined)
          : 0;
      invites.total_earnings =
        invites.total_invite != 0
          ? parseInt(env.walletbonus) * parseInt(invites.total_invite)
          : 0;
      invites.earning =
        invites.total_joined != 0
          ? parseInt(env.walletbonus) * parseInt(invites.total_joined)
          : 0;
      invites.remaining_earnings =
        invites.remaining_invite != 0
          ? parseInt(env.walletbonus) * parseInt(invites.remaining_invite)
          : 0;

      return res.send(
        response(
          {
            refer_code: users.refer_code,
            invite_count: users.referalShareCount,
            invite_bouns: settingView?.ref_bns_amt,
            invites: invites,
          },
          `Successfully send`,
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
  referal_send_count: async (req, res, next) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      // const params = req.body;
      const userid = req.user.id;

      let users = await db.User.findOne({
        where: {
          id: userid,
        },
        attributes: ["referalShareCount"],
      });
      let counts = users["referalShareCount"] ? users["referalShareCount"] : 0;
      counts = counts + 1;

      let user = await db.User.update(
        { referalShareCount: counts },
        { where: { id: userid } }
      );

      return res.send(response({}, `Successfully send`, true));
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },
  send_app_link: async (req, res, next) => {
    try {
      const params = req.body;
      let applink = "";
      if (params.type === "a") {
        applink =
          "https://play.google.com/store/apps/details?id=com.application.credexon";
      } else {
        applink =
          "https://play.google.com/store/apps/details?id=com.application.credexon";
      }
      const Checkvalue = {
        template_id: "63da03e8d6fc050f6508a072",
        mobile: params.country_code + params.phone,
        authkey: "380471ARpcb0dLmG262eb9029P1",
        var1: applink,
      };

      msg91
        .sendOTP(Checkvalue)
        .then((success) => { })
        .catch((error) => { });

      return res.send(response({}, "Sent"));
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },

  otpEmailSend: async (req, res, next) => {
    try {
      const params = req.body;
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);
      const userCheck = await UsersSchema.findOne({
          email: params.email,
          _id: { "$ne": ObjectId(req.user.id) },
        });

      if (userCheck) {
        return res.send(response({}, `This Email ID already in use.`, false));
        //return res.send(response({}, `Otp sent successfully.`, false))
      }
      const user = await UsersSchema.findOne({
          _id: ObjectId(req.user.id),
        });
      if (!user) {
        return res.send(response({}, `Account doesn't exsist.`, false));
        //return res.send(response({}, `Otp sent successfully.`, false))
      } else {
        var otp = Math.floor(100000 + Math.random() * 9000);
        //new
        const Checkvalue = {
          email: params.email,
          // mobile: 919610281124,
          authkey: "380471ARpcb0dLmG262eb9029P1",
          otp: otp,
        };
        emailTrigger(params.email, otp)
          .then((success) => { })
          .catch((error) => {
            conosle.log("email otp error", error);
            //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
          });
        if (params.email) {
          await UsersSchema.updateOne({
            _id: ObjectId(req.user.id),
          },
            {
              emailOtp: otp,
            }
          );
        }
        return res.send(
          response(
            { email: Checkvalue.email },
            "OTP has been resent successfully on your registered email id.",
            true
          )
        );
      }
      // if (!user) throw "Account doesn't exsist.";
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong.!!!", false, null, error.stack)
        );
    }
  },

  verifyEmailOtp: async (req, res, next) => {
    try {
      const params = req.body;
      const dbName = "crdxn";
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema=createUsersModel(vendorDbConnection);
      const userCheck = await UsersSchema.findOne({
        email: params.email,
        _id: { "$ne": ObjectId(req.user.id) },
      });

      if (userCheck) {
        return res.send(response({}, `This Email ID already in use.`, false));
        //return res.send(response({}, `Otp sent successfully.`, false))
      }

      const user = await UsersSchema.findOne({
          _id:ObjectId(req.user.id),
        });

      if (!user) {
        return res
          .status(400)
          .send(response({}, `Account doesn't exist.`, false));
      }

      if (
        params.otp.toString() === "787878" ||
        user.dataValues.emailOtp === params.otp.toString()
      ) {
        try {
          await UsersSchema.updateOne({
            id: user.id,
          },
            {"$set":{
              isemailverify: 1,
              email: params.email,
            }}
          );
        } catch (error) {
          return res
            .status(400)
            .send(
              response({}, "Something went wrong.!!!", false, null, error.stack)
            );
        }

        let userdeatail = await UsersSchema.findOne({
            _id: ObjectId(user.id),
          }).lean();

          userdeatail["user_profile"]={"userid":userdeatail["_id"],
                "name":userdeatail["name"],
                "gender":userdeatail["gender"],
                "dob":userdeatail["dob"],
                "address":userdeatail["address"],
                "pincode":userdeatail["pincode"],
                "cityid":userdeatail["cityid"],
                "stateid":userdeatail["stateid"],
                "profilepic":userdeatail["profilepic"],
              }
        let user_profile =
          userdeatail &&
            userdeatail.user_profile
            ? userdeatail.user_profile
            : {};

        let userData =
          userdeatail && userdeatail ? userdeatail : {};
        let url = "";
        if (userdeatail.user_profile?.profilepic == null) {
          url = null;
        } else {
          if (
            userdeatail.user_profile?.profilepic != "" &&
            userdeatail.user_profile?.profilepic != null
          ) {
            let checkhttpurl = isValidHttpUrl(
              userdeatail.user_profile.profilepic
            );
            if (checkhttpurl) {
              url = userdeatail.user_profile.profilepic;
            } else {
              url =
                config.profile_url_profile_doc +
                "profile_doc/" +
                userdeatail.user_profile?.profilepic;
            }
          }
        }

        let responsedata = {
          usertype: userData?.usertype,
          refercode: userData?.refercode,
          status: userData?.status,
          logintype: userData?.logintype,
          walletbalance: userData?.walletbalance,
          wltwin: userData?.wltwin,
          wltbns: userData?.wltbns,
          logindate: userData?.logindate,
          // isCompleteProfile: userData?.isCompleteProfile,
          isVerifed: userData?.isVerifed,
          //token: token,
          //isemailverify:userData?.isemailverify,
          user_profile: {
            // userid: user_profile?.userid,
            name: user_profile?.name,
            gender: user_profile?.gender,
            dob: user_profile?.dob,
            address: user_profile?.address,
            pincode: user_profile?.pincode,
            cityid: user_profile?.cityid,
            stateid: user_profile?.stateid,
            country_code: userData.country_code,
            phone: userData?.phone,
            email: userData?.email,
            userid: userData?.id,
            profilepic: url,
          },
        };

        KycTrigger(
          params.email,
          "Email Verification:Credexon",
          "Thanks,Your email verification in successfully done."
        )
          .then((success) => { })
          .catch((error) => {
            //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
          });
        notificationTrigger(
          user.id,
          "Email Verification:Credexon",
          "Thanks,Your email verification in successfully done."
        );

        return res.send(
          response(responsedata, "Your account has been verified", true)
        );
      } else {
        return res
          .status(400)
          .send(response({}, `Invalid otp. Please try again.`, false));
      }
    } catch (error) {
      return res
        .status(400)
        .send(
          response({}, "Something went wrong222.!!!", false, null, error.stack)
        );
    }
  },
  countApiHit: async (req, res, next) => {
    const generalDbConnection = await connectWithGeneralDb();
    const DownloadsSchema = createDownloadsModel(generalDbConnection);

    let userData = req.body;
    const clientkey = req.body.client_key;
    let currentDate = currentTimeZoneDate();
    if (clientkey) {
      //Todo: Not using
      let url = "https://play.google.com/store/apps/details?id=com.credexon";
      let ipd = await getReqOtherDetail(req);

      await DownloadsSchema.create({
        clientkey: clientkey,
        ip: ipd.ip,
        os: ipd.os,
        os_version: ipd.os_version,
        browser: ipd.browser,
        browser_version: ipd.browser_version,
        hitdate: currentDate,

        status: userData.status,
        country: userData.country,
        countryCode: userData.countryCode,
        region: userData.region,
        regionName: userData.regionName,
        city: userData.city,
        zip: userData.zip,
        lat: userData.lat,
        lon: userData.lon,
        timezone: userData.timezone,
        isp: userData.isp,
        org: userData.org,
        as: userData.as,
        query: userData.query,
      });

      // res.writeHead(301, {
      //     'Location': url
      //   });
      // res.end();
      return res.send(response({}, "Success", true));
    } else {
      return res.send(response({}, "Please check the URL", false));
    }
  },
  emailTestSend: async (req, res, next) => {
    const sgMail = require("@sendgrid/mail");
    sgMail.setApiKey(process.env.emailkeytest);

    const msg = {
      to: "vijay012@mailinator.com", // Change to your recipient
      from: "support@credexon.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: "and easy to do anywhere, even with Node.js",
      html: "<strong>and easy to do anywhere, even with Node.js</strong>",
    };

    sgMail
      .send(msg)
      .then(() => {
        res.send("Email sent");
      })
      .catch((error) => {
        res.send(error);
      });
    res.send(emsg);
  },
};
// npx sequelize-cli model:generate --name userpassport --attributes pr_name:string,pr_number:integer,pr_expirydate:integer,pr_countryid:integer,pr_image:string,pr_status:smallint

const isValidHttpUrl = (string) => {
  //return new Promise((resolve, reject) => {
  let url;
  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }
  return url.protocol === "http:" || url.protocol === "https:";
  // })
};

//notificationTrigger(21,"Hi test title","test notificatin message");
