const express = require("express");
const app = express();
const mongoose = require("mongoose");
const QRCode = require("qrcode");
const bodyParser = require("body-parser");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

const Wheel = require("./Models/wheel");
const Review = require("./Models/review");
const MembershipPlan = require("./Models/membershipPlans");
const Rental = require("./Models/rental");
const Payment = require("./Models/payment");
const user = require("./Models/user");

const wheelsRouter = require("./routes/wheel");
const reviewRouter = require("./routes/review");
const userRouter = require("./routes/user");

const wrapAsync = require("./utils/wrapAsync");
const { isLoggedIn } = require("./middleware");
const rental = require("./Models/rental");
const { isauthenticate } = require("./authenticate");

const MONGO_URL = "mongodb://127.0.0.1:27017/CycleSync";

// Database Connection
async function main() {
  try {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");
  } catch (err) {
    console.error("Error connecting to DB:", err);
  }
}
main();

// Middleware Configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

const sessionOptions = {
  secret: "ravin2313",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
app.use(session(sessionOptions));
app.use(flash());

// Passport Configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(user.authenticate()));

passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

// Flash Middleware
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user || null;

  next();
});

// Routes
app.get(
  "/",
  wrapAsync(async (req, res) => {
    const trendingWheel = await Wheel.find().limit(8);
    const allWheels = await Wheel.find();

    // Pass the `user` object to the template
    res.render("Wheels/index", { trendingWheel, allWheels, user: req.user });
  })
);

app.use("/wheels", wheelsRouter);
app.use("/wheels", reviewRouter); // Use a static base route

app.use("/", userRouter);

// Wheel Pricing Page
app.get(
  "/wheelPricing",
  wrapAsync(async (req, res) => {
    const allWheels = await Wheel.find({});
    res.render("Wheels/pricing", { allWheels });
  })
);

// Membership Plans Page
app.get(
  "/plans",
  wrapAsync(async (req, res) => {
    const membershipPlans = await MembershipPlan.find({});
    res.render("Wheels/membershipPage", { membershipPlans });
  })
);

// About Us Page
app.get("/about", (req, res) => {
  res.render("Wheels/about");
});

// Contact Us Page
app.get("/contact-us", (req, res) => {
  res.render("Wheels/contact");
});

app.post("/contact-us", isLoggedIn, (req, res) => {
  req.flash("success", "Form submitted successfully!");
  res.redirect("/");
});

app.get("/dashboard", isLoggedIn, async (req, res) => {
  try {
    // Fetch all wheel details
    const allWheels = await Wheel.find({});

    // Filter available wheels in the backend
    const availableWheels = allWheels.filter(
      (wheel) => wheel.availabilityStatus === "Available"
    );

    res.render("users/dashboard.ejs", { availableWheels });
  } catch (err) {
    console.error("Error fetching wheel details:", err);
    req.flash("error", "Unable to load dashboard.");
    res.redirect("/login");
  }
});

app.get("/feedback", (req, res) => {
  res.render("Wheels/feedback.ejs");
});

app.post("/feedback", isLoggedIn, (req, res) => {
  req.flash("success", "Feedback Sent Successfully!");
  res.redirect("/");
});

app.get("/map", (req, res) => {
  res.render("Wheels/map.ejs");
});

// Rent Details Page
app.get(
  "/wheels/:id/rent",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wheel = await Wheel.findById(id);
    if (!wheel) {
      return res.status(404).send("Wheel not found");
    }
    res.render("Wheels/rent", { wheel });
  })
);

