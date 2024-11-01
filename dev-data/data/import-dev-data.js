const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose.connect(DB).then(() => {
	console.log('DB connection succesful!');
});

// Read JSON File 
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));

// Import Data into Database
const importData = async () => {
    try{
        await Tour.create(tours);
        console.log('Data successfully loaded!');
        process.exit();
    } catch(err){
        console.log(err);
    }
}

// Delete all data from collection
const deleteData = async () => {
    try{
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
        process.exit();
    } catch(err){
        console.log(err);
    }
}

if(process.argv[2] === '--import') {
    importData();
} else if(process.argv[2] === '--delete') {
    deleteData();
}