const Tour = require('./../models/tourModel');

// Gets all tours 
exports.getAllTours = async (req, res) => {
    try {
        // Build query
        // 1A) Filtering ---------------------------------------
        const queryObj = { ...req.query };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        // 1B) Advanced Filtering ------------------------------
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        // const query = Tour.find(queryObj);  // (1A)
        let query = Tour.find(JSON.parse(queryStr));  // (1B)

        // 2) Sorting ------------------------------------------
        if(req.query.sort){
            query = query.sort(req.query.sort);
        } else{ // Adding a default sort based on date of creation
            query = query.sort('-createdAt');
        }

        // Execute query
        const tours = await query;

        // const tours = await Tour.find()
        //     .where('duration')
        //     .lte(5)
        //     .where('difficulty')
        //     .equals('easy');

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
