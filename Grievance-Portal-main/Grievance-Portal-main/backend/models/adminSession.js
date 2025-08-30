const mongoose = require('mongoose');

const adminSessionSchema = new mongoose.Schema({
    AdminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    sessionData: { type: Object, required: true },
    loginTime: { type: Date, default: Date.now }, // ✅ Store login timestamp
});

const AdminSession = mongoose.model('AdminSession', adminSessionSchema);
module.exports = AdminSession;