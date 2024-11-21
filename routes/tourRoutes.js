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
    getMonthlyPlan,
    getToursWithin,
    getDistances
} = require('./../controllers/tourController');
const authController = require('./../controllers/authController');
const reviewRouter = require('./../routes/reviewRoutes');

router.use('/:tourId/reviews', reviewRouter);

router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);

router.route('/monthly-plan/:year').get(
    authController.protect, 
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    getMonthlyPlan
);

router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
    .route('/')
    .get(getAllTours)
    .post(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        createTour
    );

router
    .route('/:id')
    .get(getTour)
    .patch(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'),
        updateTour
    )
    .delete(
        authController.protect, 
        authController.restrictTo('admin', 'lead-guide'), 
        deleteTour
    );

module.exports = router;