const mongoose = require("mongoose");
const { literal } = require("sequelize");
const response = require("../../helper/response");
let sdb = require("../../models");
const { format } = require("@fast-csv/format");
const fs = require("fs");
const path = require("path");
const { transDes, dateTimeChangeFor, dateTimeChange, currentTimeZoneDate } = require("../../helper/common");
const { Op } = require("sequelize");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const { connectWithCricketDb, connectWithFootballDb, connectWithVendorDb } = require("../../config/mongodb_connections");
const createUpcomingCricketModel = require("../../mongo_models_new/credexon_cricket/UpcomingCricketsSchema");
const createFbUpcomingsModel = require("../../mongo_models_new/credexon_football/FbUpcomingsSchema");
const createJoinMatchContestsModel = require("../../mongo_models_new/credexon_vendor/JoinMatchContestsSchema");
const createJoinAccPlayersModel = require("../../mongo_models_new/credexon_vendor/JoinAccPlayersSchema");
const createPoolModel = require("../../mongo_models_new/credexon_vendor/PoolSchema");
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const createUsersModel = require("../../mongo_models_new/credexon_vendor/UsersSchema");
const createReportFilesModel = require("../../mongo_models_new/credexon_vendor/ReportFilesSchema");

// get match list  for admin report
let get_match_list = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    let offset = (page - 1) * size;
    // let skip = page * size;
    let rstatus = req.body.rstatus;
    let game_type = req.body.game_type;
    let match_name = req.body.match_name;
    let league_id = req.body.league_id;

    if (!game_type) {
      return res.send(response({}, "Select Game Type", false, null, null));
    }

    let condition = {};

    if (rstatus) {
      condition["rstatus"] = rstatus;
    }

    if (league_id) {
      if (game_type === "ckt") {
        condition["cid"] = parseInt(league_id);
      } else if (game_type === "fb") {
        condition["season_id"] = parseInt(league_id);
      }
    } else {
      condition["is_publish"] = 1; // Need to manage with publish schema
    }

    if (match_name) {
      condition["title"] = new RegExp(match_name, "i");
    }

    console.log("condition===>>>", condition);

    let find_table_name;
    if (game_type === "ckt") {
      const cktDbConnection = await connectWithCricketDb();
      const UpcomingCricketsSchema = createUpcomingCricketModel(cktDbConnection);

      find_table_name = await UpcomingCricketsSchema.find(condition, { match_id: 1, title: 1, date_start_ist: 1 }).sort({ date_start_ist: 1 })//.limit(size);
      
    } else {
      const footballDbConnection = await connectWithFootballDb();
      const FbUpcomingsSchema = createFbUpcomingsModel(footballDbConnection);

      find_table_name = await FbUpcomingsSchema.aggregate([
        { $match: condition },
        { $project: { match_id: 1, title: { $concat: ["$teama.name", " vs ", "$teama.name"] }, date_start_ist: 1 } },
      ]);
    }

    //let match_list = await find_table_name.find(condition,{"match_id":1,"title":1,"date_start_ist":1}).sort({date_start_ist:-1}).limit(size);

    let match_list = find_table_name;

    return res.send(
      response(
        {
          match_list: match_list,
          status: match_list.length > 0 ? true : false,
        },
        match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
      )
    );
  } catch (error) {
    return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
  }
};

// get game contest type
let get_game_contest_type = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const size = parseInt(req.query.size);
    let offset = (page - 1) * size;
    // let skip = page * size;
    let currentDate = currentTimeZoneDate();
    let game_contest_type = await gameaccs.find({}).skip(offset).limit(size);

    // count
    let total_count = await find_table_name.count({
      rstatus: 1,
      is_players: 1,
      date_start_ist: {
        $gt: currentDate,
      },
    });

    return res.send(
      response(
        {
          total_count: total_count,
          match_list: match_list,
          status: match_list.length > 0 ? true : false,
        },
        match_list.length > 0 ? "Match view succesfully.!!!" : "No data found.!!!"
      )
    );
  } catch (error) {
    return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
  }
};

// test  get pool data
let get_report_data = async (req, res) => {
  try {
    let result = await reportData(req, false);
    return res.send(result);
  } catch (error) {
    return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
  }
};

const get_report_download = async (req, res) => {
  const { dbName } = req.user;
  const vendorDbConnection = await connectWithVendorDb(dbName);
  const ReportFileSchema = createReportFilesModel(vendorDbConnection);

  res.send(response([], "Your file is being generating. Please check the available downloads later.", true));

  let result = await reportData(req, true);

  const userList = result.data.userList;
  const listView = result.data.header;
  const transDescrip = result.data.transDes;

  const fileName = `${req.query.type}_${Date.now()}.csv`;
  const dirPath = path.join(__dirname, "..", "..", "upload", `${req.user._id}`, `reports-downloads`);

  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  const filePath = path.join(dirPath, fileName);
  const writeStream = fs.createWriteStream(filePath);

  const csvStream = format({ headers: listView.map((h) => h.title) });

  csvStream.pipe(writeStream);

  for (let i = 0; i < userList.length; i++) {
    const data = userList[i];
    const row = {};

    listView.forEach((item) => {
      let value = "";

      if (item.id === "c_no") {
        value = i + 1;
      } else if (item.id === "status") {
        value = data[item.c1] === 1 ? "Active" : "Inactive";
      } else if (item.id === "atype") {
        value = transDescrip[data[item.id]];
      } else if (item.id === "gstamt") {
        const amount = parseFloat(data["amount"]) || 0;
        value = ((amount * 18) / 100).toFixed(2);
      } else if (item.c == 2) {
        value = data[item.c1]?.[item.c2] || "";
      } else {
        const val = data[item.id] ?? data[item.c1];
        value = typeof val === "number" ? val.toFixed(2) : val;
      }

      row[item.title] = value;
    });

    csvStream.write(row);
  }

  csvStream.end();

  writeStream.on("finish", () => {
    // Store File Metadata in MongoDB
    ReportFileSchema.create({
      userId: req.user._id,
      filePath: filePath,
      fileName: fileName,
      fileSize: fs.statSync(filePath).size,
      format: "xlsx",
      status: "completed",
    });
  });

  writeStream.on("error", (err) => {
    console.error("File write error:", err);
    res.status(500).send("Error writing CSV file.");
  });
};

