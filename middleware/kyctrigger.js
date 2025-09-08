const Hogan = require('hogan.js');
const fs = require('fs');
const sgMail = require('@sendgrid/mail');

let KycTrigger = async (email, MailSubject, MailMessage) => {
  let template = fs.readFileSync(__dirname + "/../views/kyc_email.hjs", 'utf8');
  var compiledTemplate = Hogan.compile(template);

  sgMail.setApiKey(process.env.emailkyckey);

  const msg = {
    from: 'support@credexon.com', // sender address
    to: email, // list of receivers
    subject: MailSubject, // Subject line
    html: compiledTemplate.render({ MailMessage: MailMessage })
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error("KycTriggerERROR-->>",JSON.stringify(error))
    })
}

module.exports = KycTrigger;
