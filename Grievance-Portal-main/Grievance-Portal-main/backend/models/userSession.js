const mongoose = require('mongoose');

const userSessionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    faculty: { type: String, required: true },
    regno: { type: String, required: true },
    sessionData: { type: Object, required: true },
    loginTime: { type: Date, default: Date.now }, // ✅ Store login timestamp
});

const UserSession = mongoose.model('UserSession', userSessionSchema);
module.exports = UserSession;