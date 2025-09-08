//External Imports
const Joi = require("@hapi/joi");
const _ = require("lodash");
//const common = require("./common");

//Custom Imports
//const constants = require("../utils/constants");

// Initialize validator
module.exports = (schema) => (req, res, next) =>
  validate(schema, req, res, next);
/**
 * @public
 * @description To validate request from client
 * @param {Object} schema holds the schema to validate
 * @param {Object} req holds the request from client
 */


let validate = async (schema, req, res, next) => {
  // Extract request data
  const data = extractor(req, schema);
  try {
    //Validate request
    const validatedData = await Joi.validate(data, schema, {
      stripUnknown: { objects: true },
    });
    // Replace req with the valid data after validation
    assigner(validatedData, req);
    next();
  } catch (error) {
    //Bad Request
    // let errorMsg = common.errorMsgReplace(getValidationErrorMessage(error).message);
    // return res.status(constants.BAD_REQUEST.code).json({
    //   error: true,
    //   code: constants.BAD_REQUEST.code,
    //   message:
    //     errorMsg ||
    //     constants.BAD_REQUEST.message,
    //   data: null,
    // });
  }
};

/**
 * @private
 * @description To generate schema validation fail error message
 * @returns {object}
 */
let getValidationErrorMessage = (error) => {
  return error.details.map(({ message }) => ({
    message: message.replace(/['"]/g, ""),
  }))[0];
};

/**
 * @private
 * @description To extract data from request
 * @param {Object} schema holds the schema to validate
 * @param {Object} req holds the request from client
 */
let extractor = (req, schema) => {
  const data = {};
  //
  for (let property of ["params", "body", "query"]) {
    //
    if (!_.isEmpty(req[property])) {
    
      //
      data[property] = req[property];
    } else if (schema[property]) {
      //
      data[property] = {};
    }
  }

  return data;
};

/**
 * @private
 * @description To assign validated data to request
 * @param {Object} body holds the request body
 * @param {Object} query holds the request query string
 * @param {Object} params holds the request query parameters
 * @param {Object} req holds the request from client
 */
let assigner = ({ body, query, params }, req) => {
  if (body) {
    req.body = body;
  }
  if (query) {
    req.query = query;
  }
  if (params) {
    req.params = params;
  }
};