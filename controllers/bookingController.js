const Booking = require("../models/booking");
var availabilityController = require("./availabilityController");

const getAllBookings = (req, res) => {
  Booking.find()
    .then((results) => {
      res.send(results);
    })
    .catch((err) => {
      console.log(err);
    });
};

//date format is 'yyyy-mm--dd'
//booking takes in json obj containing user_id, room_id, start_time, end_time
const createBooking = (req, res) => {
  let date_arr = req.body.date.split("-");
  let hour = availabilityController.time_conversion(req.body.start_time);
  let offset = availabilityController.getTimezoneOffset(
    date_arr[0],
    date_arr[1],
    date_arr[0]
  );

  let minutes = hour % 1 == 0 ? 0 : 30;
  const booking = new Booking({
    user_id: req.body.user_id,
    room_id: req.body.room_id,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    date: new Date(
      date_arr[0],
      date_arr[1] - 1,
      date_arr[2],
      hour - offset, //minus the offset hours from UTC to EST
      minutes,
      0
    ),
  });

  booking
    .save()
    .then((booking) => {
      res.status(201).send(booking);
    })
    .catch((error) => {
      res.status(500).send("Failed to create booking. ");
    });
};

//get all bookings associated to a user
const getUserBookings = (req, res) => {
  const currentDate = new Date();
  const offset = availabilityController.getTimezoneOffset(
    currentDate.getFullYear().toString(),
    (currentDate.getMonth() + 1).toString(),
    currentDate.getDate()
  );
  currentDate.setHours(currentDate.getHours() - offset);

  Booking.find({ user_id: req.query.user_id })
    .then((results) => {
      const removePastBookings = results.filter(
        (obj) => obj.date >= currentDate
      );
      const sorted = removePastBookings.sort(function (a, b) {
        return a.date - b.date;
      });
      res.send(sorted);
    })
    .catch((error) => {
      res.status(500).json("Failed to get bookings for user: " + req.user_id);
    });
};

//method to delete booking by booking ID
//returns true if deleted
const deleteBooking = (req, res) => {
  Booking.deleteOne({ _id: req.query.id }).then((result) => {
    if (result.deletedCount == 1) {
      console.log("Reached");
      res.status(200).send(true);
    } else {
      res.status(500).send(false);
    }
  });
};

//returns number of hours the user has booked for a given day
//ensures user doesn't go over 3 hour max per day
const getBookingHoursPerDay = (req, res) => {
  const parsedDate = req.query.date.toString().split("T");
  let totalHours = 0;

  const startDate = new Date(parsedDate[0]);
  const endDate = new Date(parsedDate[0] + "T23:59:59Z");
  let query = {
    user_id: req.query.user_id,
    date: { $gte: startDate, $lte: endDate },
  };

  Booking.find(query)
    .then((result) => {
      for (let i = 0; i < result.length; i++) {
        let startTime = availabilityController.time_conversion(
          result[i].start_time
        );
        let endTime = availabilityController.time_conversion(
          result[i].end_time
        );
        if (endTime > startTime) {
          totalHours += endTime - startTime;
        } else {
          let sessionTime = 24 - startTime;
          sessionTime + endTime;
          totalHours += sessionTime;
        }
      }
      res.status(200).send(totalHours.toString());
    })
    .catch((error) => {
      res.status(500).send("Failed to get booking hours for user.");
    });
};

module.exports = {
  getAllBookings,
  getBookingHoursPerDay,
  getUserBookings,
  createBooking,
  deleteBooking,
};
