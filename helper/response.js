//const { WriteErrorLogs } = require('./common');

const moment = require("moment");
let fs = require('fs');
const { currentTimeZoneDate } = require("./common");


let dateTimeChange = (strdatetime, is_current) => {
  if (process.env.NODE_ENV == "production") {
    if (is_current == 1) {
      return new Date(new Date(strdatetime).toLocaleString("en-US", { timeZone: process.env.TIMEZONE }))
    } else {
      //return new Date(strdatetime)
      return new Date(new Date(strdatetime).toLocaleString("en-US", { timeZone: process.env.TIMEZONE }))
    }
  } else {
    return new Date(new Date(strdatetime).toLocaleString("en-US", { timeZone: process.env.TIMEZONE }))
  }
}

const response = (data, message = "success", status, total_count, error) => {
  let strdatetime=new Date()*1+(1000*60*60*5+1000*60*30);
  let currentDates = new Date(strdatetime);
  if (error) {
    console.log("error===>>", error)
    ErrorLogs("ErrorLog", "ErrorLog", "", error);
  }
  return {
    status: status,
    data: data,
    message: message,
    total_count: total_count,
    current_timezone: currentDates,
    currenttime: currentDates * 1
  };

};


function ErrorLogs(type, module, errorCode, msg) {
  //console.log("type, module, errorCode, msg---->>",type, module, errorCode, msg)
  var date = moment(new Date()).format("YYYY-MM-DD");
  var fillename = 'Log_' + type + '_' + date + ".txt";

  let CurrDate = moment(new Date()).format("YYYY-MM-DD hh:mm:ss");
  var dataTest = CurrDate + '  ----  ' + type + '  ----  ' + module + ' ---- ' + errorCode + ' ---- ' + msg + ' \n\r';

  fs.appendFile('./logs/error/' + fillename, dataTest, function (err) {
  });
}

module.exports = response;