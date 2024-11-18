const express = require('express');
const { getAllReviews, setTourUserIds, createReview, deleteReview, updateReview } = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');

const router = express.Router({ mergeParams: true });

router
    .route('/')
    .get(getAllReviews)
    .post(
        authController.protect, 
        authController.restrictTo('user'),
        setTourUserIds, 
        createReview
    ); // make this route accessible only for authenticated users, and restrict it to only users with the role 'user'

router
    .route('/:id')
    .delete(deleteReview)
    .patch(updateReview);

module.exports = router;