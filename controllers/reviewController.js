const Review = require('./../models/reviewModel');
const catchAsync = require('./../utils/catchAsync');

// Get all reviews
exports.getAllReviews = catchAsync(async (req, res, next) => {
    // Execute query
    const reviews = await Review.find();

    // Send response
    res.status(200).json({
        status: 'success',
        results: reviews.length,
        data: {
            reviews
        }
    });
});

// Create a new review
exports.createReview = catchAsync(async (req, res, next) => {
    const newReview = await Review.create(req.body);

    res.status(201).json({
        status: "success",
        data: {
            tour: newReview
        }
    });
});