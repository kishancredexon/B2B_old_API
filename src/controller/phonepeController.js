'use strict';
const crypto = require('crypto');
let sdb = require("../../models");
const response = require("../../helper/response");
const { dateTimeChange, gstCalculation, currentTimeZoneDate } = require("../../helper/common");
const web_url = process.env.weburl;
const api_url = process.env.apiurl;
const { Op } = require("sequelize");
const axios = require('axios');
const { connectWithGeneralDb, connectWithVendorDb } = require('../../config/mongodb_connections');
const createSettingsModel = require('../../mongo_models_new/credexon_general/SettingSchema');
const createUsersModel = require('../../mongo_models_new/credexon_vendor/UsersSchema');
const createTransactionsModel = require("../../mongo_models_new/credexon_vendor/TransactionsSchema");
const { ObjectID } = require('bson');

let phonePePay = async (req, res) => {
    
    const connection = await connectWithGeneralDb();
    const SettingSchema = createSettingsModel(connection);

    let settings = await SettingSchema.findOne({});
    let min_add_amount = settings.min_add_amount;
    let max_add_amount = settings.max_add_amount;


    let is_dev = "/pg/v1/pay";
    //let is_dev="";
    try {
        
        let params = req.body;

        if (params.amount > max_add_amount) {
            return res.status(200).send(response({}, "Max deposit limit is " + max_add_amount + ".", false))
        }
        if (min_add_amount > params.amount) {
            return res.status(200).send(response({}, "Min deposit limit is " + min_add_amount + ".", false))
        }
        
        const dbName = process.env.DBNAME_FOR_CREDEXON;//req.user.dbName;
        console.log("dbName--->>",dbName);
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const UsersSchema = createUsersModel(vendorDbConnection);
        const TransactionsSchema = createTransactionsModel(vendorDbConnection);

        const userDetail = await UsersSchema.findOne(
            { _id: ObjectID(params.userid) }, {'phone':1});
        let orderId = "CXON" + params.userid + (new Date() * 1);
        let data = {
            "merchantId": "CREDEXONONLINE",
            "merchantTransactionId": orderId, //"MT1222222268188102",
            "merchantUserId": "CXONID" + params.userid, //"MUID128",
            "amount": params.amount * 100,
            "redirectUrl": api_url + "/app/payment/responsephonepe",
            "redirectMode": "POST",
            "callbackUrl": "https://webhook.site/callback-url",
            "mobileNumber": userDetail.phone,
            "paymentInstrument": {
                "type": "PAY_PAGE"
            }
        }


        const encodedStr = Buffer.from(JSON.stringify(data)).toString('base64');
        let one = encodedStr + is_dev + "67f337b9-875c-4c91-bd55-8d3290247f5a";
        const hash = crypto.createHash('sha256').update(one).digest('hex') + "###1";

        // axios key
        const axios = require('axios');

        // url: 'https://api-preprod.phonepe.com/apis/merchant-simulator'+is_dev,
        const options = {
            method: 'POST',
            url: 'https://api.phonepe.com/apis/hermes' + is_dev,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': `${hash}`
            },
            data: {
                request: `${encodedStr}`
            }
        };

        axios.request(options).then(async function (result) {
            console.log("result--->>",result);
            await TransactionsSchema.create({
                userid: params.userid,
                amount: params.amount,
                order_id: orderId,
                ttype: "cr",
                atype: "bal_add_pen",
                trans_status: "pending"
            });
            return res.status(200).send(response(result.data.data, "Transaction is success", true))

        }).catch(function (error) {
            console.log("error--->>",error);
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        });


    } catch (error) {
        res.send(error)
    }
}

