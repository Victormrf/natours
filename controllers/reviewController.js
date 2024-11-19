const Review = require('./../models/reviewModel');
// const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    next();
};

// Get all reviews
exports.getAllReviews = factory.getAll(Review);

// Get review
exports.getReview = factory.getOne(Review);

// Create a new review
exports.createReview = factory.createOne(Review);

// Update a review 
exports.updateReview = factory.updateOne(Review);

// Delete a review 
exports.deleteReview = factory.deleteOne(Review);
