let sdb = require("../../models");
const response = require("../../helper/response");

const Razorpay = require('razorpay');
var crypto = require('crypto');
const { dateTimeChange, currentTimeZoneDate } = require("../../helper/common");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createSettingsModel = require("../../mongo_models_new/credexon_general/SettingSchema");

//Todo: Need to move into .env file
const razorpayInstance = new Razorpay({

    // Replace with your key_id
    key_id: "rzp_test_sBByppWgw98l9Z",

    // Replace with your key_secret
    key_secret: "ewei3TtT24mHXDhuK6RHVWCb"
});

//const cms = require("../../mongo_models/cmsSchema");

//const {cms_content_limit} = require("../model/contestmodel")
// let paymentDetailCheck=async()=>{
// let paymentDetail = await razorpayInstance.payments.fetch("pay_KxlEHpEWMwrr7I");

// }
// paymentDetailCheck();


module.exports = {
    createOrderInTrans: async (req, res, next) => {
        try {
            let db = (await sdb())[global.gdbname[req.user.apikey]];
            let { amount, order_id, txid, txdate, currency, userid, trans_status } = req.body;
            //const userid=userid;


            amount = (amount > 0) ? amount.toString() : "0";
            amount = parseFloat(amount);// * 100

            const TransDetail = await db.Transactions.findOne({
                where: { order_id: order_id },
            });


            if (TransDetail) {
                amount = TransDetail.amount;
                if (TransDetail.trans_status == "pending") {
                    const connection = await connectWithGeneralDb();
                    const SettingSchema = createSettingsModel(connection);

                    let settings = await SettingSchema.findOne({});
                    let add_amt_bonus_perc = settings.add_amt_bonus_perc;

                    if (trans_status == "success" && add_amt_bonus_perc > 0) {
                        let add_amt_bonus_amt = (amount * add_amt_bonus_perc / 100).toFixed(2);
                        let currentDates = currentTimeZoneDate() * 1 / 1000;

                        let objTransBns = {
                            "userid": userid,
                            "amount": add_amt_bonus_amt, "txdate": currentDates,
                            "ttype": "cr", "atype": "add_amt_bonus", "bonusbal": add_amt_bonus_amt
                        };
                        let transCreate = await db.Transactions.create(objTransBns);
                    }

                    userid = TransDetail.userid
                    txdate = currentTimeZoneDate() * 1 / 1000;
                    await db.Transactions.update({
                        trans_status: trans_status,
                        txid: txid,
                        txdate: txdate,
                        atype: (trans_status == "success" ? "bal_add" : "bal_fail"),
                        ttype: (trans_status == "success" ? "cr" : "no"),
                    }, { where: { "order_id": order_id } });
                    const userDetail = await db.User.findOne({
                        where: { id: userid }, attributes: ['walletbalance', 'wltbns'],
                    });

                    let objTransDoc = { trans_id: TransDetail.id, amount: amount, currency: currency, order_id: order_id, method: "", transaction_id: txid, created_at: txdate }
                    await db.Transactionsdoc.create(objTransDoc);

                    if (trans_status == "success") {
                        let walletbalance = userDetail.walletbalance;
                        let addWalBal = walletbalance + amount;

                        let addWltBns = 0;
                        if (add_amt_bonus_perc > 0) {
                            let add_amt_bonus_amt = (amount * add_amt_bonus_perc / 100).toFixed(2);
                            let wltbns = userDetail.wltbns;
                            addWltBns = wltbns + add_amt_bonus_amt;
                        } else {
                            addWltBns = wltbns;
                        }

                        let user = await db.User.update(
                            { "walletbalance": addWalBal, "wltbns": addWltBns }, { where: { "id": userid } });
                        res.status(200).send(response({}, "Transaction is success", true))
                    } else {
                        res.status(200).send(response({}, "Transaction is failed", true))
                    }
                } else {
                    res.status(200).send(response({}, "No process is there", true))
                }

            } else {
                await db.Transactions.create({
                    userid: userid,
                    amount: amount,
                    order_id: order_id,
                    ttype: "cr",
                    atype: "bal_add_pen",
                    trans_status: "pending"
                });
                res.status(200).send(response({}, "Transaction is initiated", true))
            }



            //let userid= req.user.id;
            // const userDetail = await db.User.findOne({
            //     where: { id: userid }, attributes: ['phone', 'email'],
            // });
            //res.redirect('https://phpapi.credexon.com/TrnPayrequest_form.php')
            // res.writeHead(301, {
            //                 'Location': 'http://localhost:8882/matches'
            //                 //add other headers here...
            //               });
            //               res.end();
            // return;
            // razorpayInstance.orders.create({ amount, currency, receipt, notes },
            //     (err, order) => {

            //STEP 3 & 4: 
            //if (!err){
            //////////////
            /*
                let ressss=  await axios.post(
                'https://phpapi.credexon.com/TrnPayRequest.php',
                { json: { 'Mid':'900000000000195',
                'SecretKey':'scrjCnDsWBg2NyHymGiPiHeoxdXjLoxxl8z',
                'SaltKey':'salhRFSA7PBmbsnWCD4qtu9nuBFAfZVfS',
                'OrderNo':'ORD'+(new Date()*1),
                'TotalAmount':amount,
                'CurrencyName':'INR',
                'MeTransReqType':'S',
                'EmailId':userDetail.email,
                'MobileNo':userDetail.phone
             } },{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    crossDomain: true
                }
            });
            */



            // function (error, response, body) {

            //     if (!error && response.statusCode == 200) {

            //     }
            // }
            //);

            // res.writeHead(301, {
            //     'Location': 'https://phpapi.credexon.com/TrnPayrequest_form.php'
            //     //add other headers here...
            //   });
            //   res.end();
            //////////////
            //res.json({});
            //     }
            // else{
            //     res.send(err);
            // }
            //}
            //)
            // }) 
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    createOrder: async (req, res, next) => {
        try {
            let db = (await sdb())[global.gdbname[req.user.apikey]];
            const { currency, receipt, notes } = req.body;

            let amount = req.body.amount;
            amount = parseInt(amount);// * 100

            const userDetail = await db.User.findOne({
                where: { id: userid }, attributes: ['walletbalance'],
            });

            let walletbalance = userDetail.walletbalance;
            let addWalBal = walletbalance + paymentDetail.amount;

            let objTransMethod = {
                "upi": "upi",
                "netbanking": "bank"
            }

            let transType = objTransMethod[paymentDetail.method];
            let user = await db.User.update(
                { "walletbalance": addWalBal }, { where: { "id": userid } });
            let currentDate = currentTimeZoneDate() * 1 / 1000;
            let objTransBal = { "userid": userid, "txid": paymentDetail.id, "amount": paymentDetail.amount, "txdate": currentDate, "ttype": "cr", "atype": "bal_add" };
            let trans_id = await db.Transactions.create(objTransBal);


            //paymentDetail.acquirer_data[transType+"_transaction_id"]
            let objTransDoc = { trans_id: trans_id.id, payment_id: paymentDetail.id, amount: paymentDetail.amount, currency: paymentDetail.currency, order_id: paymentDetail.order_id, method: paymentDetail.method, vpa: paymentDetail.vpa, transaction_id: paymentDetail.id, created_at: paymentDetail.created_at }
            await db.Transactionsdoc.create(objTransDoc);

            //let userid= req.user.id;
            // const userDetail = await db.User.findOne({
            //     where: { id: userid }, attributes: ['phone', 'email'],
            // });
            //res.redirect('https://phpapi.credexon.com/TrnPayrequest_form.php')
            // res.writeHead(301, {
            //                 'Location': 'http://localhost:8882/matches'
            //                 //add other headers here...
            //               });
            //               res.end();
            // return;
            // razorpayInstance.orders.create({ amount, currency, receipt, notes },
            //     (err, order) => {

            //STEP 3 & 4: 
            //if (!err){
            //////////////
            /*
                let ressss=  await axios.post(
                'https://phpapi.credexon.com/TrnPayRequest.php',
                { json: { 'Mid':'900000000000195',
                'SecretKey':'scrjCnDsWBg2NyHymGiPiHeoxdXjLoxxl8z',
                'SaltKey':'salhRFSA7PBmbsnWCD4qtu9nuBFAfZVfS',
                'OrderNo':'ORD'+(new Date()*1),
                'TotalAmount':amount,
                'CurrencyName':'INR',
                'MeTransReqType':'S',
                'EmailId':userDetail.email,
                'MobileNo':userDetail.phone
             } },{
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                    crossDomain: true
                }
            });
            */



            // function (error, response, body) {

            //     if (!error && response.statusCode == 200) {

            //     }
            // }
            //);

            // res.writeHead(301, {
            //     'Location': 'https://phpapi.credexon.com/TrnPayrequest_form.php'
            //     //add other headers here...
            //   });
            //   res.end();
            //////////////
            //res.json({});
            //     }
            // else{
            //     res.send(err);
            // }
            //}
            //)
            // }) 
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    },
    verifyOrder: async (req, res, next) => {
        try {
            let db = (await sdb())[global.gdbname[req.user.apikey]];
            const { order_id, payment_id } = req.body;
            const razorpay_signature = req.body.signature   //req.body['x-razorpay-signature'];
            let userid = req.user.id;
            // Pass yours key_secret here
            const key_secret = 'ewei3TtT24mHXDhuK6RHVWCb';

            // STEP 8: Verification & Send Response to User

            // Creating hmac object 
            let hmac = crypto.createHmac('sha256', key_secret);

            // Passing the data to be hashed
            hmac.update(order_id + "|" + payment_id);

            // Creating the hmac in the required format
            const generated_signature = hmac.digest('hex');




            if (razorpay_signature === generated_signature) {
                let paymentDetail = await razorpayInstance.payments.fetch(payment_id);

                ///////////
                const userDetail = await db.User.findOne({
                    where: { id: userid }, attributes: ['walletbalance'],
                });

                let walletbalance = userDetail.walletbalance;
                let addWalBal = walletbalance + paymentDetail.amount;

                let objTransMethod = {
                    "upi": "upi",
                    "netbanking": "bank"
                }

                let transType = objTransMethod[paymentDetail.method];
                let user = await db.User.update(
                    { "walletbalance": addWalBal }, { where: { "id": userid } });
                let currentDate = currentTimeZoneDate() * 1 / 1000;
                let objTransBal = { "userid": userid, "txid": paymentDetail.id, "amount": paymentDetail.amount, "txdate": currentDate, "ttype": "cr", "atype": "bal_add" };
                let trans_id = await db.Transactions.create(objTransBal);


                //paymentDetail.acquirer_data[transType+"_transaction_id"]
                let objTransDoc = { trans_id: trans_id.id, payment_id: paymentDetail.id, amount: paymentDetail.amount, currency: paymentDetail.currency, order_id: paymentDetail.order_id, method: paymentDetail.method, vpa: paymentDetail.vpa, transaction_id: paymentDetail.id, created_at: paymentDetail.created_at }
                await db.Transactionsdoc.create(objTransDoc);
                ////////////
                res.json({ success: true, message: "Payment has been verified" })
            } else {
                res.json({ success: false, message: "Payment verification failed" })
            }
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
        }
    }
}   