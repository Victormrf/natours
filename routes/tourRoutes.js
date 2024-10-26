const express = require('express');
const router = express.Router();
const {
    /*checkID,*/
    /*checkBody,*/
    aliasTopTours,
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour
} = require('./../controllers/tourController');

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router
    .route('/')
    .get(getAllTours)
    .post(/*checkBody,*/createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(deleteTour);

module.exports = router;