const getDownloadableFiles = async (req, res) => {
  try {
    const { dbName } = req.user;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const ReportFileSchema = createReportFilesModel(vendorDbConnection);
    const files = await ReportFileSchema.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.send(response(files, "Success.", true));
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching files" });
  }
};

const downloadFile = async (req, res) => {
  try {
    const { dbName } = req.user;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const ReportFileSchema = createReportFilesModel(vendorDbConnection);
    const file = await ReportFileSchema.findOne({ _id: req.params.fileId, userId: req.user._id });
    if (!file) {
      return res.send(response([], "File not found", false));
    }

    res.download(file.filePath, file.fileName);
  } catch (error) {
    return res.send(response([], "Error downloading file", false));
  }
};
const deleteAllFiles = async (req, res) => {
  try {
    const userId = req.user._id;
    const { dbName } = req.user;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const ReportFileSchema = createReportFilesModel(vendorDbConnection);

    const userFiles = await ReportFileSchema.find({ userId });

    userFiles.forEach((file) => {
      const filePath = file?.filePath;
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath); // Remove file from the server
        }
      } catch (err) {}
    });

    await ReportFileSchema.deleteMany({ userId });

    // Delete files which may still left in directory but deleted from
    try {
      const dirPath = path.join(__dirname, "..", "..", "upload", `${userId}`, "reports-downloads");
      if (fs.existsSync(dirPath)) fs.rmSync(dirPath, { recursive: true, force: true });
    } catch (err) {}

    return res.send(response([], "All report files deleted successfully.", true));
  } catch (error) {
    console.error("Delete error:", error);
    return res.send(response([], "Internal server error", false));
  }
};

