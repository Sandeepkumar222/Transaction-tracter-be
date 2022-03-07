const express = require("express");

const mongo = require("../shared/mongo");

// importing jwt to genetrate token
const jwt = require("jsonwebtoken");

//importing for password encrption
const bcrypt = require("bcrypt");

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
  async login(req, res) {
    const data = req.body;

    try {
      //initializig the schema
      const { error } = schema.login.validate(data, options);
      if (error)
        return res.status(400).send({ error: error.details[0].message });

      //check for email
      const user = await service.findEmail(data.email);
      if (!user)
        return res.status(400).send({ error: "User or password is incorrect" });

      //check for password

      const isValid = await bcrypt.compare(data.password, user.password);
      if (!isValid)
        return res.status(400).send({ error: "User or password is incorrect" });

      //Generating token and sending token as response
      const token = jwt.sign(
        { userid: user._id, email: user.email },
        process.env.TOKEN_SECRET,
        { expiresIn: "8h" }
      );
      res.send({ token });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: "Internal server error" });
    }
  },

  async register(req, res) {
    const data = req.body;
    try {
      //initializig the schema
      const { error } = schema.register.validate(data, options);
      if (error)
        return res.status(400).send({ error: error.details[0].message });

      // checking for email existance
      const user = await service.findEmail(data.email);
      if (user) return res.status(400).send({ error: "User already exists" });

      //Password encrption
      const salt = await bcrypt.genSalt(5);
      data.password = await bcrypt.hash(data.password, salt);

      await mongo.db.collection("ExpenseUsers").insert(data);

      res.send("Account created");
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
