const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    fullname: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    position: { type: String, required: true },
    phonenumber: { type: String, required: true },
    faculty: { type: String},
    department: { type: String },
    
});

module.exports = mongoose.model('admins', adminSchema);