let phonePePayMobile = async (req, res) => {
    let is_dev = "/pg/v1/pay";
    //let is_dev="";
    try {
        
        let params = req.body;
        params.userid = req.user.id;
        let data = params.data;
        // const userDetail = await db.User.findOne({
        //     where: { id: params.userid }, attributes: ['phone'],
        // });
        let orderId = "CXON" + params.userid + (new Date() * 1);

        data["merchantId"] = "CREDEXONONLINE",
            data["merchantTransactionId"] = orderId,
            data["merchantUserId"] = "CXONID" + params.userid;
        data["redirectUrl"] = api_url + "/app/payment/responsephonepe/mobile";
        data["redirectMode"] = "POST";
        data["callbackUrl"] = api_url + "/app/payment/responsephonepe/mobile"; //"https://webhook.site/callback-url",
        //"amount": params.amount*100,

        //"mobileNumber": userDetail.phone,
        // "paymentInstrument": {
        //   "type": "PAY_PAGE"
        // }

        const encodedStr = Buffer.from(JSON.stringify(data)).toString('base64');
        let one = encodedStr + is_dev + "67f337b9-875c-4c91-bd55-8d3290247f5a";
        const hash = crypto.createHash('sha256').update(one).digest('hex') + "###1";

        // axios key
        const axios = require('axios');

        // url: 'https://api-preprod.phonepe.com/apis/merchant-simulator'+is_dev,
        const options = {
            method: 'POST',
            url: 'https://api.phonepe.com/apis/hermes' + is_dev,
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'X-VERIFY': `${hash}`
            },
            data: {
                request: `${encodedStr}`
            }
        };

        const dbName =process.env.APIKEY_FOR_CREDEXON;// req.user.dbName;
        const vendorDbConnection = await connectWithVendorDb(dbName);
        const TransactionsSchema = createTransactionsModel(vendorDbConnection);

        axios.request(options).then(async function (result) {
            await TransactionsSchema.create({
                userid: params.userid,
                amount: params.amount,
                order_id: orderId,
                ttype: "cr",
                atype: "bal_add_pen",
                trans_status: "pending"
            });
            return res.status(200).send(response(result.data.data, "Transaction is success", true))

        }).catch(function (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        });


    } catch (error) {
        res.send(error)
    }
}

let responsePhonePe = async (req, res) => {
    try {
        let { transactionId, iscron } = req.body;

        //////////////////////////
        //let resDetail=await paymentCheckSave(transactionId);
        ///////////////////////////


        // else{
        //     res.status(200).send(response({}, "Transaction is failed", true))
        // }
        if (iscron === 1) {
            res.status(200).send(response({}, resDetail.message, resDetail.status))
        } else {
            res.writeHead(301, {
                'Location': web_url + 'wallet'
                //add other headers here...
            });
            res.end();
        }


    } catch (error) {
        response({}, "Something went wrong.!!!", false, null, error.stack)
        res.writeHead(301, {
            'Location': web_url + 'wallet'
            //add other headers here...
        });
        res.end();
        //return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
    }
}

let responsePhonePeMobile = async (req, res) => {
    try {
        let base64string = req.body.response;

        if (!base64string || typeof base64string !== "string") {
            throw new Error("Invalid Base64 input");
        }

        // Create a buffer from the string
        let decodedString = Buffer.from(base64string, "base64").toString("utf8");
        let decodeParse = JSON.parse(decodedString);

        //let { code,transactionId,amount,providerReferenceId};
        let code = decodeParse.code;
        let transactionId = decodeParse.data.merchantTransactionId;
        //let amount=decodeParse.data.amount;
        let providerReferenceId = decodeParse.data.transactionId;

        //////////////////////////
        //let resDetail=await paymentCheckSave(transactionId);
        res.send(response({}, resDetail.message, resDetail.status))
        ///////////////////////////


    } catch (error) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));

    }
}

let addBns = async () => {
    let transList = await db.Transactions.findAll({//limit:2,
        order: [['id', 'ASC']]
        , where: { atype: { [Op.in]: ['wel_bns', 'refer_bns', 'add_amt_bonus'] }, id: { [Op.gt]: 149120 } }
    })//,"txdate":{[Op.gt]: 1691178302}
    await transList.forEach(async (item, index) => {
        let nintyPlusDate = item.txdate + (60 * 60 * 24 * 90);
        await db.Bonusbals.create({ "transid": item.id, "userid": item.userid, "atype": item.atype, "txdate": item.txdate, "expiry_date": nintyPlusDate, "amount": item.amount, "balamt": item.amount });
        console.log("transCnt--->>", index, item.id, item.userid, item.atype, item.txdate, nintyPlusDate);
    })
}
//addBns();

