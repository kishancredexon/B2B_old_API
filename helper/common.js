let sdb = require("../models");
const response = require("./response");
const moment = require("moment");
let fs = require('fs');
const { Op } = require("sequelize");//
const env = process.env;

const { literal } = require('sequelize');
const { connectWithGeneralDb, connectWithVendorDb, connectWithMasterDb } = require("../config/mongodb_connections");
const createGameSettingsModel = require("../mongo_models_new/credexon_general/GameSettingsSchema");
const createDownloadsModel = require("../mongo_models_new/credexon_vendor/DownloadsSchema");


let generateOtp = Math.floor(100000 + Math.random() * 900000);

let LENGTH_DATATYPE = {
    email_id: 150,
    org_id: 20,
    password: 150,
    valid_password: 10,
    status: 1,
    first_name: 20,
    middle_name: 20,
    last_name: 20,
    id_number: 20,
    comp_legal_name: 150,
    comp_regist_no: 20,
    otp: 6,
    phone_no: 15,
    designation: 20,
    firstName: 20,
    lastName: 20,
    service_name: 20,
    logo: 200,
    serviceName: 30,
    label: 20,
    value: 20,
}

let countryCode = {
    "+91": "India",
    "+44": "United Kingdom"
}
let transDes = {
    wltadd: "Deposit Amount",
    welbns: "Welcome Bonus",
    refbns: "Referral Bonus",
    jcontmckt: "Join Contest | Match | Cricket",
    jcontmfb: "Join Contest | Match | Football",
    jcontsckt: "Join Contest | Series | Cricket",
    jcontsfb: "Join Contest | Series | Football",
    jaccmckt: "Join Accumulator | Match | Cricket",
    jaccmfb: "Join Accumulator | Match | Football",
    jaccsckt: "Join Accumulator | Series | Cricket",
    jaccsfb: "Join Accumulator | Series | Football",
    jpoolaccsckt: "Join Prize Pool| Series | Cricket",
    jpoolaccsfb: "Join Prize Pool| Series | Football",
    "bal": "Transaction Balance",
    "bns": "Bonus",
    "bal_add": "Add Balance",
    "bal_add_pen": "Add Balance Pending",
    "bal_fail": "Transaction Failed",
    "bal_wtd_req": "Withdrawal Request Pending",
    "bal_wtd_req_succ": "Withdrawal Request Accepted",
    "bal_wtd_req_decln": "Withdrawal Request Decline",
    "win": "Winning Amount",
    "re_win": "Winning Amount",
    "wel_bns": "Welcome Bonus",
    "cancel_bal": "Refund from unfilled contest",
    "cancel_bns": "Refund from unfilled contest",
    "cancel_bns_expire": "Refund from unfilled contest is expired",
    "cancel_win": "Refund from unfilled contest",
    "revert_win": "Revert Winning",
    "refer_bns": "Refer Bonus",
    "join_bal": "Join from Deposit",
    "join_bns": "Join from Bonus",
    "join_win": "Join from Winning",
    "bal_wtd_tds": "TDS Deduct",
    "bal_wtd_tds_decln": "TDS Request Decline",
    "bal_wtd_tds_succ": "TDS Request Accepted",
    "bal_wtd_tds_pen": "TDS Request Pending",
    "add_amt_bonus": "GST Bonus + Additional Bonus",
    "add_amt_gst": "Add GST"
}

let chargesValue = {
    platformFee: 10,
}

let settingDetail = {
    matchPlyCount: 11,
    seriesPlyCount: 15,
    substitutePlyCount: 2,
    maxteam: 10,
    privateuptojoin: 5,
    
};

const sanitizeVendorName = (vendorEmail) => {
    return vendorEmail.toLowerCase().replace(/@.+$/, "").replace(/[^a-z0-9_]/g, "_");
}

const generateDatabaseName = (vendorEmail) => {
    const sanitizedVendorEmailName = sanitizeVendorName(vendorEmail);
    const uniqueId = Math.floor(10000 + Math.random() * 90000);
    return `${sanitizedVendorEmailName}_${uniqueId}`;
}

let dateTimeChange = (strdatetime, is_current) => {
    return new Date((strdatetime).toLocaleString("en-US", { timeZone: 'Antarctica/Casey' }))
}

let dateTimeChangeFor = (strdatetime) => {
    //return new Date(strdatetime)
    return new Date(new Date(strdatetime).toLocaleString("en-US", { timeZone: 'Antarctica/Casey' }))
}

