let sdb = require("../../models");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { Op } = require("sequelize");
const response = require("../../helper/response");

const config = require("../../config.json");
const paymenttransaction = require("../../mongo_models/paymenttransactionSchema");
const singleFileRequest = require("../../middleware/files.middleware");
const KycTrigger = require("../../middleware/kyctrigger");
const { notificationTrigger } = require("../../admin/controller/notificationcontroller");
const createMasterUsersModel = require("../../mongo_models_new/credexon_master/MasterUsersSchema");
const { fetchProfilePicUrl } = require("../../helper/common");
const { connectWithMasterDb, connectWithGeneralDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createGameSettingsModel = require("../../mongo_models_new/credexon_general/GameSettingsSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const createUserPanModel = require("../../mongo_models_new/credexon_vendor/UserPanSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createUserBankAccountsModel = require("../../mongo_models_new/credexon_vendor/UserBankAccountsSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createStateModel = require("../../mongo_models_new/credexon_general/StateSchema");
const createCitiesModel = require("../../mongo_models_new/credexon_general/CitiesSchema");
const { ObjectId } = require("bson");

const blacklist = new Set();

// Function to add a token to the blacklist
const blacklistToken = (token) => {
  blacklist.add(token);
};

const env = process.env;
module.exports = {
  authenticate: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;

      const userData = await db.User.findOne({
        where: {
          [Op.or]: [
            {
              usertype: config.role.admin,
              email: params.email,
            },
            {
              usertype: config.role.subadmin,
              email: params.email,
            },
          ],
        },
      });

      if (!userData) {
        return res.status(400).send(response({}, "Email is incorrect", false));
      } else {
        const connection = await connectWithGeneralDb();
        const GameSettingsSchema = createGameSettingsModel(connection);

        const user = await db.User.findOne({
          where: {
            [Op.or]: [
              {
                usertype: config.role.admin,
                email: params.email,
              },
              {
                usertype: config.role.subadmin,
                email: params.email,
              },
            ],
          },

          include: [
            {
              model: db.Userprofile,
              as: "user_profile",
              attributes: ["name", "profilepic"],
            },
          ],
        });

        let gameSettingsList = await GameSettingsSchema.find({});

        var user_image = "";

        if (user.user_profile.profilepic != "" && user.user_profile.profilepic != null) {
          let checkhttpurl = isValidHttpUrl(user.user_profile.profilepic);
          if (checkhttpurl) {
            user_image = user.user_profile.profilepic;
          } else {
            user_image = config.profile_url + user.user_profile.profilepic;
          }
        }

        if (!user || !(await bcrypt.compare(params.password, user.password))) {
          return res.status(400).send(response({}, "Password is incorrect", false));
        }

        if (!user || user.status === config.status.inactive) {
          return res.status(400).send(response({}, "Your account is not active.", false));
        }

        const token = jwt.sign(
          {
            sub: user.id,
            usertype: user.id,
          },
          config.secret,
          {
            expiresIn: "30d",
          }
        );

        user.dataValues.token = token;
        let url = "";
        if (user?.user_profile?.dataValues.profilepic == null) {
          url = null;
        } else {
          if (user?.user_profile?.dataValues?.profilepic != "" && user?.user_profile?.dataValues?.profilepic != null) {
            let checkhttpurl = isValidHttpUrl(user.user_profile.dataValues.profilepic);
            if (checkhttpurl) {
              url = user.user_profile.dataValues.profilepic;
            } else {
              url = `${env.awsimgurl}profile_doc/${user?.user_profile?.dataValues.profilepic}`;
            }
          }

          user.user_profile.dataValues.profilepic = url;
        }
        return res.send(response({ user, gameSettingsList }, `You are logged in successfully.`, true));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  create: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;

      // validate
      if (
        await db.User.findOne({
          where: {
            email: params.email,
          },
        })
      )
        return res.send(response({}, `Email already exist.`, false));

      if (
        await db.User.findOne({
          where: {
            phone: params.phone,
          },
        })
      )
        return res.send(response({}, `Phone number already exist.`, false));

      // hash password
      if (params.password) {
        params.password = await bcrypt.hash(params.password, 10);
      }

      // save user
      var userdetal = await db.User.create(params);
      var id = await userdetal.id;

      if (params.profilepic && params.name) {
        params.userid = id;
        await db.Userprofile.create(params);
      }

      const user = await db.User.findOne({
        where: {
          phone: params.phone,
        },
      });

      return res.send(response({}, `User created successfully.`, true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  forgotPassword: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];
      const params = req.body;

      const user = await db.User.findOne({
        where: {
          usertype: config.role.admin,
          phone: params.phone,
        },
      });

      if (!user) {
        return res.send(response({}, `Account doesn't exist.`, false));
      }

      if (user.status === config.status.inactive) {
        return res.send(response({}, `Your account is not active.`, false));
      }
      params.otp = 1234;
      Object.assign(user, params);
      await user.save();
      return res.send(response({}, "OTP has been sent successfully on your phone number.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  logout: async (req, res) => {
    try {
      const authHeader = req.headers["authorization"];
      let response_array = { status: "500", data: {}, message: "" };
      jwt.sign(authHeader, "", { expiresIn: 1 }, (logout, err) => {
        if (logout) {
          blacklistToken(authHeader);
          response_array.message = "You have been Logged Out";
          response_array.status = "200";
          res.send(response_array);
        } else {
          response_array.message = "Error";
          res.send(response_array);
        }
      });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  list_vendor: async (req, res) => {
    try {
      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);

      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;
      const searchname = req.query.searchname; //Todo: Sorting is commented from frontend side for all the components
      const recTyp = req.query.typ;
      const params = req.body;

      let condition = { usertype: config.role.user };
      let optUser = [];

      // Filter by email or phone
      if (params.email) optUser.push({ email: params.email });
      if (params.phone) optUser.push({ phone: params.phone });

      if (searchname && searchname !== "undefined") {
        condition["email"] = { $regex: searchname, $options: "i" };
      }

      // Additional filters based on recTyp
      if (!params.email && !params.phone) {
        if (recTyp == 2) {
          optUser.push({ isbankdverify: 2 }); //Todo: (06-Jan) What do we mean by this
        } else if (recTyp == 1) {
          optUser.push({ status: 1 });
        }
      } else if (recTyp == 3) {
        //Todo: (06-Jan) What do we mean by recTyp
        optUser.push({ devicetoken: { $ne: null } });
      } else if (recTyp == "undefined") {
        //Todo: Need to check if we are sending undefined from frontend
        optUser.push({ status: 1 });
      }

      // Filter by device token if provided
      if (params.devicetoken) {
        optUser.push({ devicetoken: { $ne: null } });
      }

      // Add optUser conditions to the main condition
      if (optUser.length > 0) {
        condition["$or"] = optUser;
      }

      let checkAdmin=await MasterUsersSchema.findOne({"apikey":req.user.apikey});
      let sCondition={};
      if(checkAdmin.usertype==0){
        sCondition={"usertype":{"$in":[2,3]}};
      }else{
        sCondition={"apikey":req.user.apikey}
      }
      
      const [users, total_count] = await Promise.all([
        MasterUsersSchema.find(sCondition)
          .select(
            "id name email phone usertype status apikey wallet_check_api deposit_api balance_api apikeyofvendor logo_url createdAt cricket football player_accumulator player_contest"
          )
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size),
        MasterUsersSchema.countDocuments(sCondition),
      ]);

      return res.send(response({ total_count, users }, "Data found succesfully.!!!", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  list: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const size = parseInt(req.query.size) || 10;

      const searchname = req.query.searchname;
      const recTyp = req.query.typ;
      const params = req.body;

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);

      //Todo: condition we are not using
      const condition = { usertype: config.role.user };
      const optUser = [];

      if (params.email) {
        optUser.push({ email: params.email });
      }
      if (params.phone) {
        optUser.push({ phone: params.phone });
      }

      if (searchname && searchname !== "undefined") {
        condition["email"] = { $regex: searchname, $options: "i" };
      }

      // Additional conditions based on recTyp
      if (!params.email && !params.phone && recTyp && recTyp !== "undefined") {
        if (recTyp == 2) {
          optUser.push({ isbankdverify: 2 });
        } else if (recTyp == 1) {
          optUser.push({ status: 1 });
        }
      } else if (recTyp == 3) {
        optUser.push({ devicetoken: { $ne: null } });
      } else if (recTyp == "undefined") {
        optUser.push({ status: 1 });
      }

      if (params.devicetoken) {
        optUser.push({ devicetoken: { $ne: null } });
      }

      const filter = optUser.length > 0 ? { $or: optUser } : { ...condition };

      const [users, totalCount] = await Promise.all([
        UsersSchema.find(filter)
          .select("isVerifed phone email country_code usertype isbankdverify ispanverify isphoneverify isemailverify status isIds name")
          .sort({ createdAt: -1 })
          .skip((page - 1) * size)
          .limit(size)
          .lean(),

        UsersSchema.countDocuments(filter),
      ]);

      const updatedUsers = users.map((user) => ({
        ...user,
        user_profile: { name: user.name || null },
        id: user._id,
      }));

      return res.send(
        response(
          {
            total_count: totalCount,
            users: updatedUsers,
          },
          "Data found succesfully.!!!",
          true
        )
      );
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  bank_list: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];

      const page = parseInt(req.query.page);
      const size = parseInt(req.query.size);
      let bank_list = await db.Userbankaccounts.findAll({
        attributes: ["userid", "bankname", "ifsccode", "acholdername", "acno", "isverified", "image"],
        order: [["createdAt", "DESC"]],
        offset: (page - 1) * size,
        limit: size,
      });
      return res.send(response(bank_list, "Data found successfully!.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  bank_verify: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];

      const params = req.body;

      let response_array = {
        status: false,
        data: {},
        message: "Data is not Update",
      };
      let send_array = {};
      let bank_array = {};
      if (params.isverified) {
        send_array.isbankdverify = params.isverified;
      }
      await db.User.update(send_array, { where: { id: params.userid } });
      if (params?.reject_reason) {
        bank_array.reject_reason == params.reject_reason;
        //Todo: We need to check all the db. schemas
        await db.Userbankaccounts.update(bank_array, {
          where: { userid: params.userid },
        });
        let userDetail = await db.User.findOne({
          where: {
            id: params.userid,
          },
        });

        if (userDetail?.email) {
          KycTrigger(userDetail?.email, "Bank KYC Rejected :Credexon", params.reject_reason)
            .then((success) => {})
            .catch((error) => {});
        }
        if (params.userid) {
          notificationTrigger(params.userid, "Bank KYC Rejected:Credexon", "Your Bank KYC Rejected!!!.");
        }
      }

      response_array.status = true;
      if (params.isverified == 1) {
        response_array.message = "Bank Verified Successfully!!!";
      } else if (params.isverified == 3) {
        response_array.message = "Bank Verification Rejected Successfully!!!";
      } else if (params.isverified == 2) {
        response_array.message = "Bank Verification pending.!";
      }
      return res.send(response_array);
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  activeInactiveuser: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const UsersSchema = createUsersModel(vendorDbConnection);
      const { id, status } = req.body;

      const updateResult = await UsersSchema.updateOne({ _id: id }, { $set: { status } });

      if (updateResult.modifiedCount === 0) {
        return res.send({ status: false, data: {}, message: "Data is not Update" });
      }

      const message = status == 1 ? "Team Member Activated Successfully!!!" : "Team Member Deactivated Successfully!!!";

      return res.send({ status: true, data: {}, message });
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  updateUser: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];

      const params = req.body;
      const { id } = req.user;
      const user = await db.User.findOne({
        where: {
          id: params.userId,
        },
      });

      if (!user) {
        return res.send(response({}, `Account doesn't exist.`, false));
      }

      Object.assign(user, params);

      return res.send(response({}, "User updated successfully.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  delete_user: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];

      const params = req.body;
      const user = await db.User.findOne({
        where: {
          id: params.user_id,
        },
      });

      if (!user) {
        return res.send(response({}, `User does not exist`, false));
      }
      await user.destroy();
      const usertemp = await db.Usertemp.findOne({
        where: {
          id: params.user_id,
        },
      });

      if (!usertemp) {
        return res.send(response({}, `User does not exist`, false));
      }
      await usertemp.destroy();
      return res.send(response({}, "User deleted successfully.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
  transaction_list: async (req, res) => {
    try {
      let payment_transaction_list = await paymenttransaction.findAll({});
      if (payment_transaction_list) {
        return res.send(response(payment_transaction_list, "payment transaction List", true));
      } else {
        return res.send(response({}, "payment transaction data not found.", false));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  payment_access: async (req, res) => {
    try {
      const params = req.body;
      let entity_data = params.payload.payment.entity;
      let sendData = {
        transaction_id: entity_data.id,
        account_id: params.account_id,
        entity: entity_data.entity,
        amount: entity_data.amount,
        currency: entity_data.currency,
        status: entity_data.status,
        order_id: entity_data.order_id,
        invoice_id: entity_data.invoice_id,
        international: entity_data.international,
        method: entity_data.method,
        amount_refunded: entity_data.amount_refunded,
        refund_status: entity_data.refund_status,
        captured: entity_data.captured,
        description: entity_data.description,
        card_id: entity_data.card_id,
        bank: entity_data.bank,
      };
      await paymenttransaction.create(sendData);
      return res.send(response({}, "payment transaction get successfully.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  user_detail: async (req, res) => {
    try {
      const Cryptr = require("cryptr");
      const cryptr = new Cryptr("myTotalySecretKey");

      const generalDbConnection = await connectWithGeneralDb();
      const StateSchema = createStateModel(generalDbConnection);
      const CitySchema = createCitiesModel(generalDbConnection);

      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
      const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);
      const UserPanSchema = createUserPanModel(vendorDbConnection);
      const UsersSchema = createUsersModel(vendorDbConnection);
      const UserBankAccountsSchema = createUserBankAccountsModel(vendorDbConnection);
      const TransactionsSchema = createTransactionsModel(vendorDbConnection);

      const params = req?.body;

      //Todo: stateid but i think we should display state
      const userDetail = await UsersSchema.findOne(
        { _id: params?.userid },
        {
          _id: 0,
          id: "$_id",
          country_code: 1,
          phone: 1,
          email: 1,
          refercode: 1,
          status: 1,
          walletbalance: 1,
          wltwin: 1,
          wltbns: 1,
          wltdept: 1,
          isVerifed: 1,
          isCompleteProfile: 1,
          isbankdverify: 1,
          ispanverify: 1,
          isphoneverify: 1,
          isemailverify: 1,
          istnameedit: 1,
          welbns: 1,
          totaljoinfee: 1,
          totaltds: 1,
          wltbaltds: 1,
          totaljoinfeedepots: 1,
          totaljoinfeewin: 1,
          wltwithdraw: 1,
          gst: 1,
          name: 1,
          gender: 1,
          dob: 1,
          address: 1,
          pincode: 1,
          cityid: 1,
          stateid: 1,
          profilepic: 1,
        }
      ).lean();

      // Fetch the bank details separately and add to userDetail
      const userBankAccount = await UserBankAccountsSchema.findOne({ userid: params?.userid }).select("bankname ifsccode acholdername acno upi image").lean();

      if (!userDetail) {
        return res.send(response({}, "User does not exist", false));
      }

      userDetail.user_profile = {
        userid: userDetail.id,
        name: userDetail.name || "",
        gender: userDetail.gender || "",
        dob: userDetail.dob || "",
        address: userDetail.address || "",
        pincode: userDetail.pincode || "",
        cityid: userDetail.cityid || "",
        stateid: userDetail.stateid || "",
        profilepic: userDetail.profilepic || "",
      };

      userDetail.userbank_account = userBankAccount;

      // Decrypt account number
      if (userDetail.userbank_account && userDetail.userbank_account.acno) {
        userDetail.userbank_account.acno = cryptr.decrypt(userDetail.userbank_account.acno);
      }

      // Set image URL
      if (userDetail.userbank_account && userDetail.userbank_account.image) {
        userDetail.userbank_account.image = `${env.awsimgurl}profile_doc/${userDetail.userbank_account.image}`;
      }

      // Replace state and city IDs with names
      if (userDetail.user_profile && userDetail.user_profile.stateid) {
        //StateSchema
        const userState = await StateSchema.findOne({
          _id: userDetail.user_profile.stateid,
        }).lean();

        if (userState) {
          userDetail.user_profile.stateid = userState?.name || "";
        }
      }

      if (userDetail.user_profile && userDetail.user_profile.cityid) {
        const userCity = await CitySchema.findOne({
          _id: userDetail.user_profile.cityid,
        }).lean();
        if (userCity) {
          userDetail.user_profile.cityid = userCity?.city || "";
        }
      }

      // Set profile picture URL
      if (userDetail.user_profile && userDetail.user_profile.profilepic) {
        if (!isValidHttpUrl(userDetail.user_profile.profilepic)) {
          userDetail.user_profile.profilepic = `${env.awsimgurl}profile_doc/${userDetail.user_profile.profilepic}`;
        }
      }

      const panDetail = await UserPanSchema.findOne({
        userid: params.userid,
      });

      const totalContests = await JoinMatchContestsSchema.countDocuments({ userid: params.userid });
      const contestsWon = await JoinMatchContestsSchema.countDocuments({ userid: params.userid, winamt: { $gt: 0 } });
      const plyAccCount = await JoinAccPlayersSchema.countDocuments({ userid: params.userid });
      const plyAccWon = await JoinAccPlayersSchema.countDocuments({ userid: params.userid, winamt: { $gt: 0 } });
      const totalWithdrawal = await TransactionsSchema.countDocuments({
        userid: params.userid,
        atype: "bal_wtd_req_succ",
      });
      const totalDeposit = await TransactionsSchema.countDocuments({
        userid: params.userid,
        atype: "bal_add",
      });

      userDetail.totalContests = totalContests || 0;
      userDetail.contestsWon = contestsWon || 0;
      userDetail.plyAccCount = plyAccCount || 0;
      userDetail.plyAccWon = plyAccWon || 0;
      userDetail.TotalWithdrawal = totalWithdrawal || 0;
      userDetail.TotalDeposit = totalDeposit || 0;
      userDetail.use_pan = panDetail || 0;

      return res.send(response(userDetail, "User detail fetched successfully.", true));
    } catch (error) {
      console.error(error.stack);
      return res.status(400).send(response({}, "Something went wrong.", false, null, error.stack));
    }
  },

  change_password: async (req, res) => {
    try {
      const params = req.body;
      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);

      let user = await MasterUsersSchema.findOne({
        apikey: req.user.apikey,
      });

      if (!user || !(await bcrypt.compare(params.old_password, user.password))) {
        return res.send(response({}, `Old password is incorrect.`, false));
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(params.new_password, 10);

      await MasterUsersSchema.updateOne(
        { apikey: req.user.apikey }, // Query condition
        { $set: { password: hashedPassword } }
      );

      return res.send(response({}, "password change successfully.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  update_profile: async (req, res) => {
    try {
      const params = req.body;
      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);

      let form_datas = {};
      if (params.name) {
        form_datas.profilename = params.name;
      }

      let files = req.files;

      //Todo: Need to move this into comman
      if (Object.keys(files).length > 0) {
        let files_detail = {
          files: files,
          img_name: files.profilepic,
          folder_name: "profile_doc",
        };

        file_name = await singleFileRequest(files_detail);
        form_datas.profilepic = file_name;
      }

      const updatedUser = await MasterUsersSchema.findByIdAndUpdate(
        req.user.userId, // The ID of the user
        { $set: form_datas },
        { new: true, runValidators: true }
      ).select("profilepic profilename");

      if (!updatedUser) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
      }

      const userdeatail = {
        userid: req.user.userId,
        profilepic: updatedUser.profilepic ? fetchProfilePicUrl(updatedUser.profilepic) : null,
        name: updatedUser.profilename,
      };

      return res.status(200).send(response({ userdeatail }, "Profile Updated successfully!!!.", true));
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  user_withdrawal_request: async (req, res) => {
    try {
      let db = (await sdb())[global.gdbname[req.user.apikey]];

      let transId = req.body.transId;
      let transType = req.body.type;

      console.log("payoutTyp", req.body.payoutTyp);
      const trans_list = await db.Transactions.findOne({
        where: {
          id: transId,
        },
      });
      const trans_tds = await db.Transactions.findOne({
        where: {
          tid: transId,
        },
      });

      //trans_tds.dataValues=(trans_tds && trans_tds.dataValues)?trans_tds.dataValues:{}
      let userId = trans_list.dataValues.userid;
      let amount = trans_list.dataValues.amount;
      let amounttds = trans_tds ? trans_tds.dataValues.amount : 0;
      let total_amt = amount + amounttds;

      let userDetail = await db.User.findOne({
        where: {
          id: userId,
        },
      });
      //return res.send(response({}, "This is wrong transaction.", false))
      if (trans_list.dataValues.atype === "bal_wtd_req") {
        if (transType === "accept") {
          if (req.body.payoutTyp != 3) {
            const CheckAccNo = await db.Userbankaccounts.findOne({
              where: {
                userid: userId,
              },
            });
            if (req?.body?.payoutTyp == 2) {
              if (CheckAccNo?.dataValues.upi == null) {
                return res.send(response({}, "Invalid UPI ID.", false));
              }
            }
            const Cryptr = require("cryptr");
            const cryptr = new Cryptr("myTotalySecretKey");
            let decrypt = "";
            if (CheckAccNo?.dataValues.acno == null) {
              decrypt = null;
            } else {
              decrypt = cryptr.decrypt(CheckAccNo?.dataValues?.acno);
              CheckAccNo.dataValues.acno = decrypt;
            }
            let payloadData = {};
            let urlPayout = "";
            if (req.body.payoutTyp == 1) {
              urlPayout = "https://kepler.haodapayments.com/api/v1/payout/initiate";
              payloadData = {
                bankname: CheckAccNo.dataValues.bankname,
                account_ifsc: CheckAccNo.dataValues.ifsccode,
                acholdername: CheckAccNo.dataValues.acholdername,
                account_number: decrypt,
                confirm_acc_number: decrypt,
                requesttype: "IMPS",
                beneficiary_name: "credexon",
                amount: amount,
                narration: "User Withdraw request accepted",
                userid: CheckAccNo.dataValues.userid,
                reference: new Date() * 1 + CheckAccNo.dataValues.userid,
              };
            } else {
              urlPayout = "https://kepler.haodapayments.com/api/v1/upi/payout/initiate";
              payloadData = {
                vpa: CheckAccNo.dataValues.upi,
                beneficiary_name: "credexon",
                amount: amount,
                narration: "User Withdraw request accepted",
                reference: new Date() * 1 + CheckAccNo.dataValues.userid,
              };
            }
            console.log("bank payload data", payloadData);
            //   return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
            //  axios key
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
                console.log("UPI RES", result);
                if (result?.data?.status_code == 200) {
                  await db.Transactions.update({ atype: "bal_wtd_req_succ", ttype: "dr" }, { where: { id: transId } });

                  if (userDetail?.email) {
                    KycTrigger(userDetail?.email, "Withdrawal Status:Credexon", "Your withdrawal request accept successfully!!!")
                      .then((success) => {})
                      .catch((error) => {});
                  }
                  if (userId) {
                    notificationTrigger(userId, "Withdrawal Status:Credexon", "Your withdrawal request accept successfully!!!.");
                  }
                  return res.status(200).send(response({}, "Transaction accept successfully!!!.", true));
                } else {
                  return res.status(400).send(response({}, result?.data?.message, false));
                }
              })
              .catch(function (error) {
                console.log("error--->>", error);
                return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
              });
          } else {
            await db.Transactions.update({ atype: "bal_wtd_req_succ", ttype: "dr" }, { where: { id: transId } });

            if (userDetail?.email) {
              KycTrigger(userDetail?.email, "Withdrawal Status:Credexon", "Your withdrawal request accept successfully!!!")
                .then((success) => {})
                .catch((error) => {});
            }
            if (userId) {
              notificationTrigger(userId, "Withdrawal Status:Credexon", "Your withdrawal request accept successfully!!!.");
            }
            return res.status(200).send(response({}, "Transaction accept successfully!!!.", true));
          }
        } else if (transType === "decline") {
          //let walbal=userDetail.walletbalance+amount;
          //let walwin=userDetail.wltwin+total_amt;
          //"walletbalance": walbal,

          await db.User.update(
            {
              wltwin: userDetail["wltwin"] + total_amt,
              wltwithdraw: userDetail["wltwithdraw"] - amount,
              totaltds: userDetail["totaltds"] - amounttds,
              wltbaltds: userDetail["wltbaltds"] - amounttds,
            },
            { where: { id: userId } }
          );

          await db.Transactions.update({ atype: "bal_wtd_req_decln", ttype: "no" }, { where: { id: transId } });
          if (trans_tds) {
            await db.Transactions.update({ atype: "bal_wtd_tds_decln", ttype: "no" }, { where: { tid: transId } });
          }

          if (userDetail?.email) {
            KycTrigger(userDetail?.email, "Withdrawal Status:Credexon", "Your withdrawal request decline!!!")
              .then((success) => {})
              .catch((error) => {});
          }
          if (userId) {
            notificationTrigger(userId, "Withdrawal Status:Credexon", "Your withdrawal request decline!!!.");
          }

          return res.status(200).send(response({}, "Transaction decline successfully!!!.", true));
        }
      } else {
        return res.send(response({}, "This is wrong transaction.", false));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },

  get_theme_customization: async (req, res) => {
    try {
      const userId = ObjectId(req.body.userid);

      // List of fields to retrieve
      const fieldsToRetrieve = [
        "cricket",
        "football",
        "player_accumulator",
        "player_contest",
        "background_color",
        "feature_box_bg",
        "background_light",
        "border_color",
        "circle_color",
        "contest_block_bg",
        "dark_text",
        "faq_border",
        "font_secondary",
        "light_secondary_color",
        "primary_color",
        "progress_color",
        "secondary_color",
        "secondary_dark_color",
        "table_header",
        "input_bg",
        "font_primary",
      ];

      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);
      // Fetch user theme profile from database
      let datachanged = await MasterUsersSchema.findOne({ _id: userId }, fieldsToRetrieve);

      if (!datachanged) {
        return res.status(404).send(response({}, "No theme profile found for the user.", false));
      }
      
      // Send response
      return res.status(200).send(response({ datachanged }, "Theme profile fetched successfully.", true));
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      return res.status(400).send(response({}, "Something went wrong!!!", false, null, error.stack));
    }
  },
  update_theme_profile: async (req, res) => {
    try {
      const params = req.body;
      console.log("Received params:", params);

      // Define form data object with default user id
      let form_datas = { id: params._id };

      // List of possible fields to update
      const fieldsToUpdate = [
        // "cricket",
        // "football",
        // "player_accumulator",
        // "player_contest",
        "background_color",
        "feature_box_bg",
        "background_light",
        "border_color",
        "circle_color",
        "contest_block_bg",
        "dark_text",
        "faq_border",
        "font_secondary",
        "light_secondary_color",
        "primary_color",
        "progress_color",
        "secondary_color",
        "secondary_dark_color",
        "table_header",
        "input_bg",
        "font_primary",
      ];

      let viewMasterData = {};
      // Loop through fields and update form_datas if params contain the field
      fieldsToUpdate.forEach((field) => {
        viewMasterData[field] = 1;
        if (params[field] !== undefined && params[field] !== null) {
          form_datas[field] = params[field];
        }
      });

      console.log("Form data to update:", form_datas);

      const connection = await connectWithMasterDb();
      const MasterUsersSchema = createMasterUsersModel(connection);
      // Check if user already has theme profile settings
      let masterusers = await MasterUsersSchema.findOne({ _id: ObjectId(params._id) });
      console.log("Existing user data:", masterusers);

      // Update or create based on existence of masterusers record
      if (masterusers) {
        await MasterUsersSchema.update({ _id: ObjectId(params._id) }, form_datas);
      } else {
        await MasterUsersSchema.create(form_datas);
      }

      // Fetch updated data from database to send back in response
      let datachanged = await MasterUsersSchema.findOne(
        { _id: ObjectId(params._id) },
        viewMasterData // Return only specified attributes
      );

      console.log("Updated data from database:", datachanged);

      // Send response
      return res.status(200).send(response({ datachanged }, "Profile Updated successfully!!!", true));
    } catch (error) {
      // Handle errors
      console.error("Error:", error);
      return res.status(400).send(response({}, "Something went wrong!!!", false, null, error.stack));
    }
  },
  user_tds_request: async (req, res) => {
    try {
      const dbName = req.user.dbName;
      const vendorDbConnection = await connectWithVendorDb(dbName);
      const TransactionsSchema = createTransactionsModel(vendorDbConnection);

      let transId = req.body.transId;

      const trans_withd_check = await TransactionsSchema.findOne({
        _id: transId,
        atype: "bal_wtd_req_succ",
      });

      if (trans_withd_check) {
        await TransactionsSchema.updateOne({ tid: transId }, { $set: { atype: "bal_wtd_tds_succ" } });

        return res.status(200).send(response({}, "TDS accepted successfully!", true));
      } else {
        return res.send(response({}, "Please accept the withdrawal request first.", false));
      }
    } catch (error) {
      return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
  },
};
