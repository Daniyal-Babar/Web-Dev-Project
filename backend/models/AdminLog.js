const mongoose = require('mongoose');

const adminLogSchema = new mongoose.Schema({
  admin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  targetType: { type: String },
  targetId: { type: mongoose.Schema.Types.ObjectId },
  details: { type: Object },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

adminLogSchema.statics.createLog = function(payload) {
  try {
    return this.create(payload);
  } catch (e) {
    // Avoid breaking main flow on log failure
    return null;
  }
};

module.exports = mongoose.model('AdminLog', adminLogSchema);