let drTransaction = async (userid, joinfee, gtype, jpoolID, res) => {
    let db = (await sdb())[global.gdbname[req.user.apikey]];

    const connection = await connectWithGeneralDb();
    const GameSettingsSchema = createGameSettingsModel(connection);

    let gameSettingsDetail = await GameSettingsSchema.findOne({ "key": "bnsused" })
    const userDetail = await db.User.findOne({
        where: { id: userid }, attributes: ['walletbalance', 'wltbns', 'wltwin'],
    });
    let bnsFromFee = joinfee * (gameSettingsDetail.value) / 100;
    let addWltbns = (userDetail["wltbns"] > 0) ? (userDetail["wltbns"] - (bnsFromFee)) : 0;
    addWltbns = (addWltbns < 0) ? userDetail["wltbns"] : addWltbns;

    let walletbalance = userDetail["walletbalance"] + userDetail["wltwin"];
    let totalBal = walletbalance + addWltbns;

    if (totalBal >= joinfee) {
        let addWalBal = (walletbalance > 0) ? (joinfee - bnsFromFee) : 0;
        let currentWalletbalance = userDetail["walletbalance"] - addWalBal;
        let currentWin = (currentWalletbalance < 0) ? (userDetail["wltwin"] - addWalBal) : 0;
        let currentBnsbalance = userDetail["wltbns"] - bnsFromFee;
        currentWalletbalance = currentWin.toFixed(2);
        currentBnsbalance = currentBnsbalance.toFixed(2);
        let user = await db.User.update(
            { "walletbalance": currentWalletbalance, "wltwin": currentWin, "wltbns": currentBnsbalance }
            , {
                where: {
                    "id": userid
                }
            }
        );
        addWalBal = addWalBal.toFixed(2);
        bnsFromFee = bnsFromFee.toFixed(2);
        //[plyacc, mplycont, buysell, splycont, tmacc, pzpool, tmcont, optn, longtrm, ipo]
        let currentDate = currentTimeZoneDate() * 1 / 1000;
        let objTransBal = { "userid": userid, "amount": addWalBal, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "bal", "jpoolid": jpoolID };
        await db.Transactions.create(objTransBal);
        let objTransBns = { "userid": userid, "amount": bnsFromFee, "txdate": currentDate, "ttype": "dr", "gtype": gtype, "atype": "bns", "jpoolid": jpoolID };
        await db.Transactions.create(objTransBns);
        return res.send(response({}, "pool joined successfully.", true))
    } else {
        return res.send(response({}, "You don't have enough balance, please add an amount.", false))
    }
}

let bonusResult = () => {
    // Define the query parameters
    const userId = 12;
    const atype = 'add_amt_bonus';
    const bonusThreshold = 10;
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // Build and execute the Sequelize query
    Transaction.findAll({
        attributes: [
            'id',
            [Sequelize.fn('NOW'), 'sdate'],
            'userid', 'amount',
            'bonusbal',
            [Sequelize.fn('SUM', Sequelize.col('bonusbal')), 'dd'],
        ],
        where: {
            userid: userId,
            atype: atype,
            updatedAt: {
                [Op.gt]: ninetyDaysAgo,
            },
            bonusbal: {
                [Op.gt]: 0,
            },
        },
    })
}

let winPerc = {
    "1": 100,
    "2": 80,
    "3": 70,
    "4": 50,
}


