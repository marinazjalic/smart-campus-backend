const express = require("express");
const roomController = require("../controllers/roomController");

const Room = require("../models/rooms");
const router = express.Router();

router.get("/all-rooms", roomController.getAllRooms);
router.get("/get-room", roomController.getRoomById);
router.get("/filter-rooms", roomController.filterRooms);
router.post("/create-room", roomController.createRoom);

module.exports = router;
