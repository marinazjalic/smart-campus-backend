const express = require("express");
const availabilityController = require("../controllers/availabilityController");

const Availability = require("../models/availability");
const router = express.Router();

router.get("/all", availabilityController.getAvailabilities);
router.post("/create-new", availabilityController.createAvailability);
router.post("/modify-availability", availabilityController.modifyAvailability);
router.get("/get-by-room", availabilityController.getAvailabilityByRoomDate);
router.post("/get-by-id", availabilityController.getAvailabilityById);
router.delete("/delete", availabilityController.deleteAvailability);
router.get("/create", availabilityController.createAllAvailabilities);
router.delete("/delete-all", availabilityController.deleteAll);
router.get(
  "/filter-availability",
  availabilityController.filterForAvailableRooms
);

module.exports = router;
