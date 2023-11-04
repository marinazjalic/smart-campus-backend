const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const roomSchema = new Schema({
  room_num: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  capacity: {
    type: Number,
    required: true,
  },
  accessibility: {
    type: Boolean,
    required: true,
  },
  utilities: {
    type: Boolean,
    required: true,
  },
});

const Room = mongoose.model("Studyroom", roomSchema);

module.exports = Room;