const reportData = async (req, exp) => {
  const dbName = req.user.dbName;
  const vendorDbConnection = await connectWithVendorDb(dbName);
  const UsersSchema = createUsersModel(vendorDbConnection);
  const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
  const JoinAccPlayersSchema = createJoinAccPlayersModel(vendorDbConnection);
  const TransactionsSchema = createTransactionsModel(vendorDbConnection);

  const match_status = [
    {
      rstatus: 1,
      name: "UpComing",
    },
    {
      rstatus: 2,
      name: "Live",
    },
    {
      rstatus: 3,
      name: "Result",
    },
    {
      rstatus: 4,
      name: "Cancelled",
    },
  ];

  let params = exp === true ? req.query : req.body;

  const page = req.query.page && req.query.page > 0 ? parseInt(req.query.page) : 0;
  const size = req.query.size && req.query.size > 0 ? parseInt(req.query.size) : 0;

  const mongoLimit = exp === true ? [{ $skip: 0 }] : [{ $skip: page * size }, { $limit: size }];
  ///////////////////////////////  gtype
  let label = exp === true ? "title" : "label";
  let listView = {
    user_wallet: [
      { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
      { id: "email", c: 1, c1: "email", c2: "", [label]: "Email Address", alignRight: false },
      { id: "country_code", c: 1, c1: "country_code", c2: "", [label]: "Country Code", alignRight: false },
      { id: "phone", c: 1, c1: "phone", c2: "", [label]: "Phone Number", alignRight: false },
      { id: "name", c: 2, c1: "user_profile", c2: "name", [label]: "Name", alignRight: false },
      { id: "status", c: 1, c1: "status", c2: "", [label]: "Status", alignRight: false },
      { id: "walletbalance", c: 1, c1: "walletbalance", c2: "", [label]: "Amount Deposite", alignRight: false },
      { id: "totalwin", c: 1, c1: "totalwin", c2: "", [label]: "Total Winning", alignRight: false },
      { id: "wltwin", c: 1, c1: "wltwin", c2: "", [label]: "Win Balance", alignRight: false },
      { id: "wltbns", c: 1, c1: "wltbns", c2: "", [label]: "Bonus", alignRight: false },
      { id: "wltwithdraw", c: 1, c1: "wltwithdraw", c2: "", [label]: "Total withdrawal", alignRight: false },
      { id: "totaljoinfeedepots", c: 1, c1: "totaljoinfeedepots", c2: "", [label]: "Total Join Fee", alignRight: false },
      { id: "totaltds", c: 1, c1: "totaltds", c2: "", [label]: "Total TDS", alignRight: false },
      { id: "wltbaltds", c: 1, c1: "wltbaltds", c2: "", [label]: "TDS Balance", alignRight: false },
      { id: "createdAt", c: 1, c1: "createdAt", c2: "", [label]: "Registered", alignRight: false },
    ],
  };

  if (params.gameKey === "plyacc") {
    listView["transaction"] = [
      { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
      { id: "userid", c: 1, c1: "userid", c2: "", [label]: "User Id", alignRight: false },
      { id: "email", c: 2, c1: "user", c2: "email", [label]: "Email Address", alignRight: false },
      { id: "country_code", c: 2, c1: "user", c2: "country_code", [label]: "Country Code", alignRight: false },
      { id: "phone", c: 2, c1: "user", c2: "phone", [label]: "Phone Number", alignRight: false },
      { id: "gstamt", c: 1, c1: "gstamt", c2: "", [label]: "GST Amount", alignRight: false },
      { id: "amount", c: 1, c1: "amount", c2: "", [label]: "Amount", alignRight: false },
      { id: "txid", c: 1, c1: "txid", c2: "", [label]: "txid", alignRight: false },
      { id: "gtype", c: 1, c1: "gtype", c2: "", [label]: "Game Type", alignRight: false },
      { id: "updatedAt", c: 1, c1: "updatedAt", c2: "", [label]: "Date", alignRight: false },
      { id: "ttype", c: 1, c1: "ttype", c2: "", [label]: "ttype", alignRight: false },
      { id: "atype", c: 1, c1: "atype", c2: "", [label]: "atype", alignRight: false },
    ];
  } else {
    listView["transaction"] = [
      { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
      { id: "userid", c: 1, c1: "userid", c2: "", [label]: "User Id", alignRight: false },
      { id: "email", c: 2, c1: "user", c2: "email", [label]: "Email Address", alignRight: false },
      { id: "country_code", c: 2, c1: "user", c2: "country_code", [label]: "Country Code", alignRight: false },
      { id: "phone", c: 2, c1: "user", c2: "phone", [label]: "Phone Number", alignRight: false },
      { id: "amount", c: 1, c1: "amount", c2: "", [label]: "Amount", alignRight: false },
      { id: "txid", c: 1, c1: "txid", c2: "", [label]: "txid", alignRight: false },
      { id: "gtype", c: 1, c1: "gtype", c2: "", [label]: "Game Type", alignRight: false },
      { id: "updatedAt", c: 1, c1: "updatedAt", c2: "", [label]: "Date", alignRight: false },
      { id: "ttype", c: 1, c1: "ttype", c2: "", [label]: "ttype", alignRight: false },
      { id: "atype", c: 1, c1: "atype", c2: "", [label]: "atype", alignRight: false },
    ];
  }

  //'userid', 'atype', 'gtype','email', 'phone', 'country_code','user.id'
  listView["account_statement_old"] = [
    { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
    { id: "gst", c: 1, c1: "gst", c2: "", [label]: "GST", alignRight: false },
    { id: "deposite_without_gst", c: 1, c1: "deposite_without_gst", c2: "", [label]: "Deposite without GST", alignRight: false },
    { id: "platformfee", c: 1, c1: "platformfee", c2: "", [label]: "Platform fees", alignRight: false },
    { id: "acc_entryfee", c: 1, c1: "acc_entryfee", c2: "", [label]: "Accumulator Entry Fees", alignRight: false },
    { id: "acc_win", c: 1, c1: "acc_win", c2: "", [label]: "Accumulator Win", alignRight: false },
    { id: "mcont_entryfee", c: 1, c1: "mcont_entryfee", c2: "", [label]: "Match Contest Entry Fees", alignRight: false },
    { id: "mcont_win", c: 1, c1: "mcont_win", c2: "", [label]: "Match Contest Win", alignRight: false },
    { id: "join_bal", c: 1, c1: "join_bal", c2: "", [label]: "From Join Deposite Balance", alignRight: false },
    { id: "join_bns", c: 1, c1: "join_bns", c2: "", [label]: "From Join Bonus", alignRight: false },
    { id: "join_win", c: 1, c1: "join_win", c2: "", [label]: "From Join Winning", alignRight: false },
    { id: "cancel_bal", c: 1, c1: "cancel_bal", c2: "", [label]: "Cancel Deposite Balance", alignRight: false },
    { id: "cancel_bns", c: 1, c1: "cancel_bns", c2: "", [label]: "Cancel Bonus", alignRight: false },
    { id: "cancel_bns_expire", c: 1, c1: "cancel_bns_expire", c2: "", [label]: "Cancel Bonus Expire", alignRight: false },
    { id: "cancel_win", c: 1, c1: "cancel_win", c2: "", [label]: "Cancel Win", alignRight: false },
    { id: "add_amt_bonus", c: 1, c1: "add_amt_bonus", c2: "", [label]: "Add Amount Bonus", alignRight: false },
    { id: "refer_bns", c: 1, c1: "refer_bns", c2: "", [label]: "Refer Bonus", alignRight: false },
    { id: "wel_bns", c: 1, c1: "wel_bns", c2: "", [label]: "Welcome Bonus", alignRight: false },
    { id: "bal_wtd_req_succ", c: 1, c1: "bal_wtd_req_succ", c2: "", [label]: "Balance Withdrawal Request Success", alignRight: false },
    { id: "bal_wtd_tds_succ", c: 1, c1: "bal_wtd_tds_succ", c2: "", [label]: "Balance Withdrawal TDS Success", alignRight: false },
    { id: "userid", c: 1, c1: "userid", c2: "", [label]: "User Id.", alignRight: false },
    { id: "email", c: 1, c1: "email", c2: "", [label]: "Email ID", alignRight: false },
    { id: "country_code", c: 1, c1: "country_code", c2: "", [label]: "Country Code", alignRight: false },
    { id: "phone", c: 1, c1: "phone", c2: "", [label]: "Phone No.", alignRight: false },
    { id: "createdAt", c: 1, c1: "createdAt", c2: "", [label]: "Registered", alignRight: false },
    { id: "updatedAt", c: 1, c1: "updatedAt", c2: "", [label]: "Activated", alignRight: false },
    { id: "totalwith", c: 1, c1: "totalwith", c2: "", [label]: "Total Withdrawal", alignRight: false },
    { id: "totalbal", c: 1, c1: "totalbal", c2: "", [label]: "Current Balance deposite", alignRight: false },
    { id: "totalwinbal", c: 1, c1: "totalwinbal", c2: "", [label]: "Current Win Balance", alignRight: false },
    { id: "full_name", c: 1, c1: "full_name", c2: "", [label]: "PAN Full Name", alignRight: false },
    { id: "pan_number", c: 1, c1: "pan_number", c2: "", [label]: "PAN No.", alignRight: false },
  ];

  listView["account_statement"] = [
    { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
    { id: "userid", c: 1, c1: "userid", c2: "", [label]: "User Id.", alignRight: false },
    { id: "full_name", c: 1, c1: "full_name", c2: "", [label]: "PAN Full Name", alignRight: false },
    { id: "pan_number", c: 1, c1: "pan_number", c2: "", [label]: "PAN No.", alignRight: false },
    { id: "email", c: 1, c1: "email", c2: "", [label]: "Email ID", alignRight: false },
    { id: "phone", c: 1, c1: "phone", c2: "", [label]: "Phone No.", alignRight: false },
    { id: "txdate", c: 1, c1: "txdate", c2: "", [label]: "Date", alignRight: false },
    { id: "platformfee", c: 1, c1: "platformfee", c2: "", [label]: "Platform fees", alignRight: false },
    { id: "acc_entryfee", c: 1, c1: "acc_entryfee", c2: "", [label]: "Accumulator Entry Fees", alignRight: false },
    { id: "mcont_entryfee", c: 1, c1: "mcont_entryfee", c2: "", [label]: "Match Contest Entry Fees", alignRight: false },
    { id: "deposite_without_gst", c: 1, c1: "deposite_without_gst", c2: "", [label]: "Deposite without GST", alignRight: false },
    { id: "gst", c: 1, c1: "gst", c2: "", [label]: "GST", alignRight: false },
    { id: "txid", c: 1, c1: "txid", c2: "", [label]: "Tx Id", alignRight: false },
  ];

  if (params.gameKey === "mplycont") {
    listView["match_data"] = [
      { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
      { id: "_id", c: 1, c1: "_id", c2: "", [label]: "Join ID", alignRight: false },
      { id: "match_id", c: 1, c1: "match_id", c2: "", [label]: "Match Id", alignRight: false },
      { id: "match_name", c: 1, c1: "match_name", c2: "", [label]: "Match Name", alignRight: false },
      { id: "match_date", c: 1, c1: "match_date", c2: "", [label]: "Match Date", alignRight: false },
      { id: "match_format", c: 1, c1: "match_format", c2: "", [label]: "Match Format", alignRight: false },
      { id: "match_status", c: 1, c1: "match_status", c2: "", [label]: "Match Status", alignRight: false },
      { id: "joindate", c: 1, c1: "joindate", c2: "", [label]: "Join Date", alignRight: false },
      { id: "joinfee", c: 1, c1: "joinfee", c2: "", [label]: "Join Fee", alignRight: false },
      { id: "c", c: 1, c1: "c", c2: "", [label]: "Total Winning", alignRight: false },
      { id: "isprivate", c: 1, c1: "isprivate", c2: "", [label]: "Is Private", alignRight: false },
      { id: "joineduser", c: 1, c1: "joineduser", c2: "", [label]: "Joined User", alignRight: false },
      { id: "totalpnt", c: 1, c1: "totalpnt", c2: "", [label]: "Total points", alignRight: false },
      { id: "winamt", c: 1, c1: "winamt", c2: "", [label]: "Win Amount", alignRight: false },
    ];
  } else if (params.gameKey === "plyacc") {
    listView["match_data"] = [
      { id: "c_no", c: 1, c1: "c_no", c2: "", [label]: "Sr no.", alignRight: false },
      { id: "_id", c: 1, c1: "_id", c2: "", [label]: "Join ID", alignRight: false },
      { id: "match_id", c: 1, c1: "match_id", c2: "", [label]: "Match Id", alignRight: false },
      { id: "match_name", c: 1, c1: "match_name", c2: "", [label]: "Match Name", alignRight: false },
      { id: "match_date", c: 1, c1: "match_date", c2: "", [label]: "Match Date", alignRight: false },
      { id: "match_format", c: 1, c1: "match_format", c2: "", [label]: "Match Format", alignRight: false },
      { id: "match_status", c: 1, c1: "match_status", c2: "", [label]: "Match Status", alignRight: false },
      { id: "joindate", c: 1, c1: "joindate", c2: "", [label]: "Join Date", alignRight: false },
      { id: "joinfee", c: 1, c1: "joinfee", c2: "", [label]: "Join Fee", alignRight: false },
      { id: "platformfee", c: 1, c1: "platformfee", c2: "", [label]: "Platform (%)", alignRight: false },
      { id: "sharecnt", c: 1, c1: "sharecnt", c2: "", [label]: "Shares", alignRight: false },
      { id: "totalpnt", c: 1, c1: "totalpnt", c2: "", [label]: "Total points", alignRight: false },
      { id: "winamt", c: 1, c1: "winamt", c2: "", [label]: "Win Amount", alignRight: false },
    ];
  }
  ///////////////////////////////

  let userList = null;
  let total_count = null;
  let condition = {},
    condition2 = {};

  if (params.type === "user_wallet") {
    if (params.multiUser) {
      params.multiUser = params.multiUser.split(",").map((id) => new mongoose.Types.ObjectId(id));
      condition["_id"] = { $in: params.multiUser };
    }

    if (params.country) {
      condition["country_code"] = params.country;
    }

    const queryOptions = {};

    if (size > 0) {
      queryOptions.skip = page * size;
      queryOptions.limit = size;
    }

    userList = await UsersSchema.find(condition, { password: 0, devicetoken: 0, devicetype: 0, otp: 0 }, queryOptions).lean();

    userList = userList.map((user) => ({
      ...user,
      user_profile: { name: user.name || null, profilepic: user.profilepic || "" },
      id: user._id,
    }));

    total_count = await UsersSchema.countDocuments(condition);
  } else if (params.type === "transaction") {
    if (params.multiUser) {
      params.multiUser = params.multiUser.split(",").map((id) => new mongoose.Types.ObjectId(id));
      condition["userid"] = { $in: params.multiUser };
    }

    if (params.trans_status) {
      params.trans_status = params.trans_status.split(",");
      condition["atype"] = { $in: params.trans_status };
    }

    if (params.gameKey) {
      condition["gtype"] = params.gameKey;
    }

    if (params.country) {
      condition2["country_code"] = params.country;
    }

    const queryOptions = [];

    queryOptions.push(
      {
        $match: condition, // Apply filters
      },
      {
        $lookup: {
          from: "users", // Replace with actual MongoDB collection name
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: { path: "$user", preserveNullAndEmptyArrays: true },
      },
      {
        $match: condition2, // Apply user-based country filter
      },
      {
        $lookup: {
          from: "transactions_doc", // Replace with actual MongoDB collection name
          localField: "_id",
          foreignField: "trans_id",
          as: "transactions_doc",
        },
      },
      {
        $unwind: { path: "$transactions_doc", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          id: 1,
          amount: 1,
          txid: 1,
          status: 1,
          updatedAt: 1,
          createdAt: 1,
          ttype: 1,
          atype: 1,
          wit: 1,
          gtype: 1,
          userid: 1,
          "user.id": 1,
          "user.email": 1,
          "user.phone": 1,
          "user.country_code": 1,
          "transactions_doc.id": 1,
          "transactions_doc.trans_id": 1,
          "transactions_doc.payment_id": 1,
          "transactions_doc.amount": 1,
          "transactions_doc.currency": 1,
          "transactions_doc.order_id": 1,
          "transactions_doc.method": 1,
          "transactions_doc.vpa": 1,
          "transactions_doc.transaction_id": 1,
        },
      },
      { $sort: { createdAt: -1 } } // Sort by createdAt in descending order
    );

    if (size > 0) {
      queryOptions.push({ $skip: page * size }, { $limit: size });
    }

    userList = await TransactionsSchema.aggregate(queryOptions);

    const countPipeline = [
      { $match: condition },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } }, // If needed
      {
        $match: condition2, // Apply user-based country filter
      },
      { $count: "total" },
    ];

    const countResult = await TransactionsSchema.aggregate(countPipeline);
    total_count = countResult.length > 0 ? countResult[0].total : 0;
  } else if (params.type === "match_data" && params.gameKey === "mplycont") {
    let conditionMatch = {};

    conditionMatch["gametype"] = params.gameType;
    if (params.match_id) {
      conditionMatch["match_id"] = params.match_id;
    }

    if (params.multiUser) {
      params.multiUser = params.multiUser.split(",").map((id) => new mongoose.Types.ObjectId(id));
      conditionMatch["userid"] = { $in: params.multiUser };
    }

    const joinList = await JoinMatchContestsSchema.aggregate([
      { $match: conditionMatch },
      {
        $lookup: {
          from: "pools",
          localField: "poolid",
          foreignField: "_id",
          as: "pool_detail",
        },
      },
      { $unwind: { path: "$pool_detail", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$_id",
          match_id: { $first: "$match_id" },
          joindate: { $first: "$createdAt" },
          joinfee: { $first: "$pool_detail.joinfee" },
          c: { $first: "$pool_detail.c" },
          isprivate: { $first: "$pool_detail.isprivate" },
          joineduser: { $first: "$pool_detail.joineduser" },
          totalpnt: { $first: "$totalpnt" },
          winamt: { $first: "$winamt" },
        },
      },
      { $sort: { createdAt: -1 } },
      { $facet: { data: mongoLimit, total_count: [{ $count: "count" }] } },
    ]);

    let UpcomingSchema = "";

    if (params.gameType === "ckt") {
      const cktDbConnection = await connectWithCricketDb();
      UpcomingSchema = createUpcomingCricketModel(cktDbConnection);
    } else if (params.gameType === "fb") {
      const footballDbConnection = await connectWithVendorDb();
      UpcomingSchema = createFbUpcomingsModel(footballDbConnection);
    }

    total_count = joinList?.[0]?.total_count?.[0]?.count || 0;
    userList = joinList?.[0]?.data || [];

    const matchIds = userList.map((m) => m.match_id);

    const UpcomingMatchList = await UpcomingSchema.find({ match_id: { $in: matchIds } });

    const matchListMap = Object.fromEntries(UpcomingMatchList.map((m) => [m.match_id, m]));

    userList = userList.map((match) => {
      const matchDetail = matchListMap[match.match_id];

      return {
        ...match,
        match_name: matchDetail.short_title,
        match_date: matchDetail.date_start_ist,
        match_format: matchDetail.format_str,
        match_status: matchDetail?.status ? match_status[matchDetail?.status - 1].name : "",
      };
    });
  } else if (params.type === "match_data" && params.gameKey === "plyacc") {
    let conditionMatch = {};

    conditionMatch["gametype"] = params.gameType;
    if (params.match_id) {
      conditionMatch["match_id"] = params.match_id;
    }

    if (params.multiUser) {
      params.multiUser = params.multiUser.split(",").map((id) => new mongoose.Types.ObjectId(id));
      conditionMatch["userid"] = { $in: params.multiUser };
    }

    conditionMatch["gamekey"] = params.gameKey;

    let joinList = await JoinAccPlayersSchema.aggregate([
      { $match: conditionMatch },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$_id",
          match_id: { $first: "$match_id" },
          joindate: { $first: "$createdAt" },
          joinfee: { $first: "$gkamount" },
          platformfee: { $first: "$platformfee" },
          sharecnt: { $first: "$sharecnt" },
          totalpnt: { $first: "$totalpnt" },
          winamt: { $first: "$winamt" },
          gamekey: { $first: "$gamekey" },
        },
      },
      {
        $facet: { data: mongoLimit, total_count: [{ $count: "count" }] },
      },
    ]);

    let UpcomingSchema = "";

    if (params.gameType === "ckt") {
      const cktDbConnection = await connectWithCricketDb();
      UpcomingSchema = createUpcomingCricketModel(cktDbConnection);
    } else if (params.gameType === "fb") {
      const footballDbConnection = await connectWithVendorDb();
      UpcomingSchema = createFbUpcomingsModel(footballDbConnection);
    }

    total_count = joinList?.[0]?.total_count?.[0]?.count || 0;
    userList = joinList?.[0]?.data || [];

    const matchIds = userList.map((m) => m.match_id);

    const UpcomingMatchList = await UpcomingSchema.find({ match_id: { $in: matchIds } });

    const matchListMap = Object.fromEntries(UpcomingMatchList.map((m) => [m.match_id, m]));

    userList = userList.map((match) => {
      const matchDetail = matchListMap[match.match_id];

      return {
        ...match,
        match_name: matchDetail.short_title,
        match_date: matchDetail.date_start_ist,
        match_format: matchDetail.format_str,
        match_status: matchDetail?.status ? match_status[matchDetail?.status - 1].name : "",
      };
    });
  } else if (params.type === "account_statement") {
    let condition = {};

    if (params.start_date) {
      condition["updatedAt"] = { $gte: dateTimeChange(params.start_date + " 00:00:00") };
    }

    if (params.end_date) {
      condition["updatedAt"] = { ...condition["updatedAt"], $lte: dateTimeChange(params.end_date + " 23:59:59") };
    }

    const joinList = await TransactionsSchema.aggregate([
      { $match: condition },
      {
        $project: {
          userid: 1,
          atype: 1,
          txid: 1,
          gst: { $sum: { $cond: { if: { $eq: ["$atype", "add_amt_gst"] }, then: "$amount", else: 0 } } },
          amount_deposite: { $sum: { $cond: { if: { $eq: ["$atype", "bal_add"] }, then: "$amount", else: 0 } } },
          join_bal: { $sum: { $cond: { if: { $eq: ["$atype", "join_bal"] }, then: "$amount", else: 0 } } },
          join_bns: { $sum: { $cond: { if: { $eq: ["$atype", "join_bns"] }, then: "$amount", else: 0 } } },
          join_win: { $sum: { $cond: { if: { $eq: ["$atype", "join_win"] }, then: "$amount", else: 0 } } },
          cancel_bal: { $sum: { $cond: { if: { $eq: ["$atype", "cancel_bal"] }, then: "$amount", else: 0 } } },
          cancel_bns: { $sum: { $cond: { if: { $eq: ["$atype", "cancel_bns"] }, then: "$amount", else: 0 } } },
          cancel_bns_expire: { $sum: { $cond: { if: { $eq: ["$atype", "cancel_bns_expire"] }, then: "$amount", else: 0 } } },
          cancel_win: { $sum: { $cond: { if: { $eq: ["$atype", "cancel_win"] }, then: "$amount", else: 0 } } },
          add_amt_bonus: { $sum: { $cond: { if: { $eq: ["$atype", "add_amt_bonus"] }, then: "$amount", else: 0 } } },
          refer_bns: { $sum: { $cond: { if: { $eq: ["$atype", "refer_bns"] }, then: "$amount", else: 0 } } },
          wel_bns: { $sum: { $cond: { if: { $eq: ["$atype", "wel_bns"] }, then: "$amount", else: 0 } } },
          bal_wtd_req_succ: { $sum: { $cond: { if: { $eq: ["$atype", "bal_wtd_req_succ"] }, then: "$amount", else: 0 } } },
          bal_wtd_tds_succ: { $sum: { $cond: { if: { $eq: ["$atype", "bal_wtd_tds_succ"] }, then: "$amount", else: 0 } } },
        },
      },
      {
        $group: {
          _id: { userid: "$userid" },
          gst: { $sum: "$gst" },
          amount_deposite: { $sum: "$amount_deposite" },
          userid: { $first: "$userid" },
          txid: { $first: "$txid" },
          join_bal: { $sum: "$join_bal" },
          join_bns: { $sum: "$join_bns" },
          join_win: { $sum: "$join_win" },
          cancel_bal: { $sum: "$cancel_bal" },
          cancel_bns: { $sum: "$cancel_bns" },
          cancel_bns_expire: { $sum: "$cancel_bns_expire" },
          cancel_win: { $sum: "$cancel_win" },
          add_amt_bonus: { $sum: "$add_amt_bonus" },
          refer_bns: { $sum: "$refer_bns" },
          wel_bns: { $sum: "$wel_bns" },
          bal_wtd_req_succ: { $sum: "$bal_wtd_req_succ" },
          bal_wtd_tds_succ: { $sum: "$bal_wtd_tds_succ" },
        },
      },
      { $sort: { amount_deposite: -1 } },
      {
        $lookup: {
          from: "join_acc_players",
          localField: "userid",
          foreignField: "userid",
          as: "jacc",
        },
      },
      { $unwind: { path: "$jacc", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { userid: "$userid" },
          userid: { $first: "$userid" },
          gst: { $first: "$gst" },
          txid: { $first: "$txid" },
          deposite_without_gst: { $first: "$amount_deposite" },
          platformfee: { $sum: { $divide: [{ $multiply: ["$jacc.platformfee", "$jacc.gkamount"] }, 100] } },
          acc_entryfee: { $sum: "$jacc.gkamount" },
          acc_win: { $sum: "$jacc.winamt" },
          join_bal: { $first: "$join_bal" },
          join_bns: { $first: "$join_bns" },
          join_win: { $first: "$join_win" },
          cancel_bal: { $first: "$cancel_bal" },
          cancel_bns: { $first: "$cancel_bns" },
          cancel_bns_expire: { $first: "$cancel_bns_expire" },
          cancel_win: { $first: "$cancel_win" },
          add_amt_bonus: { $first: "$add_amt_bonus" },
          refer_bns: { $first: "$refer_bns" },
          wel_bns: { $first: "$wel_bns" },
          bal_wtd_req_succ: { $first: "$bal_wtd_req_succ" },
          bal_wtd_tds_succ: { $first: "$bal_wtd_tds_succ" },
        },
      },
      {
        $lookup: {
          from: "join_match_contests",
          localField: "userid",
          foreignField: "userid",
          as: "jmcont",
        },
      },
      { $unwind: { path: "$jmcont", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "users",
        },
      },
      { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "user_pans",
          localField: "userid",
          foreignField: "userid",
          as: "upan",
        },
      },
      { $unwind: { path: "$upan", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          gst: 1,
          userid: 1,
          txid: 1,
          deposite_without_gst: 1,
          join_bal: 1,
          join_bns: 1,
          join_win: 1,
          cancel_bal: 1,
          cancel_bns: 1,
          cancel_bns_expire: 1,
          cancel_win: 1,
          add_amt_bonus: 1,
          refer_bns: 1,
          wel_bns: 1,
          bal_wtd_req_succ: 1,
          bal_wtd_tds_succ: 1,
          acc_entryfee: 1,
          acc_win: 1,
          platformfee: 1,
          mcont_entryfee: { $sum: "$jmcont.pamount" },
          mcont_win: { $sum: "$jmcont.winamt" },
          email: "$users.email",
          country_code: "$users.country_code",
          phone: "$users.phone",
          createdAt: "$users.createdAt",
          updatedAt: "$users.updatedAt",
          totalwith: "$users.wltwithdraw",
          totalbal: "$users.walletbalance",
          totalbns: "$users.wltbns",
          totalwinbal: "$users.wltwin",
          full_name: "$upan.full_name",
          pan_number: "$upan.pan_number",
        },
      },
      { $facet: { data: mongoLimit, total_count: [{ $count: "count" }] } },
    ]);

    total_count = joinList?.[0]?.total_count?.[0]?.count || 0;
    userList = joinList?.[0]?.data || [];
  }

  return response(
    {
      total_count: total_count,
      userList: userList,
      transDes,
      status: userList && userList.length > 0 ? true : false,
      header: listView[params.type],
    },
    userList && userList.length > 0 ? "User view succesfully.!!!" : "No data found.!!!"
  );
};

let get_track_download = async (req, res) => {
  const dbName = req.user.dbName;
  const vendorDbConnection = await connectWithVendorDb(dbName);
  const UsersSchema = createUsersModel(vendorDbConnection);

  let params = req.query;
  let condition = {},
    condition2 = {};
  if (params.start_date) {
    condition["hitdate"] = { $gte: dateTimeChangeFor(params.start_date + " 00:00:00"), $lte: dateTimeChangeFor(params.end_date + " 23:59:59") };
  }

  if (params.install) {
    condition2["install"] = params.install;
    condition["os"] = "Android";
  }
  //

  if (params.clientkey) {
    let clientKey = params.clientkey.split(",");
    condition["clientkey"] = { $in: clientKey }; //params.clientkey
    //return;
    let downList = await downloadsSchema.aggregate([
      {
        $match: condition,
      },
      {
        $group: {
          _id: { clientkey: "$clientkey", query: "$query" },
          clientkey: { $last: "$clientkey" },
          ip: { $last: "$ip" },
          os: { $last: "$os" },
          os_version: { $last: "$os_version" },
          browser: { $last: "$browser" },
          browser_version: { $last: "$browser_version" },
          hitdate: { $last: "$hitdate" },
          status: { $last: "$status" },
          country: { $last: "$country" },
          countryCode: { $last: "$countryCode" },
          region: { $last: "$region" },
          regionName: { $last: "$regionName" },
          city: { $last: "$city" },
          zip: { $last: "$zip" },
          lat: { $last: "$lat" },
          lon: { $last: "$lon" },
          timezone: { $last: "$timezone" },
          isp: { $last: "$isp" },
          org: { $last: "$org" },
          as: { $last: "$as" },
          query: { $last: "$query" },
        },
      },
      //{"$sort":{"hitdate":-1}},
      {
        $lookup: {
          from: "loginlogs",
          localField: "query",
          foreignField: "query",
          as: "llogs",
        },
      },
      {
        $unwind: {
          path: "$llogs",
          preserveNullAndEmptyArrays: true,
        },
      },
      // {
      //     "$lookup": {
      //         from: "users",
      //         localField: "id",
      //         foreignField: "llogs.userid",
      //         as: "user"
      //     }
      // },
      // {
      //     $unwind: {
      //         "path": "$user",
      //         "preserveNullAndEmptyArrays": true
      //     }
      // },
      {
        $project: {
          install: { $cond: { if: { $eq: ["$llogs.query", "$query"] }, then: "YES", else: "NO" } },
          userid: "$llogs.userid",
          clientkey: 1,
          ip: 1,
          os: 1,
          os_version: 1,
          browser: 1,
          browser_version: 1,
          hitdate: { $convert: { input: "$hitdate", to: "string" } },
          status: 1,
          country: 1,
          countryCode: 1,
          region: 1,
          regionName: 1,
          city: 1,
          zip: 1,
          lat: 1,
          lon: 1,
          timezone: 1,
          isp: 1,
          org: 1,
          as: 1,
          query: 1,
        },
      },
      { $match: condition2 },
    ]);

    let exportData = downList;
    let headerData = [
      { id: "query", title: "IP" },
      { id: "clientkey", title: "clientkey" },
      { id: "os", title: "os" },
      { id: "os_version", title: "os_version" },
      { id: "browser", title: "browser" },
      { id: "browser_version", title: "browser_version" },
      { id: "hitdate", title: "hitdate" },
      { id: "status", title: "status" },
      { id: "country", title: "country" },
      { id: "countryCode", title: "countryCode" },
      { id: "region", title: "region" },
      { id: "regionName", title: "regionName" },
      { id: "city", title: "city" },
      { id: "zip", title: "zip" },
      { id: "lat", title: "lat" },
      { id: "lon", title: "lon" },
      { id: "timezone", title: "timezone" },
      { id: "isp", title: "isp" },
      { id: "org", title: "org" },
      { id: "as", title: "as" },
      { id: "install", title: "Register" },
      { id: "userid", title: "userid" },
    ];

    if (params.install === "YES" && params.istrans === "YES") {
      headerData.push({ id: "walletbalance", title: "Wallet Balance" });
      headerData.push({ id: "totaljoinfeedepots", title: "Total Join Fee" });
      headerData.push({ id: "transaction", title: "Transaction" });

      //updateUser().then(async(itemR)=>{
      exportData = await Promise.all(
        exportData.map(async (item) => {
          return new Promise(async (resolve, reject) => {
            let userData = await UsersSchema.findOne({ id: item.userid });
            if (userData) {
            } else {
            }
            item["walletbalance"] = userData?.walletbalance;
            item["totaljoinfeedepots"] = userData?.totaljoinfeedepots;
            item["transaction"] = userData?.walletbalance > 0 || userData?.totaljoinfeedepots > 0 ? "YES" : "NO";

            resolve(item);
          });
        })
      );
      //})
    }

    // Define your CSV headers
    const csvWriter = createCsvWriter({
      path: "file.csv",
      header: headerData,
      //   [
      //     {id: 'name', title: 'Name'},
      //     {id: 'surname', title: 'Surname'},
      //     {id: 'age', title: 'Age'},
      //   ]
    });

    // Write the CSV file
    csvWriter.writeRecords(exportData).then(() => {
      // Set the response headers
      res.setHeader("Content-Disposition", "attachment; filename=file.csv");
      res.setHeader("Content-Type", "text/csv");

      // Send the file as a response
      res.download("file.csv");
    });
  } else {
    return res.send(response({}, "Select Client Key", false, null, null));
  }
};

//////////////////////////////////////////////
let updateUser = async (req, res) => {
  return new Promise(async (resolve, reject) => {
    const dbName = req.user.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const UsersSchema = createUsersModel(vendorDbConnection);

    let db = (await sdb())[global.gdbname["crdxn"]];
    let complete = 0;
    let postTransact = await db.User.findAll({
      order: [["id", "ASC"]],
    });

    postTransact.forEach(async (item, index) => {
      console.log("index--->>", index);
      await UsersSchema.updateOne({ id: item.id }, item.dataValues, { upsert: true });
      if (postTransact.length === index + 1) {
        resolve(postTransact.length);
      }
    });
  }).then((item) => {
    console.log("-----Users updated-----");
    return response({}, "Users updated - ", true, item, null);
  });
};
//updateUser();
//////////////////////////////////////////////
//Todo: Not using
let transactionUpdate = async (req) => {
  return new Promise(async (resolve, reject) => {
    const dbName = req.user.dbName;
    const vendorDbConnection = await connectWithVendorDb(dbName);
    const TransactionsSchema = createTransactionsModel(vendorDbConnection);

    let db = (await sdb())[global.gdbname["crdxn"]];
    let mongoTransact = await TransactionsSchema.findOne().sort({ id: -1 });
    let lastId = mongoTransact && mongoTransact.id ? mongoTransact.id : 0;
    let ids = lastId - 10;
    console.log("ids--->>>", ids, lastId);
    //return;
    let postTransact = await db.Transactions.findAll({
      where: { id: { [Op.gt]: ids } },
      order: [["id", "ASC"]],
    });

    postTransact.forEach(async (item, index) => {
      let lengTrans = postTransact.length;
      let trnsUp = await TransactionsSchema.updateOne({ id: item.id }, item.dataValues, { upsert: true });
      console.log("item---->>", lengTrans, index);
      if (postTransact.length === index + 1) {
        resolve(postTransact.length);
      }
    });
  }).then((item) => {
    console.log("-----Transaction updated-----");
    return response({}, "Transaction updated - ", true, item, null);
  });
};
//transactionUpdate()

let transWltDeptUpdate = async () => {
  let db = (await sdb())[global.gdbname[req.user.apikey]];
  let postTransact = await db.Transactions.findAll({
    where: { atype: "bal_add", userid: 12 },
    group: ["userid"],
    attributes: ["userid", [literal(`SUM(amount)`), "amount"]],
  });

  postTransact.forEach(async (item) => {
    console.log("postTransact===>>", item.userid, item.amount);
    await db.User.update({ wltdept: item.amount }, { where: { id: item.userid } });
  });
};
//transWltDeptUpdate();

//Todo: We are not using this
let poolPriceUpdate = async (req) => {
  const dbName = req.user.dbName;
  const vendorDbConnection = await connectWithVendorDb(dbName);
  const JoinMatchContestsSchema = createJoinMatchContestsModel(vendorDbConnection);
  const PoolSchema = createPoolModel(vendorDbConnection);

  let poolList = await PoolSchema.find({});

  poolList.forEach(async (item, index) => {
    console.log("joinMContSchema===>>", index, item._id);
    await JoinMatchContestsSchema.updateMany({ poolid: item._id }, { $set: { pamount: item.joinfee } });
  });
};
//poolPriceUpdate()

let fetch_data = async (req, res) => {
  const mongoose = require("mongoose");
  mongoose.connect(process.env.DB_CONNECTION_STRING, {
    user: "credexon",
    pass: "Keks8TRpN@hu",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const mdb = mongoose.connection;

  const page = parseInt(req.query.page);
  const size = parseInt(req.query.size);
  const parms = req.query;
  const collection = req.query.collection;

  if (!collection) {
    return res.send(response({}, "Please send 'collection' value", false, null, null));
  }
  delete parms["page"];
  delete parms["size"];
  delete parms["collection"];
  let condition = parms ? parms : {};
  Object.keys(condition).map((itemCond) => {
    if (Number(condition[itemCond])) {
      condition[itemCond] = Number(condition[itemCond]);
    } else {
      if (itemCond.indexOf("start_") === 0 || itemCond.indexOf("end_") === 0) {
        let date_start = "",
          date_end = "",
          objRange = {},
          objD = {};
        if (itemCond.indexOf("start_") === 0) {
          let keyn = itemCond.replace(/^(start_)/, "");
          date_start = condition[itemCond];
          //objRange["$gte"]=dateTimeChangeFor(date_start+" 00:00:00");
          condition[keyn] = { $gte: dateTimeChangeFor(date_start + " 00:00:00") };
        }

        if (itemCond.indexOf("end_") === 0) {
          let keyn = itemCond.replace(/^(end_)/, "");
          date_end = condition[itemCond];
          objRange["$lte"] = dateTimeChangeFor(date_end + " 23:59:59");
          if (condition[keyn]) {
            let objDA = condition[keyn];

            objDA["$lte"] = dateTimeChangeFor(date_end + " 23:59:59");
            condition[keyn] = objDA;
          } else {
            condition[keyn] = { $lte: dateTimeChangeFor(date_end + " 23:59:59") };
          }
        }
        //let keyname=itemCond.replace(/^(start_)/,"").replace(/^(end_)/,"");
        //condition[keyname]=objD;
        delete condition[itemCond];
      } else {
        condition[itemCond] = condition[itemCond];
      }
    }

    return condition;
  });

  mdb
    .collection(collection)
    .find(condition)
    .toArray(function (err, result) {
      if (err) {
        return res.send(response({}, "Some error", false, null, null));
      }

      //  db.close();

      if (result && result.length > 0) {
        /////////////////////
        let headerData = [];
        Object.keys(result[0]).forEach((item) => {
          headerData.push({ id: item, title: item });
        });

        // Define your CSV headers
        const csvWriter = createCsvWriter({
          path: "file.csv",
          header: headerData,
        });

        // Write the CSV file
        csvWriter.writeRecords(result).then(() => {
          // Set the response headers
          res.setHeader("Content-Disposition", "attachment; filename=file.csv");
          res.setHeader("Content-Type", "text/csv");

          // Send the file as a response
          res.download("file.csv");
        });
        //////////////////////
      } else {
        return res.send(response({}, "No data found", false, null, null));
      }
      //mdb.close();
      // mdb.on("error", console.error.bind(console, "connection error: "));
      // mdb.once("open", function () {

      // });
    });
};

module.exports = {
  get_match_list: get_match_list,
  get_report_data: get_report_data,
  get_report_download,
  getDownloadableFiles,
  downloadFile,
  deleteAllFiles,
  get_track_download,
  fetch_data,
  updateUser,
};