let calDeductBal = async (joinfee, bnsPercUsed, watbal, walbns, wltwin, userid, preview,req, vendorDbConnection) => {
    return new Promise(async (resolve, reject) => {
        bnsPercUsed = (bnsPercUsed) ? bnsPercUsed : 0;
        console.log("walbns,bns_used22--->>", joinfee, bnsPercUsed, watbal, walbns, wltwin, userid);
        walbns = await checkBonusBalUser(userid, vendorDbConnection);
        let bns_used = joinfee * bnsPercUsed / 100;
        let check_bns_used = (walbns - bns_used) > 0 ? bns_used : walbns;
        let check_overall_bal = joinfee - watbal - wltwin - check_bns_used;

        //if (check_overall_bal <= 0) {
        // let deduct_bns = joinfee - check_bns_used;
        // let remaining_bal = watbal - deduct_bns;
        // let remaining_bns = walbns - check_bns_used;
        let isnext = false;
        let reqAmt = 0;

        let rBns = 0;
        if (check_bns_used - joinfee >= 0) {
            rBns = walbns - check_bns_used;
            reqAmt = 0;
            isnext = false;
        } else {
            rBns = walbns - check_bns_used;
            reqAmt = joinfee - check_bns_used;
            isnext = true;
        }


        let rBal = 0;
        if (isnext === true) {
            if (watbal - reqAmt >= 0) {
                rBal = watbal - reqAmt;
                reqAmt = 0;
                isnext = false;
            }
            else {
                rBal = 0;
                reqAmt = reqAmt - watbal;
                isnext = true;
            }

        } else {
            rBal = watbal;
        }

        let rWin = 0;
        if (isnext === true) {
            if (wltwin - reqAmt >= 0) {
                rWin = wltwin - reqAmt;
                reqAmt = 0;
                isnext = false;
            }
            else {
                rWin = 0;
                reqAmt = reqAmt - wltwin;
                isnext = true;
            }

        } else {
            rWin = wltwin;
        }


        // let deduct_bal = (deduct_bns-watbal)<0?watbal-deduct_bns:(watbal - deduct_bns);
        // let deduct_win=(deduct_bal)
        // let remaining_bns = walbns - check_bns_used;
        let objResp = {
            deductBns: parseFloat((check_bns_used).toFixed(2)),
            deductBal: parseFloat((watbal - rBal).toFixed(2)),
            deductWin: parseFloat((wltwin - rWin).toFixed(2)),
            remainingBns: parseFloat(rBns.toFixed(2)),
            remainingBal: parseFloat(rBal.toFixed(2)),
            remainingWin: parseFloat(rWin.toFixed(2))
        };

        userid = ObjectId(userid);



        if (check_overall_bal <= 0) {
            let bnsTransString = (objResp.deductBns > 0) ? await drBonusTrans(userid, objResp.deductBns, false, req,vendorDbConnection) : { "transidpz": "", "arrayBns": null };
            objResp["bnsTransString"] = bnsTransString["transidpz"];
            objResp["arrayBns"] = bnsTransString["arrayBns"];

            objResp["status"] = true;
            console.log("objResp-2-->>", bnsTransString["arrayBns"]);
            return resolve(objResp);
        } else {
            let bnsTransString = (objResp.deductBns > 0) ? await drBonusTrans(userid, objResp.deductBns, true, req,vendorDbConnection) : { "transidpz": "" };
            objResp["bnsTransString"] = bnsTransString["transidpz"];

            objResp["status"] = false;
            console.log("objResp-3-->>", objResp);
            return resolve(objResp);
        }

    })

}


let thirdWalletChkApi = async (apikey, phone, request_amt, is_preview) => {
    return new Promise(async (resolve, reject) => {
        console.log("phone===>>", phone)
        const connection = await connectWithMasterDb();
        const MasterUsersSchema = createMasterUsersModel(connection);
        let vendorApi = await MasterUsersSchema.findOne({apikey: apikey});
        let wallet_check_api = vendorApi.wallet_check_api;
        let apikeyofvendor = vendorApi.apikeyofvendor;
        
        const options = {
            method: 'POST',
            url: wallet_check_api,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json'
            },
            data: JSON.stringify({ "userid": phone, "apikey": apikeyofvendor, "request_amt": request_amt, "is_preview": is_preview })
        };

        axios.request(options).then(async function (result) {
            console.log("resultresult===>>", result.data)
            resolve(result.data)
        }).catch(function (error) {
            console.log("error==>>", error)
            resolve(0)
        });
    })
}

let calAcceptRejectBal = (type, reqamt, watbal, watwin) => {
    if (type === "accept") {
        let sWalBal = watbal - reqamt;
        let sWalWin = watwin - reqamt;
        return { status: true, walBal: sWalBal, walWin: sWalWin }
    } else if (type === "reject") {
        let sWalBal = watbal - reqamt;
        let sWalWin = watwin - reqamt;
        return { status: true, walBal: sWalBal, walWin: sWalWin }
    } else {
        return { status: false }
    }
}

let currentTimeZoneDate = () => {
    //return new Date(new Date().toLocaleString("en-US", { timeZone: 'Antarctica/Casey' }))
    let strdatetime=new Date()*1+(1000*60*60*5+1000*60*30);
    return new Date(strdatetime);
}

