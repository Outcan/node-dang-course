const passport = require("passport");
const crypto = require("crypto");
const mongoose = require("mongoose");
const User = mongoose.model("User");
const promisify = require("es6-promisify");
const mail = require("../handlers/mail"); // import our mail sending handler (mail.js)

exports.login = passport.authenticate("local", {
  failureRedirect: "/login",
  failureFlash: "Failed login!",
  successRedirect: "/",
  successFlash: "You are now logged in!"
});

exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "You are now logged out! 👋");
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  // first check if the user is authenticated
  if (req.isAuthenticated()) {
    next(); // carry on! They are logged in!!
    return;
  }
  req.flash("error", "Ooops you must be logged in to do that!");
  res.redirect("/login");
};

exports.forgot = async (req, res) => {
  // 1. See if the user with that email exists
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    req.flash("error", "A password reset has been mailed to you!");
    return res.redirect("/login");
  }
  // 2. Set rest tokens and expiry on their account
  user.resetPasswordToken = crypto.randomBytes(20).toString("hex");
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hr from when called
  await user.save();
  // 3. Send them an email with the token
  const resetUrl = `http://${req.headers.host}/account/reset/${user.resetPasswordToken}`;
  // Send email with reset link using (handlers/mail.js)
  await mail.send({
    user,
    subject: "Password reset",
    resetUrl,
    filename: "password-reset"
  });
  // Flash success message
  req.flash("success", `You have been emailed a password reset link.`);
  // 4. Redirect to login page
  res.redirect("/login");
};

exports.reset = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password reset is invalid or has expired!!");
    return res.redirect("/login");
  }
  // If there is a user, show them the reset password form
  res.render("reset", {
    title: "Reset your password"
  });
};

exports.confirmedPasswords = async (req, res, next) => {
  if (req.body.password === req.body["password-confirm"]) {
    next();
    return;
  }
  req.flash("error", "Passwords do not match!");
  res.redirect("back");
};

exports.update = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() }
  });
  if (!user) {
    req.flash("error", "Password reset is invalid or has expired");
    return res.redirect("/login");
  }
  // Promisify setPassword method - make it a promise
  const setPassword = promisify(user.setPassword, user);
  // Now we can await the setPassword method
  await setPassword(req.body.password);
  // Clear the resetPasswordToken and resetPasswordExpires db fields
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  // Now await the save user (to update the pwd in the db)
  const updatedUser = await user.save();
  await req.login(updatedUser);
  req.flash("success", "Nice! your password has been reset! You are now logged in! ✓");
  res.redirect("/");
};