// Rent Confirmation
app.post(
  "/wheels/:id/confirm",
  isLoggedIn,
  wrapAsync(async (req, res) => {
    try {
      const { id } = req.params; // The bicycle ID
      const {
        contactNumber,
        rentalDays,
        pickupDate,
        paymentMethod,
        totalPrice,
      } = req.body;

      // The logged-in user’s ID (from session or authentication middleware)
      const userId = req.user._id;

      // Step 1: Find the wheel by ID
      const wheel = await Wheel.findById(id);
      if (!wheel) {
        return res.status(404).send("Wheel not found");
      }

      // Step 2: Check if the wheel is available
      if (wheel.availabilityStatus !== "Available") {
        return res
          .status(400)
          .json({ success: false, message: "Wheel is not available for rent" });
      }

      // Step 3: Create a new rental record
      const newRental = new Rental({
        wheelId: id, // Bicycle ID
        userId, // Associate the rental with the logged-in user
        contactNumber,
        rentalDays,
        pickupDate,
        paymentMethod,
        totalPrice,
      });

      const savedRental = await newRental.save();

      // Step 4: Update the user's `rentals` array
      await user.updateOne(
        { _id: userId },
        { $push: { rentals: savedRental._id } }
      );

      // Step 5: Update the wheel's availability status
      wheel.availabilityStatus = "Rented";
      await wheel.save();

      res.redirect(`/wheels/${id}/confirmation`);

      // Step 6: Respond to the client
      // res.status(201).json({
      //   success: true,
      //   message: "Rental created successfully",
      //   rental: savedRental,
      // });
    } catch (error) {
      console.error("Error creating rental:", error);
      res
        .status(500)
        .json({ success: false, message: "Failed to create rental" });
    }
  })
);

// Confirmation Page
app.get(
  "/wheels/:id/confirmation",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wheel = await Wheel.findById(id);
    if (!wheel) return res.status(404).send("Wheel not found");

    const userDetails = {
      name: req.query.name,
      email: req.query.email,
    };

    res.render("Wheels/confirmation", { wheel, userDetails });
  })
);

// Payment Page
app.get(
  "/wheels/:id/payment",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const wheel = await Wheel.findById(id);
    if (!wheel) return res.status(404).send("Wheel not found");

    const paymentInfo = {
      upi: "8839540925@ibl",
      amount: wheel.rentPrice,
      note: `Payment for ${wheel.modelName}`,
    };

    const upiString = `upi://pay?pa=${paymentInfo.upi}&pn=CycleSync&am=${
      paymentInfo.amount
    }&cu=INR&tn=${encodeURIComponent(paymentInfo.note)}`;
    const qrImage = await QRCode.toDataURL(upiString);

    res.render("Wheels/payment", { qrImage, wheel });
  })
);

// Payment Confirmation
app.post(
  "/wheels/:id/payment-confirm",
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const { paymentStatus, transactionId, paymentMethod } = req.body;

    const wheel = await Wheel.findById(id);
    if (!wheel) return res.status(404).send("Wheel not found");

    if (paymentStatus === "success") {
      const rental = await Rental.findOne({
        wheelId: id,
        paymentStatus: { $ne: "paid" },
      });
      if (!rental)
        return res.status(404).send("Rental not found or already paid");

      const payment = new Payment({
        rentalId: rental._id,
        userName: rental.userName,
        userEmail: rental.email,
        wheelId: wheel._id,
        paymentMethod,
        paymentStatus: "paid",
        transactionId,
        amount: rental.totalPrice,
      });

      await payment.save();
      rental.paymentStatus = "paid";
      await rental.save();
      wheel.availabilityStatus = "Rented";
      await wheel.save();

      res.render("payment-confirmation", {
        userName: rental.userName,
        wheelModelName: wheel.modelName,
        amountPaid: rental.totalPrice,
        paymentMethod,
        transactionId,
      });
    } else {
      req.flash("success", "Payment Successful & Wheel Rented Successfully!");
      res.redirect("/");
    }
  })
);

// Error Handling
app.use((err, req, res, next) => {
  console.error("An error occurred:", err);
  res.status(500).send("Something went wrong");
});

// Server
app.listen(8080, () => {
  console.log("Server is running on port 8080");
});
