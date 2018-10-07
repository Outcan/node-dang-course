const express = require("express");
const router = express.Router();
const storeController = require("../controllers/storeController");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const reviewController = require("../controllers/reviewController");
const { catchErrors } = require("../handlers/errorHandlers");

// Stores
router.get("/", catchErrors(storeController.getStores));
router.get("/stores", catchErrors(storeController.getStores));
router.get("/stores/page/:page", catchErrors(storeController.getStores));
// Add store
router.get("/add", authController.isLoggedIn, storeController.addStore);

router.post(
  "/add",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.createStore)
);

router.post(
  "/add/:id",
  storeController.upload,
  catchErrors(storeController.resize),
  catchErrors(storeController.updateStore)
);

router.get("/stores/:id/edit", catchErrors(storeController.editStore));

router.get("/store/:slug", catchErrors(storeController.getStoreBySlug));

// Tag routes
router.get("/tags", catchErrors(storeController.getStoresByTag));
router.get("/tags/:tag", catchErrors(storeController.getStoresByTag));

// Users, logins and logout routes
router.get("/login", userController.loginForm);
router.post("/login", authController.login);
router.get("/register", userController.registerForm);

// 1. Validate the registration form
// 2. Register the user
// 3. We need to log them in
router.post(
  "/register",
  userController.validateRegister,
  catchErrors(userController.register),
  authController.login
);

router.get("/logout", authController.logout);

// Account routes
router.get("/account", authController.isLoggedIn, userController.account);
router.post("/account", catchErrors(userController.updateAccount));

// Reset Password routes
router.post("/account/forgot", catchErrors(authController.forgot));
router.get("/account/reset/:token", catchErrors(authController.reset));
router.post(
  "/account/reset/:token",
  catchErrors(authController.confirmedPasswords),
  catchErrors(authController.update)
);

// Map route
router.get("/map", storeController.mapPage);

// Hearts - get hearted stores route
router.get("/hearts", authController.isLoggedIn, catchErrors(storeController.getHearts));

// Reviews route
router.post("/reviews/:id", authController.isLoggedIn, catchErrors(reviewController.addReview));

// Top stores
router.get("/top", catchErrors(storeController.getTopStores));

// API
router.get("/api/search", catchErrors(storeController.searchStores));
router.get("/api/stores/near", catchErrors(storeController.mapStores));
router.post("/api/stores/:id/heart", catchErrors(storeController.heartStore));

module.exports = router;
