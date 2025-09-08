const express = require("express");
const router = express.Router();
const authorize = require("../../middleware/authorize_admin.middleware");
const reportManagementController = require("../controller/reportmanagement");

router.post("/get_match_list", authorize, reportManagementController.get_match_list); // Todo: Need to check with raman
router.post("/get_report_data", authorize, reportManagementController.get_report_data);
router.post("/get_report_download", authorize, reportManagementController.get_report_download);
router.get("/get-downloads", authorize, reportManagementController.getDownloadableFiles); // Done
router.get("/download-file/:fileId", authorize, reportManagementController.downloadFile); // Done
router.delete("/files", authorize, reportManagementController.deleteAllFiles);
router.get("/get_download_affiliates", reportManagementController.get_track_download); //get_track_download
router.get("/mongo_export_csv", reportManagementController.fetch_data); //fetch_data
router.get("/update_user", reportManagementController.updateUser);

module.exports = router;
