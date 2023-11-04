const express = require("express");
const userController = require("../controllers/userController");
const User = require("../models/user");
const router = express.Router();

router.get("/all-users", userController.getAllUsers);
router.post("/add-user", userController.addNewUser);
router.get("/is-existing", userController.checkIfUserExisting);
router.post("/validate-credentials", userController.validateUserCredentials);
router.get("/get-id", userController.getUserID);
router.post("/auth", userController.userLogin);

router.delete("/delete", userController.deleteUserById);
module.exports = router;
