const Account = require("../models/Account");
const package = require("../middlewares/package");
const jwt = require("jsonwebtoken");
const bcypt = require("bcrypt");

module.exports = {
    getChangePassword: (req, res) => {
        res.render("auth/changepassword");
    },
    changepassword: async (req, res) => {
        try {
            const token = req.params.token;
            const { pasword } = req.body;
            if (!token) {
                return res.json(package(1, "Token is invalid", null));
            }

            jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
                if (err) {
                    return res.json(package(1, "Token is invalid", null));
                }

                const { email } = decode;
                const user = Account.findOne({ email });
                if (!user) return res.json(package(1, "Token is invalid"));

                const hashedPassword = bcypt.hashSync(pasword, 10);
                user.pasword = hashedPassword;
                await user.save();
                return res.json(
                    package(0, "Change password successfully", null)
                );
            });
        } catch (error) {
            res.json(package(2, "Internal error", error.message));
        }
    },
};