//Todo: Not using this
let paymentCheckSave = async (transactionId) => {
    return new Promise(async (resolve, reject) => {

        let addWalBal = 0;
        let addWltBns = 0;

        let updateTrans = await db.Transactions.update({ status: "progress" }, { where: { "order_id": transactionId, trans_status: { [Op.ne]: "PAYMENT_SUCCESS" } } });


        const TransDetail = await db.Transactions.findOne({
            where: {
                [Op.and]: [{ order_id: transactionId }]
            },//{ trans_status:code }
        });

        console.log("updateTrans---->>>", updateTrans, TransDetail?.dataValues?.status, TransDetail?.dataValues?.trans_status);


        let transTransStatus = (TransDetail?.dataValues?.trans_status) ? TransDetail?.dataValues?.trans_status : "";
        let transStatusCheck = (TransDetail?.dataValues?.status) ? TransDetail?.dataValues?.status : "";

        let response = { "status": false, "message": "" };
        if ((transTransStatus !== 'PAYMENT_SUCCESS') && (transStatusCheck === 'progress')) {
            let merchantTransactionId = transactionId;
            let hashString = "/pg/v1/status/CREDEXONONLINE/" + merchantTransactionId + "" + "67f337b9-875c-4c91-bd55-8d3290247f5a";

            const hash = crypto.createHash('sha256').update(hashString).digest('hex') + "###1";
            /////////////////////////////////
            const options = {
                method: 'GET',
                url: 'https://api.phonepe.com/apis/hermes/pg/v1/status/CREDEXONONLINE/' + merchantTransactionId + '',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': `${hash}`,
                    "X-MERCHANT-ID": "CREDEXONONLINE"
                }
            };

            axios.request(options).then(async function (result, err) {

                let respData = result.data;
                //////////////////////////////////
                let code = respData.code;

                let currentDates = currentTimeZoneDate() * 1 / 1000;


                try {
                    const connection = await connectWithGeneralDb();
                    const SettingSchema = createSettingsModel(connection);

                    let transactionId = (respData.data && respData.data.merchantTransactionId) ? respData.data.merchantTransactionId : merchantTransactionId;
                    let providerReferenceId = (respData.data && respData.data.transactionId) ? respData.data.transactionId : "";

                    let amount = TransDetail.dataValues.amount;

                    amount = (amount > 0) ? amount.toString() : "0";
                    //amount = parseFloat(amount) / 100
                    amount = parseFloat(amount);

                    let settings = await SettingSchema.findOne({});
                    let add_amt_bonus_perc = settings.add_amt_bonus_perc;
                    let gst_addamount_percentage = settings.gst_addamount_percentage;
                    let gstBnsAmtCal = gstCalculation(amount, gst_addamount_percentage, add_amt_bonus_perc);

                    let gstValue = gstBnsAmtCal.gst;
                    let gstDepoValue = gstBnsAmtCal.deposite;
                    let gstBnsValue = gstBnsAmtCal.bns;



                    const userDetail = await db.User.findOne({
                        where: { id: TransDetail.userid }, attributes: ['walletbalance', 'wltbns', 'gst', 'deviceId', 'rdevicetype', 'isfirstdepo'],
                    });
                    let lastGst = userDetail.gst;
                    let addGstUsr = 0;



                    let objTrans = {
                        trans_status: code,
                        txid: providerReferenceId,
                        txdate: currentDates,
                        atype: (code == "PAYMENT_SUCCESS" ? "bal_add" : "bal_fail"),
                        ttype: (code == "PAYMENT_SUCCESS" ? "cr" : "no"),
                        status: ""
                    }


                    if (code == "PAYMENT_SUCCESS") {
                        if (gst_addamount_percentage > 0) {

                            let objTransGst = {
                                "userid": TransDetail.userid,
                                "amount": gstValue, "txdate": currentDates,
                                "ttype": "cr", "atype": "add_amt_gst"
                            };
                            await db.Transactions.create(objTransGst);

                            amount = gstDepoValue;
                            addGstUsr = lastGst + gstValue;
                            objTrans["amount"] = gstDepoValue;
                        } else {
                            addGstUsr = lastGst;
                        }


                        let walletbalance = userDetail.walletbalance;
                        addWalBal = walletbalance + amount;

                        if (add_amt_bonus_perc > 0) {
                            let add_amt_bonus_amt = gstBnsValue;//(amount*add_amt_bonus_perc/100).toFixed(2);


                            let objTransBns = {
                                "userid": TransDetail.userid,
                                "amount": add_amt_bonus_amt, "txdate": currentDates,
                                "ttype": "cr", "atype": "add_amt_bonus", "bonusbal": add_amt_bonus_amt
                            };
                            let transCreate = await db.Transactions.create(objTransBns);

                            let nintyPlusDate = currentDates + (60 * 60 * 24 * 90);
                            await db.Bonusbals.create({ "transid": transCreate.id, "userid": userid, "atype": "add_amt_bonus", "txdate": currentDates, "expiry_date": nintyPlusDate, "amount": add_amt_bonus_amt, "balamt": add_amt_bonus_amt });

                            let wltbns = userDetail.wltbns;
                            wltbns = (wltbns > 0) ? wltbns : 0;
                            addWltBns = parseFloat(wltbns) + parseFloat(add_amt_bonus_amt);
                        } else {
                            addWltBns = parseFloat(wltbns);
                        }



                        let objTransDoc = { trans_id: TransDetail.id, amount: amount, currency: "IN", order_id: transactionId, method: "", transaction_id: providerReferenceId, created_at: currentDates }
                        await db.Transactionsdoc.create(objTransDoc);

                        let userUp = await db.User.update(
                            { "walletbalance": addWalBal, "wltbns": addWltBns, "gst": addGstUsr, isfirstdepo: 1 }, { where: { "id": TransDetail.userid } });
                        response = { "status": false, "message": "Transaction is success" };
                        resolve(response);

                    } else {
                        response = { "status": false, "message": "Transaction is failed" };
                        resolve(response);
                    }




                    await db.Transactions.update(objTrans, { where: { "order_id": transactionId } });


                    if (userDetail.deviceId && userDetail.isfirstdepo === 0 && code === "PAYMENT_SUCCESS") {
                        let deviceId = userDetail.deviceId;
                        let rdevicetype = userDetail.rdevicetype;
                        let userId = TransDetail.userid;
                        let pType = {
                            "android": "Android",
                            "ios": "iOS",
                            "web": "PC"
                        }

                        let singularUrl = "https://s2s.singular.net/api/v1/evt?p=" + pType[rdevicetype] + "&a=credexon_4457a6fa&n=" + code + "&custom_user_id=" + userId + "&amt=" + amount + "&cur=INR&is_revenue_event=true&use_ip=true";
                        if (rdevicetype === "android") {
                            singularUrl = singularUrl + "&i=com.credexon&aifa=" + deviceId + "";
                        } else if (rdevicetype === "ios") {
                            singularUrl = singularUrl + "&i=com.application.credexon&idfv=" + deviceId + "";
                        }
                        axios.request(singularUrl).then(async function (result, err) {
                        })
                    }



                } catch (e) {
                    console.log("e---->>", e)
                    response = { "status": false, "message": "Something went wrong" };
                    resolve(response);
                }
            }).catch(function (e) {
                console.log("eeee==>>", e);
                response = { "status": false, "message": "Something went wrong" };
                resolve(response);
                //WriteErrorLogs("phonePe", "verifyPaymentStatus", "", e.stack);
            });
        } else {
            if (transTransStatus === 'PAYMENT_SUCCESS') {
                response = { "status": false, "message": "Already payment added" };
                resolve(response);
            } else if (transStatusCheck === 'progress') {
                response = { "status": false, "message": "Payment in progress" };
                resolve(response);
            }
        }
    })

}

