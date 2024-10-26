const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

exports.aliasTopTours = async (req, res, next) => {
    req.query.limit = '5';
    req.query.sort = '-ratingsAverage,price';
    req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
    next();
};

// Gets all tours 
exports.getAllTours = async (req, res) => {
    try {
        // Execute query
        const features = new APIFeatures(Tour.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate();
        const tours = await features.query;

        // Send response
        res.status(200).json({
            status: 'success',
            data: {
                tours: tours
            }
        });
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
};

// Gets a specific tour based on its id
exports.getTour = async (req, res) => {
    try {
        const tour = await Tour.findById(req.params.id);

        res.status(200).json({
            status: 'success',
            data: {
                tour: tour
            }
        })
    } catch (err) {
        res.status(404).json({
            status: 'fail',
            message: err
        });
    }
}

// Creates a new tour
exports.createTour = async (req, res) => {
    try {
        const newTour = await Tour.create(req.body);

        res.status(201).json({
            status: "success",
            data: {
                tour: newTour
            }
        });
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

// Updates a tour
exports.updateTour = async (req, res) => {
    try{
        const tour = await Tour.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { 
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            status: 'success',
            data: {
                tour
            }
        });
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    } 
}

// Deletes a tour
exports.deleteTour = async (req, res) => {
    try{
        await Tour.findByIdAndDelete(req.params.id);
    
        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (err){
        res.status(400).json({
            status: 'fail',
            message: err
        });
    }
}

// Function to calculate statistics about the tours
exports.getTourStats = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    } 
}

// Tours per month of a year
exports.getMonthlyPlan = async (req, res) => {
    try{
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
    } catch(err){
        res.status(404).json({
            status: 'fail',
            message: err
        });
    } 
}