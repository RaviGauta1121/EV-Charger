// controllers/bookingController.js


const Charger = require("../models/Charger");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { generateTimeSlots } = require("../utils/slotGenerator");

exports.getAvailableSlots = async (req, res) => {
  try {
    const { chargerId, date } = req.params;
    const allSlots = generateTimeSlots();

    const busy = await Booking.find({
      chargerId,
      date,
      bookingStatus: { $in: ["confirmed", "in-progress"] },
      paymentStatus: { $in: ["pending", "completed"] },
    }).select("timeSlot");

    const booked = busy.map((b) => b.timeSlot);
    const availableSlots = allSlots.filter((slot) => !booked.includes(slot));

    res.json({ success: true, availableSlots });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch slots",
        error: err.message,
      });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { chargerId, date, timeSlot, duration = 30 } = req.body;
    if (!chargerId || !date || !timeSlot)
      return res
        .status(400)
        .json({
          success: false,
          message: "Charger ID, date & timeSlot required",
        });

    const charger = await Charger.findById(chargerId);
    if (!charger)
      return res
        .status(404)
        .json({ success: false, message: "Charger not found" });

    const conflict = await Booking.findOne({
      chargerId,
      date,
      timeSlot,
      bookingStatus: { $in: ["confirmed", "in-progress"] },
      paymentStatus: { $in: ["pending", "completed"] },
    });
    if (conflict)
      return res
        .status(400)
        .json({ success: false, message: "Slot already booked" });

    const kwh = (duration / 60) * (charger.power / 1000);
    const amountPaise = Math.round((charger.price || 10) * kwh * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `EV Charger – ${charger.name}`,
              description: `${date} @ ${timeSlot} (${duration} min)`,
            },
            unit_amount: amountPaise,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/booking/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/booking/cancel`,
      metadata: { userId: req.user.id, chargerId, date, timeSlot, duration },
    });

    const booking = await Booking.create({
      userId: req.user.id,
      chargerId,
      date,
      timeSlot,
      duration,
      totalAmount: amountPaise / 100,
      paymentStatus: "pending",
      bookingStatus: "confirmed",
      stripeSessionId: session.id,
    });

    res.json({
      success: true,
      bookingId: booking._id,
      checkoutUrl: session.url,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Create booking failed",
        error: err.message,
      });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res
        .status(400)
        .json({ success: false, message: "Payment not completed" });
    }

    const booking = await Booking.findOneAndUpdate(
      { stripeSessionId: sessionId },
      {
        paymentStatus: "completed",
        bookingStatus: "confirmed",
        stripePaymentIntentId: session.payment_intent,
      },
      { new: true }
    ).populate("chargerId");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    res.json({ success: true, booking });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Verify failed", error: err.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { userId: req.user.id };
    if (status) query.bookingStatus = status;

    const bookings = await Booking.find(query)
      .populate("chargerId", "name location type power price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Booking.countDocuments(query);
    res.json({
      success: true,
      bookings,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      total,
    });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Fetch failed", error: err.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    if (booking.bookingStatus === "cancelled")
      return res
        .status(400)
        .json({ success: false, message: "Already cancelled" });

    const [startTime] = booking.timeSlot.split("-");
    const start = new Date(`${booking.date}T${startTime}:00`);
    if (start.getTime() - Date.now() < 3600000)
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot cancel less than 1 hour before start",
        });

    if (
      booking.paymentStatus === "completed" &&
      booking.stripePaymentIntentId
    ) {
      await stripe.refunds.create({
        payment_intent: booking.stripePaymentIntentId,
      });
      booking.paymentStatus = "refunded";
    }
    booking.bookingStatus = "cancelled";
    await booking.save();

    res.json({ success: true, message: "Booking cancelled", booking });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Cancel failed", error: err.message });
  }
};

exports.updateStatus = async (req, res) => {
  if (req.user.role !== "admin")
    return res.status(403).json({ success: false, message: "Admin only" });
  try {
    const { status } = req.body;
    const valid = ["confirmed", "cancelled", "completed", "in-progress"];
    if (!valid.includes(status))
      return res
        .status(400)
        .json({
          success: false,
          message: `Valid statuses: ${valid.join(", ")}`,
        });

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { bookingStatus: status },
      { new: true }
    ).populate("chargerId");

    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    res.json({
      success: true,
      message: `Status updated to ${status}`,
      booking,
    });
  } catch (err) {
    res
      .status(500)
      .json({
        success: false,
        message: "Status update failed",
        error: err.message,
      });
  }
};
