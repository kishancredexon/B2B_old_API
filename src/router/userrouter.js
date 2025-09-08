const express = require('express')
const multer = require("multer");
const router = express.Router()
const Joi = require('joi');
const validateRequest = require("../../middleware/validate.middleware");
const authorize = require("../../middleware/authorize.middleware");
const path = require("path");
const response = require("../../helper/response");
const env = process.env;
const formidable = require('formidable');
const singleFileRequest = require("../../middleware/files.middleware");
const userController = require('../controller/usercontroller')
const registerSchema = require('../../validate/registerSchema.validate');
const authenticatefrontSchema = require('../../validate/authenticatefrontSchema.validate')
const verifyfrontSchema = require('../../validate/verifyfrontSchema.validate')
const otpfrontSchema = require('../../validate/otpfrontSchema.validate')
const resetfrontSchema = require('../../validate/resetfrontSchema.validate')
const verifyemailSchema = require('../../validate/verifyemailSchema.validate')
const completeprofileSchema = require('../../validate/completeprofileSchema.validate')
const verificationSchema = require('../../validate/verificationSchema.validate')
const bankverifySchema = require('../../validate/bankverifySchema.validate')
const upiverifySchema = require('../../validate/upiverifySchema.validate')
const updatecompleteprofileSchema = require('../../validate/updatecompleteprofileSchema.validate')
const citySchema = require('../../validate/citySchema.validate')
const sateSchema = require('../../validate/sateSchema.validate')
const personaverificationSchema = require('../../validate/personaverificationSchema.validate')
const socialloginSchema = require('../../validate/socialloginSchema.validate')
// const { config } = require('process');
const config = require("../../config.json");
const { upcomingCricketList, playersCricketList, scoresCricketDetail, scoresCricketShortList } = require('../../service/apiCricket.service');
const verifygetprofileSchema = require('../../validate/verifygetprofileSchema.validate');
const sendAppLinkSchema = require('../../validate/sendAppLinkSchema.validate');
const sureVerificationSchema = require('../../validate/sureVerificationSchema.validate');
const otpemailfrontSchema = require('../../validate/otpemailfrontSchema.validate');
const verifyemailotpSchema = require('../../validate/verifyemailotpSchema.validate');
const authenticatefrontCheckSchema = require('../../validate/authenticatefrontCheckSchema.validate');


// storage engine for profile
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    },
})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5702400
    }
})


//Upload Files for profile
//router.post("/upload", upload.single('profile'), (req, res) => {

router.post("/upload", async (req, res) => {

    try {
        let db=(await sdb())[global.gdbname[req.user.apikey]];
        const params = req.body;
        const Userprofile = await db.Userprofile.findOne({
            where: {
                userid: params.userid
            }
        })
        let form_datas = {
            userid: params.userid
        }
        var form = new formidable.IncomingForm();
        form.multiples = true;

        form.parse(req, async function (err, fields, files) {
            // let files = req.files;

            if (Object.keys(files).length > 0) {
                let files_detail = { files: files, img_name: files.profilepic, folder_name: "profile_doc" }
                let file_name = await singleFileRequest(files_detail);
                // updateArray.image = file_name;
                form_datas.profilepic = file_name;

                if (Userprofile) {

                    try {
                        await db.Userprofile.update(
                            form_datas
                            , {
                                where: {
                                    userid: params.userid
                                }
                            });
                    }
                    catch (error) {
                        return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
                    }

                } else {
                    await db.Userprofile.create(form_datas);
                }
                return res.send(response({
                    profile: `${env.awsimgurl}profile_doc/${file_name}`,
                    profile_url: file_name,
                }));
            }
        })
    } catch (error) {
        return res.status(400).send(response({}, "Something went wrong.!!!", false,null,error.stack));
    }
    

})


// storage engine for identity_proof
const storageIdetityProof = multer.diskStorage({
    destination: './upload/identity_proof',
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now());
    }
})

const uploadIdentityProof = multer({
    storage: storageIdetityProof,
    limits: {
        fileSize: 5702400
    }
})


//Upload Files for identity_proof
router.post("/upload/identity_proof", uploadIdentityProof.single('file'), (req, res) => {
    
    return res.send(response({

        files: req.file.filename
    }));
})
// /otp: Joi.number().required().messages({
//     'number.base': `Please enter OTP`
// }),

router.post('/get_profile', authorize, verifygetprofileSchema, userController.getProfile);
router.post('/register', registerSchema, userController.userRegister);
router.post('/login', authenticatefrontSchema, userController.authenticate);
router.post('/social_login', socialloginSchema, userController.social_login);
router.post('/send_app_link', sendAppLinkSchema, userController.send_app_link);
router.post('/update_token',authorize, userController.update_token);
router.post('/verifyphone', verifyfrontSchema, userController.verifyUser);
router.post('/resend', otpfrontSchema, userController.otpSend);
router.post('/forgot', otpfrontSchema, userController.forgotPassword);
router.post('/verifyotp', verifyfrontSchema, userController.verifyOtp);
router.post('/reset', authorize, resetfrontSchema, userController.resetPassword);
router.post('/verifyemail', verifyemailSchema, userController.verifyEmail);
router.post('/completeprofile', authorize, completeprofileSchema, userController.completeprofile);
router.post('/update_profile', authorize, updatecompleteprofileSchema, userController.updateCompleteProfile)
router.post('/city', citySchema, userController.city_list)
router.post('/state', sateSchema, userController.state_list)
router.post('/verification', authorize, verificationSchema, userController.verrification);
router.post('/bankverification', authorize, bankverifySchema, userController.bankverify)
router.post('/upiverification', authorize, upiverifySchema, userController.upiverification)
router.get('/view', authorize, userController.transaction_view)
router.get('/wallet_view', authorize, userController.wallet_view)
router.post('/persona_verify', authorize, personaverificationSchema, userController.personal_verify_user)
router.post('/sure_verify', authorize, sureVerificationSchema, userController.sure_verify_user)
router.post('/cricket/uc', upcomingCricketList);
router.post('/cricket/players', playersCricketList);
router.post('/cricket/scores', scoresCricketDetail);
router.post('/cricket/scores/short', scoresCricketShortList); 
router.post('/wallet/withdraw_request', authorize, userController.withdraw_amount)
router.post('/invite_count',authorize, userController.referal_send_count)
router.post('/refer_earn',authorize, userController.referal_calculation)
router.get('/refer_earn_user',authorize, userController.referal_calculation)


router.post('/send-email-otp',authorize,otpemailfrontSchema, userController.otpEmailSend);
router.post('/verify-email-otp',authorize,verifyemailotpSchema, userController.verifyEmailOtp);

router.get('/a/:id',userController.countApiHit);

router.get('/email_test', userController.emailTestSend);


router.get('/signin', authenticatefrontCheckSchema, userController.authenticate_vendor);

module.exports = router;


