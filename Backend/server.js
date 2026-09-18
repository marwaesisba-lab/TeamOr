
require("dotenv").config();

const express = require("express");
const ejs = require("ejs")
const path = require("path");

const { routers } = require("./Routers/routers");

const app = express();

const port = 5501;

const cookieparser = require("cookie-parser");

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.use(cookieparser());

app.use(express.static(path.join(__dirname, "frontend")));

app.use("/admin", express.static(path.join(__dirname, "admin")));

app.use("/html", express.static(path.join(__dirname, "html")));
const  {autoRefreshToken}  = require("./functions/autorefreshtoken");


app.use("/", routers);



// recaptcha

const request = require("request");


app.post("/recaptcha", (req, res) => {

    const captcha = req.body.captcha;

    if (!captcha) {

        return res.json({

            success: false,

            message: "please select captcha"

        });

    }

    const secretKey = "6Lf_BqItAAAAAEqXfemhuGYM1CsWm7NncIbnCKR-";

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

    request(verifyUrl, (error, response, body) => {

        if (error) {

            return res.status(500).json({

                success: false,

                message: "CAPTCHA verification failed"

            });

        }

        const elements = JSON.parse(body);

        if (!elements.success) {

            return res.json({

                success: false,

                message: "CAPTCHA verification failed"

            });

        }

        return res.json({

            success: true,

            message: "success selected recaptcha"

        });

    });

});


app.listen(port, () => {

    console.log(`Server running on port ${port}`);

});

module.exports= {
    app
}