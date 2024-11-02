const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// 1) Import the User Model
const User = require('./../models/userModel');
// Importing the error handling wrapper for async functions
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

const signToken = id => {
    return jwt.sign(
        { id: id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    );
}

// 2) Create and export the first controller (Sign-up)
exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm } = req.body;

    //Only the data we actually need is used to create the user
    const newUser = await User.create({
        name,
        email,
        password,
        passwordConfirm
    });
    
    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        data: {
            user: newUser
        }
    });
});

exports.login = catchAsync(async (req, res, next) => {
    // Read email and password from the body
    const { email, password } = req.body;

    // 1) Check if email and password exists
    if(!email || !password){
        return next(new AppError('Please provide email and password!', 400));
    }

    // 2) Check if user exists and password is correct
    //      When we want a field that by default is not selected, we need to use the '+' operator and then the name of the field 
    const user = await User.findOne({ email: email }).select('+password');

    if(!user || !(await user.correctPassword(password, user.password))){
        return next(new AppError('Incorrect email or password!', 401));
    }

    // 3) Send token to client
    const token = signToken(user._id);

    res.status(200).json({
        status: 'success',
        token,
    });
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and checking if it exists
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return next(new AppError('You must be logged in to gain access', 401));
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if users still exists

    // 4) Check if user changed password after the JWT was issued

    next();
});