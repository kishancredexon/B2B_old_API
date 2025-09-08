// const config = require("../../config.json");
// const jwt = require("jsonwebtoken");

// const bcrypt = require("bcryptjs");
// const moment = require("moment")


// var fs = require("fs");
// const db = require("../../models");
// const response = require("../../helper/response");
// const e = require("express");

// module.exports = {
//     create_contactus: async (req, res, next) => {
//         try {
//             const params = req.body
//         //     if (await db.ContactUs.findOne({
//         //         where: {
//         //             name: params.name,
//         //             subject:params.subject
//         //         }
//         //     })) {
//         //         return res.send(response({}, "your enquiry is already taken..",true));
//         //     // throw 'your enquiry is already taken.';
//         // }
//             const constactus = await db.ContactUs.create(params);
//             return res.send(response({}, "Thanks for your enquiry. We will contact you soon.!!!.",true));
//         } catch (error) {
//             return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
//         }
//     }
// }v

const response = require("../../helper/response");
const contactUsRequest = require("../../middleware/kyctrigger");
const { connectWithGeneralDb } = require("../../config/mongodb_connections");
const createContactUsModel = require("../../mongo_models_new/credexon_general/ContactUsSchema");

// const ym_contact
let create_contactus = async (req, res, next) => {
    try {
        let name = req.body.name;
        let email = req.body.email;
        let phone = req.body.phone;
        let subject = req.body.subject;
        let message = req.body.message;
        let obj = {
            name,
            email,
            phone,
            subject,
            message
        }
        // send mail functionality
        const Checkvalue = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            subject: req.body.subject,
            message: req.body.message
        }

        contactUsRequest(req.body.name, req.body.email, req.body.phone, req.body.subject, req.body.message).then((success) => {

        }).catch((error) => {

            //return res.status(400).send(response({}, "Something went wrong with mail.!!!", false,null,error.stack));
        })

        const generalDbConnection = await connectWithGeneralDb();
        const ContactUsSchema = createContactUsModel(generalDbConnection);

        await ContactUsSchema.create(obj); //Todo: API key is removed
        return res.send(response({}, "Thank you! We will connect you soon.", true));


    } catch (error) {

        return res.status(400).send(response({}, "Something went wrong.!!!", false, null, error.stack));
    }
}



module.exports = {
    create_contactus: create_contactus
}