let errorLogsWrite = (type, module, errorCode, msg) => {
    console.log("type, module, errorCode, msg---->>", type, module, errorCode, msg)
}

function WriteErrorLogs(type, module, errorCode, msg) {
    //console.log("type, module, errorCode, msg---->>",type, module, errorCode, msg)
    var date = moment(new Date()).format("YYYY-MM-DD");

    var fillename = 'Log_' + type + '_' + date + ".txt";

    let CurrDate = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
    var dataTest = CurrDate + '  ----  ' + type + '  ----  ' + module + ' ---- ' + errorCode + ' ---- ' + msg + ' \n\r';

    fs.appendFile('./logs/error/' + fillename, dataTest, function (err) {
    });
}



let sortingData = (objs, sort_name, d_sort) => {
    function compare(a, b) {
        if (a[sort_name] < b[sort_name]) {
            return -1 * d_sort;
        }
        if (a[sort_name] > b[sort_name]) {
            return d_sort;
        }
        return 0;
    }
    return objs.sort(compare);
}

let tdsCalculate = (totalJoinFee, totalWinning, tdsPerc, withdrawValue, welbns) => {
    totalJoinFee = (totalJoinFee - welbns) >= 0 ? (totalJoinFee - welbns) : 0;
    if (totalWinning - totalJoinFee > 0) {
        let netProfit = totalWinning - totalJoinFee;//+welbns;
        let tdsValue = tdsPerc * netProfit / 100;
        let withdrawPercFromTWin = 100 * withdrawValue / totalWinning;

        let withdrawTDSAmt = (tdsValue * withdrawPercFromTWin / 100).toFixed(2);
        let tDSRemainingValue = (withdrawValue - withdrawTDSAmt).toFixed(2);

        return { tDSRemainingValue, withdrawTDSAmt };
    } else {
        return { tDSRemainingValue: withdrawValue, withdrawTDSAmt: 0 };
    }

}


/**
 * @description To get user ip address
 */
var get_ip = require('ipware')().get_ip;
const DeviceDetector = require("node-device-detector");

let getReqOtherDetail = async (req, isQues) => {
    var ip_info = get_ip(req);
    let ip = (req.headers["x-forwarded-for"] || "").split(",").pop().trim() || req.connection.remoteAddress;
    let detector = new DeviceDetector();
    let os = detector.detect(req.headers["user-agent"]);
    ip = ip ? ip.replace("::ffff:", "") : ""

    return {
        os: os.os ? os.os.name || "" : "",
        os_version: os.os ? os.os.version || "" : "",
        ip: ip ? ip.replace("::ffff:", "") : "",
        browser: os.client ? os.client.name || "" : "",
        browser_version: os.client ? os.client.version || "" : "",
    }
}

const axios = require('axios');
const createLoginLogsModel = require("../mongo_models_new/credexon_vendor/LoginLogsSchema");
const createMasterUsersModel = require("../mongo_models_new/credexon_master/MasterUsersSchema");
const createUserBonusModel = require("../mongo_models_new/credexon_vendor/UserBonusSchema");
const { ObjectId } = require("bson");

let loginLogsTrack = (userid, ipaddress) => {
    return new Promise(async (resolve, reject) => {
        const dbName = "crdxn";
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const DownloadsSchema = createDownloadsModel(vendorDbConnection);
        const LoginLogsSchema = createLoginLogsModel(vendorDbConnection);

        const options = {
            method: 'GET',
            url: `${env.PRO_IPINFO_BASE_URL}` + ipaddress + '?key=FX0x6GCwnutvMOp',
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json'
            },
        };

        await axios.request(options).then(async function (result) {
            console.log("----CHECK-----");
            let resultData = result.data;
            resultData["userid"] = userid;
            let currentDate = currentTimeZoneDate();
            resultData["hitdate"] = currentDate;
            await DownloadsSchema.updateOne({ "query": ipaddress }, { "$set": { "userid": userid } })
            await LoginLogsSchema.create(resultData)
            resolve(resultData);
        }).catch(async (error) => {
            const options = {
                method: 'GET',
                url: `${env.IPINFO_BASE_URL}` + ipaddress + '?key=FX0x6GCwnutvMOp',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json'
                },
            };

            await axios.request(options).then(async function (result) {
                console.log("----CHECK-----");
                let resultData = result.data;
                resultData["userid"] = userid;
                let currentDate = currentTimeZoneDate();
                resultData["hitdate"] = currentDate;
                await DownloadsSchema.updateOne({ "query": ipaddress }, { "$set": { "userid": userid } })
                await LoginLogsSchema.create(resultData)
                resolve(resultData);
            }).catch(async (error) => {
                resolve({});
            })
        });

    })

}

