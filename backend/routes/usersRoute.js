const express = require("express");
const userRouter = express.Router();

//importing service

const usersService = require("../services/usersService");

userRouter.get("/", async (req, res) => {
  const posts = await usersService.getUsers();
  res.send(posts);
});

userRouter.get("/:id", async (req, res) => {
  const posts = await usersService.getUser(req.params.id);
  res.send(posts);
});

userRouter.post("/", async (req, res) => {
  const post = await usersService.addUsers(req.body);
  res.send(post);
});

userRouter.put("/:id", async (req, res) => {
  const post = await usersService.updateUsers(req.params.id, req.body);
  res.send(post);
});

userRouter.delete("/:id", async (req, res) => {
  await usersService.deleteUser(req.params.id);
  res.send({});
});

module.exports = userRouter;
