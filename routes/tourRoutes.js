const express = require('express');
const router = express.Router();
const {
    /*checkID,*/
    /*checkBody,*/
    aliasTopTours,
    getTourStats,
    getAllTours,
    createTour,
    getTour,
    updateTour,
    deleteTour,
    getMonthlyPlan
} = require('./../controllers/tourController');
const authController = require('./../controllers/authController');

// router.param('id', checkID);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(getMonthlyPlan);

router
    .route('/')
    .get(authController.protect, getAllTours)
    .post(/*checkBody,*/createTour);

router
    .route('/:id')
    .get(getTour)
    .patch(updateTour)
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        deleteTour
    );

module.exports = router;