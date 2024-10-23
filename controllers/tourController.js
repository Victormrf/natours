const Tour = require('./../models/tourModel');

exports.checkBody = (req, res, next) => {
    const { name, price } = req.body;

    if(!name || !price){
        return res.status(400).json({
            status: 'fail',
            message: 'Missing name or price property'
        });
    }

    next();
};

// Gets all tours 
exports.getAllTours = (req, res) => {
    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         tours: tours
    //     }
    // });
};

// Gets a specific tour based on its id
exports.getTour = (req, res) => {
    // const tour = tours.find(el => el.id === id);

    // res.status(200).json({
    //     status: 'success',
    //     data: {
    //         tour: tour
    //     }
    // })
}

// Creates a new tour
exports.createTour = (req, res) => {
    res.status(201).json({
        status: "success",
        data: {
            tour: newTour
        }
    });
    // const newId = tours[tours.length - 1].id + 1;
    // const newTour = Object.assign({ id: newId }, req.body);

    // tours.push(newTour);

    // fs.writeFile(`${__dirname}/dev-data/data/tours-simple.json`, JSON.stringify(tours), err => {
    //     res.status(201).json({
    //         status: "success",
    //         data: {
    //             tour: newTour
    //         }
    //     });
    // });
}

// Updates a tour
exports.updateTour = (req, res) => {
    res.status(200).json({
        status: 'success',
        data: {
           tour: '<Updated tour here...>' 
        }
    });
}

// Deletes a tour
exports.deleteTour = (req, res) => {
    res.status(204).json({
        status: 'success',
        data: null
    });
}
