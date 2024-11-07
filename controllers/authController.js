const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// 1) Import the User Model
const User = require('./../models/userModel');
// Importing the error handling wrapper for async functions
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

const signToken = id => {
    return jwt.sign(
        { id: id }, 
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN } 
    );
}

const createSendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000), // the browser will delete the cookie after it expired
        secure: true, // the cookie will only be sent encrypted
        httpOnly: true // the cookie cannot be modified by the browser
    }
    
    if(process.env.NODE_ENV === 'production') cookieOptions.secure = true
    
    res.cookie('jwt', token, cookieOptions);

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
}

// 2) Create and export the first controller (Sign-up)
exports.signup = catchAsync(async (req, res, next) => {
    const { name, email, password, passwordConfirm, role } = req.body;

    //Only the data we actually need is used to create the user
    const newUser = await User.create({
        name,
        email,
        role,
        password,
        passwordConfirm
    });

    createSendToken(newUser, 201, res);
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
    createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
    // 1) Getting token and checking if it exists
    let token;

    if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }
    
    if(!token){
        return next(
            new AppError('You must be logged in to gain access', 401)
        );
    }

    // 2) Verification token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Check if users still exists
    const currentUser = await User.findById(decoded.id);

    if(!currentUser){
        return next(
            new AppError('The user belonging to this token no longer exist.', 401)
        );
    }

    // 4) Check if user changed password after the JWT was issued
    if(currentUser.changesPasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }

    // GRANTS ACCESS TO PROTECTED ROUTE
    req.user = currentUser;
    next();
});

exports.restrictTo = (...roles) => {
    return (req, res, next) => {
        // roles is an array
        if(!roles.includes(req.user.role)){ //since we run the protect middleware before, we have acess to the req variable
            return next(
                new AppError('You do not have permission to perform this action', 403)
            );
        }
        
        next();
    }
}

exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({ email: req.body.email });

    if(!user){
        return next(new AppError('There is no user with that email address.', 404));
    }

    // 2) Generate the random reset token   
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false }); //de-activate all the validators specified on the schema


    // 3) Send the token back to the user's email
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

    try{
        await sendEmail({
            email: user.email,
            subject: 'Your password reset token (valid for 10 minutes)',
            message
        });

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        });
    } catch(e){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false }); // So the changes persists to the database

        return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
});    

exports.resetPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on token
    const hashedToken = crypto
        .createHash('sha256')
        .update(req.params.token)
        .digest('hex');

    const user = await User.findOne({ passwordResetToken: hashedToken, passwordResetExpires: { $gt: Date.now() } });

    // 2) If token hasn't expired, and there is user, set the new password
    if(!user){
        return next(new AppError('Token is invalid or has expired', 400));
    }

    user.password = req.body.password; 
    user.passwordConfirm = req.body.passwordConfirm; 
    user.passwordResetToken = undefined; 
    user.passwordResetExpires = undefined;
    await user.save(); 
    
    // 3) Update changedPasswordAt property for the user

    // 4) Log the user in, send JWT
    createSendToken(user, 200, res);
});    

exports.updatePassword = catchAsync(async (req, res, next) => {
    // 1) Get user from collection
    const user = await User.findById(req.user.id).select('+password');

    // 2) Check if POSTed current password is correct
    if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
        return next(new AppError('The current password informed is incorrect!', 401));
    }

    // 3) If so, update the password
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // 4) Log user in, send JWT
    createSendToken(user, 200, res);
});