const Checkvalue = {
    template_id: "1207166792180292875",
    // mobile: 91 + user.mob_no,
    mobile:9610281124,
    authkey: "380471ARpcb0dLmG262eb9029P1",
    otp: otp,
}
msg91.sendOTP(Checkvalue).then((success) => {
}).catch((error) => {
})

// var msg91 = require("msg91")("380471ARpcb0dLmG262eb9029P1");
// var args = {
//     "flow_id": "EnterflowID",
//     "sender": "EnterSenderID",
//     "mobiles": "Enter Mobile Number/Numbers separated by comma", 
//     "VAR1": "VALUE1",
//     "VAR2": "VALUE2"
//   };
  
//   msg91.sendSMS(args, function(err, response){
//   });


function get_sms(msg_type, msg_detail) {
    if (msg_type == 'signup') {
        return {
            sms: {
                title: 'signup',
                body: `Hi ${msg_detail.user_name},Your account has been registered successfully on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'professional_new_bookingrequest') {
        return {
            sms: {
                title: 'professional_new_bookingrequest',
                body: `Hi ${msg_detail.user_name}, Your appointment Booked Successfully on ${process.env.website}.`


            }
        }
    } else if (msg_type == 'confirmation_accept_bookingrequest') {
        return {
            sms: {
                title: 'confirmation_accept_bookingrequest',
                body: `Hi ${msg_detail.user_name}, Your Booking confirmed on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'confirmation_sms_accept_reschedulebookingrequest') {
        return {
            sms: {
                title: 'confirmation_sms_accept_reschedulebookingrequest',
                body: `Hi ${msg_detail.user_name}, Your Booking Reschedule Successfully on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'cancelled_sms_booking_request') {
        return {
            sms: {
                title: 'cancelled_sms_booking_request',
                body: `Hi ${msg_detail.user_name}, Your Booking Cancelled successfully on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'alert_24hours_sms') {
        return {
            sms: {
                title: 'alert_24hours_sms',
                body: `Hi ${msg_detail.user_name},Your appointment will be started in 24 hours on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'alert_15minutes_sms') {
        return {
            sms: {
                title: 'alert_15minutes_sms',
                body: `Hi ${msg_detail.user_name},Your appointment will be started in 15 minutes on ${process.env.website}.`

            }
        }
    } else if (msg_type == 'approve_sms_blog_post') {
        return {
            sms: {
                title: 'approve_sms_blog_post',
                body: `Hi ${msg_detail.user_name}, Your Blog Active Successfully on ${process.env.website}.`

            }
        }
    }

    else {
        throw `msg type ${msg_type} not recognised`
    }
}

module.exports = {
    
    sender_sms: async (user, msg_type, msg_detail) => {
        let sms_notification = user.sms_notification
        if (sms_notification == 0) {
           return
        }

        const msg = get_sms(msg_type, msg_detail)
        let data = {
            msg_type: msg_type,
            msg_detail: JSON.stringify(msg_detail)
        }
        Object.assign(msg, {
            data: data
        })


        let country_code = user.country_code
        let phone = user.phone

//8072991602
        var args = {
            "flow_id": "EnterflowID",
            "sender": "EnterSenderID",
            "mobiles": "Enter Mobile Number/Numbers separated by comma", 
            "VAR1": "VALUE1",
            "VAR2": "VALUE2"
          };
          
          msg91.sendSMS(args, function(err, response){
              
          });
        // const message = await client.messages.create({
        //     body: `${msg.sms.body}`,
        //     to: country_code + phone, // Text this number
        //     from: process.env.twilioNumber, // From a valid Twilio number
        // });
        Object.assign(msg, {
            message: message
        })
    }
}