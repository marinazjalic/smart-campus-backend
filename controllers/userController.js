const User = require("../models/user");

const getAllUsers = (req, res) => {
  User.find()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

//use to validate if username is free during signup
const checkIfUserExisting = (req, res) => {
  User.findOne({ username: req.query.user })
    .then((user) => {
      !user ? res.send(false) : res.send(true);
    })
    .catch((err) => {
      console.log(err);
    });
};

//creates a new user
const addNewUser = (req, res) => {
  const user = new User({
    username: req.body.username,
    password: req.body.password,
  });

  user
    .save()
    .then((result) => {
      res.send(result);
    })
    .catch((err) => {
      console.log(err);
    });
};

//validate credentials during login
const validateUserCredentials = (req, res) => {
  User.findOne({ username: req.body.username })
    .then((user) => {
      if (!user) {
        res.send("Error: user not found.");
      } else {
        user.password == req.body.password ? res.send(true) : res.send(false);
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

const deleteUserById = async (req, res) => {
  res.send("deleted received" + req.body);
};

const userLogin = async (req, res) => {
  const user = new User({ username: req.username, password: req.password });
  User.findOne(user).then((result) => res.send("Found"));
};

const getUserID = (req, res) => {
  User.findOne({ username: req.query.user })
    .then((user) => {
      res.send(user._id);
    })
    .catch((error) => {
      res.status(500).send("Failed to get user ID");
    });
};

module.exports = {
  getAllUsers,
  checkIfUserExisting,
  addNewUser,
  validateUserCredentials,
  deleteUserById,
  userLogin,
  getUserID,
};
