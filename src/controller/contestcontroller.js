const config = require("../../config.json");
const jwt = require("jsonwebtoken");

const bcrypt = require("bcryptjs");
const moment = require("moment")


var fs = require("fs");
const response = require("../../helper/response");
const e = require("express");

module.exports = {
    contest_list:async(req,res,next)=>{
        try {
            
        } catch (error) {
            return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
        }
    }
}


//Todo: Not using commenting the code
//async
// async function getContest(contest_id) {
//     let contestlist = await contestsSchema.find({});
    
//     return contestlist;
// }

