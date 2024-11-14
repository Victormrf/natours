// Where we are going to set all the express configuration
const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

const app = express();

//-----------------//
//   MIDDLEWARES   //
//-----------------//
// Set security HTTP headers
app.use(helmet());

// Limit requests from same API
const limiter = rateLimit({
    // 100 request from the same Ip in one hour
    max: 100,
    windowMs: 60 * 60 * 1000, 
    message: 'Too many requests from this IP, please try again in an hour'
});
app.use('/api', limiter); //affects all APIs that start with this url

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
    whitelist: [
        'duration', 
        'ratingsQuality', 
        'ratingsAverage', 
        'maxGroupSize', 
        'difficulty', 
        'price'
    ]
}));

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middlewares
app.use((req, res, next) => {
    req.requestDate = new Date().toISOString();
    next();
});

if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev'));
}


//-------------//
//   ROUTERS   //
//-------------//

app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

app.all('*', (req, res, next) => {
    // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
    // err.status = 'fail';
    // err.statusCode = 404;

    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;