const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');

// Gets all users
exports.getAllUsers = catchAsync(async (req, res, next) => {
    const users = await User.find();

    // Send response
    res.status(200).json({
        status: 'success',
        data: {
            users
        }
    });
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Route not defined"
    });
}

exports.getUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Route not defined"
    });
}

exports.updateUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Route not defined"
    });
}

exports.deleteUser = (req, res) => {
    res.status(500).json({
        status: "error",
        message: "Route not defined"
    });
}