const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
