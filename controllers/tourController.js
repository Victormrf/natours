const Tour = require('./../models/tourModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// Gets all tours 
exports.getAllTours = factory.getAll(Tour);

// Gets a specific tour based on its id
exports.getTour = factory.getOne(Tour, { path: 'reviews' });

// Creates a new tour
exports.createTour = factory.createOne(Tour);

// Updates a tour
exports.updateTour = factory.updateOne(Tour);

// Deletes a tour
exports.deleteTour = factory.deleteOne(Tour);

// Function to calculate statistics about the tours
exports.getTourStats = catchAsync(async (req, res, next) => {
    const stats = await Tour.aggregate([
        {
            $match: { ratingsAverage: { $gte: 4.5 } }
        },
        {
            $group: { 
                _id: '$difficulty', // 3 groups - easy, medium, difficult
                numTours:   { $sum: 1 },
                numRatings: { $sum: '$ratingsQuantity' },
                avgRating:  { $avg: '$ratingsAverage' },
                avgPrice:   { $avg: '$price' },
                minPrice:   { $min: '$price' },
                maxPrice:   { $max: '$price' },
            }
        },
        {
            $sort: {  avgPrice: 1 }
        },
        {
            $match: { _id: { $ne: 'easy' } }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            stats
        }
    });
});

// Tours per month of a year
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
    const year = req.params.year * 1; //2024
    const plan = await Tour.aggregate([
        {
            $unwind: '$startDates'
        },
        {
            $match: { 
                startDates: {
                    $gte: new Date(`${year}-01-01`),
                    $lte: new Date(`${year}-12-31`)
                }
            }
        },
        {
            $group: {
                _id: { $month: '$startDates' },
                numTourStarts: { $sum: 1 },
                tours: { $push: '$name' }
            }
        },
        {
            $addFields: { month: '$_id' }
        },
        {
            $project: {
                _id: 0
            }
        },
        {
            $sort: { numTourStarts: -1 }
        }

    ]);

    res.status(200).json({
        status: 'success',
        data: {
            plan
        }
    });
});