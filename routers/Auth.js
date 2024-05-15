const express = require("express");
const {
    getChangePassword,
    changepassword,
} = require("../controllers/authController");

const router = express.Router();

//change password
router.get("/changepassword:/token", getChangePassword);
router.post("/changepassword/:token", changepassword);

module.exports = router;
