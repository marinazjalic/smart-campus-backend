const Room = require("../models/rooms");
const availabilityController = require("./availabilityController");

const getAllRooms = async (req, res) => {
  return Room.find()
    .then((result) => {
      return result;
    })
    .catch((err) => {
      console.log(err);
    });
};

//method to create room
const createRoom = (req, res) => {
  const room = new Room({
    room_num: req.body.room_num,
    location: req.body.location,
    capacity: req.body.capacity,
    accessibility: req.body.accessibility,
    utilities: req.body.utilities,
  });

  room
    .save()
    .then((room) => {
      res.status(200).send(room);
    })
    .catch((error) => {
      res.status(500).send("Failed to create room. Error: ${error}");
    });
};

//method to get room by ID
const getRoomById = (req, res) => {
  Room.findById(req.query.id)
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("Failed to find room");
    });
};

/*function to filter rooms based on critieria 
note: location and capacity are mandatory params, while accessibility and utilities are optional*/
const filterRooms = (req, res) => {
  const capacityValue = Number(req.query["capacity"]);

  //filter capacity such that it's equal to or greater than what the user provided
  const query = {
    capacity: { $gte: capacityValue },
    location: req.query.location,
  };

  //search for either Leddy Main or Leddy West
  var containsLeddy = req.query.location.includes("Leddy Library")
    ? (query.location = { $regex: new RegExp("Leddy Library", "i") })
    : undefined;

  //only pass accessibility and utilities to the query if they are true
  var isAccessible = req.query.hasOwnProperty("accessibility")
    ? (query.accessibility = true)
    : undefined;
  var hasUtilities = req.query.hasOwnProperty("utilities")
    ? (query.utilities = true)
    : undefined;

  Room.find(query)
    .then((results) => {
      const sortByCapacity = results.sort((a, b) => a.capacity - b.capacity); //sort so the user gets the closest match to their chosen capacity
      res.status(200).send(sortByCapacity);
    })
    .catch((error) => {
      res.status(500).send("Failed to filter rooms. ");
    });
};

module.exports = {
  getAllRooms,
  getRoomById,
  filterRooms,
  createRoom,
};
