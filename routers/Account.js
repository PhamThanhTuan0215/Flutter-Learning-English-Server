const express = require("express");
const router = express.Router();
const {
    register,
    login,
    getProfile,
} = require("../controllers/accountController");

//[post] /register
router.post("/register", register);

//[post] /login
router.post("/login", login);

//[get] /:uid
router.get("/:uid", getProfile);

module.exports = router;
