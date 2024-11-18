const mongoose = require('mongoose');

//=====================//
//       SCHEMA        //
//=====================//
const reviewSchema = new mongoose.Schema({
    review: {
        type: String,
        required: [true, 'Review cannot be empty!']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Review must belong to a tour.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Review must have an author.']
    }
}, {
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

//=====================//
//     MIDDLEWARES     //
//=====================//
// QUERY MIDDLEWARES
reviewSchema.pre(/^find/, function(next) {
    this.populate([
        // {
        //     path:'tour',
        //     select: 'name' 
	    // },
        {
            path:'user',
            select: 'name photo' 
        }
    ]);

    next();
});

//=====================//
//        MODEL        //
//=====================//
const Review = mongoose.model('Review', reviewSchema);

//=====================//
//        EXPORT       //
//=====================//
module.exports = Review;