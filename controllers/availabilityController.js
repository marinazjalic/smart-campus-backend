const Availability = require("../models/availability");
const roomController = require("./roomController");

//method to get all availability records
const getAvailabilities = (req, res) => {
  Availability.find()
    .then((results) => {
      res.send(results);
    })
    .catch((error) => {
      console.log(error);
    });
};

//method to create new availability record
//will need to pass in roomID and date in the format of 'yyyy-mm-dd' as json body
const createAvailability = async (req, res) => {
  let times = [];
  const weekday_hrs = [
    0, 0.5, 1, 1.5, 2, 8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5,
    14, 14.5, 15, 15.5, 16, 16.5, 17, 17.5, 18, 18.5, 19, 19.5, 20, 20.5, 21,
    21.5, 22, 22.5, 23, 23.5,
  ];
  const weekend_nav = [0.5, 1, 1.5, 2, 8, 8.5, 9, 9.5];
  const date_arr = req.date.split("-");
  let timezone_offset = 4;
  if (date_arr[2] > "05") {
    //fix to call getTimeZone function instead
    timezone_offset = 5;
  }

  const curr_date = new Date(
    date_arr[0],
    date_arr[1] - 1,
    date_arr[2],
    0 - timezone_offset,
    0,
    0,
    0
  );

  /* check which day of the week and assign corresponding hours of operation */
  if (curr_date.getDay() == 0 || curr_date.getDay() == 6) {
    times = weekday_hrs.filter((x) => weekend_nav.indexOf(x) === -1);
  } else {
    times = weekday_hrs;
  }

  const availability = new Availability({
    room_id: req.room_id,
    date: curr_date,
    times_avail: times,
  });

  return availability
    .save()
    .then((availability) => {
      return availability;
    })
    .catch((error) => {
      console.log("Error");
    });
};

//run this loop with a json body for the needed date in order to create an availability record/
//for every existing room
const createAllAvailabilities = async (req, res) => {
  try {
    const allRooms = await roomController.getAllRooms(req, res);
    let createdAvails = [];

    for (let i = 0; i < allRooms.length; i++) {
      var newObj = {
        room_id: allRooms[i]._id.toString(),
        date: req.body.date,
      };
      const created = await createAvailability(newObj, res);

      createdAvails.push(created);
    }
    res.send(createdAvails);
  } catch (error) {
    console.log(error);
  }
};

//method to modify an existing record when a booking has been created or modified
//this method is called within the getAvailabilityById method
const modifyAvailability = (result, req, res) => {
  var start_time = time_conversion(req.body.start_time);
  var end_time = time_conversion(req.body.end_time);
  let new_times = [];

  //in the case that a booking is made, the time slots need to be removed from the times arr
  if (req.body.status == "booked") {
    var ind1 = result.times_avail.indexOf(start_time);
    var ind2 = result.times_avail.indexOf(end_time);
    var times_removed = [];
    if (start_time < end_time) {
      times_removed = result.times_avail.splice(ind1, ind2 - ind1 + 1);
    } else {
      var removed = result.times_avail.splice(
        ind1,
        result.times_avail.length - ind1
      );
      var removed2 = result.times_avail.splice(0, ind2 + 1);
      times_removed = removed.concat(removed2);
    }
    new_times = result.times_avail.filter(
      (x) => times_removed.indexOf(x) === -1
    );
  }

  //in the case that a booking is cancelled, the times need to be added back into the times arr
  else if (req.body.status == "cancelled") {
    var added_times = [];

    if (start_time < end_time) {
      for (let i = start_time; i <= end_time; i += 0.5) {
        added_times.push(i);
      }
    }
    //case where end time is on or after midnight
    else if (start_time > end_time) {
      for (let i = start_time; i < 24; i += 0.5) {
        added_times.push(i);
      }
      //end time is after midnight
      if (end_time != 0) {
        for (let i = 0; i <= end_time; i += 0.5) {
          added_times.push(i);
        }
      }
      //end time is exactly midnight
      if (end_time == 0) {
        added_times.push(0);
      }
    }
    //add new times to the array and sort in ascending order
    new_times = result.times_avail.concat(added_times);
    new_times = new_times.sort(function (a, b) {
      return a - b;
    });
  }

  //   filter by ID and update the times_avail array
  Availability.updateOne(
    {
      _id: req.body.id,
    },
    {
      $set: { times_avail: new_times },
    }
  )
    .then((result) => {
      res.send(result);
    })
    .catch((error) => {
      res.status(500).send("Failed to modify record.");
    });
};