var matchType = new Object();
matchType["womenodi"] = 'odi';
matchType["Woman ODI"] = 'odi';
matchType["youthodi"] = 'odi';
matchType["t20i"] = 't20';
matchType["t20"] = 't20';
matchType["T20I"] = 't20';
matchType["Woman T20"] = 't20';
matchType["t100"] = 't10';
matchType["woment100"] = 't10';
matchType["lista"] = 'odi';
matchType["woment20"] = 't20';
matchType["youtht20"] = 't20';
matchType["odi"] = 'odi';
matchType["ODI"] = 'odi';
matchType["firstclass"] = 'test';
matchType["First Class"] = 'test';
matchType["test"] = 'test';
matchType["Test"] = 'test';
matchType["List A"] = 'odi';
matchType["Women ODI"] = 'odi';
matchType["Women T20"] = 't20';

matchType["t10"] = 't10';
matchType["football"] = 'football';


let timeChange = (userid, orgdatetime) => {
    return ([0].indexOf(userid) > -1) ? dateTimeChangeFor(orgdatetime * 1 - ((3 * 60) * 60 * 1000)) : orgdatetime;
}

let dateTimeZone = (strdatetime, sTimeZone) => {
    sTimeZone = (sTimeZone) ? sTimeZone : "Asia/Kolkata";
    strdatetime = new Date(strdatetime * 1);//+1000*60*60*5+1000*60*30
    return new Date(strdatetime.toLocaleString("en-US", { timeZone: sTimeZone }))
}


let footballPosition = {
    1: "Goalkeeper",
    2: "Defender",
    3: "Midfielder",
    4: "Attacker"
}

let gstCalculation = (amount, gstperc, bnsperc) => {
    return {
        "deposite": (gstperc > 0) ? parseInt((amount / (1 + (gstperc / 100))).toFixed(0)) : amount,
        "gst": (gstperc > 0) ? parseInt((amount - (amount / (1 + (gstperc / 100)))).toFixed(0)) : 0,
        "bns": (bnsperc > 0) ? parseInt(((amount - (amount / (1 + (gstperc / 100)))) + ((amount / (1 + (gstperc / 100))) * bnsperc / 100)).toFixed(0)) : 0
    }
}

let drBonusTrans = async (userid, bnsreq, preview, req,vendorDbConnection) => {
    return new Promise(async (resolve, reject) => {
        
        let currentDate = currentTimeZoneDate() * 1 / 1000;
        console.log("userid,bnsreq,preview===>>", userid, bnsreq, preview)
        let UserBonusSchema=createUserBonusModel(vendorDbConnection);
        const transList = await UserBonusSchema.find({
             "$or": [{ "userid": userid, "balamt": { "$gt": 0 }, "atype": { "$in": ["wel_bns", "refer_bns"] } }, { "userid": userid, "balamt": { "$gt": 0 }, "atype": "add_amt_bonus", "expiry_date": { "$gte": currentDate } }] 
        }, {'id':1, 'amount':1, 'balamt':1, 'transid':1}).sort({'transid':1});
        let getbns = 0, chkbns = 0;
        let remBal = {};
        let transidpz = "";
        for (n = 0; n < transList.length; n++) {
            let curt = transList[n]["balamt"];
            //console.log("curt--->>",curt)
            chkbns = chkbns + curt;

            //console.log("Main-1-->>",n,transList[n]["transid"],chkbns,bnsreq);
            if (chkbns <= bnsreq) {
                getbns = getbns + curt;
                remBal[transList[n]["transid"]] = 0;
                transidpz = transidpz + ((n > 0) ? "," : "") + transList[n]["transid"] + "p" + curt;
                console.log("getbns-1" + n + "-->>", n, getbns);
            } else {
                let rem = bnsreq - getbns;
                if (rem > 0) {
                    getbns = getbns + rem;
                    remBal[transList[n]["transid"]] = curt - rem;
                    transidpz = transidpz + ((n > 0) ? "," : "") + transList[n]["transid"] + "p" + rem;
                    console.log("getbns-2" + n + "-->>", n, getbns, rem);
                }
            }

        }
        // if(getbns<bnsreq){
        //     console.log("--LESS BAL--->>",getbns,"/",bnsreq);    
        //     resolve(false);
        // }else{
        console.log("remBal--->>", remBal, transidpz);
        let arrayBns = [];
        Object.keys(remBal).forEach(async (itmBal) => {
            console.log("itmBal--->>", itmBal)
            //if(preview===false){
            //await db.Bonusbals.update({"balamt": remBal[itmBal]}, {where: {"transid": itmBal}});
            arrayBns.push({ "balamt": remBal[itmBal], "transid": itmBal })
            //}
        })
        console.log("transidpz-->>", transidpz);
        resolve({ transidpz, getbns, arrayBns });

        //}
    })
}

