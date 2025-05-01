
const mongoose = require('mongoose');

const savedItemSchema = new mongoose.Schema({
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
  savedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index to ensure a user can't save the same item twice
savedItemSchema.index({ userId: 1, feedItemId: 1 }, { unique: true });

const SavedItem = mongoose.model('SavedItem', savedItemSchema);

module.exports = SavedItem;
