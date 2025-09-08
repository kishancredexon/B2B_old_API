const Hogan = require('hogan.js');
const fs = require('fs');
const sgMail = require('@sendgrid/mail')

const emailApiKey = process.env.emailApiKey;

let emailTrigger = async (email, otp) => {
  const template = fs.readFileSync(__dirname + "/../views/send_email.hjs", 'utf8');
  const compiledTemplate = Hogan.compile(template);

  sgMail.setApiKey(emailApiKey);

  const msg = {
    from: 'support@credexon.com', // sender address
    to: email, // list of receivers
    subject: "OTP Verification", // Subject line
    html: compiledTemplate.render({ otp: otp })
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(JSON.stringify(error))
    })
}

let emailVendorCredential = async (email, password, apikey) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(__dirname + "/../views/send_email_vendor.hjs", 'utf8');
    const compiledTemplate = Hogan.compile(template);

    sgMail.setApiKey(emailApiKey);

    const msg = {
      from: 'support@credexon.com', // sender address
      to: email, // list of receivers
      subject: "Vendor - Credential", // Subject line
      html: compiledTemplate.render({ email: email, password: password, apikey: apikey })
    }

    sgMail
      .send(msg)
      .then(() => {
        console.log('Email sent')
        resolve(true);
      })
      .catch((error) => {
        resolve(JSON.stringify(error))
      })

  })
}

let contactUsRequest = async (name, email, phone, subject, message) => {
  const template = fs.readFileSync(__dirname + "/../views/send_contact_email.hjs", 'utf8');
  const compiledTemplate = Hogan.compile(template);

  sgMail.setApiKey(emailApiKey);

  const msg = {
    from: 'support@credexon.com', // sender address
    to: 'social.credexon@gmail.com', // list of receivers
    subject: "New contact request is recevied", // Subject line
    html: compiledTemplate.render({ name: name, email: email, phone: phone, subject: subject, message: message })
  }

  sgMail
    .send(msg)
    .then(() => {
      console.log('Email sent')
    })
    .catch((error) => {
      console.error(JSON.stringify(error))
    })
}

module.exports = { emailTrigger, contactUsRequest, emailVendorCredential };
