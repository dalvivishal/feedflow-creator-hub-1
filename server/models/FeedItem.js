
const mongoose = require('mongoose');

const feedItemSchema = new mongoose.Schema({
  source: {
    type: String,
    required: true,
    enum: ['twitter', 'reddit'],
  },
  author: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  title: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const FeedItem = mongoose.model('FeedItem', feedItemSchema);

module.exports = FeedItem;
