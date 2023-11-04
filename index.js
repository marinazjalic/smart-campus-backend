// import bodyParser from "body-parser";

const express = require("express");
const cors = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

const roomRoutes = require("./routes/roomRoutes");
const userRoutes = require("./routes/userRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const availabilityRoutes = require("./routes/availabilityRoutes");

app.use("/rooms", roomRoutes);
app.use("/users", userRoutes);
app.use("/bookings", bookingRoutes);
app.use("/availability", availabilityRoutes);

dotenv.config();
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("DB connected"))
  .catch((err) => console.log(err));

app.get("/", (req, res) => res.send("Smart Campus - Study Room API"));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.listen(process.env.PORT || port, () =>
  console.log(`Listening on port ${process.env.PORT}!`)
);
