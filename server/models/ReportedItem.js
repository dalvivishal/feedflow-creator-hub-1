
const mongoose = require('mongoose');

const reportedItemSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  feedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FeedItem',
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  reportedAt: {
    type: Date,
    default: Date.now,
  },
});

const ReportedItem = mongoose.model('ReportedItem', reportedItemSchema);

module.exports = ReportedItem;
