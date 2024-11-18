const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');
const factory = require('./handlerFactory');

// Get all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
    let filter = {};
    
    if (req.params.tourId) filter = { tour: req.params.tourId }

    // Execute query
    const reviews = await Review.find(filter);

    // Send response
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

exports.setTourUserIds = (req, res, next) => {
    // Allow nested routes
    if(!req.body.tour) req.body.tour = req.params.tourId;
    if(!req.body.user) req.body.user = req.user.id;

    next();
};

// Create a new review
exports.createReview = factory.createOne(Review);

// Update a review 
exports.updateReview = factory.updateOne(Review);

// Delete a review 
exports.deleteReview = factory.deleteOne(Review);
