// const express = require("express");
// const router = express.Router();
// const Booking = require("../models/Booking");
// const { generateTimeSlots } = require("../utils/slotGenerator");

// router.get("/slots", async (req, res) => {
//   const date = req.query.date;
//   if (!date) return res.status(400).json({ error: "Date is required" });

//   const allSlots = generateTimeSlots();
//   const bookings = await Booking.find({ date });
//   const bookedSlots = bookings.map(b => b.timeSlot);
//   const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

//   res.json({ availableSlots });
// });

// router.post("/book", async (req, res) => {
//   const { name, email, date, timeSlot } = req.body;
//   if (!name || !email || !date || !timeSlot) {
//     return res.status(400).json({ error: "All fields are required" });
//   }

//   const existing = await Booking.findOne({ date, timeSlot });
//   if (existing) {
//     return res.status(409).json({ error: "Slot already booked" });
//   }

//   const booking = new Booking({ name, email, date, timeSlot });
//   await booking.save();
//   res.status(201).json({ message: "Booking successful" });
// });

// module.exports = router;
const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a booking by ID
router.delete("/:id", async (req, res) => {
  try {
    const booking = await Booking.findByIdAndDelete(req.params.id);

    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    res.status(200).json({
      success: true,
      message: "Booking deleted successfully",
      booking,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