//drBonusTrans(21,1.5)

let drBonusTransRevert = async (transidpz) => {
    return new Promise(async (resolve, reject) => {
        let db = (await sdb())[global.gdbname[req.user.apikey]];

        transidpz = transidpz.split(",");
        console.log("transidpz-->>", transidpz);
        let transIds = [];
        let transIdPz = {};
        transidpz.forEach(async (itmBal) => {
            console.log("itmBal--->>", itmBal)
            transIds.push(itmBal.split("p")[0]);
            transIdPz[itmBal.split("p")[0]] = parseFloat(itmBal.split("p")[1]);

        })

        let currentDate = currentTimeZoneDate() * 1 / 1000;
        const transList = await db.Bonusbals.findAll({
            where: { "transid": { [Op.in]: transIds }, "expiry_date": { [Op.gte]: currentDate } }
        });
        //console.log("transIds-->>",transList);
        let lastTransVal = {};
        for (let m = 0; m < transList.length; m++) {
            lastTransVal[transList[m]["transid"]] = transList[m]["balamt"]
        }
        //console.log("lastTransVal-->>",lastTransVal);
        let expireVal = 0;
        let bnsVal = 0;
        let transDistri = {};
        Object.keys(transIdPz).forEach(async (itemTrs) => {
            itemTrs = parseInt(itemTrs);
            if (lastTransVal[itemTrs] > -1) {
                let addTrans = transIdPz[itemTrs] + lastTransVal[itemTrs];

                bnsVal = bnsVal + transIdPz[itemTrs];
                transDistri["cancel_bns"] = bnsVal;
                console.log("bnsVal--->>", bnsVal, itemTrs);
                await db.Bonusbals.update({ "balamt": addTrans }, { where: { "transid": itemTrs } });


            } else {
                expireVal = expireVal + transIdPz[itemTrs];
                console.log("Expire--->>", transIdPz[itemTrs], lastTransVal[itemTrs]);
                transDistri["cancel_bns_expire"] = expireVal;

            }
        })

        console.log("transDistri--->>", transDistri)
        resolve(transDistri);
    })
}

//drBonusTransRevert("42375p10,42376p10,42382p50,42383p30");

let checkBonusBalUser = async (userid,vendorDbConnection) => {
    return new Promise(async (resolve, reject) => {
        
        const UserBonusSchema = createUserBonusModel(vendorDbConnection);
        let currentDate = currentTimeZoneDate() * 1 / 1000;
        const transList = await UserBonusSchema.aggregate([
            {
                $match: {
                    userid: userid,
                    balamt: { "$gt": 0 },
                    $or: [
                        { atype: { "$in": ["wel_bns", "refer_bns"] } },
                        { atype: "add_amt_bonus", expiry_date: { $gte: currentDate } }
                    ]
                }
            },
            {
                $group: {
                    _id: null,
                    totalBalAmt: { $sum: "$balamt" }
                }
            }
        ]);
        
        let sumBalAmt = transList.length > 0 ? transList[0].totalBalAmt : 0;
        resolve(sumBalAmt);
    })
}

let mkmk = async () => {
    let bnss = await checkBonusBalUser(21);
    console.log("bnss--->>>", bnss)
}
//mkmk();



