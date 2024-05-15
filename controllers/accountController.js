const package = require("../middlewares/package.js");
const Account = require("../models/Account.js");
const bcypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../utils/mailer");

module.exports = {
    login: async (req, res) => {
        try {
            const { username, password } = req.body;

            if (!username || username.length < 1) {
                return res.json(
                    package(1, "Please provide your username!", null)
                );
            } else if (!password || password.length < 1) {
                return res.json(
                    package(1, "Please provide your password!", null)
                );
            }

            //check email ton tai
            const userDB = await Account.findOne({ username: username });
            if (!userDB) {
                return res.json(
                    package(1, "Invalid username or password", null)
                );
            }

            if (bcypt.compareSync(password, userDB.password)) {
                const userWithoutPassword = { ...userDB };
                delete userWithoutPassword._doc.password;

                let prepairUser = { ...userWithoutPassword };
                prepairUser._doc.token = jwt.sign(
                    prepairUser._doc,
                    process.env.JWT_SECRET,
                    { expiresIn: "24h" }
                );
                return res.json(package(0, "Login success", prepairUser._doc));
            }
            return res.json(package(1, "Invalid username or password", null));
        } catch (error) {
            return res.json(package(2, "Internal error", error.message));
        }
    },

    register: async (req, res) => {
        try {
            const { username, fullName, email, password, imageUrl } = req.body;

            const checkEmailExist = await Account.find({ email: email });
            if (checkEmailExist.length > 0)
                return res.json(package(1, "Email is exist ", null));

            const checkUsernameExist = await Account.find({
                username: username,
            });
            if (checkUsernameExist.length > 0)
                return res.json(package(1, "Usename is exist", null));

            const hashedPassword = bcypt.hashSync(password, 10);

            const newAccount = new Account({
                username: username,
                fullName: fullName,
                email: email,
                role: "user",
                password: hashedPassword,
                avatar_url: imageUrl,
            });

            const result = await newAccount.save();
            if (!result) return res.json(package(1, "Can not save user", null));

            const mailResult = await mailer.sendMail(
                email,
                "Quiz Card - Your accout has been created",
                accountCreateAccount(fullName)
            );
            if (mailResult.status === "error")
                return res.json(
                    package(1, "Internal error", mailResult.message)
                );
            return res.json(package(1, "Save user successfully", result));
        } catch (error) {
            res.json(package(2, "Internal error", error.message));
        }
    },

    getProfile: async (req, res) => {
        try {
            const _id = req.params.uid;
            const result = await Account.findById(_id);
            if (result)
                return res.json(package(0, "Get user successfully", result));
            return res.json(package(1, "Can not get user", null));
        } catch (error) {
            res.json(package(2, "Internal error", error.message));
        }
    },

    resendVerifyEmail: async (req, res) => {
        try {
            const { username, email, name } = req.body;
            const token = generateToken(email);

            const url = `${process.env.URL}/auth/verify/${token}`;

            const mailResult = await mailer.sendMail(
                email,
                "Please reset your password",
                annouceChangAccount(url)
            );
            if (mailResult.status === "error")
                return res.json(
                    package(1, "Internal error", mailResult.message)
                );
            return res.json(package(1, "Send email successfully", null));
        } catch (error) {
            res.json(package(2, "Internal error", error.message));
        }
    },
};

function generateToken(username) {
    const token = jwt.sign({ username }, process.env.JWT_SECRET, {
        expiresIn: "5m",
    });
    return token;
}

function accountCreateAccount(name) {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <style>
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
                .container {
                    width: 100%;
                    max-width: 600px;
                    margin: 0 auto;
                    background-color: #ffffff;
                    border: 1px solid #dddddd;
                    padding: 20px;
                }
                .header {
                    background-color: #4CAF50;
                    color: #ffffff;
                    padding: 10px 0;
                    text-align: center;
                }
                .header h1 {
                    margin: 0;
                    font-size: 24px;
                }
                .content {
                    padding: 20px;
                    text-align: center;
                }
                .content h2 {
                    color: #333333;
                }
                .content p {
                    color: #666666;
                    font-size: 16px;
                    line-height: 1.5;
                }
                .content a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                    font-size: 12px;
                    color: #999999;
                    border-top: 1px solid #dddddd;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Congratulations!</h1>
                </div>
                <div class="content">
                    <h2>Account Successfully Created</h2>
                    <p>Hello ${name},</p>
                    <p>
                        Your account has been successfully created. Thank you for registering at our website. 
                        You can now log in and start using our services.
                    </p>
                </div>
                <div class="footer">
                    <p>If you did not create this account, please disregard this email.</p>
                    <p>&copy; 2024 Group 49. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>

    `;
}

function annouceChangAccount(linkChange) {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
            body {
                font-family: Arial, sans-serif;
                background-color: #f4f4f4;
                margin: 0;
                padding: 0;
            }
            .container {
                width: 100%;
                max-width: 600px;
                margin: 0 auto;
                background-color: #ffffff;
                border: 1px solid #dddddd;
                padding: 20px;
            }
            .header {
                background-color: #FF5722;
                color: #ffffff;
                padding: 10px 0;
                text-align: center;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                padding: 20px;
                text-align: center;
            }
            .content h2 {
                color: #333333;
            }
            .content p {
                color: #666666;
                font-size: 16px;
                line-height: 1.5;
            }
            .content a {
                display: inline-block;
                margin-top: 20px;
                padding: 10px 20px;
                background-color: #FF5722;
                color: #ffffff;
                text-decoration: none;
                border-radius: 5px;
            }
            .footer {
                text-align: center;
                padding: 10px 0;
                font-size: 12px;
                color: #999999;
                border-top: 1px solid #dddddd;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Password Reset Request</h1>
            </div>
            <div class="content">
                <h2>Password Reset</h2>
                <p>Hello [User Name],</p>
                <p>
                    We received a request to reset your password. Click the button below to reset your password:
                </p>
                <a href="${linkChange}">Reset Password</a>
                <p>
                    If you did not request a password reset, please ignore this email or contact support if you have questions.
                </p>
            </div>
            <div class="footer">
                <p>If you did not make this request, please disregard this email.</p>
                <p>&copy; 2024 Your Company. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
        
    `;
}
