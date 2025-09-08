const express = require("express");
const router = express.Router();
const Joi = require("joi");
const validateRequest = require("../../middleware/validate.middleware").default;
const authorize = require("../../middleware/authorize_admin.middleware");

const multer = require("multer");
const path = require("path");
const config = require("../../config.json");

const userController = require("../controller/usercontroller");
const response = require("../../helper/response");
const createUserSchema = require("../../validate/createUserSchema.validate");
const authenticateSchema = require("../../validate/authenticateSchema.validate");
const forgotSchema = require("../../validate/forgotSchema.validate");
const activeinactiveSchema = require("../../validate/activeinactiveSchema.validate");
const updateSchema = require("../../validate/updateSchema.validate");
const updatecustomizationSchema = require("../../validate/updatecustomizationSchema.validate");
const deleteUserSchema = require("../../validate/deleteUserSchema.validate");
const viewSchema = require("../../validate/viewSchema.validate");
const bankverifyadminSchema = require("../../validate/bankverifyadminSchema.validate");
const adminupdateprofileSchema = require("../../validate/adminupdateprofileSchema.validate");
const colorDeatilsSchema = require("../../validate/colorDeatilsSchema.validate");
const transWithSchema = require("../../validate/transWithSchema.validate");
module.exports = router;

router.post("/create", createUserSchema, userController.create);
router.post("/login", authenticateSchema, userController.authenticate); // Todo: Need to verify
router.get("/logout", authorize, userController.logout); // Done
router.post("/forgot", authorize, forgotSchema, userController.forgotPassword);
router.get("/list", authorize, userController.list); // Done
router.post("/uservendorList", authorize, userController.list_vendor); // Done
router.post("/userList", authorize, userController.list); // Done
router.get("/bank_list", userController.bank_list);
router.post(
  "/bank_verified",
  bankverifyadminSchema,
  userController.bank_verify
);

router.post(
  "/active-inactive",
  authorize,
  activeinactiveSchema,
  userController.activeInactiveuser
);// Done
router.post("/update-user", authorize, updateSchema, userController.updateUser);

router.delete("/delete", deleteUserSchema, userController.delete_user);
router.post("/view", authorize, viewSchema, userController.user_detail);// Dono//Todo: Authorize added

router.post("/payment_access", userController.payment_access);
router.post("/transaction_list", userController.transaction_list);
router.post("/change_password", authorize, userController.change_password); // Done

router.post(
  "/update_profile",
  authorize,
  adminupdateprofileSchema,
  userController.update_profile
); // Done

router.post(
  "/trans_withdraw_req",
  authorize,
  transWithSchema,
  userController.user_withdrawal_request
);
router.post(
  "/trans_tds_req",
  authorize,
  transWithSchema,
  userController.user_tds_request
);

// storage engine
const storage = multer.diskStorage({
  destination: "./upload/images",
  filename: (req, file, cb) => {
    return cb(
      null,
      `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5702400,
  },
});
//Upload Files for profile
router.post("/upload", upload.single("profile"), (req, res) => {
  return res.send(
    response({
      profile_url: config.profile_url + req.file.filename,
      profile: req.file.filename,
    })
  );
});

//Login
function authenticateSchema1(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}
//Create User
function createUserSchema1(req, res, next) {
  const schema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().required(),
    usertype: Joi.number().required(),
    country_code: Joi.string().required(),
    phone: Joi.string().required(),
    password: Joi.string().required(),
    logintype: Joi.string().required(),
    profilepic: Joi.string().allow("").optional(),
  });
  validateRequest(req, next, schema);
}
//Forgot password
function forgotSchema1(req, res, next) {
  const schema = Joi.object({
    phone: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

router.post(
  "/theme-customization",
  authorize,
  upload.none(),
  updatecustomizationSchema,
  userController?.update_theme_profile
);
router.post(
  "/get-theme-customization",
  authorize,
  upload.none(),
  colorDeatilsSchema,
  userController.get_theme_customization
);
