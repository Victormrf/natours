const express = require('express');
const {
    getAllUsers,
    createUser,
    getUser,
    updateUser,
    deleteUser,
    updateMe,
    deleteMe,
    getMe
} = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router(); 

router.post('/signup', authController.signup); // Special route where we can only POST data
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.use(authController.protect); //whatever comes after this middleware only runs if this method runs correctly

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', getMe, getUser);
router.patch('/updateMe', updateMe);
router.delete('/deleteMe', deleteMe);

router.route('/')
    .get(getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getUser)
    .patch(updateUser)
    .delete(deleteUser);



module.exports = router;