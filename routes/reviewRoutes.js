const express = require('express');
const {
  getAllReviews,
  setTourUserIds,
  createReview,
  deleteReview,
  updateReview,
  getReview,
} = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(getAllReviews)
  .post(authController.restrictTo('user'), setTourUserIds, createReview); // make this route accessible only for authenticated users, and restrict it to only users with the role 'user'

router
  .route('/:id')
  .get(getReview)
  .patch(authController.restrictTo('user', 'admin'), updateReview)
  .delete(authController.restrictTo('user', 'admin'), deleteReview);

module.exports = router;
