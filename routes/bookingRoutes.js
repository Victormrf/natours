const express = require('express');
const bookingController = require('./../controllers/bookingController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.use(authController.protect);

// Won't follow the REST principles
router.get(
    '/checkout-session/:tourId', //specifying URL param: tour ID
    bookingController.getCheckoutSession
);

router(authController.restrictTo('admin', 'leag-guide'));

router
    .route('/')
    .get(bookingController.getAllBookings)
    .post(bookingController.createBooking);

router
    .route('/:id')
    .get(bookingController.getBooking)
    .post(bookingController.updateBooking)
    .patch(bookingController.updateBooking)
    .delete(bookingController.deleteBooking);

module.exports = router;