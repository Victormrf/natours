const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// Creating the Schema
const userSchema = new mongoose.Schema({
	name: {
        type: String,
        required: [true, 'An user must have a name'],
		unique: true,
		trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        unique: true,
        required: [true, 'An user must have an email'],
        validate: [validator.isEmail, 'The email informed is not valid.'],

    },
    photo: String,
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: { 
        type: String, 
        required: [true, 'The users password is invalid'],
        minlength: [8, 'The password should have at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String, 
        required: [true, 'Please confirm your password'],
        validate: {
            // This only works on CREATE or SAVE
            validator: function(el) {
                return el === this.password;
            },
            message: 'Passwords are not the same'
        }
    }, 
    passwordChangedAt: Date
});

// Mongoose middleware that manipulates password and passwordConfirm post schema creation
userSchema.pre('save', async function(next) {
    // Only run the code if password was modified
    if(!this.isModified('password')) return next();

    // hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    //delete the passwordConfirm field -> not to persisted in the database, we only need it for the validation
    this.passwordConfirm = undefined;
});

// Instance method to be used to compare original password with hashed password
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
}

// Instance method to verify i user changed its password after the JWT was issued
userSchema.methods.changesPasswordAfter = function (JWTTimestamp) {
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

        return JWTTimestamp < changedTimestamp;
    }

    // False means NOT changed
    return false;
}

// Creating the Model
const User = mongoose.model('User', userSchema);

// Exporting the Model
module.exports = User;