//call this method to modify an availability record
//takes start time, end time and availability ID
const getAvailabilityById = (req, res) => {
  Availability.findById(req.body.id)
    .then((result) => {
      modifyAvailability(result, req, res);
    })
    .catch((error) => {
      res.status(500).send("Failed to find record");
    });
};

//method to get availability record by roomId and date
//pass the params into the url
const getAvailabilityByRoomDate = (req, res) => {
  let query = req.query;
  Availability.find(query)
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((error) =>
      res.status(500).send("Failed to find availability record. ")
    );
};

/* function for converting time to military time */
const time_conversion = (time) => {
  let delimiter = time.includes("am") ? "am" : "pm";
  var time_arr = time.split(delimiter);
  var new_time = 0;

  const num = time_arr[0].split(":")[0];

  if (delimiter == "pm" && 1 <= num && num <= 11) {
    new_time = parseInt(num) + 12;
  } else if (delimiter == "am" && num == 12) {
    new_time = 0;
  } else {
    new_time = parseInt(num);
  }
  if (time_arr[0].includes(":30")) {
    new_time += 0.5;
  }
  return new_time;
};

const deleteAvailability = (req, res) => {
  Availability.deleteOne({ _id: req.query.id })
    .then((result) => {
      if (result.deletedCount == 1) {
        res.status(200).send("Successfully deleted availability record. ");
      }
    })
    .catch((error) => {
      res.status(500).send("Failed to delete availability record. ");
    });
};

const deleteAll = (req, res) => {
  Availability.deleteMany({})
    .then((result) => res.send(true))
    .catch((error) => {
      res.send("Failed");
    });
};

//return a list of roomIds that are available for a particular day and time range
const filterForAvailableRooms = (req, res) => {
  const parsedDate = req.query.date.split("-");
  let offset = getTimezoneOffset(parsedDate[0], parsedDate[1], parsedDate[2]);
  let start_time = time_conversion(req.query.start_time);
  let end_time = time_conversion(req.query.end_time);
  let time_range = [];

  //filter for rooms that contain this time range
  for (let i = start_time; i <= end_time; i += 0.5) {
    time_range.push(i);
  }

  //create new date obj
  const date = new Date(
    parsedDate[0],
    parsedDate[1] - 1,
    parsedDate[2],
    0 - offset,
    0,
    0,
    0
  );

  const query = {
    date: date,
    times_avail: { $all: time_range },
  };

  Availability.find(query)
    .then((results) => {
      const availableRoomIds = results.map((obj) => {
        return { id: obj._id, room_id: obj.room_id };
      });
      res.status(200).send(availableRoomIds);
    })
    .catch((error) => {
      res.status(500).send("Failed to filter availability");
    });
};

const getTimezoneOffset = (year, month, day) => {
  let offset = 0;

  if (year == "2023" && month == "11" && Number(day) > 5) {
    offset = 5;
  } else {
    offset = 4;
  }
  return offset;
};

module.exports = {
  getAvailabilities,
  createAvailability,
  modifyAvailability,
  getAvailabilityByRoomDate,
  getAvailabilityById,
  deleteAvailability,
  time_conversion,
  createAllAvailabilities,
  deleteAll,
  filterForAvailableRooms,
  getTimezoneOffset,
};
