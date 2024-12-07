const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Won't follow the REST principles
router.get(
    '/checkout-session/:tourId', //specifying URL param: tour ID
    authController.protect, 
    bookingController.getCheckoutSession
);

module.exports = router;