let drBonusTransSettled = async (userid) => {
    return new Promise(async (resolve, reject) => {

        const userList = await db.User.findAll({
            attributes: ['id', 'wltbns'],
            order: [['id', 'ASC']],
            offset: 35001,
            limit: 5000
        });
        /////////////

        await Promise.all(userList.map(async (userDetail) => {
            return new Promise(async (resolve, reject) => {
                let userid = userDetail.id;
                let currentDate = currentTimeZoneDate() * 1 / 1000;
                console.log("currentD,u===>>", currentDate, userid)

                const transList = await db.Bonusbals.findOne({
                    group: ['userid'],
                    where: { [Op.or]: [{ "userid": userid, "balamt": { [Op.gt]: 0 }, "atype": { [Op.or]: ["wel_bns", "refer_bns"] } }, { "userid": userid, "balamt": { [Op.gt]: 0 }, "atype": "add_amt_bonus", "expiry_date": { [Op.gte]: currentDate } }] }, attributes: ['userid', [literal(`SUM(balamt)`), 'balamt']]
                });

                let totalBns = (transList && transList.balamt) ? transList.balamt : 0;
                let userBns = (userDetail && userDetail.wltbns) ? userDetail.wltbns : 0;

                let removeBns = totalBns - userBns;



                console.log("totalBns--->>", totalBns, userBns, removeBns);
                await drBonusTrans(userid, removeBns, false, req);
                console.log("END--userid->>", userid);
                resolve(true);

            })
        }))


        /////////////

    })
}

//drBonusTransSettled(21,500)

let keyGen = (reqdb) => {
    let dbkey = (reqdb === "crdxn" ? "" : ((gDBNameKey(null))[reqdb]).replace("_db", ""));
    console.log("dbkeyCheck===>>", dbkey);
    return dbkey;
}

let gDBNameKey = function (isnewDb) {
    if (global.gdbname && !(isnewDb)) {
        return global.gdbname;
    } else if (isnewDb || !(global.gdbname)) {
        return sdb().then(db => {
            let master_db = db["master_db"];
            return master_db.masterusers.findAll({
                where: { status: 1 },
                attributes: ['apikey', 'dbname']
            }).then(query => {
                let dbAll = {};
                query.forEach(itemDB => {
                    dbAll[itemDB.apikey] = itemDB.dbname;
                });
                console.log("dbAlldbAll===>>", dbAll);
                global.gdbname = dbAll;
                return dbAll;
            });
        });
    }
};

let getDBName=async(sApikey)=>{
    const connection = await connectWithMasterDb();
    const MasterUsersSchema = createMasterUsersModel(connection);
    const vendorDetail = await MasterUsersSchema.findOne({"apikey":sApikey},{"dbname":1});
    return vendorDetail.dbname;
}

let apiVersion = {
    "v1": "v1",
    "v2": "v2"
}

function handleMessage(socket, data, url, requestdata) {
    console.log('Message received:', data);
    socket.emit(url, requestdata);
}

const isValidHttpUrl = (string) => {
    let url;
    try {
        url = new URL(string);
    } catch (_) {
        return false;
    }
    return url.protocol === "http:" || url.protocol === "https:";
};

const fetchProfilePicUrl = (profilePicUrl) => {
    let checkhttpurl = isValidHttpUrl(profilePicUrl);

    if (checkhttpurl) return profilePicUrl;

    return `${env.awsimgurl}profile_doc/${profilePicUrl}`;
}

let areArraysEqual=(arr1, arr2)=> {
    if (arr1.length !== arr2.length) return false; // If lengths are different, they can't be equal

    let sortedArr1 = [...arr1].sort((a, b) => a - b);
    let sortedArr2 = [...arr2].sort((a, b) => a - b);

    return sortedArr1.every((value, index) => value === sortedArr2[index]);
}

// let abc = [2, 4, 6, 7, 8, 9, 10];
// let xyz = [10, 2, 9, 6, 7, 8, 4];

// console.log(areArraysEqual(abc, xyz)); // Output: false


module.exports = { generateOtp, LENGTH_DATATYPE, countryCode, transDes, chargesValue, settingDetail, dateTimeChange, drTransaction, winPerc, calDeductBal, calAcceptRejectBal, WriteErrorLogs, sortingData, tdsCalculate, currentTimeZoneDate, getReqOtherDetail, loginLogsTrack, dateTimeChangeFor, matchType, timeChange, dateTimeZone, gstCalculation, drBonusTrans, drBonusTransRevert, checkBonusBalUser, errorLogsWrite, keyGen, thirdWalletChkApi, gDBNameKey, apiVersion, handleMessage, fetchProfilePicUrl,getDBName,generateDatabaseName,areArraysEqual };
