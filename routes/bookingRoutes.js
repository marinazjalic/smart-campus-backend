const express = require("express");
const bookingController = require("../controllers/bookingController");

const Booking = require("../models/booking");

const router = express.Router();

router.get("/all", bookingController.getAllBookings);
router.get("/by-user", bookingController.getUserBookings);
router.post("/add", bookingController.createBooking);
router.delete("/delete-booking", bookingController.deleteBooking);
router.get("/get-hours", bookingController.getBookingHoursPerDay);

module.exports = router;
