const express = require("express");

const mongo = require("../shared/mongo");

require("dotenv").config();

// importing jwt to genetrate token
const jwt = require("jsonwebtoken");

//importing for password encrption
const bcrypt = require("bcrypt");

const nodemailer = require("nodemailer");

const smtpTransport = require("nodemailer-smtp-transport");

// importing for validating the registering data
//schema for register and login
const schema = require("../shared/schema");


// schema options
const options = {
  abortEarly: false, // include all errors
  allowUnknown: true, // ignore unknown props
  stripUnknown: true, // remove unknown props
};

const service = {
  async emailCheck(req, res) {
    const data = req.body;
    console.log(data);
    try {
      //initializig the schema
      const { error } = schema.emailSending.validate(data, options);
      if (error)
        return res.status(400).send({ error: error.details[0].message });

      //check for email
      const user = await service.findEmail(data.email);
      if (!user)
        return res
          .status(400)
          .send({ error: "User email is incorrect or not registered" });

      //Generating token and sending token as response
      const token = jwt.sign(
        { userid: user._id, email: user.email },
        process.env.TOKEN_SECRET,
        { expiresIn: "8h" }
      );
      emailSending();

      // async..await is not allowed in global scope, must use a wrapper
      async function emailSending() {
        // Generate test SMTP service account from ethereal.email
        // Only needed if you don't have a real mail account for testing
        // let testAccount = await nodemailer.createTestAccount();

        // create reusable transporter object using the default SMTP transport
        console.log(process.env.EMAIL, process.env.PASS);
        let transporter = nodemailer.createTransport(
          smtpTransport({
            host: "smtp.gmail.com",
            port: 587,
            ignoreTLS: false,
            secure: false, // true for 465, false for other ports
            auth: {
              user: `${process.env.EMAIL}`, // generated user
              pass: `${process.env.PASS}`, // generated password
            },
            tls: {
              rejectUnauthorized: false,
            },
          })
        );

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: '"Transactions tracker ????" <fitnesstracker123456@gmail.com>', // sender address
          to: data.email, // list of receivers
          subject: "Hello ??? Transactions tracker verification link", // Subject line
          text: "Please click on the button to change the password", // plain text body
          html: `<b><a href="transaction-tracker01.herokuapp.com/changePassword/${token}">Change password</a></b>`, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

        res.send("Mail sent");
      }
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  async updatePassword(req, reqbody, res) {
    console.log(req, reqbody);
    const data = reqbody.body;
    try {
      //initializig the schema
      //       const { error } = schema.updatePassword.validate(data, options);
      //       if (error)
      //         return res.status(400).send({ error: error.details[0].message });

      // checking for email existance
      const userid = jwt.verify(req, process.env.TOKEN_SECRET);
      //check for email
      const user = await service.findEmail(userid.email);
      if (!user)
        return res
          .status(400)
          .send({ error: "User email is incorrect or not registered" });

      //Password encrption
      const salt = await bcrypt.genSalt(5);
      reqbody.password = await bcrypt.hash(reqbody.password, salt);

      await mongo.db
        .collection("ExpenseUsers")
        .findOneAndUpdate(
          { email: userid.email },
          { $set: reqbody },
          { returnDocument: "after" }
        );
      res.send("Changed the password");
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  findEmail(mail) {
    console.log(mail);
    return mongo.db.collection("ExpenseUsers").findOne({ email: mail });
  },
};

module.exports = service;
