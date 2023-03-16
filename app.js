import express, { json } from 'express';
const app = express();
app.use(json());
import crypto from "crypto";
// const nodemailer = require('nodemailer');
import nodemailer from 'nodemailer';


// import { SHA256 } from 'crypto-js';
// app.use(SHA256());
// import { SHA256 } from 'crypto-js';

import cors from "cors";
app.use(cors());

import { connect, model } from 'mongoose';

// const jwt = require('jsonwebtoken');
import jsonwebtoken from 'jsonwebtoken';

const JWT_SECRET =
    "hvdvay6ert72839289()aiyg8t87qt72393293883uhefiuh78ttq3ifi78272jbkj?[]]pou89ywe";


const mongoURL = "mongodb+srv://bivishan8686:jsxvH01MtNg46E5v@cluster0.y5o1jak.mongodb.net/?retryWrites=true&w=majority";


connect(mongoURL, {
    useNewUrlParser: true
}).then(() => {
    console.log("Connected to database.");
}).catch((e) => console.log(e));

import "./userDetails.cjs";

const User = model("UserInfo");

const sendVerifyemail = async (name, email, user_id) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'sapkotabivishan@gmail.com',
                pass: 'bqraazhbapiuqzpp'
            }
        });
        const mailOption = {
            from: 'sapkotabivishan@gmail.com',
            to: email,
            subject: "Verification Email",
            html: '<p> Hi ' + name + 'Please Click this link <a href="http://localhost:3000/verify?id=' + user_id + '">Verify </a> to verify.</p>'
        }
        transporter.sendMail(mailOption, function (err, info) {
            if (err) {
                console.log(err);
            }
            else {
                console.log("Email has been sent:-", info.response);
            }
        })
    } catch (error) {
        console.log(error);
    }

}

app.get("/user/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.send({ status: "error" });
        } else {
            res.send({ status: "success", user });
        }
    } catch (error) {
        console.error(error);
        res.send({ status: "error" });
    }
});


app.patch("/verify", async (req, res) => {

    try {

        const updateInfo = await User.updateOne({ _id: req.query.id }, { $set: { verified: 1 } });
        console.log(updateInfo);
        console.log(req);
        res.send({ status: "success" });
    } catch (error) {
        res.send({ status: "error updating" });
    }

})

app.post("/register", async (req, res) => {
    const { user, email, pwd, verified } = req.body;
    // const { SHA256 } = SHA256;

    const encryption = crypto.createHash("sha256").update(pwd).digest("hex");

    try {
        const oldUser = await User.findOne({ user });

        if (oldUser) {
            return res.send({ status: 'exist', error: "Account exists" })
        }

        const newUser = await User.create({
            user,
            email,
            pwd: encryption,
            verified
        });
        res.send({ status: "ok" });
        // console.log(user, email);
        sendVerifyemail(user, email, newUser._id.toString())
    } catch (error) {
        res.send({ status: 'error' })
        // if (error.response?.status === 409) {
        //     setErrMsg('Username Taken');
        // }
    }
})

app.post("/sign-in", async (req, res) => {
    //     const { user, pwd } = req.body;
    //     console.log(req.body);
    // })

    // app.post("/signin", async (res, req) => {
    const { user, pwd } = req.body;
    // console.log(req.body);
    const oldUser = await User.findOne({ user });

    const encryption = crypto.createHash("sha256").update(pwd).digest("hex");

    if (!oldUser) {
        return res.send({ error: "User doesn't exist" })
    }
    if (encryption !== oldUser.pwd) {
        // console.log(oldUser.pwd);
        return res.send({ status: "User or password doesn't match." })
    }
    else {
        // console.log('oldUser: ' + oldUser);
        const token = jsonwebtoken.sign({ user: oldUser.user }, JWT_SECRET, {
            expiresIn: 10,
        });

        if (res.status(201)) {
            return res.json({ status: "ok", data: token })
        }
        else {
            return res.json({ error: "error" })
        }
    }

})

app.post("/userDash", async (req, res) => {
    const { token } = req.body;
    console.log(token);
    try {
        const userN = jsonwebtoken.verify(token, JWT_SECRET, (err, res) => {
            if (err) {
                return "token expired";
            }
            return res;
        });
        if (userN == "token expired") {
            return res.send({ status: "error", data: "token expired" });
        }
        const username = userN.user;
        User.findOne({ user: username }).then((data) => {
            res.send({ status: "OK", data: data });
            // console.log(user);
        })
            .catch((error) => {
                res.send({ status: "error", data: error })
            });
    }
    catch (error) {

    }
}
)

app.listen(5000, () => {
    console.log("server started");
})

// module.exports = {
//     verifyMail
// }

// app.post('/post', async (req, res) => {
//     console.log(req.body);

//     const { data } = req.body;
//     console.log({ data });
//     console.log(data);

//     try {
//         if (data == "bivishan") {
//             res.send({ status: "okay" })
//         }
//         else {
//             res.send({ status: "user not found" })
//         }

//     } catch (error) {
//         res.send({ status: 'error' })
//     }
// })
