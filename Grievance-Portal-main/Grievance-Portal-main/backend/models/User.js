const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    registrationNumber: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    academicYear: { type: String, required: true },
    phone: { type: String, required: true },
    faculty: { type: String, required: true }
});

module.exports = mongoose.model('User', userSchema);
