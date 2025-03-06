const mongoose = require('mongoose');
const Tour = require('./tourModel');

//=====================//
//       SCHEMA        //
//=====================//
const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'Review cannot be empty!'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'Review must belong to a tour.'],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Review must have an author.'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.index({ tour: 1, user: 1 }, { unique: true });

//=====================//
//     MIDDLEWARES     //
//=====================//
// QUERY MIDDLEWARES
reviewSchema.pre(/^find/, function (next) {
  this.populate([
    // {
    //     path:'tour',
    //     select: 'name'
    // },
    {
      path: 'user',
      select: 'name photo',
    },
  ]);

  next();
});

//=====================//
//       STATICS       //
//=====================//
// In static methods the this keyword points to the model
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // only select a tour we want to update
    },
    {
      $group: {
        _id: '$tour', // grouping statistics by tour
        nRating: { $sum: 1 }, // adds 1 per review added
        avgRating: { $avg: '$rating' },
      },
    },
  ]);

  if (stats.length) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};

reviewSchema.post('save', function () {
  // this -> current review
  this.constructor.calcAverageRatings(this.tour); // adds the method to the constructor of the model
});

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); //created a new property to receive the values
  console.log(this.r);
  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  // this.r = await this.findOne(); does not work here -> query has already been executed
  await this.r.constructor.calcAverageRatings(this.r.tour);
});

//=====================//
//        MODEL        //
//=====================//
const Review = mongoose.model('Review', reviewSchema);

//=====================//
//        EXPORT       //
//=====================//
module.exports = Review;
