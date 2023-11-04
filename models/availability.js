const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const availabilitySchema = new Schema({
  room_id: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  times_avail: {
    type: Array,
    required: true,
  },
});

const Availability = mongoose.model("Availability", availabilitySchema);

module.exports = Availability;
