const express = require('express');
const router = express.Router();
const { getAllReviews, createReview } = require('./../controllers/reviewController');
const authController = require('./../controllers/authController')

router
    .route('/')
    .get(getAllReviews)
    .post(authController.protect, authController.restrictTo('user'), createReview); // make this route accessible only for authenticated users, and restrict it to only users with the role 'user'

module.exports = router;