//Todo: Not using
let verifyPaymentStatus = async () => {
    const connection = await connectWithGeneralDb();
    const SettingSchema = createSettingsModel(connection);

    const TransList = await db.Transactions.findAll({
        where: {
            "trans_status": "pending", "order_id": "CXON94721691072667048"
        }
    });
    TransList.forEach(async (item, indexTrans) => {
        let Trans = item;

        if (Trans?.dataValues?.order_id) {

            let merchantTransactionId = Trans.dataValues.order_id;
            let hashString = "/pg/v1/status/CREDEXONONLINE/" + merchantTransactionId + "" + "67f337b9-875c-4c91-bd55-8d3290247f5a";

            const hash = crypto.createHash('sha256').update(hashString).digest('hex') + "###1";
            /////////////////////////////////

            const axios = require('axios');

            const options = {
                method: 'GET',
                url: 'https://api.phonepe.com/apis/hermes/pg/v1/status/CREDEXONONLINE/' + merchantTransactionId + '',
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'X-VERIFY': `${hash}`,
                    "X-MERCHANT-ID": "CREDEXONONLINE"
                }
            };

            axios.request(options).then(async function (result, err) {

                let respData = result.data;

                //////////////////////////////////
                try {

                    let code = respData.code;
                    let transactionId = (respData.data && respData.data.merchantTransactionId) ? respData.data.merchantTransactionId : merchantTransactionId;
                    //let amount=decodeParse.data.amount;
                    let providerReferenceId = (respData.data && respData.data.transactionId) ? respData.data.transactionId : "";

                    const Trans = await db.Transactions.findOne({
                        where: {
                            [Op.and]: [{ order_id: transactionId }, { trans_status: code }]
                        },
                    });

                    if (!(Trans)) {

                        //const userid=userid;
                        const TransDetail = await db.Transactions.findOne({
                            where: { order_id: transactionId },
                        });

                        let amount = TransDetail.dataValues.amount;

                        amount = (amount > 0) ? amount.toString() : "0";
                        //amount = parseFloat(amount) / 100
                        amount = parseFloat(amount);

                        txdate = currentTimeZoneDate() * 1 / 1000;
                        await db.Transactions.update({
                            trans_status: code,
                            txid: providerReferenceId,
                            txdate: txdate,
                            atype: (code == "PAYMENT_SUCCESS" ? "bal_add" : "bal_fail"),
                            ttype: (code == "PAYMENT_SUCCESS" ? "cr" : "no"),
                        }, { where: { "order_id": transactionId } });
                        const userDetail = await db.User.findOne({
                            where: { id: TransDetail.userid }, attributes: ['walletbalance', 'wltbns'],
                        });


                        let settings = await SettingSchema.findOne({});
                        let add_amt_bonus_perc = settings.add_amt_bonus_perc;

                        if (code == "PAYMENT_SUCCESS" && add_amt_bonus_perc > 0) {
                            let add_amt_bonus_amt = (amount * add_amt_bonus_perc / 100).toFixed(2);
                            let currentDates = currentTimeZoneDate() * 1 / 1000;

                            let objTransBns = {
                                "userid": TransDetail.userid,
                                "amount": add_amt_bonus_amt, "txdate": currentDates,
                                "ttype": "cr", "atype": "add_amt_bonus", "bonusbal": add_amt_bonus_amt
                            };
                            await db.Transactions.create(objTransBns);
                        }

                        let objTransDoc = { trans_id: TransDetail.id, amount: amount, currency: "IN", order_id: transactionId, method: "", transaction_id: providerReferenceId, created_at: txdate }
                        await db.Transactionsdoc.create(objTransDoc);

                        if (code == "PAYMENT_SUCCESS") {
                            let walletbalance = userDetail.walletbalance;
                            let addWalBal = walletbalance + amount;

                            let addWltBns = 0;
                            if (add_amt_bonus_perc > 0) {
                                let add_amt_bonus_amt = (amount * add_amt_bonus_perc / 100).toFixed(2);
                                let wltbns = userDetail.wltbns;
                                wltbns = (wltbns > 0) ? wltbns : 0;
                                addWltBns = parseFloat(wltbns) + parseFloat(add_amt_bonus_amt);
                            } else {
                                addWltBns = parseFloat(wltbns);
                            }

                            await db.User.update(
                                { "walletbalance": addWalBal, "wltbns": addWltBns, "isfirstdepo": 1 }, { where: { "id": TransDetail.userid } });

                            notificationTrigger(TransDetail.userid, "Payment Success:Credexon", "Your pending transaction of Rs." + addWalBal + " has been approved! You can now see the " + addWalBal + " coins in your credexon deposit wallet & " + addWltBns + " coins in your bonus wallet.");

                            response({}, "Transaction is success", true);
                        }
                        else {
                            notificationTrigger(TransDetail.userid, "Payment Failed:Credexon", "Your transaction of Rs." + addWalBal + " has been failed.");
                            response({}, "Transaction is failed", true)
                        }

                    } else {
                        response({}, "Transaction already done", true)
                    }




                } catch (error) {
                    response({}, "Something went wrong.!!!", false, null, error.stack);

                }
                ////////////////////////////////////

            }).catch(function (error) {
                // return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
            });
        }

    })
}

//verifyPaymentStatus();

module.exports = { phonePePay, responsePhonePe, phonePePayMobile, responsePhonePeMobile }